package com.healthtracker.htbackend.exception;

/**
 * Exception thrown when a user is authenticated but not authorized to perform an action.
 * This results in HTTP 403 Forbidden status.
 */
public class ForbiddenException extends RuntimeException {
    
    public ForbiddenException(String message) {
        super(message);
    }
    
    public ForbiddenException(String message, Throwable cause) {
        super(message, cause);
    }
}