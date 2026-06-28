import psycopg2
import os
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

def get_conn():
    return psycopg2.connect(
        host=os.getenv("DB_HOST", "localhost"),
        port=os.getenv("DB_PORT", 5432),
        dbname=os.getenv("DB_NAME", "jakedb"),
        user=os.getenv("DB_USER", "jake"),
        password=os.getenv("DB_PASSWORD", "jake1234")
    )

def init_db():
    """테이블이 없으면 생성 (서버 시작 시 자동 호출)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            instruction TEXT,
            assigned_to TEXT,
            status TEXT DEFAULT 'pending',
            result TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS conversation_log (
            id SERIAL PRIMARY KEY,
            agent TEXT NOT NULL,
            message TEXT,
            related_task_id INTEGER,
            timestamp TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS token_usage (
            id SERIAL PRIMARY KEY,
            agent TEXT,
            input_tokens INTEGER DEFAULT 0,
            output_tokens INTEGER DEFAULT 0,
            api_error TEXT,
            timestamp TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS chat_messages (
            id SERIAL PRIMARY KEY,
            persona TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            source TEXT DEFAULT 'api',
            timestamp TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE INDEX IF NOT EXISTS idx_chat_messages_persona_ts
        ON chat_messages (persona, timestamp DESC)
    """)
    # 기존 tasks 테이블에 누락된 컬럼 보강 (CREATE TABLE IF NOT EXISTS는 기존 테이블을 변경하지 않음)
    cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS result TEXT")
    cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW()")
    cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS delegated_by TEXT")
    cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE")
    cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMP")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS persona_status (
            persona TEXT PRIMARY KEY,
            active BOOLEAN DEFAULT TRUE,
            updated_at TIMESTAMP DEFAULT NOW(),
            updated_by TEXT
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            owner TEXT,
            status TEXT DEFAULT 'active',
            due_date TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES projects(id)")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS persona_activity (
            persona TEXT PRIMARY KEY,
            activity_type TEXT DEFAULT 'idle',
            counterpart TEXT,
            note TEXT,
            started_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("""
        CREATE TABLE IF NOT EXISTS decision_log (
            id SERIAL PRIMARY KEY,
            category TEXT NOT NULL,
            summary TEXT NOT NULL,
            reason TEXT,
            decided_by TEXT,
            related_task_id INTEGER,
            created_at TIMESTAMP DEFAULT NOW(),
            status TEXT DEFAULT 'resolved',
            requested_by TEXT,
            resolution TEXT,
            resolved_at TIMESTAMP
        )
    """)
    cur.execute("ALTER TABLE decision_log ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'resolved'")
    cur.execute("ALTER TABLE decision_log ADD COLUMN IF NOT EXISTS requested_by TEXT")
    cur.execute("ALTER TABLE decision_log ADD COLUMN IF NOT EXISTS resolution TEXT")
    cur.execute("ALTER TABLE decision_log ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMP")
    cur.execute("""
        CREATE TABLE IF NOT EXISTS manual_costs (
            id SERIAL PRIMARY KEY,
            label TEXT NOT NULL,
            amount NUMERIC NOT NULL,
            currency TEXT DEFAULT 'USD',
            billed_date DATE NOT NULL,
            recurring BOOLEAN DEFAULT FALSE,
            note TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        )
    """)
    cur.execute("ALTER TABLE manual_costs ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD'")
    cur.execute("ALTER TABLE manual_costs ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT FALSE")
    cur.execute("DO $$ BEGIN ALTER TABLE manual_costs RENAME COLUMN amount_usd TO amount; EXCEPTION WHEN undefined_column THEN NULL; END $$;")
    conn.commit()
    cur.close()
    conn.close()

def create_task(title: str, instruction: str, assigned_to: str, delegated_by: str = None) -> int:
    """due_date는 기본 위임 SLA로 24시간 후 자동 설정 (미배정/기한초과 추적용 기본값)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO tasks (title, instruction, assigned_to, status, delegated_by, due_date)
           VALUES (%s, %s, %s, 'pending', %s, NOW() + INTERVAL '24 hours') RETURNING id""",
        (title, instruction, assigned_to, delegated_by)
    )
    task_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return task_id


