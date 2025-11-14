/**
 * Mock Content Script for CultureAI Browser Extension
 * This simulates the extension's password detection logic for testing
 */

// Common weak passwords list (sample)
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', 'qwerty', 'letmein', 
  'welcome', 'abc123', 'admin', 'user', 'test123'
];

// Corporate email domain
const CORPORATE_DOMAIN = '@culture.ai';

// Multi-stage hashing function
async function multiStageHash(password) {
  // Stage 1: SHA-256 hash
  let hash = await sha256(password);
  
  // Stage 2: Take first half
  hash = hash.substring(0, 32);
  
  // Stage 3: Hash again
  hash = await sha256(hash);
  
  // Stage 4: Hash again
  hash = await sha256(hash);
  
  return hash;
}

// SHA-256 helper
async function sha256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Check if password is weak
function isWeakPassword(password) {
  // Check common passwords
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return true;
  }
  
  // Check length (≤12 characters)
  if (password.length <= 12) {
    return true;
  }
  
  // Check character types
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const typeCount = [hasLowercase, hasUppercase, hasDigit, hasSpecial].filter(Boolean).length;
  
  // Single character type
  if (typeCount <= 1) {
    return true;
  }
  
  return false;
}

// Check if email is corporate
function isCorporateEmail(email) {
  return email.toLowerCase().endsWith(CORPORATE_DOMAIN);
}

// Send event to API
async function sendEvent(email, passwordHash) {
  try {
    const response = await fetch('https://doesnotexist.culture.ai/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        passwordHash: passwordHash,
        timestamp: new Date().toISOString(),
        loginType: 'form-based'
      })
    });
    
    if (response.ok) {
      console.log('✓ Event sent successfully');
    } else {
      console.error('✗ Event sending failed:', response.status);
    }
  } catch (error) {
    console.error('✗ Event sending error:', error);
  }
}

// Monitor form submissions
function monitorForms() {
  document.addEventListener('submit', async (event) => {
    const form = event.target;
    
    // Find email and password fields
    const emailField = form.querySelector('input[type="email"]');
    const passwordField = form.querySelector('input[type="password"]');
    
    if (emailField && passwordField) {
      const email = emailField.value;
      const password = passwordField.value;
      
      // Only monitor corporate emails
      if (isCorporateEmail(email)) {
        // Check if password is weak
        if (isWeakPassword(password)) {
          console.log('Weak password detected with corporate email');
          
          // Hash password
          const passwordHash = await multiStageHash(password);
          
          // Send event
          await sendEvent(email, passwordHash);
        } else {
          console.log('✓ Strong password detected, no event sent');
        }
      } else {
        console.log('Non-corporate email, not monitored');
      }
    }
  });
}

// Initialize monitoring
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', monitorForms);
} else {
  monitorForms();
}

console.log('CultureAI Password Monitor - Content Script Loaded');
