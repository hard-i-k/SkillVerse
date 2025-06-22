// Simple test script to verify authentication endpoints
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const testAuth = async () => {
  console.log('🧪 Testing Authentication Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);

    // Test 2: Register a test user
    console.log('\n2. Testing registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      console.log('✅ Registration successful:', registerResponse.data.success);
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('already exists')) {
        console.log('ℹ️  User already exists, continuing with login test...');
      } else {
        console.log('❌ Registration failed:', error.response?.data?.message || error.message);
      }
    }

    // Test 3: Login
    console.log('\n3. Testing login...');
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };

    try {
      const loginResponse = await axios.post(`${API_URL}/auth/login`, loginData);
      console.log('✅ Login successful:', loginResponse.data.success);
      
      // Test 4: Get current user (with token)
      console.log('\n4. Testing get current user...');
      const token = loginResponse.data.token;
      const userResponse = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Get current user successful:', userResponse.data.success);
    } catch (error) {
      console.log('❌ Login failed:', error.response?.data?.message || error.message);
    }

    // Test 5: Forgot password
    console.log('\n5. Testing forgot password...');
    const forgotPasswordData = {
      email: 'test@example.com'
    };

    try {
      const forgotResponse = await axios.post(`${API_URL}/auth/forgot-password`, forgotPasswordData);
      console.log('✅ Forgot password successful:', forgotResponse.data.message);
    } catch (error) {
      console.log('❌ Forgot password failed:', error.response?.data?.message || error.message);
    }

    console.log('\n🎉 Authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
};

// Run the test
testAuth(); 