def log_ceo_instruction(persona: str, instruction: str, result: str):
    """대표님이 팀원에게 직접 보낸 지시도 대시보드 활동으로 기록 (이미 완료된 대화라 due_date 불필요)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO tasks (title, instruction, assigned_to, status, result, delegated_by)
           VALUES (%s, %s, %s, 'completed', %s, '대표님')""",
        (instruction[:100], instruction, persona, result)
    )
    conn.commit()
    cur.close()
    conn.close()


def get_recent_activity(since_id: int = 0, limit: int = 50) -> list:
    """대시보드용 — 최근 위임 활동 (id > since_id)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, title, assigned_to, delegated_by, status, result, created_at, instruction
           FROM tasks WHERE id > %s AND archived = FALSE ORDER BY id DESC LIMIT %s""",
        (since_id, limit)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "title": r[1], "to": r[2], "from": r[3] or "제이크",
            "status": r[4], "result": r[5] or "", "timestamp": r[6].isoformat(),
            "instruction": r[7] or ""
        }
        for r in rows
    ]

def get_task_by_id(task_id: int):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, title, instruction, assigned_to, delegated_by, status FROM tasks WHERE id = %s", (task_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return None
    return {"id": row[0], "title": row[1], "instruction": row[2], "assigned_to": row[3], "delegated_by": row[4], "status": row[5]}


def update_task(task_id: int, status: str, result: str = None):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET status=%s, result=%s, updated_at=%s WHERE id=%s",
        (status, result, datetime.now(), task_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def log_conversation(agent: str, message: str, task_id: int = None):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO conversation_log (agent, message, related_task_id) VALUES (%s, %s, %s)",
        (agent, message, task_id)
    )
    conn.commit()
    cur.close()
    conn.close()

def get_attention_tasks(limit: int = 50) -> list:
    """대시보드 종 아이콘용 — 미완료/보류(failed/pending/held) 작업 전체 조회 (since_id 무관)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, title, assigned_to, delegated_by, status, result, created_at, instruction
           FROM tasks WHERE status IN ('failed', 'pending', 'held') AND archived = FALSE
           ORDER BY id DESC LIMIT %s""",
        (limit,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "title": r[1], "to": r[2], "from": r[3] or "제이크",
            "status": r[4], "result": r[5] or "", "timestamp": r[6].isoformat(),
            "instruction": r[7] or ""
        }
        for r in rows
    ]


def get_persona_statuses() -> dict:
    """각 페르소나의 가장 최근 작업 상태 (대시보드 카드 배지용)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT DISTINCT ON (persona) persona, status, id FROM (
            SELECT assigned_to AS persona, status, id FROM tasks WHERE assigned_to IS NOT NULL AND archived = FALSE
            UNION ALL
            SELECT delegated_by AS persona, status, id FROM tasks WHERE delegated_by IS NOT NULL AND archived = FALSE
        ) t
        ORDER BY persona, id DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {r[0]: r[1] for r in rows}


def update_task_status_guarded(task_id: int, new_status: str, expected_statuses: list) -> bool:
    """동시 변경 충돌 방지 — 현재 상태가 expected_statuses 중 하나일 때만 갱신"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "UPDATE tasks SET status=%s, updated_at=NOW() WHERE id=%s AND status = ANY(%s) RETURNING id",
        (new_status, task_id, expected_statuses)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return row is not None


def delete_task_row(task_id: int) -> bool:
    """소프트 삭제 — 감사 로그 보존 원칙상 실제로 지우지 않고 archived=TRUE만 표시"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("UPDATE tasks SET archived = TRUE WHERE id = %s AND archived = FALSE RETURNING id", (task_id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return row is not None


def get_archived_tasks(limit: int = 100) -> list:
    """감사 로그 조회용 — 보관된(삭제 처리된) 작업 전체"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, title, assigned_to, delegated_by, status, result, created_at, instruction
           FROM tasks WHERE archived = TRUE ORDER BY id DESC LIMIT %s""",
        (limit,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "title": r[1], "to": r[2], "from": r[3] or "제이크",
            "status": r[4], "result": r[5] or "", "timestamp": r[6].isoformat(),
            "instruction": r[7] or ""
        }
        for r in rows
    ]


def get_archive_stats() -> dict:
    """포화 감지용 — 보관(archived) 데이터 규모와 가장 오래된 기록 시점"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*), MIN(created_at) FROM tasks WHERE archived = TRUE")
    arch_count, arch_oldest = cur.fetchone()
    cur.execute("SELECT COUNT(*), MIN(created_at) FROM tasks WHERE archived = FALSE")
    live_count, live_oldest = cur.fetchone()
    cur.execute("SELECT COUNT(*) FROM chat_messages")
    chat_count = cur.fetchone()[0]
    cur.close()
    conn.close()
    # 임계값: 보관 row 5000건 이상이면 정리 권장 (실측 기반으로 추후 조정 가능)
    warn = arch_count >= 5000
    return {
        "archived_count": arch_count,
        "archived_oldest": arch_oldest.isoformat() if arch_oldest else None,
        "live_count": live_count,
        "live_oldest": live_oldest.isoformat() if live_oldest else None,
        "chat_message_count": chat_count,
        "warn_threshold": 5000,
        "warning": warn,
    }


