"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonaTreeProvider = exports.PersonaItem = void 0;
const vscode = __importStar(require("vscode"));
const PERSONA_ROLES = {
    '제이크': 'COO',
    '다인': '기획본부장',
    '렉스': 'AI시스템 본부장',
    '루나': 'CFO',
    '제로': '보안본부장',
    '바쿠': '데이터 본부장',
    '피오': '백엔드 본부장',
    '리리': '프론트엔드 본부장',
    '에바': 'UX Research 본부장',
    '사라': 'UX Research 팀장',
    '미나': 'CRO 본부장',
    '카이': 'GTM 본부장',
    '설리': 'QA 본부장',
    '노바': 'DevOps 팀장',
};
// 결재 승인으로 충원되는 신규 페르소나(테오/노아/엠마/조이 등)는 jake-agent DB에 계속 추가되므로,
// 하드코딩 목록만으로는 누락됨 — 매 새로고침마다 /personas/custom을 조회해 합침
async function fetchCustomRoles() {
    try {
        const base = vscode.workspace.getConfiguration('jakeSquad').get('apiBaseUrl', 'http://localhost:8000');
        const res = await fetch(`${base}/personas/custom`, { signal: AbortSignal.timeout(8000) });
        if (!res.ok)
            return {};
        const data = await res.json();
        const roles = {};
        for (const p of data.personas || []) {
            if (p?.name)
                roles[p.name] = p.role || '';
        }
        return roles;
    }
    catch {
        return {};
    }
}
class PersonaItem extends vscode.TreeItem {
    constructor(personaName, role, isGroup = false, totalCount = 0) {
        super(personaName, vscode.TreeItemCollapsibleState.None);
        this.personaName = personaName;
        this.role = role;
        this.isGroup = isGroup;
        this.totalCount = totalCount;
        this.tooltip = isGroup ? 'Alpha Squad 전체 회의방' : `${personaName} — ${role}`;
        this.description = isGroup ? `전체 ${totalCount}인` : role;
        this.contextValue = isGroup ? 'group' : 'persona';
        this.iconPath = new vscode.ThemeIcon(isGroup ? 'organization' : 'person');
        this.command = {
            command: 'jakeSquad.selectPersona',
            title: isGroup ? '전체 회의' : '채팅',
            arguments: [personaName],
        };
    }
}
exports.PersonaItem = PersonaItem;
class PersonaTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren() {
        const customRoles = await fetchCustomRoles();
        const allRoles = { ...PERSONA_ROLES, ...customRoles };
        const groupItem = new PersonaItem('🏢 Alpha Squad', '전체 회의', true, Object.keys(allRoles).length);
        const personas = Object.entries(allRoles).map(([name, role]) => new PersonaItem(name, role, false));
        return [groupItem, ...personas];
    }
}
exports.PersonaTreeProvider = PersonaTreeProvider;
