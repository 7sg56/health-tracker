package com.healthtracker.htbackend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class UnauthorizedExceptionTest {

    @Test
    void testConstructorWithMessage() {
        String message = "Unauthorized access";
        UnauthorizedException exception = new UnauthorizedException(message);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    void testInheritanceFromRuntimeException() {
        UnauthorizedException exception = new UnauthorizedException("Test message");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testExceptionWithNullMessage() {
        UnauthorizedException exception = new UnauthorizedException(null);
        
        assertNull(exception.getMessage());
    }

    @Test
    void testExceptionWithEmptyMessage() {
        String message = "";
        UnauthorizedException exception = new UnauthorizedException(message);
        
        assertEquals(message, exception.getMessage());
    }
}