def export_and_purge_archived(older_than_days: int) -> dict:
    """archived=TRUE이면서 older_than_days보다 오래된 행만 JSON으로 백업 후 영구 삭제.
    archived=FALSE(아직 보관 처리 안 된 살아있는 작업)는 절대 건드리지 않음."""
    import json
    from pathlib import Path

    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, title, instruction, assigned_to, status, result, created_at, updated_at, delegated_by, due_date
           FROM tasks WHERE archived = TRUE AND created_at < NOW() - INTERVAL '%s days'""" % int(older_than_days)
    )
    rows = cur.fetchall()
    cols = ["id", "title", "instruction", "assigned_to", "status", "result", "created_at", "updated_at", "delegated_by", "due_date"]
    backup_rows = [
        {c: (v.isoformat() if hasattr(v, "isoformat") else v) for c, v in zip(cols, r)}
        for r in rows
    ]

    backup_dir = Path(__file__).resolve().parent.parent / "backups"
    backup_dir.mkdir(exist_ok=True)
    backup_file = backup_dir / f"archive_purge_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(backup_file, "w", encoding="utf-8") as f:
        json.dump(backup_rows, f, ensure_ascii=False, indent=2)

    ids = [r[0] for r in rows]
    if ids:
        cur.execute("DELETE FROM tasks WHERE id = ANY(%s)", (ids,))
    conn.commit()
    cur.close()
    conn.close()
    return {"purged_count": len(ids), "backup_file": str(backup_file)}


def get_task_health() -> dict:
    """기한초과/미배정 작업 — Phase 1 핵심 알림"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, title, assigned_to, delegated_by, status, due_date
        FROM tasks
        WHERE archived = FALSE AND status NOT IN ('completed', 'approved')
          AND due_date IS NOT NULL AND due_date < NOW()
        ORDER BY due_date ASC
    """)
    overdue = [
        {"id": r[0], "title": r[1], "to": r[2], "from": r[3] or "제이크", "status": r[4], "due_date": r[5].isoformat()}
        for r in cur.fetchall()
    ]
    cur.execute("""
        SELECT id, title, delegated_by, status, created_at
        FROM tasks
        WHERE archived = FALSE AND (assigned_to IS NULL OR assigned_to = '')
        ORDER BY id DESC
    """)
    unassigned = [
        {"id": r[0], "title": r[1], "from": r[2] or "제이크", "status": r[3], "timestamp": r[4].isoformat()}
        for r in cur.fetchall()
    ]
    cur.close()
    conn.close()
    return {"overdue": overdue, "unassigned": unassigned}


def get_persona_performance(period: str = "month") -> list:
    """성과 추적 — 완료율/기한준수율/실패율(재작업 지표)/평균 처리시간.
    archived 여부와 무관하게 이력 전체를 집계 대상으로 함(평가는 영구 기록이어야 함)."""
    period_clause = "AND created_at >= date_trunc('month', NOW())" if period == "month" else ""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(f"""
        SELECT
            assigned_to,
            COUNT(*) AS total,
            COUNT(*) FILTER (WHERE status IN ('completed', 'approved')) AS completed,
            COUNT(*) FILTER (WHERE status = 'failed') AS failed,
            COUNT(*) FILTER (WHERE status IN ('completed', 'approved') AND due_date IS NOT NULL AND updated_at <= due_date) AS on_time,
            COUNT(*) FILTER (WHERE status IN ('completed', 'approved') AND due_date IS NOT NULL AND updated_at > due_date) AS late,
            AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600.0) FILTER (WHERE status IN ('completed', 'approved')) AS avg_hours
        FROM tasks
        WHERE assigned_to IS NOT NULL {period_clause}
        GROUP BY assigned_to
        ORDER BY total DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    result = []
    for r in rows:
        persona, total, completed, failed, on_time, late, avg_hours = r
        deadline_total = on_time + late
        result.append({
            "persona": persona,
            "total": total,
            "completed": completed,
            "failed": failed,
            "completion_rate": round(completed / total, 3) if total else 0,
            "failure_rate": round(failed / total, 3) if total else 0,
            "deadline_adherence": round(on_time / deadline_total, 3) if deadline_total else None,
            "avg_hours": round(float(avg_hours), 2) if avg_hours is not None else None,
        })
    return result


