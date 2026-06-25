const http = require('http');

const runTest = async () => {
  try {
    const username = `test_large_${Date.now()}`;
    const email = `${username}@test.com`;
    const regPayload = JSON.stringify({ username, email, password: "password123", firstName: "Test", lastName: "User", role: "CLIENT" });
    const regRes = await makeRequest('/api/v1/auth/register', 'POST', regPayload);
    if (!regRes.body.includes('accessToken')) {
      console.log('Registration failed:', regRes.body);
      return;
    }
    const token = JSON.parse(regRes.body).accessToken;
    const userId = JSON.parse(regRes.body).userId;
    
    // Create 3MB string
    const largeString = "a".repeat(3 * 1024 * 1024);
    const updatePayload = JSON.stringify({ profileImage: `data:image/png;base64,${largeString}` });

    const updateRes = await makeRequest(`/api/v1/auth/profile/${userId}`, 'PUT', updatePayload, token);
    console.log(`Update Status: ${updateRes.status}`);
    console.log(`Update Body: ${updateRes.body}`);
  } catch (err) {
    console.error(err);
  }
};

const makeRequest = (path, method, payload, token = null) => {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (payload) headers['Content-Length'] = Buffer.byteLength(payload);
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const req = http.request(`http://localhost:8081${path}`, { method, headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
};
runTest();
