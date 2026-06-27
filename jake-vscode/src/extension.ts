import * as vscode from 'vscode';
import { PersonaTreeProvider } from './personaTreeProvider';
import { ChatPanel } from './chatPanel';

export function activate(context: vscode.ExtensionContext) {
  const treeProvider = new PersonaTreeProvider();

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('jakeSquadTeam', treeProvider)
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.openChat', (personaName?: string) => {
      if (!personaName) {
        vscode.window.showQuickPick(
          ['제이크', '다인', '렉스', '루나', '제로', '바쿠', '피오', '리리', '에바', '사라', '미나', '카이', '설리', '노바'],
          { placeHolder: '채팅할 팀원을 선택하세요' }
        ).then(selected => {
          if (selected) ChatPanel.createOrShow(selected);
        });
      } else {
        ChatPanel.createOrShow(personaName);
      }
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.refreshTree', () => {
      treeProvider.refresh();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('jakeSquad.openGroupChat', () => {
      ChatPanel.createOrShow('전체 회의', true);
    })
  );
}

export function deactivate() {}
