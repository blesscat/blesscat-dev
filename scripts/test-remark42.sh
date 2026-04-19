#!/bin/bash
# Test Remark42 API endpoints

BASE_URL="https://remark42.blesscat.dev"
SITE="blog"

echo "=== Remark42 API Test ==="
echo ""

echo "1. Health check (/ping):"
curl -s "$BASE_URL/ping"
echo -e "\n"

echo "2. Get comments for a page:"
curl -s "$BASE_URL/api/v1/find?site=$SITE&url=https://blog.blesscat.dev/test"
echo -e "\n"

echo "3. Get user ID (for reply tracking):"
curl -s "$BASE_URL/api/v1/user?id=anon&site=$SITE"
echo -e "\n"

echo "4. Check all comments (no URL filter):"
curl -s "$BASE_URL/api/v1/find?site=$SITE"
echo -e "\n"
