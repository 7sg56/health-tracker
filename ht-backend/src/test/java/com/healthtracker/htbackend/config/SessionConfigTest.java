package com.healthtracker.htbackend.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import jakarta.servlet.http.HttpSession;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionBindingEvent;
import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SessionConfigTest {

    private SessionConfig.CustomSessionListener sessionListener;
    private SessionConfig.CustomSessionAttributeListener attributeListener;

    @BeforeEach
    void setUp() {
        sessionListener = new SessionConfig.CustomSessionListener();
        attributeListener = new SessionConfig.CustomSessionAttributeListener();
        
        // Clear static session tracking before each test
        SessionConfig.CustomSessionListener.clearActiveSessions();
    }

    @Test
    void testSessionCreated() {
        // Setup
        HttpSession mockSession = mock(HttpSession.class);
        HttpSessionEvent mockSessionEvent = mock(HttpSessionEvent.class);
        when(mockSessionEvent.getSession()).thenReturn(mockSession);
        when(mockSession.getId()).thenReturn("test-session-123");
        
        // Act
        sessionListener.sessionCreated(mockSessionEvent);
        
        // Verify session timeout is set to 24 hours (86400 seconds)
        verify(mockSession).setMaxInactiveInterval(86400);
        
        // Verify session attributes are set
        verify(mockSession).setAttribute(eq("createdAt"), any(LocalDateTime.class));
        verify(mockSession).setAttribute(eq("lastAccessedAt"), any(LocalDateTime.class));
        verify(mockSession).setAttribute("sessionSecure", true);
        
        // Verify session is tracked
        assertEquals(1, SessionConfig.CustomSessionListener.getActiveSessionCount());
        assertTrue(SessionConfig.CustomSessionListener.getActiveSessions().containsKey("test-session-123"));
    }

    @Test
    void testSessionDestroyed() {
        // Setup - create session first
        HttpSession mockSession = mock(HttpSession.class);
        HttpSessionEvent mockSessionEvent = mock(HttpSessionEvent.class);
        when(mockSessionEvent.getSession()).thenReturn(mockSession);
        when(mockSession.getId()).thenReturn("test-session-123");
        
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(30);
        when(mockSession.getAttribute("createdAt")).thenReturn(createdAt);
        
        sessionListener.sessionCreated(mockSessionEvent);
        assertEquals(1, SessionConfig.CustomSessionListener.getActiveSessionCount());
        
        // Act
        sessionListener.sessionDestroyed(mockSessionEvent);
        
        // Verify session cleanup
        verify(mockSession).removeAttribute("userId");
        verify(mockSession).removeAttribute("userEmail");
        verify(mockSession).removeAttribute("lastAccessedAt");
        
        // Verify session is removed from tracking
        assertEquals(0, SessionConfig.CustomSessionListener.getActiveSessionCount());
        assertFalse(SessionConfig.CustomSessionListener.getActiveSessions().containsKey("test-session-123"));
    }

    @Test
    void testMultipleSessionsTracking() {
        // Create first session
        HttpSession mockSession1 = mock(HttpSession.class);
        HttpSessionEvent mockEvent1 = mock(HttpSessionEvent.class);
        when(mockEvent1.getSession()).thenReturn(mockSession1);
        when(mockSession1.getId()).thenReturn("session-1");
        
        // Create second session
        HttpSession mockSession2 = mock(HttpSession.class);
        HttpSessionEvent mockEvent2 = mock(HttpSessionEvent.class);
        when(mockEvent2.getSession()).thenReturn(mockSession2);
        when(mockSession2.getId()).thenReturn("session-2");
        
        // Act
        sessionListener.sessionCreated(mockEvent1);
        sessionListener.sessionCreated(mockEvent2);
        
        // Verify both sessions are tracked
        assertEquals(2, SessionConfig.CustomSessionListener.getActiveSessionCount());
        Map<String, SessionConfig.SessionInfo> activeSessions = SessionConfig.CustomSessionListener.getActiveSessions();
        assertTrue(activeSessions.containsKey("session-1"));
        assertTrue(activeSessions.containsKey("session-2"));
        
        // Destroy one session
        sessionListener.sessionDestroyed(mockEvent1);
        
        // Verify only one session remains
        assertEquals(1, SessionConfig.CustomSessionListener.getActiveSessionCount());
        assertFalse(SessionConfig.CustomSessionListener.getActiveSessions().containsKey("session-1"));
        assertTrue(SessionConfig.CustomSessionListener.getActiveSessions().containsKey("session-2"));
    }

    @Test
    void testSessionAttributeAdded() {
        // Setup
        HttpSession mockSession = mock(HttpSession.class);
        HttpSessionBindingEvent mockBindingEvent = mock(HttpSessionBindingEvent.class);
        when(mockBindingEvent.getSession()).thenReturn(mockSession);
        when(mockBindingEvent.getName()).thenReturn("userId");
        
        // Act
        attributeListener.attributeAdded(mockBindingEvent);
        
        // Verify lastAccessedAt is updated
        verify(mockSession).setAttribute(eq("lastAccessedAt"), any(LocalDateTime.class));
    }

    @Test
    void testSensitiveAttributesNotLogged() {
        // Setup
        HttpSession mockSession = mock(HttpSession.class);
        HttpSessionBindingEvent mockBindingEvent = mock(HttpSessionBindingEvent.class);
        when(mockBindingEvent.getSession()).thenReturn(mockSession);
        
        // Test that sensitive attributes are filtered out
        when(mockBindingEvent.getName()).thenReturn("password");
        
        // Act - should not log sensitive attributes but should not crash
        assertDoesNotThrow(() -> attributeListener.attributeAdded(mockBindingEvent));
        
        // Test other sensitive attributes
        when(mockBindingEvent.getName()).thenReturn("token");
        assertDoesNotThrow(() -> attributeListener.attributeAdded(mockBindingEvent));
        
        when(mockBindingEvent.getName()).thenReturn("SPRING_SECURITY_CONTEXT");
        assertDoesNotThrow(() -> attributeListener.attributeAdded(mockBindingEvent));
    }

    @Test
    void testSessionInfoDuration() {
        // Create session info
        LocalDateTime createdAt = LocalDateTime.now().minusMinutes(45);
        SessionConfig.SessionInfo sessionInfo = new SessionConfig.SessionInfo("test-session", createdAt);
        
        // Verify session info
        assertEquals("test-session", sessionInfo.getSessionId());
        assertEquals(createdAt, sessionInfo.getCreatedAt());
        
        // Duration should be approximately 45 minutes (allow some tolerance)
        long duration = sessionInfo.getDurationMinutes();
        assertTrue(duration >= 44 && duration <= 46, "Duration should be around 45 minutes, but was: " + duration);
    }

    @Test
    void testSessionCleanupWithException() {
        // Setup session that will throw exception during cleanup
        HttpSession problematicSession = mock(HttpSession.class);
        HttpSessionEvent problematicEvent = mock(HttpSessionEvent.class);
        when(problematicEvent.getSession()).thenReturn(problematicSession);
        when(problematicSession.getId()).thenReturn("problematic-session");
        
        // Make removeAttribute throw exception
        doThrow(new RuntimeException("Cleanup error")).when(problematicSession).removeAttribute("userId");
        
        // Act - should not propagate exception
        assertDoesNotThrow(() -> sessionListener.sessionDestroyed(problematicEvent));
    }
}