#!/usr/bin/env node

/**
 * Backend Integration Test Runner
 * Verifies backend is running and executes integration tests
 */

const { spawn } = require('child_process');
const fetch = require('node-fetch');

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';
const MAX_RETRIES = 30;
const RETRY_DELAY = 2000; // 2 seconds

async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function waitForBackend() {
  console.log('🔍 Checking if backend is running...');
  
  for (let i = 0; i < MAX_RETRIES; i++) {
    const isHealthy = await checkBackendHealth();
    
    if (isHealthy) {
      console.log('✅ Backend is running and healthy');
      return true;
    }
    
    console.log(`⏳ Backend not ready, retrying in ${RETRY_DELAY/1000}s... (${i + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
  }
  
  console.error('❌ Backend is not running or not healthy');
  console.error(`Please ensure the backend is running at ${BACKEND_URL}`);
  console.error('You can start it with: cd ht-backend && ./mvnw spring-boot:run');
  return false;
}

async function runIntegrationTests() {
  console.log('🧪 Running backend integration tests...');
  
  return new Promise((resolve, reject) => {
    const testProcess = spawn('npm', ['test', '--', '__tests__/integration/backend-integration.test.tsx', '--verbose'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ All integration tests passed!');
        resolve(true);
      } else {
        console.error('❌ Some integration tests failed');
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });
    
    testProcess.on('error', (error) => {
      console.error('❌ Failed to run tests:', error);
      reject(error);
    });
  });
}

async function main() {
  console.log('🚀 Starting Backend Integration Test Suite');
  console.log(`Backend URL: ${BACKEND_URL}`);
  console.log('');
  
  try {
    // Check if backend is running
    const backendReady = await waitForBackend();
    
    if (!backendReady) {
      process.exit(1);
    }
    
    console.log('');
    
    // Run integration tests
    await runIntegrationTests();
    
    console.log('');
    console.log('🎉 Backend integration testing completed successfully!');
    
  } catch (error) {
    console.error('');
    console.error('💥 Backend integration testing failed:', error.message);
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(1);
});

main();