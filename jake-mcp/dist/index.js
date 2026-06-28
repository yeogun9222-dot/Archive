"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const API_BASE = process.env.JAKE_API_BASE || 'http://34.47.74.42:8000';
const TIMEOUT_MS = 120000;
const PERSONAS = [
    '제이크', '다인', '렉스', '루나', '제로', '바쿠', '피오',
    '리리', '에바', '사라', '미나', '카이', '설리', '노바',
];
async function postWithTimeout(path, body) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(`${API_BASE}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: controller.signal,
        });
        if (!res.ok) {
            return { error: `jake-agent 응답 오류: HTTP ${res.status}` };
        }
        return await res.json();
    }
    catch (e) {
        if (e.name === 'AbortError') {
            return { error: `jake-agent 응답 시간 초과 (${TIMEOUT_MS / 1000}초). 서버가 느리거나 응답 없음.` };
        }
        return { error: `jake-agent 연결 실패: ${e.message}` };
    }
    finally {
        clearTimeout(timer);
    }
}
async function getWithTimeout(path) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(`${API_BASE}${path}`, { signal: controller.signal });
        if (!res.ok)
            return { error: `jake-agent 응답 오류: HTTP ${res.status}` };
        return await res.json();
    }
    catch (e) {
        if (e.name === 'AbortError')
            return { error: `jake-agent 응답 시간 초과 (${TIMEOUT_MS / 1000}초)` };
        return { error: `jake-agent 연결 실패: ${e.message}` };
    }
    finally {
        clearTimeout(timer);
    }
}
const server = new mcp_js_1.McpServer({
    name: 'jake-squad',
    version: '1.0.0',
});
server.registerTool('ask_persona', {
    title: '팀원에게 메시지 전달',
    description: 'Alpha Squad 팀원(제이크, 다인, 렉스, 루나, 제로, 바쿠, 피오, 리리, 에바, 사라, 미나, 카이, 설리, 노바) 중 한 명에게 직접 메시지를 보내고 응답을 받습니다. ' +
        '각 팀원은 jake-agent 서버에 저장된 고유 페르소나와 전용 도구(렉스의 Docker 관리 등)를 사용합니다.',
    inputSchema: {
        persona: zod_1.z.enum(PERSONAS).describe('대화할 팀원 이름'),
        message: zod_1.z.string().describe('전달할 메시지 내용'),
    },
}, async ({ persona, message }) => {
    const data = await postWithTimeout(`/chat/persona/${encodeURIComponent(persona)}`, {
        message,
        persona,
        source: 'mcp',
    });
    const text = data.error ? data.error : (data.response || '응답 없음');
    return { content: [{ type: 'text', text: `[${persona}] ${text}` }] };
});
server.registerTool('ask_alpha_squad', {
    title: 'Alpha Squad 전체 회의',
    description: '안건을 Alpha Squad 전체 회의에 올립니다. 제이크 COO가 관련 팀원들의 의견을 수렴하여 종합 답변을 정리합니다.',
    inputSchema: {
        message: zod_1.z.string().describe('회의에 올릴 안건/질문'),
    },
}, async ({ message }) => {
    const data = await postWithTimeout('/chat/group', { message, source: 'mcp' });
    const text = data.error ? data.error : (data.response || '응답 없음');
    return { content: [{ type: 'text', text }] };
});
server.registerTool('delegate_task', {
    title: '팀원에게 실제 업무 위임',
    description: '팀원에게 실제 업무를 위임합니다. 위임받은 팀원은 본인 전용 도구(Docker, GitHub, Notion 등)를 사용해 작업을 직접 수행하고 결과를 보고합니다. ' +
        '단순 질문이 아니라 실제 작업(예: "렉스에게 Docker 재시작시켜")일 때 사용하세요.',
    inputSchema: {
        member: zod_1.z.enum(PERSONAS).describe('업무를 수행할 팀원'),
        task: zod_1.z.string().describe('위임할 구체적인 업무 내용'),
    },
}, async ({ member, task }) => {
    const data = await postWithTimeout(`/chat/persona/${encodeURIComponent(member)}`, {
        message: task,
        persona: member,
        source: 'mcp-delegate',
    });
    const text = data.error ? data.error : (data.response || '응답 없음');
    return { content: [{ type: 'text', text: `[${member} 완료 보고]\n${text}` }] };
});
server.registerTool('clear_persona_history', {
    title: '팀원 대화 기록 초기화',
    description: '특정 팀원 또는 Alpha Squad 전체방의 저장된 대화 기록을 삭제합니다.',
    inputSchema: {
        persona: zod_1.z.string().describe('초기화할 팀원 이름, 또는 전체방은 "alpha-squad"'),
    },
}, async ({ persona }) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const res = await fetch(`${API_BASE}/history/${encodeURIComponent(persona)}`, {
            method: 'DELETE',
            signal: controller.signal,
        });
        clearTimeout(timer);
        if (!res.ok)
            return { content: [{ type: 'text', text: `초기화 실패: HTTP ${res.status}` }] };
        return { content: [{ type: 'text', text: `${persona} 대화 기록이 초기화되었습니다.` }] };
    }
    catch (e) {
        clearTimeout(timer);
        return { content: [{ type: 'text', text: `초기화 실패: ${e.message}` }] };
    }
});
server.registerTool('get_persona_history', {
    title: '팀원 대화 기록 조회',
    description: '특정 팀원과 나눈 과거 대화 기록을 조회합니다.',
    inputSchema: {
        persona: zod_1.z.string().describe('조회할 팀원 이름, 또는 전체방은 "alpha-squad"'),
        limit: zod_1.z.number().optional().describe('조회할 메시지 수 (기본 20)'),
    },
}, async ({ persona, limit }) => {
    const data = await getWithTimeout(`/history/${encodeURIComponent(persona)}?limit=${limit || 20}`);
    if (data.error)
        return { content: [{ type: 'text', text: data.error }] };
    const messages = data.messages || [];
    if (messages.length === 0)
        return { content: [{ type: 'text', text: '대화 기록 없음' }] };
    const text = messages
        .map((m) => `${m.role === 'user' ? '대표님' : persona}: ${m.content}`)
        .join('\n');
    return { content: [{ type: 'text', text }] };
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    console.error('jake-mcp 서버 오류:', err);
    process.exit(1);
});