def create_decision(category: str, summary: str, reason: str = None, decided_by: str = "대표님", related_task_id: int = None) -> int:
    """이미 결정된 사실을 기록(자동로그/CEO 수동기록) — status는 곧바로 resolved"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO decision_log (category, summary, reason, decided_by, related_task_id, status, resolved_at)
           VALUES (%s, %s, %s, %s, %s, 'resolved', NOW()) RETURNING id""",
        (category, summary, reason, decided_by, related_task_id)
    )
    decision_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return decision_id


def request_decision(category: str, summary: str, reason: str, requested_by: str, related_task_id: int = None) -> int:
    """팀원이 CEO의 판단이 필요한 사안을 올림 — status는 pending, CEO가 resolve_decision으로 결재해야 종료됨"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """INSERT INTO decision_log (category, summary, reason, requested_by, related_task_id, status)
           VALUES (%s, %s, %s, %s, %s, 'pending') RETURNING id""",
        (category, summary, reason, requested_by, related_task_id)
    )
    decision_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return decision_id


def resolve_decision(decision_id: int, resolution: str, decided_by: str = "대표님") -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """UPDATE decision_log SET status='resolved', resolution=%s, decided_by=%s, resolved_at=NOW()
           WHERE id=%s AND status='pending' RETURNING id""",
        (resolution, decided_by, decision_id)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return row is not None


def get_pending_decisions() -> list:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, category, summary, reason, requested_by, created_at
           FROM decision_log WHERE status='pending' ORDER BY id ASC"""
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {"id": r[0], "category": r[1], "summary": r[2], "reason": r[3] or "", "requested_by": r[4] or "제이크", "created_at": r[5].isoformat()}
        for r in rows
    ]


def get_decisions(limit: int = 100) -> list:
    """결재 완료(resolved)된 결정 이력만 — 대기 중인 항목은 get_pending_decisions로 따로 조회"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        """SELECT id, category, summary, reason, decided_by, related_task_id, created_at, requested_by, resolution
           FROM decision_log WHERE status='resolved' ORDER BY id DESC LIMIT %s""",
        (limit,)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "category": r[1], "summary": r[2], "reason": r[3] or "",
            "decided_by": r[4] or "대표님", "related_task_id": r[5], "created_at": r[6].isoformat(),
            "requested_by": r[7], "resolution": r[8] or ""
        }
        for r in rows
    ]


def is_persona_active(persona: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT active FROM persona_status WHERE persona = %s", (persona,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else True  # 등록 안 된 페르소나는 기본 활성


def set_persona_active(persona: str, active: bool, updated_by: str = "대표님") -> None:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO persona_status (persona, active, updated_at, updated_by) VALUES (%s, %s, NOW(), %s)
        ON CONFLICT (persona) DO UPDATE SET active = %s, updated_at = NOW(), updated_by = %s
    """, (persona, active, updated_by, active, updated_by))
    conn.commit()
    cur.close()
    conn.close()


def get_persona_active_map() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT persona, active FROM persona_status")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {r[0]: r[1] for r in rows}


