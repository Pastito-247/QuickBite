const http = require('http');

// First login
const loginPayload = JSON.stringify({
  username: "customer@quickbite.com",
  password: "password"
});

const req = http.request('http://localhost:8081/api/v1/auth/authenticate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginPayload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    if (res.statusCode !== 200) {
      console.log('Login failed:', data);
      return;
    }
    const token = JSON.parse(data).accessToken;
    const userId = JSON.parse(data).userId;
    console.log(`Logged in as userId: ${userId}`);

    // Now update profile
    const updatePayload = JSON.stringify({
      firstName: "Michis",
      lastName: "Melo",
      email: "mich.melo@duocuc.cl",
      phoneNumber: "+56912345678",
      address: "Santiago",
      profileImage: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
    });

    const updateReq = http.request(`http://localhost:8081/api/v1/auth/profile/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(updatePayload)
      }
    }, (updateRes) => {
      let updateData = '';
      updateRes.on('data', chunk => updateData += chunk);
      updateRes.on('end', () => {
        console.log(`UPDATE STATUS: ${updateRes.statusCode}`);
        console.log(`UPDATE BODY: ${updateData}`);
      });
    });
    updateReq.write(updatePayload);
    updateReq.end();
  });
});

req.write(loginPayload);
req.end();
