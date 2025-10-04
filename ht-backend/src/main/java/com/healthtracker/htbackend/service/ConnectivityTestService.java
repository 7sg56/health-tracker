package com.healthtracker.htbackend.service;

import com.healthtracker.htbackend.dto.PaginatedResponse;
import com.healthtracker.testing.api.EndpointTestSuite;
import com.healthtracker.testing.api.EndpointTester;
import com.healthtracker.testing.config.TestConfiguration;
import com.healthtracker.testing.cors.CrossOriginTester;
import com.healthtracker.testing.database.DatabaseConnectionTester;
import com.healthtracker.testing.integration.IntegrationTester;
import com.healthtracker.testing.integration.IntegrationTestSuite;
import com.healthtracker.testing.reporting.TestReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ConnectivityTestService {

    @Autowired
    private DatabaseConnectionTester databaseTester;

    @Autowired
    private EndpointTester endpointTester;

    @Autowired
    private CrossOriginTester corsTester;

    @Autowired
    private IntegrationTester integrationTester;

    @Autowired
    private TestResultRepository testResultRepository;

    public TestReport runDatabaseTests(TestConfiguration config) {
        try {
            TestReport report = databaseTester.runComprehensiveTests(config);
            testResultRepository.save(report);
            return report;
        } catch (Exception e) {
            return createErrorReport("DATABASE_TEST", e);
        }
    }

    public EndpointTestSuite runApiTests(TestConfiguration config) {
        try {
            EndpointTestSuite results = endpointTester.runAllEndpointTests(config);
            TestReport report = convertToReport(results, "API_TEST");
            testResultRepository.save(report);
            return results;
        } catch (Exception e) {
            throw new RuntimeException("API tests failed", e);
        }
    }

    public TestReport runCorsTests(TestConfiguration config) {
        try {
            TestReport report = corsTester.runComprehensiveTests(config);
            testResultRepository.save(report);
            return report;
        } catch (Exception e) {
            return createErrorReport("CORS_TEST", e);
        }
    }

    public IntegrationTestSuite runIntegrationTests(TestConfiguration config) {
        try {
            IntegrationTestSuite results = integrationTester.runAllIntegrationTests(config);
            TestReport report = convertToReport(results, "INTEGRATION_TEST");
            testResultRepository.save(report);
            return results;
        } catch (Exception e) {
            throw new RuntimeException("Integration tests failed", e);
        }
    }

    public TestReport runAllTests(TestConfiguration config) {
        TestReport combinedReport = new TestReport();
        combinedReport.setTestType("ALL_TESTS");
        combinedReport.setStartTime(LocalDateTime.now());

        try {
            // Run database tests
            TestReport dbReport = runDatabaseTests(config);
            combinedReport.addSubReport("database", dbReport);

            // Run API tests
            EndpointTestSuite apiResults = runApiTests(config);
            TestReport apiReport = convertToReport(apiResults, "API_TEST");
            combinedReport.addSubReport("api", apiReport);

            // Run CORS tests
            TestReport corsReport = runCorsTests(config);
            combinedReport.addSubReport("cors", corsReport);

            // Run integration tests
            IntegrationTestSuite integrationResults = runIntegrationTests(config);
            TestReport integrationReport = convertToReport(integrationResults, "INTEGRATION_TEST");
            combinedReport.addSubReport("integration", integrationReport);

            combinedReport.setEndTime(LocalDateTime.now());
            combinedReport.setStatus(calculateOverallStatus(combinedReport));
            
            testResultRepository.save(combinedReport);
            return combinedReport;
        } catch (Exception e) {
            combinedReport.setEndTime(LocalDateTime.now());
            combinedReport.setStatus("FAILED");
            combinedReport.setError(e.getMessage());
            testResultRepository.save(combinedReport);
            return combinedReport;
        }
    }

    public PaginatedResponse<TestReport> getTestResults(String testType, String status, 
            LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        return testResultRepository.findWithFilters(testType, status, startDate, endDate, pageable);
    }

    public TestReport getTestResult(String testId) {
        return testResultRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test result not found: " + testId));
    }

    public Map<String, Object> getSystemHealth() {
        Map<String, Object> health = new HashMap<>();
        
        try {
            // Check database connectivity
            boolean dbHealthy = databaseTester.isHealthy();
            health.put("database", Map.of(
                "status", dbHealthy ? "UP" : "DOWN",
                "lastChecked", LocalDateTime.now()
            ));

            // Check API endpoints
            boolean apiHealthy = endpointTester.isHealthy();
            health.put("api", Map.of(
                "status", apiHealthy ? "UP" : "DOWN",
                "lastChecked", LocalDateTime.now()
            ));

            // Overall status
            boolean overallHealthy = dbHealthy && apiHealthy;
            health.put("overall", Map.of(
                "status", overallHealthy ? "UP" : "DOWN",
                "timestamp", LocalDateTime.now()
            ));

        } catch (Exception e) {
            health.put("error", e.getMessage());
            health.put("overall", Map.of("status", "ERROR"));
        }

        return health;
    }

    public Map<String, Object> cleanupTestResults(int daysToKeep, String testType) {
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(daysToKeep);
        int deletedCount = testResultRepository.deleteOldResults(cutoffDate, testType);
        
        return Map.of(
            "deletedCount", deletedCount,
            "cutoffDate", cutoffDate,
            "testType", testType != null ? testType : "ALL"
        );
    }

    private TestReport createErrorReport(String testType, Exception e) {
        TestReport report = new TestReport();
        report.setTestType(testType);
        report.setStartTime(LocalDateTime.now());
        report.setEndTime(LocalDateTime.now());
        report.setStatus("ERROR");
        report.setError(e.getMessage());
        return report;
    }

    private TestReport convertToReport(Object testResults, String testType) {
        TestReport report = new TestReport();
        report.setTestType(testType);
        report.setStartTime(LocalDateTime.now());
        report.setEndTime(LocalDateTime.now());
        report.setResults(testResults);
        report.setStatus("COMPLETED");
        return report;
    }

    private String calculateOverallStatus(TestReport combinedReport) {
        // Logic to determine overall status based on sub-reports
        return "COMPLETED";
    }
}