def get_contention_personas() -> list:
    """워크플로 충돌 감지 — 동일 페르소나에게 미해결(pending/failed) 작업이 2건 이상 쌓인 경우"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT assigned_to, COUNT(*) FROM tasks
        WHERE archived = FALSE AND status IN ('pending', 'failed') AND assigned_to IS NOT NULL
        GROUP BY assigned_to HAVING COUNT(*) >= 2
        ORDER BY COUNT(*) DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"persona": r[0], "count": r[1]} for r in rows]


def get_bottleneck_detail() -> list:
    """병목 상세 — 미해결(pending/failed) 작업이 1건 이상 쌓인 페르소나별로,
    실제 어떤 작업이 누구에게서 와서 얼마나 오래 막혀있는지 보여줌.
    (작업 간 명시적 선후관계는 시스템에 없으므로, 백로그 적체=병목으로 정의)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, title, assigned_to, delegated_by, status, created_at
        FROM tasks
        WHERE archived = FALSE AND status IN ('pending', 'failed') AND assigned_to IS NOT NULL
        ORDER BY assigned_to, created_at ASC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()

    grouped = {}
    now = datetime.now()
    for id_, title, assigned_to, delegated_by, status, created_at in rows:
        age_hours = round((now - created_at).total_seconds() / 3600, 1)
        grouped.setdefault(assigned_to, []).append({
            "id": id_, "title": title, "from": delegated_by or "제이크", "status": status, "age_hours": age_hours
        })

    result = [
        {"persona": persona, "count": len(items), "oldest_age_hours": max(i["age_hours"] for i in items), "tasks": items}
        for persona, items in grouped.items()
    ]
    result.sort(key=lambda x: (x["count"], x["oldest_age_hours"]), reverse=True)
    return result


def set_persona_activity(persona: str, activity_type: str, counterpart: str = None, note: str = None) -> None:
    """카드 상태바용 — 'idle'로 갱신할 때만 started_at도 초기화, 그 외엔 갱신 시각만 업데이트"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO persona_activity (persona, activity_type, counterpart, note, started_at, updated_at)
        VALUES (%s, %s, %s, %s, NOW(), NOW())
        ON CONFLICT (persona) DO UPDATE SET
            activity_type = %s, counterpart = %s, note = %s, updated_at = NOW(),
            started_at = CASE WHEN persona_activity.activity_type != %s THEN NOW() ELSE persona_activity.started_at END
    """, (persona, activity_type, counterpart, note, activity_type, counterpart, note, activity_type))
    conn.commit()
    cur.close()
    conn.close()


def clear_persona_activity(persona: str) -> None:
    set_persona_activity(persona, "idle")


def get_persona_activity_map() -> dict:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT persona, activity_type, counterpart, note, started_at FROM persona_activity")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {
        r[0]: {"activity_type": r[1], "counterpart": r[2], "note": r[3] or "", "started_at": r[4].isoformat()}
        for r in rows
    }


def get_last_message_map() -> dict:
    """카드 💬 안읽음 표시용 — 각 페르소나가 CEO에게 보낸 가장 최근 발신 시각(채널 무관)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT persona, MAX(timestamp) FROM chat_messages
        WHERE role = 'assistant' GROUP BY persona
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return {r[0]: r[1].isoformat() for r in rows}


# 환율은 매일 변동하므로 정확한 USD 환산이 필요하면 직접 갱신 — 표시는 원래 입력 통화 그대로 보여주고,
# 합계 집계용으로만 근사 환산 사용
USD_PER_KRW = 1 / 1380


def _to_usd(amount: float, currency: str) -> float:
    if currency == "KRW":
        return amount * USD_PER_KRW
    return amount


def create_manual_cost(label: str, amount: float, billed_date: str, currency: str = "USD", recurring: bool = False, note: str = None) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO manual_costs (label, amount, currency, billed_date, recurring, note) VALUES (%s, %s, %s, %s, %s, %s) RETURNING id",
        (label, amount, currency, billed_date, recurring, note)
    )
    cost_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return cost_id


def get_manual_costs_this_month() -> list:
    """이번 달에 적용되는 수동 비용 — 일회성은 이번달에 청구된 것만, 정기(recurring)는
    시작일(billed_date)이 이번 달 말일 이전이면 매달 자동 포함 (예: GCP VM 월 고정비)."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT id, label, amount, currency, billed_date, recurring, note FROM manual_costs
        WHERE (recurring = FALSE
               AND billed_date >= date_trunc('month', NOW())::date
               AND billed_date < (date_trunc('month', NOW()) + INTERVAL '1 month')::date)
           OR (recurring = TRUE
               AND billed_date < (date_trunc('month', NOW()) + INTERVAL '1 month')::date)
        ORDER BY recurring DESC, billed_date DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "label": r[1], "amount": float(r[2]), "currency": r[3] or "USD",
            "amount_usd": round(_to_usd(float(r[2]), r[3] or "USD"), 4),
            "billed_date": r[4].isoformat(), "recurring": r[5], "note": r[6] or ""
        }
        for r in rows
    ]


