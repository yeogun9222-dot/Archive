import * as vscode from 'vscode';
import { PersonaTreeProvider } from './personaTreeProvider';
import { ChatViewProvider } from './chatViewProvider';

export function activate(context: vscode.ExtensionContext) {
  const treeProvider = new PersonaTreeProvider();
  const chatProvider = new ChatViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('jakeSquadTeam', treeProvider)
  );

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(ChatViewProvider.viewType, chatProvider)
  );

  // 팀원 클릭 → 사이드바 채팅 전환
  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.selectPersona', (name: string) => {
      chatProvider.switchPersona(name);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.refreshTree', () => {
      treeProvider.refresh();
    })
  );

  // 전체 회의 버튼
  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.openGroupChat', () => {
      chatProvider.switchPersona('전체 회의');
    })
  );
}

export function deactivate() {}
