const http = require('http');

/**
 * Helper to call Python FastAPI engine on http://localhost:8000
 */
const callPythonAPI = (endpoint, payload) => {
  return new Promise((resolve, reject) => {
    const dataString = JSON.stringify(payload || {});
    const options = {
      hostname: 'localhost',
      port: 8000,
      path: endpoint,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(dataString)
      },
      timeout: 10000
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve({ success: false, raw: body });
        }
      });
    });

    req.on('error', (err) => {
      console.warn(`Python API request error on ${endpoint}:`, err.message);
      resolve({ success: false, message: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, message: 'Python API request timeout' });
    });

    req.write(dataString);
    req.end();
  });
};

module.exports = { callPythonAPI };
