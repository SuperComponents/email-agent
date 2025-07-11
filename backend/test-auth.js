// Simple test script to verify auth routes work
// Run with: JWT_ACCESS_SECRET=test JWT_REFRESH_SECRET=test node test-auth.js

const testUser = {
  email: 'test@example.com',
  password: 'testpassword123',
  name: 'Test User'
};

async function testAuth() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('Testing authentication routes...');
    
    // Test signup
    console.log('1. Testing signup...');
    const signupResponse = await fetch(`${baseUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser),
    });
    
    if (signupResponse.ok) {
      const signupData = await signupResponse.json();
      console.log('✓ Signup successful:', signupData.user.email);
    } else {
      const error = await signupResponse.json();
      console.log('✗ Signup failed:', error);
    }
    
    // Test login
    console.log('2. Testing login...');
    const loginResponse = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✓ Login successful:', loginData.user.email);
      
      // Get cookies from response
      const cookies = loginResponse.headers.get('set-cookie');
      console.log('✓ Cookies set:', cookies ? 'yes' : 'no');
      
      // Test /me endpoint
      console.log('3. Testing /me endpoint...');
      const meResponse = await fetch(`${baseUrl}/auth/me`, {
        method: 'GET',
        headers: {
          'Cookie': cookies || '',
        },
      });
      
      if (meResponse.ok) {
        const meData = await meResponse.json();
        console.log('✓ /me successful:', meData.user.email);
      } else {
        const error = await meResponse.json();
        console.log('✗ /me failed:', error);
      }
      
      // Test logout
      console.log('4. Testing logout...');
      const logoutResponse = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Cookie': cookies || '',
        },
      });
      
      if (logoutResponse.ok) {
        console.log('✓ Logout successful');
      } else {
        const error = await logoutResponse.json();
        console.log('✗ Logout failed:', error);
      }
      
    } else {
      const error = await loginResponse.json();
      console.log('✗ Login failed:', error);
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

// Run the test
testAuth();
