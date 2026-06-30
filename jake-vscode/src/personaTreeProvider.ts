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

// 결재 승인으로 충원되는 신규 페르소나(테오/노아/엠마/조이 등)는 jake-agent DB에 계속 추가되므로,
// 하드코딩 목록만으로는 누락됨 — 매 새로고침마다 /personas/custom을 조회해 합침
async function fetchCustomRoles(): Promise<Record<string, string>> {
  try {
    const base = vscode.workspace.getConfiguration('jakeSquad').get<string>('apiBaseUrl', 'http://localhost:8000');
    const res = await fetch(`${base}/personas/custom`, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return {};
    const data: any = await res.json();
    const roles: Record<string, string> = {};
    for (const p of data.personas || []) {
      if (p?.name) roles[p.name] = p.role || '';
    }
    return roles;
  } catch {
    return {};
  }
}

export class PersonaItem extends vscode.TreeItem {
  constructor(
    public readonly personaName: string,
    public readonly role: string,
    public readonly isGroup = false,
    public readonly totalCount = 0,
  ) {
    super(personaName, vscode.TreeItemCollapsibleState.None);
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

export class PersonaTreeProvider implements vscode.TreeDataProvider<PersonaItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<PersonaItem | undefined | null>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire(undefined);
  }

  getTreeItem(element: PersonaItem): vscode.TreeItem {
    return element;
  }

  async getChildren(): Promise<PersonaItem[]> {
    const customRoles = await fetchCustomRoles();
    const allRoles = { ...PERSONA_ROLES, ...customRoles };
    const groupItem = new PersonaItem('🏢 Alpha Squad', '전체 회의', true, Object.keys(allRoles).length);
    const personas = Object.entries(allRoles).map(
      ([name, role]) => new PersonaItem(name, role, false)
    );
    return [groupItem, ...personas];
  }
}
