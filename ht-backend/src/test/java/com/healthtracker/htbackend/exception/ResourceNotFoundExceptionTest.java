package com.healthtracker.htbackend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ResourceNotFoundExceptionTest {

    @Test
    void testConstructorWithMessage() {
        String message = "Resource not found";
        ResourceNotFoundException exception = new ResourceNotFoundException(message);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    void testInheritanceFromRuntimeException() {
        ResourceNotFoundException exception = new ResourceNotFoundException("Test message");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testExceptionWithNullMessage() {
        ResourceNotFoundException exception = new ResourceNotFoundException(null);
        
        assertNull(exception.getMessage());
    }

    @Test
    void testExceptionWithEmptyMessage() {
        String message = "";
        ResourceNotFoundException exception = new ResourceNotFoundException(message);
        
        assertEquals(message, exception.getMessage());
    }
}