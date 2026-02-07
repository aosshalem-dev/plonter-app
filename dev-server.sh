#!/bin/bash

# Local Development Server Manager for Plonter App

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PORT=${1:-8080}
PID_FILE=".dev-server.pid"

case "${2:-start}" in
    "start")
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}⚠️  Server already running on port $PORT (PID: $PID)${NC}"
                echo -e "${BLUE}🌐 Open: http://localhost:$PORT${NC}"
                exit 1
            else
                rm "$PID_FILE"
            fi
        fi
        
        echo -e "${BLUE}🚀 Starting development server on port $PORT...${NC}"
        python3 -m http.server $PORT > /dev/null 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > "$PID_FILE"
        
        # Wait a moment and check if server started successfully
        sleep 2
        if ps -p $SERVER_PID > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Server running successfully!${NC}"
            echo -e "${BLUE}🌐 Open: http://localhost:$PORT${NC}"
            echo -e "${BLUE}📱 Network: http://$(ipconfig getifaddr en0):$PORT${NC}" 2>/dev/null || true
            echo -e "${YELLOW}💡 Stop with: ./dev-server.sh $PORT stop${NC}"
        else
            echo -e "${RED}❌ Failed to start server${NC}"
            rm "$PID_FILE" 2>/dev/null || true
            exit 1
        fi
        ;;
        
    "stop")
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${YELLOW}🛑 Stopping server (PID: $PID)...${NC}"
                kill $PID
                rm "$PID_FILE"
                echo -e "${GREEN}✅ Server stopped${NC}"
            else
                echo -e "${YELLOW}⚠️  Server not running${NC}"
                rm "$PID_FILE"
            fi
        else
            echo -e "${YELLOW}⚠️  No server PID file found${NC}"
        fi
        ;;
        
    "restart")
        $0 $PORT stop
        sleep 1
        $0 $PORT start
        ;;
        
    "status")
        if [ -f "$PID_FILE" ]; then
            PID=$(cat "$PID_FILE")
            if ps -p $PID > /dev/null 2>&1; then
                echo -e "${GREEN}✅ Server running on port $PORT (PID: $PID)${NC}"
                echo -e "${BLUE}🌐 http://localhost:$PORT${NC}"
            else
                echo -e "${RED}❌ Server not running (stale PID file)${NC}"
                rm "$PID_FILE"
            fi
        else
            echo -e "${RED}❌ Server not running${NC}"
        fi
        ;;
        
    *)
        echo "Usage: $0 [port] [start|stop|restart|status]"
        echo "Default port: 8080"
        echo
        echo "Examples:"
        echo "  $0                    # Start on port 8080"
        echo "  $0 3000               # Start on port 3000"
        echo "  $0 8080 stop          # Stop server on port 8080"
        echo "  $0 8080 status        # Check server status"
        ;;
esac