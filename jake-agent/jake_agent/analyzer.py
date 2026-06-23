import os
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage
from .db import get_conn
from .telegram import send_message

ANALYSIS_INTERVAL = 10  # 대화 N회마다 분석

def get_conversation_stats():
    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT agent, COUNT(*) as count
        FROM conversation_log
        GROUP BY agent
        ORDER BY count DESC
    """)
    agent_stats = cur.fetchall()

    cur.execute("""
        SELECT message FROM conversation_log
        WHERE agent != 'jake' OR message LIKE '이사님:%'
        ORDER BY timestamp DESC
        LIMIT 30
    """)
    recent = [row[0] for row in cur.fetchall()]

    cur.execute("SELECT COUNT(*) FROM conversation_log")
    total = cur.fetchone()[0]

    cur.execute("SELECT COUNT(*) FROM tasks")
    task_count = cur.fetchone()[0]

    cur.close()
    conn.close()
    return agent_stats, recent, total, task_count

def get_total_conversation_count():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("SELECT COUNT(*) FROM conversation_log WHERE message LIKE '이사님:%'")
    count = cur.fetchone()[0]
    cur.close()
    conn.close()
    return count

def run_analysis():
    agent_stats, recent_messages, total_logs, task_count = get_conversation_stats()

    stats_text = "\n".join([f"- {row[0]}: {row[1]}회" for row in agent_stats])
    recent_text = "\n".join(recent_messages[:15])

    llm = ChatAnthropic(
        model="claude-sonnet-4-6",
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        max_tokens=1024
    )

    prompt = f"""당신은 제이크(Jake)입니다. Kade Yeo 이사님의 PM 팀장입니다.

아래는 현재까지 이사님과 팀원들의 대화 통계와 최근 대화 내용입니다.

[팀원별 대화 횟수]
{stats_text}

[최근 대화 샘플]
{recent_text}

[전체 현황]
- 총 대화 로그: {total_logs}건
- 총 작업(tasks): {task_count}건

이 데이터를 분석해서 이사님께 다음을 제안해주세요:
1. 어떤 팀원과 대화가 많은지 패턴 파악
2. 앞으로 어떤 팀원의 DB/컨텍스트를 우선 강화하면 좋을지
3. 데이터 관리 효율화 제안

간결하게 3~5줄로 핵심만 제안하세요. 제이크 말투로."""

    response = llm.invoke([
        SystemMessage(content="당신은 제이크입니다. 항상 한국어로 답변하세요."),
        HumanMessage(content=prompt)
    ])

    report = (
        f"📊 *제이크 데이터 분석 리포트*\n\n"
        f"*팀원별 대화 횟수:*\n{stats_text}\n\n"
        f"*제이크 제안:*\n{response.content}"
    )

    send_message(report)
    return response.content

def check_and_analyze(conversation_count: int):
    """대화 N회마다 자동 분석 실행"""
    if conversation_count > 0 and conversation_count % ANALYSIS_INTERVAL == 0:
        run_analysis()
