# RumbleSurge 로컬 AI 작업

## 목표
- 아래 실패 상황을 분석하고 대상 프로젝트를 수정한다.
- 최소 변경으로 문제를 해결한다.
- 자동 commit / push 는 하지 않는다.
- 작업 후 변경 파일과 수정 요약을 마지막에 정리한다.

## 작업 정보
- Agent Run ID: cmonkvgla006l14ezem3jbxei
- 프로젝트: local-user
- Base Branch: stage
- Target URL: http://localhost:5173
- 이슈 ID: RS-00c19c80-587f-4155-8703-1a727618aa0d
- 이슈 제목: [자동화 실패] TC-004 로그인 후 홈 대시보드

## 실패 상황 프롬프트
# 테스트 실패 이슈
이 문서는 자동화 테스트 실패를 기반으로 코딩 에이전트에게 전달할 작업 지시서다.
실패 원인을 분석하고, 필요한 경우 테스트 코드 또는 대상 애플리케이션 수정안을 제시하라.
## 프로젝트
- ID: 7
- 이름: local-user
- URL: http://localhost:5173
## 실행 정보
- 실행 ID: cmonktyba006914ezwxeth8yl
- 트리거: manual
- 브라우저: chromium
- Base URL: http://localhost:5173
- 시작: 2026-05-02T00:01:39.348Z
## 테스트 대상
- ID: cmome4qy8000714ez4vw8otj0
- 제목: TC-004 로그인 후 홈 대시보드
- 설명: VIP1 로그인 완료 후 홈 대시보드의 개인화된 컨텐츠, Counter 애니메이션, MetricCard 컴포넌트들이 올바르게 표시되는지 검증하는 테스트
- 파일 경로: generated/plans/cmomdiz7o000112rb210gt828/tc-004.spec.ts
- 소스 경로: generated/plans/cmomdiz7o000112rb210gt828/tc-004.spec.ts
- 현재 경로: http://localhost:5173
- 상태: review
- 우선순위: High
## 실패 결과
- ID: cmonktyba006914ezwxeth8yl:cmome4qy8000714ez4vw8otj0
- 상태: failed
- 소요시간: 10431ms
- 에러 메시지: Error: [2mexpect([22m[31mreceived[39m[2m).[22mtoBeTruthy[2m()[22m

Received: [31mfalse[39m

  73 |     const counterText = await counterElement.first().textContent()
  74 |     expect(counterText).toBeTruthy()
> 75 |     expect(/^[0-9,]+$/.test(counterText || '')).toBeTruthy()
     |                                                 ^
  76 |   } else {
  77 |     // Counter 요소를 찾지 못한 경우 디버그 정보 출력
  78 |     console.log('Counter element not found with standard selectors. Available elements with large text:')
    at /Users/ahndonghyun/dongfiles/ADHcode/DreamFurnace/rumbleSurge/rumble_agent/.rumble-runtime/runs/cmonktyba006914ezwxeth8yl/cmome4qy8000714ez4vw8otj0-tc-004.spec.ts:75:49
- Trace: artifacts/runs/cmonktyba006914ezwxeth8yl/cmome4qy8000714ez4vw8otj0/.rumble-runtime-runs-cmonk-731ce--홈-대시보드---개인화된-컨텐츠-및-메트릭-표시/trace.zip
- Screenshot: artifacts/runs/cmonktyba006914ezwxeth8yl/cmome4qy8000714ez4vw8otj0/.rumble-runtime-runs-cmonk-731ce--홈-대시보드---개인화된-컨텐츠-및-메트릭-표시/test-failed-1.png
## 실행 요약
```json
{
  "jobId": "87",
  "queueName": "test-automation-runs",
  "startedAt": "2026-05-02T00:01:38.737Z",
  "totalCases": 1
}
```
## 추가 메타데이터
{
  "queueJobId": "87",
  "title": "TC-004 로그인 후 홈 대시보드",
  "filePath": ".rumble-runtime/runs/cmonktyba006914ezwxeth8yl/cmome4qy8000714ez4vw8otj0-tc-004.spec.ts",
  "sourceFilePath": "generated/plans/cmomdiz7o000112rb210gt828/tc-004.spec.ts",
  "videoUrl": "artifacts/runs/cmonktyba006914ezwxeth8yl/cmome4qy8000714ez4vw8otj0/.rumble-runtime-runs-cmonk-731ce--홈-대시보드---개인화된-컨텐츠-및-메트릭-표시/video.webm",
  "tests": [
    {
      "title": "",
      "statuses": [
        "failed"
      ]
    }
  ],
  "exitCode": 1,
  "outputDir": "artifacts/runs/cmonktyba006914ezwxeth8yl/cmome4qy8000714ez4vw8otj0"
}
## 요청
1. 실패 원인을 재현 가능한 형태로 정리하라.
2. 테스트 코드 결함인지, 애플리케이션 결함인지, 환경 결함인지 구분하라.
3. 수정이 필요하면 최소 변경으로 고쳐라.
4. 필요하면 추가 검증 절차를 제안하라.