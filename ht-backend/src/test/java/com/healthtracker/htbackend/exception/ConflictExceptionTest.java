package com.healthtracker.htbackend.exception;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ConflictExceptionTest {

    @Test
    void testConstructorWithMessage() {
        String message = "Conflict occurred";
        ConflictException exception = new ConflictException(message);
        
        assertEquals(message, exception.getMessage());
        assertNull(exception.getCause());
    }

    @Test
    void testInheritanceFromRuntimeException() {
        ConflictException exception = new ConflictException("Test message");
        
        assertTrue(exception instanceof RuntimeException);
    }

    @Test
    void testExceptionWithNullMessage() {
        ConflictException exception = new ConflictException(null);
        
        assertNull(exception.getMessage());
    }

    @Test
    void testExceptionWithEmptyMessage() {
        String message = "";
        ConflictException exception = new ConflictException(message);
        
        assertEquals(message, exception.getMessage());
    }
}