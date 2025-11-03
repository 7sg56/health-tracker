#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting HealthTracker Development Environment${NC}"

# Function to cleanup processes on exit
cleanup() {
    echo -e "\n${YELLOW}🛑 Shutting down services...${NC}"
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Start backend
echo -e "${YELLOW}📦 Starting Backend (Java Spring Boot)...${NC}"
cd ht-backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 5

# Start frontend
echo -e "${YELLOW}🌐 Starting Frontend (Next.js)...${NC}"
cd ht-frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo -e "${GREEN}✅ Services started!${NC}"
echo -e "${GREEN}🔗 Backend: http://localhost:8080${NC}"
echo -e "${GREEN}🔗 Frontend: http://localhost:3002${NC}"
echo -e "${YELLOW}📝 Press Ctrl+C to stop all services${NC}"

# Wait for processes to finish
wait $BACKEND_PID $FRONTEND_PID