def delete_manual_cost(cost_id: int) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM manual_costs WHERE id = %s RETURNING id", (cost_id,))
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return row is not None


def get_cost_summary() -> dict:
    """대시보드 월비용 요약 — Anthropic 토큰 자동집계(모델별 단가 적용) + 수동 입력 비용(구독료/GCP VM 등) 합산.
    기간은 모호한 '이번달'이 아니라 이번 달 1일 ~ 말일(현지 서버 기준) 정확한 날짜로 명시."""
    import calendar
    now = datetime.now()
    month_start = now.replace(day=1).date()
    last_day = calendar.monthrange(now.year, now.month)[1]
    month_end = now.replace(day=last_day).date()

    # 모델별 단가(1M 토큰당, USD) — Sonnet 4.6: $3/$15, Haiku 4.5: $1/$5
    # consult_team/discuss_with(그룹회의·1:1논의)는 Haiku를 쓰므로 Sonnet 단가를 그대로 적용하면 과대 산정됨
    MODEL_RATES = {
        "claude-sonnet-4-6": (3, 15),
        "claude-haiku-4-5-20251001": (1, 5),
    }
    DEFAULT_RATE = (3, 15)

    def cost(inp, out, model=None):
        rate_in, rate_out = MODEL_RATES.get(model, DEFAULT_RATE)
        return round((inp / 1_000_000 * rate_in) + (out / 1_000_000 * rate_out), 4)

    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT agent, model, COALESCE(SUM(input_tokens),0), COALESCE(SUM(output_tokens),0)
        FROM token_usage
        WHERE created_at >= date_trunc('month', NOW())
        GROUP BY agent, model
    """)
    rows = cur.fetchall()

    cur.execute("""
        SELECT model, COALESCE(SUM(input_tokens),0), COALESCE(SUM(output_tokens),0)
        FROM token_usage
        WHERE created_at >= date_trunc('month', NOW() - INTERVAL '1 month')
          AND created_at < date_trunc('month', NOW())
        GROUP BY model
    """)
    prev_rows = cur.fetchall()
    cur.close()
    conn.close()

    active_map = get_persona_active_map()
    persona_agg = {}
    for agent, model, inp, out in rows:
        name = agent or "제이크"
        entry = persona_agg.setdefault(name, {"persona": name, "input_tokens": 0, "output_tokens": 0, "cost": 0.0})
        entry["input_tokens"] += inp
        entry["output_tokens"] += out
        entry["cost"] = round(entry["cost"] + cost(inp, out, model), 4)
    by_persona = sorted(
        [{**v, "active": active_map.get(v["persona"], True)} for v in persona_agg.values()],
        key=lambda p: p["cost"], reverse=True
    )
    api_total = round(sum(p["cost"] for p in by_persona), 4)
    prev_cost = round(sum(cost(inp, out, model) for model, inp, out in prev_rows), 4)

    manual = get_manual_costs_this_month()

    # GCP 실사용량이 BigQuery로 자동집계되면, 추정값인 manual_costs의 "GCP" 항목은
    # 이중집계를 막기 위해 합계에서 제외하고 실제 자동집계값으로 대체
    from .gcp_billing import get_gcp_billing_cost_this_month
    gcp_auto = get_gcp_billing_cost_this_month()
    if gcp_auto.get("available"):
        manual_for_total = [m for m in manual if "GCP" not in m["label"].upper()]
    else:
        manual_for_total = manual
    manual_total = round(sum(m["amount_usd"] for m in manual_for_total), 4)
    gcp_auto_cost = gcp_auto.get("net_cost_usd", 0) if gcp_auto.get("available") else 0

    # Anthropic 실제 청구액이 조회되면 by_persona 추정치 대신 진짜 금액을 합계에 사용
    # (by_persona는 페르소나별 분담 확인용으로 추정치 그대로 계속 보여줌)
    from .anthropic_billing import get_anthropic_actual_cost_this_month
    anthropic_auto = get_anthropic_actual_cost_this_month()
    effective_api_cost = anthropic_auto["actual_cost_usd"] if anthropic_auto.get("available") else api_total

    return {
        "period": f"{month_start.isoformat()} ~ {month_end.isoformat()}",
        "api_total": api_total,
        "manual_total": manual_total,
        "gcp_auto": gcp_auto,
        "anthropic_auto": anthropic_auto,
        "total_this_month": round(effective_api_cost + manual_total + gcp_auto_cost, 4),
        "prev_month": prev_cost,
        "by_persona": by_persona,
        "manual_costs": manual,
    }


def create_project(name: str, owner: str = None, due_date: str = None) -> int:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO projects (name, owner, due_date) VALUES (%s, %s, %s) RETURNING id",
        (name, owner, due_date)
    )
    project_id = cur.fetchone()[0]
    conn.commit()
    cur.close()
    conn.close()
    return project_id


def get_projects() -> list:
    """프로젝트 목록 + 소속 작업 진행률 (완료/전체)"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        SELECT p.id, p.name, p.owner, p.status, p.due_date, p.created_at,
               COUNT(t.id) AS total,
               COUNT(t.id) FILTER (WHERE t.status IN ('completed', 'approved')) AS done
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.id AND t.archived = FALSE
        GROUP BY p.id ORDER BY p.id DESC
    """)
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [
        {
            "id": r[0], "name": r[1], "owner": r[2] or "제이크", "status": r[3],
            "due_date": r[4].isoformat() if r[4] else None, "created_at": r[5].isoformat(),
            "total_tasks": r[6], "done_tasks": r[7]
        }
        for r in rows
    ]


def update_project_status(project_id: int, status: str) -> bool:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "UPDATE projects SET status=%s, updated_at=NOW() WHERE id=%s RETURNING id",
        (status, project_id)
    )
    row = cur.fetchone()
    conn.commit()
    cur.close()
    conn.close()
    return row is not None


def get_project_name(project_id: int) -> str:
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT name FROM projects WHERE id = %s", (project_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    return row[0] if row else f"#{project_id}"


def get_pending_tasks():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT id, title, instruction, assigned_to FROM tasks WHERE status='pending' ORDER BY created_at")
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return rows

def clear_chat_history(persona: str):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("DELETE FROM chat_messages WHERE persona = %s", (persona,))
    conn.commit()
    cur.close()
    conn.close()


def save_chat_message(persona: str, role: str, content: str, source: str = "api"):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO chat_messages (persona, role, content, source) VALUES (%s, %s, %s, %s)",
        (persona, role, content, source)
    )
    conn.commit()
    cur.close()
    conn.close()


def get_chat_history(persona: str, limit: int = 50) -> list:
    """VSCode 채팅창 히스토리 반환 — [{role, content, timestamp}]"""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT role, content, timestamp FROM chat_messages WHERE persona=%s ORDER BY timestamp DESC LIMIT %s",
        (persona, limit)
    )
    rows = cur.fetchall()
    cur.close()
    conn.close()
    return [{"role": r[0], "content": r[1], "timestamp": r[2].isoformat()} for r in reversed(rows)]


def get_recent_conversation_history(persona: str, limit: int = 20) -> list:
    """최근 대화를 messages 형식으로 반환. 새 세션 시작 시 컨텍스트 복원용."""
    conn = get_conn()
    cur = conn.cursor()
    cur.execute(
        "SELECT message FROM conversation_log WHERE agent = %s ORDER BY timestamp DESC LIMIT %s",
        (persona, limit * 2)
    )
    rows = [r[0] for r in cur.fetchall()]
    cur.close()
    conn.close()

    messages = []
    for message in reversed(rows):
        if message.startswith("대표님:"):
            content = message[len("대표님:"):].strip()
            messages.append({"role": "user", "content": content})
        elif ":" in message:
            content = message.split(":", 1)[1].strip()
            messages.append({"role": "assistant", "content": content})
    return messages
