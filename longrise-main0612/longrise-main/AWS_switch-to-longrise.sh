#!/bin/bash
# Longrise AWS 계정으로 빠른 전환 스크립트

echo "🔄 Longrise AWS 계정으로 전환 중..."

# Longrise 키 설정 (환경변수 방식)
unset AWS_PROFILE
export AWS_ACCESS_KEY_ID=AKIARE73K53WCXFHSATT
export AWS_SECRET_ACCESS_KEY=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
export AWS_REGION=ap-northeast-2

# 전환 확인
echo "📋 현재 AWS 계정 정보:"
aws sts get-caller-identity

# 계정 확인
ACCOUNT=$(aws sts get-caller-identity --query Account --output text 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "✅ Longrise 계정 ($ACCOUNT)으로 전환 완료"
    echo "   사용자: longrise-admin"
    echo "   권한: 프로젝트 전용 권한"
else
    echo "❌ 전환 실패 - AWS CLI 설정을 확인해주세요"
    echo "   - AWS CLI가 설치되어 있는지 확인"
    echo "   - 네트워크 연결 상태 확인"
    echo "   - AWS 자격 증명이 올바른지 확인"
fi

echo ""
echo "💡 이 터미널 세션에서 Longrise AWS 서비스를 사용할 수 있습니다."
echo "⚠️  보안상 다른 터미널에서는 별도로 실행해주세요."