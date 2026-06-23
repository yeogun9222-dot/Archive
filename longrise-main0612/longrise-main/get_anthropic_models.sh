#!/bin/bash
# Anthropic API 모델 목록 조회 스크립트

echo "🔍 Anthropic API 사용 가능한 모델 조회 중..."
echo

# API 키 입력 받기
if [ -z "$ANTHROPIC_API_KEY" ]; then
    read -p "Anthropic API 키를 입력하세요: " API_KEY
    if [ -z "$API_KEY" ]; then
        echo "❌ API 키가 제공되지 않았습니다."
        exit 1
    fi
else
    API_KEY="$ANTHROPIC_API_KEY"
fi

echo "📡 API 호출 중..."

# 모델 목록 조회
response=$(curl -s \
    -H "x-api-key: $API_KEY" \
    -H "anthropic-version: 2023-06-01" \
    "https://api.anthropic.com/v1/models")

# 에러 체크
if echo "$response" | grep -q '"type":"error"'; then
    echo "❌ API 호출 실패:"
    echo "$response" | jq -r '.error.message' 2>/dev/null || echo "$response"
    exit 1
fi

echo "✅ 성공! 사용 가능한 모델 목록:"
echo "=================================================="

# jq가 설치되어 있는지 확인
if command -v jq >/dev/null 2>&1; then
    echo "$response" | jq -r '.data[] | "🤖 \(.id) - \(.display_name)"'

    echo
    echo "📊 모델 개수: $(echo "$response" | jq '.data | length')"

    echo
    echo "💡 추천 모델들:"
    echo "$response" | jq -r '.data[] | select(.id | contains("sonnet") or contains("haiku")) | "  - \(.id) (\(.display_name))"' | head -3

    echo
    echo "🎯 RumbleSurge에서 사용할 수 있는 모델명:"
    echo "$response" | jq -r '.data[0:5][] | "  \(.id)"'

else
    # jq가 없는 경우 grep으로 파싱
    echo "⚠️  jq가 설치되어 있지 않아 간단한 출력만 제공합니다."
    echo "전체 응답:"
    echo "$response"

    echo
    echo "💡 jq 설치 권장: brew install jq"
fi