#!/usr/bin/env node

/**
 * Integration Test Report Generator
 * Generates a comprehensive report of backend-frontend integration status
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

// Test endpoints to verify
const TEST_ENDPOINTS = [
  { method: 'GET', path: '/api/health', description: 'Health check endpoint' },
  { method: 'POST', path: '/api/auth/register', description: 'User registration' },
  { method: 'POST', path: '/api/auth/login', description: 'User login' },
  { method: 'GET', path: '/api/auth/profile', description: 'User profile (requires auth)' },
  { method: 'POST', path: '/api/auth/logout', description: 'User logout' },
  { method: 'GET', path: '/api/water', description: 'Water intake list' },
  { method: 'POST', path: '/api/water', description: 'Create water intake' },
  { method: 'GET', path: '/api/food', description: 'Food intake list' },
  { method: 'POST', path: '/api/food', description: 'Create food intake' },
  { method: 'GET', path: '/api/workouts', description: 'Workout list' },
  { method: 'POST', path: '/api/workouts', description: 'Create workout' },
  { method: 'GET', path: '/api/health-index/current', description: 'Current health score' },
];

async function checkEndpoint(endpoint) {
  try {
    const response = await fetch(`${BACKEND_URL}${endpoint.path}`, {
      method: endpoint.method === 'GET' ? 'OPTIONS' : 'OPTIONS', // Use OPTIONS for all to check CORS
      headers: {
        'Origin': 'http://localhost:3000',
        'Access-Control-Request-Method': endpoint.method,
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    return {
      ...endpoint,
      status: response.status,
      available: response.status === 200,
      corsEnabled: response.headers.get('Access-Control-Allow-Origin') !== null,
      allowedMethods: response.headers.get('Access-Control-Allow-Methods') || '',
    };
  } catch (error) {
    return {
      ...endpoint,
      status: 0,
      available: false,
      corsEnabled: false,
      error: error.message,
    };
  }
}

async function checkBackendHealth() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/health`, {
      timeout: 5000,
    });
    return {
      healthy: response.ok,
      status: response.status,
      statusText: response.statusText,
    };
  } catch (error) {
    return {
      healthy: false,
      status: 0,
      error: error.message,
    };
  }
}

async function runTestSuite(testFile) {
  return new Promise((resolve) => {
    const testProcess = spawn('npm', ['test', '--', testFile, '--json'], {
      stdio: 'pipe',
      cwd: process.cwd(),
    });

    let output = '';
    testProcess.stdout.on('data', (data) => {
      output += data.toString();
    });

    testProcess.stderr.on('data', (data) => {
      output += data.toString();
    });

    testProcess.on('close', (code) => {
      try {
        // Try to parse Jest JSON output
        const lines = output.split('\n');
        const jsonLine = lines.find(line => line.trim().startsWith('{') && line.includes('testResults'));
        
        if (jsonLine) {
          const result = JSON.parse(jsonLine);
          resolve({
            success: code === 0,
            numTotalTests: result.numTotalTests || 0,
            numPassedTests: result.numPassedTests || 0,
            numFailedTests: result.numFailedTests || 0,
            testResults: result.testResults || [],
          });
        } else {
          resolve({
            success: code === 0,
            numTotalTests: 0,
            numPassedTests: 0,
            numFailedTests: 0,
            error: 'Could not parse test output',
            rawOutput: output,
          });
        }
      } catch (error) {
        resolve({
          success: false,
          error: error.message,
          rawOutput: output,
        });
      }
    });
  });
}

function generateMarkdownReport(data) {
  const timestamp = new Date().toISOString();
  
  let report = `# Backend Integration Test Report

Generated: ${timestamp}
Backend URL: ${BACKEND_URL}

## Executive Summary

`;

  // Backend Health Summary
  if (data.backendHealth.healthy) {
    report += `✅ **Backend Status**: Healthy (${data.backendHealth.status})\n`;
  } else {
    report += `❌ **Backend Status**: Unhealthy (${data.backendHealth.status || 'Connection Failed'})\n`;
    if (data.backendHealth.error) {
      report += `   Error: ${data.backendHealth.error}\n`;
    }
  }

  // Test Results Summary
  const totalTests = data.testResults.reduce((sum, result) => sum + result.numTotalTests, 0);
  const passedTests = data.testResults.reduce((sum, result) => sum + result.numPassedTests, 0);
  const failedTests = data.testResults.reduce((sum, result) => sum + result.numFailedTests, 0);

  report += `📊 **Test Results**: ${passedTests}/${totalTests} passed (${failedTests} failed)\n`;

  // Endpoint Availability Summary
  const availableEndpoints = data.endpoints.filter(ep => ep.available).length;
  const totalEndpoints = data.endpoints.length;
  report += `🔗 **API Endpoints**: ${availableEndpoints}/${totalEndpoints} available\n`;

  // CORS Configuration Summary
  const corsEnabledEndpoints = data.endpoints.filter(ep => ep.corsEnabled).length;
  report += `🌐 **CORS Configuration**: ${corsEnabledEndpoints}/${totalEndpoints} endpoints have CORS enabled\n\n`;

  // Detailed Backend Health
  report += `## Backend Health Check

| Metric | Status | Details |
|--------|--------|---------|
| Health Endpoint | ${data.backendHealth.healthy ? '✅ Available' : '❌ Unavailable'} | ${data.backendHealth.status} ${data.backendHealth.statusText || ''} |
| Response Time | ${data.backendHealth.responseTime || 'N/A'} | Time to respond to health check |

`;

  // API Endpoints Status
  report += `## API Endpoints Status

| Method | Endpoint | Status | CORS | Description |
|--------|----------|--------|------|-------------|
`;

  data.endpoints.forEach(endpoint => {
    const statusIcon = endpoint.available ? '✅' : '❌';
    const corsIcon = endpoint.corsEnabled ? '✅' : '❌';
    const status = endpoint.status || 'N/A';
    
    report += `| ${endpoint.method} | ${endpoint.path} | ${statusIcon} ${status} | ${corsIcon} | ${endpoint.description} |\n`;
  });

  report += '\n';

  // Test Results Details
  report += `## Test Results Details

`;

  data.testResults.forEach(result => {
    const testFile = result.testFile || 'Unknown';
    const successIcon = result.success ? '✅' : '❌';
    
    report += `### ${testFile} ${successIcon}

- **Total Tests**: ${result.numTotalTests}
- **Passed**: ${result.numPassedTests}
- **Failed**: ${result.numFailedTests}
- **Success Rate**: ${result.numTotalTests > 0 ? Math.round((result.numPassedTests / result.numTotalTests) * 100) : 0}%

`;

    if (result.error) {
      report += `**Error**: ${result.error}\n\n`;
    }
  });

  // CORS Configuration Details
  report += `## CORS Configuration Analysis

`;

  const corsIssues = data.endpoints.filter(ep => !ep.corsEnabled);
  if (corsIssues.length === 0) {
    report += `✅ All endpoints have CORS properly configured.\n\n`;
  } else {
    report += `❌ ${corsIssues.length} endpoints have CORS issues:\n\n`;
    corsIssues.forEach(endpoint => {
      report += `- ${endpoint.method} ${endpoint.path}: ${endpoint.error || 'CORS not enabled'}\n`;
    });
    report += '\n';
  }

  // Recommendations
  report += `## Recommendations

`;

  if (!data.backendHealth.healthy) {
    report += `### 🚨 Critical Issues

1. **Backend Unavailable**: The backend server is not responding. Please ensure:
   - Spring Boot application is running
   - Database connection is established
   - Port 8080 is not blocked by firewall
   - No other services are using port 8080

`;
  }

  if (corsIssues.length > 0) {
    report += `### 🔧 CORS Configuration Issues

1. **Missing CORS Headers**: Some endpoints don't have proper CORS configuration:
   - Verify \`@CrossOrigin\` annotations on controllers
   - Check \`CorsConfigurationSource\` bean in SecurityConfig
   - Ensure allowed origins include frontend URL

`;
  }

  if (failedTests > 0) {
    report += `### 🧪 Test Failures

1. **Failed Integration Tests**: ${failedTests} tests are failing:
   - Check backend logs for errors
   - Verify database schema is up to date
   - Ensure test data doesn't conflict with existing data
   - Review authentication and session configuration

`;
  }

  // Next Steps
  report += `## Next Steps

1. **Fix Critical Issues**: Address any backend availability or CORS issues
2. **Run Full Test Suite**: Execute all integration tests with backend running
3. **Monitor Performance**: Check response times and optimize slow endpoints
4. **Security Review**: Verify authentication and authorization are working correctly
5. **Documentation**: Update API documentation based on test results

## Test Commands

To reproduce these results:

\`\`\`bash
# Start backend
cd ht-backend && ./mvnw spring-boot:run

# Run integration tests
npm test -- __tests__/integration/ --verbose

# Generate this report
node scripts/generate-integration-report.js
\`\`\`

---
*Report generated by Health Tracker Integration Test Suite*
`;

  return report;
}

async function main() {
  console.log('🔍 Generating Backend Integration Test Report...\n');

  const data = {
    timestamp: new Date().toISOString(),
    backendUrl: BACKEND_URL,
    backendHealth: {},
    endpoints: [],
    testResults: [],
  };

  // Check backend health
  console.log('📡 Checking backend health...');
  const startTime = Date.now();
  data.backendHealth = await checkBackendHealth();
  data.backendHealth.responseTime = `${Date.now() - startTime}ms`;
  
  if (data.backendHealth.healthy) {
    console.log('✅ Backend is healthy');
  } else {
    console.log('❌ Backend is not responding');
  }

  // Check API endpoints
  console.log('\n🔗 Checking API endpoints...');
  for (const endpoint of TEST_ENDPOINTS) {
    process.stdout.write(`   ${endpoint.method} ${endpoint.path}... `);
    const result = await checkEndpoint(endpoint);
    data.endpoints.push(result);
    
    if (result.available) {
      console.log('✅');
    } else {
      console.log('❌');
    }
  }

  // Run test suites (only if backend is available)
  if (data.backendHealth.healthy) {
    console.log('\n🧪 Running integration test suites...');
    
    const testFiles = [
      '__tests__/integration/backend-integration.test.tsx',
      '__tests__/integration/cors-configuration.test.tsx',
      '__tests__/integration/session-management.test.tsx',
    ];

    for (const testFile of testFiles) {
      if (fs.existsSync(testFile)) {
        process.stdout.write(`   ${path.basename(testFile)}... `);
        const result = await runTestSuite(testFile);
        result.testFile = path.basename(testFile);
        data.testResults.push(result);
        
        if (result.success) {
          console.log('✅');
        } else {
          console.log('❌');
        }
      }
    }
  } else {
    console.log('\n⏭️  Skipping test suites (backend not available)');
  }

  // Generate report
  console.log('\n📝 Generating report...');
  const report = generateMarkdownReport(data);
  
  // Save report
  const reportPath = path.join(__dirname, '..', 'integration-test-report.md');
  fs.writeFileSync(reportPath, report);
  
  console.log(`✅ Report saved to: ${reportPath}`);
  console.log('\n📊 Summary:');
  console.log(`   Backend Health: ${data.backendHealth.healthy ? 'Healthy' : 'Unhealthy'}`);
  console.log(`   Available Endpoints: ${data.endpoints.filter(ep => ep.available).length}/${data.endpoints.length}`);
  console.log(`   CORS Enabled: ${data.endpoints.filter(ep => ep.corsEnabled).length}/${data.endpoints.length}`);
  
  if (data.testResults.length > 0) {
    const totalTests = data.testResults.reduce((sum, result) => sum + result.numTotalTests, 0);
    const passedTests = data.testResults.reduce((sum, result) => sum + result.numPassedTests, 0);
    console.log(`   Test Results: ${passedTests}/${totalTests} passed`);
  }

  console.log('\n🎉 Integration test report generation complete!');
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Report generation interrupted');
  process.exit(1);
});

main().catch(error => {
  console.error('\n💥 Report generation failed:', error);
  process.exit(1);
});