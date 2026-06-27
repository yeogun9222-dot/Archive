import * as vscode from 'vscode';
import * as https from 'https';
import * as http from 'http';

export interface PersonaInfo {
  name: string;
  keywords: string[];
}

const PERSONA_ROLES: Record<string, string> = {
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

export class PersonaItem extends vscode.TreeItem {
  constructor(
    public readonly personaName: string,
    public readonly role: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(personaName, collapsibleState);
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

export class PersonaTreeProvider implements vscode.TreeDataProvider<PersonaItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PersonaItem | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  private personas: string[] = Object.keys(PERSONA_ROLES);

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: PersonaItem): vscode.TreeItem {
    return element;
  }

  getChildren(_element?: PersonaItem): vscode.ProviderResult<PersonaItem[]> {
    return this.personas.map(
      name => new PersonaItem(name, PERSONA_ROLES[name] || '', vscode.TreeItemCollapsibleState.None)
    );
  }
}
