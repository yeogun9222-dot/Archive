import * as vscode from 'vscode';
import { PersonaTreeProvider } from './personaTreeProvider';

export function activate(context: vscode.ExtensionContext) {
  const treeProvider = new PersonaTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('jakeSquadTeam', treeProvider)
  );

  // 팀원 클릭 → Claude Code 네이티브 새 채팅 탭 열기 (슬래시 명령어 미리 입력)
  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.selectPersona', (name: string) => {
      const isGroup = name.includes('Alpha Squad');
      const command = isGroup ? '/알파스쿼드' : `/${name}`;
      const uri = vscode.Uri.parse(
        `vscode://anthropic.claude-code/open?prompt=${encodeURIComponent(command + ' ')}`
      );
      vscode.env.openExternal(uri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.refreshTree', () => {
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.openGroupChat', () => {
      const uri = vscode.Uri.parse(
        `vscode://anthropic.claude-code/open?prompt=${encodeURIComponent('/알파스쿼드 ')}`
      );
      vscode.env.openExternal(uri);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.openDashboard', async () => {
      const base = vscode.workspace.getConfiguration('jakeSquad').get<string>('apiBaseUrl', 'http://localhost:8000');
      await vscode.commands.executeCommand('simpleBrowser.show', `${base}/dashboard`);
    })
  );
}

export function deactivate() {}
