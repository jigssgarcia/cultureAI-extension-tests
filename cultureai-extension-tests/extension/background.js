/**
 * Mock Background Script for CultureAI Browser Extension
 * Handles background tasks and initialization
 */

console.log('CultureAI Password Monitor - Background Script Loaded');

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('CultureAI Password Monitor installed');
  
  // Initialize settings
  chrome.storage.local.set({
    enabled: true,
    apiEndpoint: 'https://doesnotexist.culture.ai/events',
    corporateDomain: '@culture.ai'
  });
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'WEAK_PASSWORD_DETECTED') {
    console.log('Weak password event received:', request.data);
    sendResponse({ success: true });
  }
  
  return true;
});
