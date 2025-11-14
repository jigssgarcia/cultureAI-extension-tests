/**
 * Mock API Server for CultureAI /events endpoint
 * Simulates the behavior of https://doesnotexist.culture.ai/events
 */

const http = require('http');
const url = require('url');

// Store received events for validation in tests
const receivedEvents = [];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // POST /events endpoint
  if (req.method === 'POST' && parsedUrl.pathname === '/events') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        
        // Validate required fields
        if (!event.email || !event.passwordHash) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ 
            success: false, 
            error: 'Missing required fields: email and passwordHash' 
          }));
          return;
        }
        
        // Store event with timestamp
        const eventWithMeta = {
          ...event,
          timestamp: new Date().toISOString(),
          id: Math.random().toString(36).substr(2, 9)
        };
        
        receivedEvents.push(eventWithMeta);
        
        console.log('✓ Event received:', JSON.stringify(eventWithMeta, null, 2));
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: true,
          eventId: eventWithMeta.id
        }));
        
      } catch (error) {
        console.error('Error parsing event:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          success: false, 
          error: 'Invalid JSON' 
        }));
      }
    });
    
    return;
  }
  
  // GET /events endpoint - for test verification
  if (req.method === 'GET' && parsedUrl.pathname === '/events') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      events: receivedEvents,
      count: receivedEvents.length
    }));
    return;
  }
  
  // DELETE /events endpoint - for test cleanup
  if (req.method === 'DELETE' && parsedUrl.pathname === '/events') {
    receivedEvents.length = 0;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      success: true,
      message: 'All events cleared'
    }));
    return;
  }
  
  // Health check endpoint
  if (req.method === 'GET' && parsedUrl.pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok',
      timestamp: new Date().toISOString()
    }));
    return;
  }
  
  // 404 for all other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ 
    success: false, 
    error: 'Not found' 
  }));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Mock API server running on https://doesnotexist.culture.ai:${PORT}`);
  console.log(`   POST /events - Receive password detection events`);
  console.log(`   GET /events - View all received events`);
  console.log(`   DELETE /events - Clear all events`);
  console.log(`   GET /health - Health check`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
