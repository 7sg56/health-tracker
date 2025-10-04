package com.healthtracker.htbackend.exception;

import com.healthtracker.htbackend.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerUnitTest {

    private GlobalExceptionHandler globalExceptionHandler;

    @Mock
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        globalExceptionHandler = new GlobalExceptionHandler();
        when(request.getRequestURI()).thenReturn("/test/endpoint");
    }

    @Test
    void testHandleResourceNotFoundException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Resource not found");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleResourceNotFound(exception, request);
        
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(404, errorResponse.getStatus());
        assertEquals("Not Found", errorResponse.getError());
        assertEquals("Resource not found", errorResponse.getMessage());
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleUnauthorizedException() {
        UnauthorizedException exception = new UnauthorizedException("Unauthorized access");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleUnauthorized(exception, request);
        
        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(401, errorResponse.getStatus());
        assertEquals("Unauthorized", errorResponse.getError());
        assertEquals("Unauthorized access", errorResponse.getMessage());
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleConflictException() {
        ConflictException exception = new ConflictException("Conflict occurred");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleConflict(exception, request);
        
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(409, errorResponse.getStatus());
        assertEquals("Conflict", errorResponse.getError());
        assertEquals("Conflict occurred", errorResponse.getMessage());
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleForbiddenException() {
        ForbiddenException exception = new ForbiddenException("Access forbidden");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleForbidden(exception, request);
        
        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(403, errorResponse.getStatus());
        assertEquals("Forbidden", errorResponse.getError());
        assertEquals("Access forbidden", errorResponse.getMessage());
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleGenericException() {
        RuntimeException exception = new RuntimeException("Unexpected error");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleGenericException(exception, request);
        
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(500, errorResponse.getStatus());
        assertEquals("Internal Server Error", errorResponse.getError());
        assertEquals("An unexpected error occurred", errorResponse.getMessage());
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleMethodArgumentTypeMismatchException() throws NoSuchMethodException {
        Method method = String.class.getMethod("valueOf", Object.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        
        MethodArgumentTypeMismatchException exception = new MethodArgumentTypeMismatchException(
                "invalid-value", Long.class, "id", parameter, new NumberFormatException());
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleTypeMismatch(exception, request);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(400, errorResponse.getStatus());
        assertEquals("Bad Request", errorResponse.getError());
        assertTrue(errorResponse.getMessage().contains("Invalid value"));
        assertTrue(errorResponse.getMessage().contains("invalid-value"));
        assertTrue(errorResponse.getMessage().contains("id"));
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
    }

    @Test
    void testHandleValidationExceptions() throws NoSuchMethodException {
        // Create a mock MethodParameter
        Method method = String.class.getMethod("valueOf", Object.class);
        MethodParameter parameter = new MethodParameter(method, 0);
        
        // Create binding result with field errors
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "testObject");
        bindingResult.addError(new FieldError("testObject", "username", "Username is required"));
        bindingResult.addError(new FieldError("testObject", "email", "Email format is invalid"));
        
        MethodArgumentNotValidException exception = new MethodArgumentNotValidException(parameter, bindingResult);
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleValidationExceptions(exception, request);
        
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        ErrorResponse errorResponse = response.getBody();
        assertNotNull(errorResponse);
        assertEquals(400, errorResponse.getStatus());
        assertEquals("Bad Request", errorResponse.getError());
        assertEquals("Validation failed", errorResponse.getMessage());
        assertEquals("/test/endpoint", errorResponse.getPath());
        assertNotNull(errorResponse.getTimestamp());
        
        // Check field errors
        List<ErrorResponse.FieldError> fieldErrors = errorResponse.getDetails();
        assertNotNull(fieldErrors);
        assertEquals(2, fieldErrors.size());
        
        ErrorResponse.FieldError usernameError = fieldErrors.stream()
                .filter(error -> "username".equals(error.getField()))
                .findFirst()
                .orElse(null);
        assertNotNull(usernameError);
        assertEquals("Username is required", usernameError.getMessage());
        
        ErrorResponse.FieldError emailError = fieldErrors.stream()
                .filter(error -> "email".equals(error.getField()))
                .findFirst()
                .orElse(null);
        assertNotNull(emailError);
        assertEquals("Email format is invalid", emailError.getMessage());
    }

    @Test
    void testErrorResponseStructure() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test message");
        
        ResponseEntity<ErrorResponse> response = globalExceptionHandler.handleResourceNotFound(exception, request);
        ErrorResponse errorResponse = response.getBody();
        
        assertNotNull(errorResponse);
        assertNotNull(errorResponse.getTimestamp());
        assertTrue(errorResponse.getStatus() > 0);
        assertNotNull(errorResponse.getError());
        assertNotNull(errorResponse.getMessage());
        assertNotNull(errorResponse.getPath());
    }
}