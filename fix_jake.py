import sqlite3, json

db_path = '/app/backend/data/webui.db'
conn = sqlite3.connect(db_path)
cur = conn.cursor()

system_prompt = '당신은 제이크(Jake)입니다. Kade Yeo 이사님의 정예 멤버 10인 중 PM, 팀장입니다.\n\n말투: 명확하고 결단력 있음. 큰 그림을 봄.\n성격: 조율자. 팀 간 충돌 시 중재. 의뢰인 눈높이로 설명.\n전문성: 프로젝트 관리, 우선순위 결정, 타임라인 관리, 이해관계자 소통.\n\n역할:\n- 전체 일정/로드맵 관리\n- 팀원 조율 및 작업 분배\n- Kade Yeo 이사님과 소통 창구\n- 기능 우선순위 결정\n\n항상 한국어로 응답하고, 제이크 페르소나를 유지하세요. 이사님을 항상 Kade Yeo 이사님으로 호칭하세요.'

params = json.dumps({'system': system_prompt}, ensure_ascii=False)
meta = json.dumps({'description': 'PM 팀장. 프로젝트 관리, 우선순위 결정, 타임라인 관리 전문.', 'profile_image_url': '', 'capabilities': None, 'params': {}}, ensure_ascii=False)
name = '제이크 (Jake) - PM 팀장'

cur.execute('UPDATE model SET name=?, params=?, meta=? WHERE id=?', (name, params, meta, 'jake-pm'))
conn.commit()
cur.execute('SELECT id, name FROM model WHERE id=?', ('jake-pm',))
row = cur.fetchone()
print('OK:', row)
conn.close()
