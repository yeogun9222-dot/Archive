import * as vscode from 'vscode';
import { PersonaTreeProvider } from './personaTreeProvider';
import { ChatPanel } from './chatPanel';

export function activate(context: vscode.ExtensionContext) {
  const treeProvider = new PersonaTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('jakeSquadTeam', treeProvider)
  );

  // 팀원 클릭 → 에디터 탭으로 채팅창 열기
  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.selectPersona', (name: string) => {
      const isGroup = name.includes('Alpha Squad');
      ChatPanel.createOrShow(isGroup ? '🏢 Alpha Squad' : name, isGroup);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.refreshTree', () => {
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.openGroupChat', () => {
      ChatPanel.createOrShow('🏢 Alpha Squad', true);
    })
  );
}

export function deactivate() {}
