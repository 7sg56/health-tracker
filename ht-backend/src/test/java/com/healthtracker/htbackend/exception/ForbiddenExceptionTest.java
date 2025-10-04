package com.healthtracker.htbackend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ForbiddenExceptionTest {

    @Test
    void testConstructorWithMessage() {
        String message = "Access forbidden";
        ForbiddenException exception = new ForbiddenException(message);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    void testConstructorWithMessageAndCause() {
        String message = "Access forbidden";
        Throwable cause = new RuntimeException("Root cause");
        ForbiddenException exception = new ForbiddenException(message, cause);
        
        assertEquals(message, exception.getMessage());
        assertEquals(cause, exception.getCause());
    }

    @Test
    void testInheritanceFromRuntimeException() {
        ForbiddenException exception = new ForbiddenException("Test message");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testExceptionWithNullMessage() {
        ForbiddenException exception = new ForbiddenException(null);
        
        assertNull(exception.getMessage());
    }

    @Test
    void testExceptionWithEmptyMessage() {
        String message = "";
        ForbiddenException exception = new ForbiddenException(message);
        
        assertEquals(message, exception.getMessage());
    }

    @Test
    void testExceptionWithNullCause() {
        String message = "Test message";
        ForbiddenException exception = new ForbiddenException(message, null);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }
}