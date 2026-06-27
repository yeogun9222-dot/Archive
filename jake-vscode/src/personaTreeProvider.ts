import * as vscode from 'vscode';

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
    public readonly isGroup = false,
  ) {
    super(personaName, vscode.TreeItemCollapsibleState.None);
    this.tooltip = isGroup ? 'Alpha Squad 전체 회의방' : `${personaName} — ${role}`;
    this.description = isGroup ? '전체 14인' : role;
    this.contextValue = isGroup ? 'group' : 'persona';
    this.iconPath = new vscode.ThemeIcon(isGroup ? 'organization' : 'person');
    this.command = {
      command: 'jakeSquad.selectPersona',
      title: isGroup ? '전체 회의' : '채팅',
      arguments: [personaName],
    };
  }
}

export class PersonaTreeProvider implements vscode.TreeDataProvider<PersonaItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PersonaItem | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: PersonaItem): vscode.TreeItem {
    return element;
  }

  getChildren(): vscode.ProviderResult<PersonaItem[]> {
    const groupItem = new PersonaItem('🏢 Alpha Squad', '전체 회의', true);
    const personas = Object.entries(PERSONA_ROLES).map(
      ([name, role]) => new PersonaItem(name, role, false)
    );
    return [groupItem, ...personas];
  }
}
