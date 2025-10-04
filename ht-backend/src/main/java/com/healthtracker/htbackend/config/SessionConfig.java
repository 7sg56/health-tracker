package com.healthtracker.htbackend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.servlet.ServletListenerRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.web.session.HttpSessionEventPublisher;


import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import jakarta.servlet.http.HttpSessionAttributeListener;
import jakarta.servlet.http.HttpSessionBindingEvent;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

@Configuration
public class SessionConfig {

    private static final Logger logger = LoggerFactory.getLogger(SessionConfig.class);



    /**
     * Register custom session listener for session event handling
     */
    @Bean
    public ServletListenerRegistrationBean<HttpSessionListener> sessionListener() {
        return new ServletListenerRegistrationBean<>(new CustomSessionListener());
    }

    /**
     * Register session attribute listener for tracking session data changes
     */
    @Bean
    public ServletListenerRegistrationBean<HttpSessionAttributeListener> sessionAttributeListener() {
        return new ServletListenerRegistrationBean<>(new CustomSessionAttributeListener());
    }



    /**
     * Custom session listener to handle session lifecycle events
     */
    public static class CustomSessionListener implements HttpSessionListener {
        
        private static final Logger sessionLogger = LoggerFactory.getLogger(CustomSessionListener.class);
        private static final int SESSION_TIMEOUT_SECONDS = 86400; // 24 hours
        
        // Track active sessions for monitoring
        private static final Map<String, SessionInfo> activeSessions = new ConcurrentHashMap<>();
        
        @Override
        public void sessionCreated(HttpSessionEvent se) {
            // Set session timeout to 24 hours (86400 seconds)
            se.getSession().setMaxInactiveInterval(SESSION_TIMEOUT_SECONDS);
            
            String sessionId = se.getSession().getId();
            LocalDateTime createdAt = LocalDateTime.now();
            String timestamp = createdAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            sessionLogger.info("Session created: {} at {} (timeout: {}s)", sessionId, timestamp, SESSION_TIMEOUT_SECONDS);
            
            // Set session security attributes
            se.getSession().setAttribute("createdAt", createdAt);
            se.getSession().setAttribute("lastAccessedAt", createdAt);
            se.getSession().setAttribute("sessionSecure", true);
            
            // Track session for monitoring
            activeSessions.put(sessionId, new SessionInfo(sessionId, createdAt));
            
            sessionLogger.debug("Active sessions count: {}", activeSessions.size());
        }

        @Override
        public void sessionDestroyed(HttpSessionEvent se) {
            String sessionId = se.getSession().getId();
            LocalDateTime destroyedAt = LocalDateTime.now();
            String timestamp = destroyedAt.format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            
            // Calculate session duration
            LocalDateTime createdAt = (LocalDateTime) se.getSession().getAttribute("createdAt");
            long durationMinutes = 0;
            if (createdAt != null) {
                durationMinutes = java.time.Duration.between(createdAt, destroyedAt).toMinutes();
            }
            
            sessionLogger.info("Session destroyed: {} at {} (duration: {} minutes)", 
                sessionId, timestamp, durationMinutes);
            
            // Clean up session resources
            cleanupSessionResources(se);
            
            // Remove from active sessions tracking
            activeSessions.remove(sessionId);
            
            sessionLogger.debug("Active sessions count after cleanup: {}", activeSessions.size());
        }
        
        /**
         * Clean up session-specific resources and perform security cleanup
         */
        private void cleanupSessionResources(HttpSessionEvent se) {
            try {
                String sessionId = se.getSession().getId();
                
                // Clear sensitive session attributes
                se.getSession().removeAttribute("userId");
                se.getSession().removeAttribute("userEmail");
                se.getSession().removeAttribute("lastAccessedAt");
                
                sessionLogger.debug("Session resources cleaned up for session: {}", sessionId);
                
            } catch (Exception e) {
                sessionLogger.error("Error cleaning up session resources", e);
            }
        }
        
        /**
         * Get count of active sessions (for monitoring)
         */
        public static int getActiveSessionCount() {
            return activeSessions.size();
        }
        
        /**
         * Get active session information (for monitoring)
         */
        public static Map<String, SessionInfo> getActiveSessions() {
            return new ConcurrentHashMap<>(activeSessions);
        }
        
        /**
         * Clear all active sessions (for testing)
         */
        public static void clearActiveSessions() {
            activeSessions.clear();
        }
    }

    /**
     * Custom session attribute listener to track session data changes
     */
    public static class CustomSessionAttributeListener implements HttpSessionAttributeListener {
        
        private static final Logger attributeLogger = LoggerFactory.getLogger(CustomSessionAttributeListener.class);
        
        @Override
        public void attributeAdded(HttpSessionBindingEvent se) {
            String sessionId = se.getSession().getId();
            String attributeName = se.getName();
            
            // Log important attribute additions (avoid logging sensitive data)
            if (isImportantAttribute(attributeName)) {
                attributeLogger.debug("Session attribute added - Session: {}, Attribute: {}", 
                    sessionId, attributeName);
            }
            
            // Update last accessed time
            se.getSession().setAttribute("lastAccessedAt", LocalDateTime.now());
        }
        
        @Override
        public void attributeRemoved(HttpSessionBindingEvent se) {
            String sessionId = se.getSession().getId();
            String attributeName = se.getName();
            
            if (isImportantAttribute(attributeName)) {
                attributeLogger.debug("Session attribute removed - Session: {}, Attribute: {}", 
                    sessionId, attributeName);
            }
        }
        
        @Override
        public void attributeReplaced(HttpSessionBindingEvent se) {
            String sessionId = se.getSession().getId();
            String attributeName = se.getName();
            
            if (isImportantAttribute(attributeName)) {
                attributeLogger.debug("Session attribute replaced - Session: {}, Attribute: {}", 
                    sessionId, attributeName);
            }
            
            // Update last accessed time
            se.getSession().setAttribute("lastAccessedAt", LocalDateTime.now());
        }
        
        /**
         * Check if attribute is important enough to log (avoid logging sensitive data)
         */
        private boolean isImportantAttribute(String attributeName) {
            return attributeName != null && 
                   !attributeName.equals("password") && 
                   !attributeName.equals("token") &&
                   !attributeName.startsWith("SPRING_SECURITY");
        }
    }
    
    /**
     * Session information holder for monitoring
     */
    public static class SessionInfo {
        private final String sessionId;
        private final LocalDateTime createdAt;
        
        public SessionInfo(String sessionId, LocalDateTime createdAt) {
            this.sessionId = sessionId;
            this.createdAt = createdAt;
        }
        
        public String getSessionId() { return sessionId; }
        public LocalDateTime getCreatedAt() { return createdAt; }
        
        public long getDurationMinutes() {
            return java.time.Duration.between(createdAt, LocalDateTime.now()).toMinutes();
        }
    }
}