const http = require('http');

const runTest = async () => {
  try {
    // 1. Register test user
    const username = `test_${Date.now()}`;
    const email = `${username}@test.com`;
    const pwd = "password123";
    
    const regPayload = JSON.stringify({
      username: username,
      email: email,
      password: pwd,
      firstName: "Test",
      lastName: "User",
      role: "CLIENT"
    });

    console.log('Registering user...');
    const regRes = await makeRequest('/api/v1/auth/register', 'POST', regPayload);
    if (!regRes.body.includes('accessToken')) {
      console.log('Registration failed:', regRes.body);
      return;
    }
    
    const token = JSON.parse(regRes.body).accessToken;
    const userId = JSON.parse(regRes.body).userId;
    console.log(`Registered and logged in as userId: ${userId}`);

    // 2. Update profile
    const updatePayload = JSON.stringify({
      firstName: "UpdatedName",
      lastName: "UpdatedLast",
      email: email,
      phoneNumber: "+56912345678",
      address: "Santiago",
      profileImage: "data:image/png;base64,TEST_BASE64_STRING_THAT_IS_NOT_TOO_LONG"
    });

    console.log('Updating profile...');
    const updateRes = await makeRequest(`/api/v1/auth/profile/${userId}`, 'PUT', updatePayload, token);
    console.log(`Update Status: ${updateRes.status}`);
    console.log(`Update Body: ${updateRes.body}`);

    // 3. Get profile
    console.log('Fetching profile...');
    const getRes = await makeRequest(`/api/v1/auth/profile/${userId}`, 'GET', null, token);
    console.log(`Get Status: ${getRes.status}`);
    console.log(`Get Body: ${getRes.body}`);
    
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
