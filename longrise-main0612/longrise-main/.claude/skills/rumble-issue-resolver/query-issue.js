// RumbleSurge REST API 클라이언트 (보안 강화된 버전)
const readline = require('readline');

async function promptForApiKey() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question('🔑 RUMBLE_API_KEY를 입력해주세요: ', (apiKey) => {
      rl.close();
      resolve(apiKey.trim());
    });
  });
}

async function queryRumbleSurgeIssue(issueUuid, providedApiKey = null) {
  let apiKey = providedApiKey || process.env.RUMBLE_API_KEY;
  const apiBase = process.env.RUMBLE_API_BASE || 'http://localhost:4237/api';

  if (!apiKey) {
    console.log('⚠️  RUMBLE_API_KEY 환경 변수가 설정되지 않았습니다.');
    apiKey = await promptForApiKey();

    if (!apiKey) {
      throw new Error('API 키가 제공되지 않았습니다.');
    }
  }

  try {
    console.log(`🔗 RumbleSurge API 연결 중... (${apiBase})`);

    const response = await fetch(`${apiBase}/ai/issues/${issueUuid}/context`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Claude-Code-RumbleIssueResolver/1.0'
      },
      timeout: 30000
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('API 키가 유효하지 않습니다. RUMBLE_API_KEY를 확인해주세요.');
      } else if (response.status === 404) {
        throw new Error(`이슈 UUID ${issueUuid}를 찾을 수 없습니다.`);
      } else {
        throw new Error(`API 요청 실패: ${response.status} ${response.statusText}`);
      }
    }

    const issueContext = await response.json();
    console.log('✅ 이슈 컨텍스트 조회 성공');

    // API 응답을 기존 형식과 호환되도록 변환
    return {
      id: issueContext.id,
      title: issueContext.title,
      content: issueContext.formattedContent || issueContext.content,
      priority: issueContext.priority,
      status: issueContext.status,
      createdAt: issueContext.createdAt,

      // 환경 정보
      environment: {
        currentPath: issueContext.currentPath,
        pageUrl: issueContext.pageUrl,
        viewType: issueContext.viewType,
        loginStatus: issueContext.loginStatus,
        web3Status: issueContext.web3Status,
        userAgent: issueContext.userAgent,
        viewport: {
          width: issueContext.viewportWidth,
          height: issueContext.viewportHeight
        }
      },

      // 개발 정보
      development: {
        componentFilePath: issueContext.componentFilePath,
        consoleLogs: issueContext.consoleLogs || [],
        attachments: issueContext.attachments || [],
        metadata: issueContext.metadata || {}
      },

      // 프로젝트 정보 (API에서 enriched context로 제공)
      project: {
        id: issueContext.projectId,
        name: issueContext.projectContext?.name,
        url: issueContext.projectContext?.url,
        gitRepository: issueContext.projectContext?.gitRepository,
        business: {
          id: issueContext.projectContext?.business?.id,
          name: issueContext.projectContext?.business?.name
        }
      },

      // 작업자 정보
      worker: {
        id: issueContext.workerId,
        name: issueContext.worker?.name,
        avatarColor: issueContext.worker?.avatarColor
      }
    };

  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ API 요청 타임아웃');
      throw new Error('RumbleSurge API 요청이 타임아웃되었습니다.');
    } else {
      console.error('❌ API 요청 실패:', error.message);
      throw error;
    }
  }
}

// CLI에서 직접 실행할 때
if (require.main === module) {
  const issueUuid = process.argv[2];
  const apiKey = process.argv[3]; // 선택적으로 API 키를 명령줄 인수로 받음

  if (!issueUuid) {
    console.error('사용법: node query-issue.js <issue-uuid> [api-key]');
    process.exit(1);
  }

  queryRumbleSurgeIssue(issueUuid, apiKey)
    .then(issue => {
      console.log('\n📋 이슈 상세 정보:');
      console.log(JSON.stringify(issue, null, 2));

      // 스크린샷 첨부 분석
      const screenshots = issue.development.attachments.filter(a => a.type === 'screenshot');
      if (screenshots.length > 0) {
        console.log(`\n📸 스크린샷 첨부: ${screenshots.length}개`);
        screenshots.forEach((screenshot, index) => {
          console.log(`  - 스크린샷 ${index + 1}: ${screenshot.dataUrl.slice(0, 50)}...`);
        });
      }

      // 요소 선택 분석
      const elements = issue.development.attachments.filter(a => a.type === 'element');
      if (elements.length > 0) {
        console.log(`\n🎯 선택된 요소: ${elements.length}개`);
        elements.forEach((element, index) => {
          console.log(`  - 요소 ${index + 1}: ${element.tag}.${element.classes} - "${element.text}"`);
          console.log(`    경로: ${element.path}`);
        });
      }

      // 개발 정보 요약
      console.log('\n🛠️  개발 작업 정보:');
      console.log(`- Git 저장소: ${issue.project.gitRepository}`);
      console.log(`- 컴포넌트 파일: ${issue.development.componentFilePath || '지정되지 않음'}`);
      console.log(`- 페이지 URL: ${issue.environment.pageUrl}`);
      console.log(`- 현재 경로: ${issue.environment.currentPath}`);
    })
    .catch(error => {
      console.error('실행 실패:', error.message);
      process.exit(1);
    });
}

module.exports = { queryRumbleSurgeIssue };