'use client';

import { useState } from 'react';
import { TestService } from '@/lib/api/test';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: unknown;
}

export default function ApiTestPage() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'API Connectivity', status: 'pending', message: 'Not tested' },
    { name: 'CORS Configuration', status: 'pending', message: 'Not tested' },
    { name: 'Session Management', status: 'pending', message: 'Not tested' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, updates: Partial<TestResult>) => {
    setTests(prev => prev.map((test, i) => i === index ? { ...test, ...updates } : test));
  };

  const runConnectivityTest = async () => {
    updateTest(0, { status: 'pending', message: 'Testing...' });
    
    try {
      const result = await TestService.testConnectivity();
      
      if (result.error) {
        updateTest(0, { 
          status: 'error', 
          message: result.error,
          details: { status: result.status }
        });
      } else {
        updateTest(0, { 
          status: 'success', 
          message: 'API is reachable',
          details: result.data
        });
      }
    } catch (error) {
      updateTest(0, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const runCORSTest = async () => {
    updateTest(1, { status: 'pending', message: 'Testing...' });
    
    try {
      const result = await TestService.testCORS();
      
      if (result) {
        updateTest(1, { 
          status: 'success', 
          message: 'CORS is properly configured'
        });
      } else {
        updateTest(1, { 
          status: 'error', 
          message: 'CORS configuration issue detected'
        });
      }
    } catch (error) {
      updateTest(1, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'CORS test failed'
      });
    }
  };

  const runSessionTest = async () => {
    updateTest(2, { status: 'pending', message: 'Testing...' });
    
    try {
      const result = await TestService.testSession();
      
      if (result) {
        updateTest(2, { 
          status: 'success', 
          message: 'Session management is working'
        });
      } else {
        updateTest(2, { 
          status: 'error', 
          message: 'Session management issue detected'
        });
      }
    } catch (error) {
      updateTest(2, { 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Session test failed'
      });
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending' as const, message: 'Waiting...' })));
    
    // Run tests sequentially
    await runConnectivityTest();
    await runCORSTest();
    await runSessionTest();
    
    setIsRunning(false);
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">API Connectivity Test</h1>
        <p className="text-muted-foreground">
          Test the connection between the frontend and backend API, including CORS configuration and session management.
        </p>
      </div>

      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
            <CardDescription>Current API configuration settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'}
              </div>
              <div>
                <strong>Environment:</strong> {process.env.NODE_ENV || 'development'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="w-full sm:w-auto"
        >
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      <div className="space-y-4">
        {tests.map((test) => (
          <Card key={test.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{test.name}</CardTitle>
                <Badge className={getStatusColor(test.status)}>
                  {test.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{test.message}</p>
              {test.details ? (
                <details className="mt-2">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    View Details
                  </summary>
                  <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                    {JSON.stringify(test.details, null, 2)}
                  </pre>
                </details>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Troubleshooting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>If connectivity fails:</strong> Check that the backend server is running on the configured port.</p>
              <p><strong>If CORS fails:</strong> Verify that the backend CORS configuration includes the frontend origin.</p>
              <p><strong>If session fails:</strong> Check that session cookies are being set and CSRF tokens are working.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}