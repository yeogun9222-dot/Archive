#!/usr/bin/env python3
"""
Anthropic API 모델 테스트 스크립트
실제 사용 가능한 모델명을 확인합니다.
"""

import sys
import json

# anthropic 패키지 설치 확인
try:
    import anthropic
except ImportError:
    print("anthropic 패키지가 설치되어 있지 않습니다.")
    print("설치 명령: pip install anthropic")
    sys.exit(1)

# 테스트할 모델 목록
TEST_MODELS = [
    # Claude 3 시리즈
    "claude-3-opus-20240229",
    "claude-3-sonnet-20240229",
    "claude-3-haiku-20240307",

    # Claude 3.5 시리즈 (다양한 날짜 버전)
    "claude-3-5-sonnet-20240620",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",

    # 기타 가능한 버전들
    "claude-3-5-sonnet-latest",
    "claude-3-sonnet-latest",
    "claude-3-haiku-latest",
]

def test_model(client, model_name):
    """특정 모델로 간단한 API 호출 테스트"""
    try:
        response = client.messages.create(
            model=model_name,
            max_tokens=10,
            messages=[
                {"role": "user", "content": "Hi"}
            ]
        )
        return True, f"✅ {model_name} - 작동함"
    except anthropic.NotFoundError:
        return False, f"❌ {model_name} - not_found_error"
    except anthropic.AuthenticationError:
        return False, f"🔐 {model_name} - 인증 오류 (API 키 확인 필요)"
    except Exception as e:
        return False, f"⚠️ {model_name} - 기타 오류: {str(e)[:50]}"

def main():
    # API 키 확인
    api_key = input("Anthropic API 키를 입력하세요 (Enter로 환경변수 사용): ").strip()

    if not api_key:
        import os
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            print("❌ API 키가 제공되지 않았습니다.")
            print("환경변수 ANTHROPIC_API_KEY를 설정하거나 직접 입력해주세요.")
            return

    # Anthropic 클라이언트 생성
    client = anthropic.Anthropic(api_key=api_key)

    print("🧪 Anthropic API 모델 테스트 시작...\n")

    working_models = []
    failed_models = []

    for model in TEST_MODELS:
        print(f"테스트 중: {model}")
        success, message = test_model(client, model)
        print(f"  {message}")

        if success:
            working_models.append(model)
        else:
            failed_models.append(model)
        print()

    # 결과 요약
    print("=" * 50)
    print("📊 테스트 결과 요약:")
    print(f"✅ 작동하는 모델: {len(working_models)}개")
    print(f"❌ 실패한 모델: {len(failed_models)}개")

    if working_models:
        print("\n🎯 사용 가능한 모델들:")
        for model in working_models:
            print(f"  - {model}")

        print(f"\n💡 추천: {working_models[0]}")
    else:
        print("\n❌ 사용 가능한 모델이 없습니다. API 키나 권한을 확인해주세요.")

if __name__ == "__main__":
    main()