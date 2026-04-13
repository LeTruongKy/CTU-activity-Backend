#!/bin/bash

# SV5T Criteria Testing Script
# This script helps test the SV5T implementation and endpoints

API_BASE_URL="http://localhost:3000/api"

echo "========================================"
echo "SV5T Criteria Testing Script"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Test: Get all criteria groups
echo -e "${BLUE}[1] Testing GET /criteria-groups${NC}"
echo "Request: curl ${API_BASE_URL}/criteria-groups"
echo ""
curl -s -X GET "${API_BASE_URL}/criteria-groups" | jq '.' || echo "Failed or no response"
echo ""
echo ""

# 2. Test: Get all criteria (flat)
echo -e "${BLUE}[2] Testing GET /criteria${NC}"
echo "Request: curl ${API_BASE_URL}/criteria"
echo ""
curl -s -X GET "${API_BASE_URL}/criteria" | jq '.' || echo "Failed or no response"
echo ""
echo ""

# 3. Test: Get criteria grouped by category (main endpoint for frontend)
echo -e "${BLUE}[3] Testing GET /criteria/grouped${NC}"
echo "Request: curl ${API_BASE_URL}/criteria/grouped"
echo "This returns criteria organized by their group for easy frontend consumption"
echo ""
curl -s -X GET "${API_BASE_URL}/criteria/grouped" | jq '.' || echo "Failed or no response"
echo ""
echo ""

# 4. Test: Get specific criterion
echo -e "${BLUE}[4] Testing GET /criteria/1${NC}"
echo "Request: curl ${API_BASE_URL}/criteria/1"
echo ""
curl -s -X GET "${API_BASE_URL}/criteria/1" | jq '.' || echo "Failed or no response"
echo ""
echo ""

# 5. Test: Get specific criteria group
echo -e "${BLUE}[5] Testing GET /criteria-groups/1${NC}"
echo "Request: curl ${API_BASE_URL}/criteria-groups/1"
echo ""
curl -s -X GET "${API_BASE_URL}/criteria-groups/1" | jq '.' || echo "Failed or no response"
echo ""
echo ""

# 6. Test: Create an activity with criteria
echo -e "${BLUE}[6] Testing POST /activities with criteriaIds${NC}"
echo "Request: POST /activities with criteria assignment"
echo ""

# First, get a valid user and unit ID from the database
# For this example, we assume user exists and unit ID is 1

read -p "Enter a valid user ID (UUID format) for activity creator: " CREATOR_ID
read -p "Enter a valid unit ID (integer): " UNIT_ID
read -p "Enter criteria IDs to assign (comma-separated, e.g., 1,3,5): " CRITERIA_IDS

# Convert comma-separated criteria IDs to JSON array
CRITERIA_ARRAY=$(echo "[$(echo "$CRITERIA_IDS" | tr ',' ',')]")

ACTIVITY_PAYLOAD=$(cat <<EOF
{
  "title": "Test Activity - SV5T Criteria",
  "description": "This activity tests the criteria assignment feature",
  "categoryId": 1,
  "unitId": $UNIT_ID,
  "location": "Test Location",
  "startTime": "2026-04-15T09:00:00Z",
  "endTime": "2026-04-15T12:00:00Z",
  "maxParticipants": 100,
  "criteriaIds": $CRITERIA_ARRAY
}
EOF
)

echo "Payload:"
echo "$ACTIVITY_PAYLOAD" | jq '.'
echo ""

curl -s -X POST "${API_BASE_URL}/activities" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d "$ACTIVITY_PAYLOAD" | jq '.' || echo "Failed - ensure you're authenticated and IDs are valid"
echo ""
echo ""

# 7. Test: Get activity with criteria
echo -e "${BLUE}[7] Testing GET /activities/:id (should include criteria)${NC}"
echo "Request: curl ${API_BASE_URL}/activities/1"
echo ""
curl -s -X GET "${API_BASE_URL}/activities/1" | jq '.' || echo "Failed or no response"
echo ""
echo ""

# 8. Test: Get all activities (check if criteria appear in list)
echo -e "${BLUE}[8] Testing GET /activities (list should include criteria for each activity)${NC}"
echo "Request: curl ${API_BASE_URL}/activities"
echo ""
curl -s -X GET "${API_BASE_URL}/activities?page=1&limit=5" | jq '.data[0]' || echo "Failed or no response"
echo ""
echo ""

# Summary
echo -e "${GREEN}========================================"
echo "Testing Complete!"
echo "========================================${NC}"
echo ""
echo -e "${YELLOW}Summary of Endpoints:${NC}"
echo "  GET    /criteria              - Get all criteria (flat)"
echo "  GET    /criteria/grouped      - Get criteria grouped by category (recommended for UI)"
echo "  GET    /criteria/:id          - Get single criterion"
echo "  POST   /criteria              - Create criterion"
echo "  PATCH  /criteria/:id          - Update criterion"
echo "  DELETE /criteria/:id          - Delete criterion"
echo ""
echo "  GET    /criteria-groups       - Get all criteria groups with relations"
echo "  GET    /criteria-groups/:id   - Get single group"
echo "  POST   /criteria-groups       - Create group"
echo "  PATCH  /criteria-groups/:id   - Update group"
echo "  DELETE /criteria-groups/:id   - Delete group"
echo ""
echo "  POST   /activities            - Create activity (with criteriaIds array)"
echo "  GET    /activities            - List activities (includes criteria array)"
echo "  GET    /activities/:id        - Get activity with criteria"
echo ""
echo -e "${YELLOW}Key Features:${NC}"
echo "  ✓ Automatic SV5T data seeding on app startup"
echo "  ✓ 5 criteria groups with 18 specific criteria"
echo "  ✓ Many-to-Many relationship between activities and criteria"
echo "  ✓ Grouped endpoint for easy frontend integration"
echo "  ✓ Validation of criteria IDs when creating activities"
echo ""
