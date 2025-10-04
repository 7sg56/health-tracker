#!/bin/bash

# Health Tracker Backend - Production Startup Script
# This script sets up and starts the Health Tracker Backend in production mode

set -e

# Configuration
APP_NAME="Health Tracker Backend"
JAR_FILE="../target/ht-backend-*.jar"
PID_FILE="/var/run/healthtracker/healthtracker.pid"
LOG_DIR="/var/log/healthtracker"
APP_USER="healthtracker"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking requirements..."
    
    # Check Java version
    if ! command -v java &> /dev/null; then
        log_error "Java is not installed or not in PATH"
        exit 1
    fi
    
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -lt 21 ]; then
        log_error "Java 21 or higher is required. Current version: $JAVA_VERSION"
        exit 1
    fi
    
    log_info "Java version: $JAVA_VERSION ✓"
    
    # Check if JAR file exists
    if ! ls $JAR_FILE 1> /dev/null 2>&1; then
        log_error "JAR file not found: $JAR_FILE"
        log_info "Please build the application first: ./mvnw clean package"
        exit 1
    fi
    
    log_info "JAR file found ✓"
}

setup_directories() {
    log_info "Setting up directories..."
    
    # Create log directory
    sudo mkdir -p "$LOG_DIR"
    sudo mkdir -p "$(dirname "$PID_FILE")"
    
    # Set permissions
    if id "$APP_USER" &>/dev/null; then
        sudo chown -R "$APP_USER:$APP_USER" "$LOG_DIR"
        sudo chown -R "$APP_USER:$APP_USER" "$(dirname "$PID_FILE")"
        log_info "Directories created and permissions set ✓"
    else
        log_warn "User '$APP_USER' does not exist. Running as current user."
    fi
}

check_environment() {
    log_info "Checking environment variables..."
    
    # Required environment variables
    REQUIRED_VARS=("DB_URL" "DB_USERNAME" "DB_PASSWORD")
    
    for var in "${REQUIRED_VARS[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "Required environment variable $var is not set"
            log_info "Please set all required environment variables or use a .env file"
            exit 1
        fi
    done
    
    log_info "Environment variables configured ✓"
}

start_application() {
    log_info "Starting $APP_NAME..."
    
    # JVM options for production
    JVM_OPTS="-Xms512m -Xmx2g"
    JVM_OPTS="$JVM_OPTS -XX:+UseG1GC"
    JVM_OPTS="$JVM_OPTS -XX:MaxGCPauseMillis=200"
    JVM_OPTS="$JVM_OPTS -XX:+HeapDumpOnOutOfMemoryError"
    JVM_OPTS="$JVM_OPTS -XX:HeapDumpPath=$LOG_DIR/"
    
    # Spring profile
    SPRING_OPTS="-Dspring.profiles.active=prod"
    
    # Build command
    CMD="java $JVM_OPTS $SPRING_OPTS -jar $JAR_FILE"
    
    # Start application
    if id "$APP_USER" &>/dev/null; then
        sudo -u "$APP_USER" nohup $CMD > "$LOG_DIR/startup.log" 2>&1 &
    else
        nohup $CMD > "$LOG_DIR/startup.log" 2>&1 &
    fi
    
    APP_PID=$!
    echo $APP_PID > "$PID_FILE"
    
    log_info "$APP_NAME started with PID: $APP_PID"
    log_info "Logs are available at: $LOG_DIR/"
    
    # Wait a moment and check if process is still running
    sleep 5
    if kill -0 $APP_PID 2>/dev/null; then
        log_info "$APP_NAME is running successfully ✓"
        log_info "Health check: curl http://localhost:8081/actuator/health"
    else
        log_error "$APP_NAME failed to start. Check logs at $LOG_DIR/startup.log"
        exit 1
    fi
}

stop_application() {
    log_info "Stopping $APP_NAME..."
    
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            sleep 5
            if kill -0 $PID 2>/dev/null; then
                log_warn "Process still running, force killing..."
                kill -9 $PID
            fi
            rm -f "$PID_FILE"
            log_info "$APP_NAME stopped ✓"
        else
            log_warn "Process not running"
            rm -f "$PID_FILE"
        fi
    else
        log_warn "PID file not found"
    fi
}

status_application() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if kill -0 $PID 2>/dev/null; then
            log_info "$APP_NAME is running (PID: $PID)"
            
            # Check health endpoint
            if command -v curl &> /dev/null; then
                if curl -s http://localhost:8081/actuator/health > /dev/null; then
                    log_info "Health check: HEALTHY ✓"
                else
                    log_warn "Health check: UNHEALTHY"
                fi
            fi
        else
            log_warn "$APP_NAME is not running (stale PID file)"
            rm -f "$PID_FILE"
        fi
    else
        log_info "$APP_NAME is not running"
    fi
}

# Main script
case "$1" in
    start)
        check_requirements
        setup_directories
        check_environment
        start_application
        ;;
    stop)
        stop_application
        ;;
    restart)
        stop_application
        sleep 2
        check_requirements
        setup_directories
        check_environment
        start_application
        ;;
    status)
        status_application
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        echo ""
        echo "Environment variables required for start/restart:"
        echo "  DB_URL - Database connection URL"
        echo "  DB_USERNAME - Database username"
        echo "  DB_PASSWORD - Database password"
        echo ""
        echo "Optional environment variables:"
        echo "  COOKIE_DOMAIN - Domain for session cookies"
        echo "  SSL_ENABLED - Enable SSL (true/false)"
        echo "  SSL_KEYSTORE - Path to SSL keystore"
        echo "  SSL_KEYSTORE_PASSWORD - SSL keystore password"
        echo "  LOG_FILE_PATH - Custom log file path"
        echo "  MANAGEMENT_PORT - Management endpoint port (default: 8081)"
        exit 1
        ;;
esac

exit 0