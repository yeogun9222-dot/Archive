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
class PersonaItem extends vscode.TreeItem {
    constructor(personaName, role, collapsibleState) {
        super(personaName, collapsibleState);
        this.personaName = personaName;
        this.role = role;
        this.collapsibleState = collapsibleState;
        this.tooltip = `${personaName} — ${role}`;
        this.description = role;
        this.contextValue = 'persona';
        this.command = {
            command: 'jakeSquad.openChat',
            title: '채팅 열기',
            arguments: [personaName],
        };
        this.iconPath = new vscode.ThemeIcon('person');
    }
}
exports.PersonaItem = PersonaItem;
class PersonaTreeProvider {
    constructor() {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.personas = Object.keys(PERSONA_ROLES);
    }
    refresh() {
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(_element) {
        return this.personas.map(name => new PersonaItem(name, PERSONA_ROLES[name] || '', vscode.TreeItemCollapsibleState.None));
    }
}
exports.PersonaTreeProvider = PersonaTreeProvider;
