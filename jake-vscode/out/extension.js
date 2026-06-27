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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const personaTreeProvider_1 = require("./personaTreeProvider");
function activate(context) {
    const treeProvider = new personaTreeProvider_1.PersonaTreeProvider();
    context.subscriptions.push(vscode.window.registerTreeDataProvider('jakeSquadTeam', treeProvider));
    // 팀원 클릭 → Claude Code 네이티브 새 채팅 탭 열기 (슬래시 명령어 미리 입력)
    context.subscriptions.push(vscode.commands.registerCommand('jakeSquad.selectPersona', (name) => {
        const isGroup = name.includes('Alpha Squad');
        const command = isGroup ? '/알파스쿼드' : `/${name}`;
        const uri = vscode.Uri.parse(`vscode://anthropic.claude-code/open?prompt=${encodeURIComponent(command + ' ')}`);
        vscode.env.openExternal(uri);
    }));
    context.subscriptions.push(vscode.commands.registerCommand('jakeSquad.refreshTree', () => {
        treeProvider.refresh();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('jakeSquad.openGroupChat', () => {
        const uri = vscode.Uri.parse(`vscode://anthropic.claude-code/open?prompt=${encodeURIComponent('/알파스쿼드 ')}`);
        vscode.env.openExternal(uri);
    }));
}
function deactivate() { }
