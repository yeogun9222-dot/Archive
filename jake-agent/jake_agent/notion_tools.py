from langchain_core.tools import tool
from notion_client import Client
import os


def _clients():
    """두 인테그레이션 키를 모두 반환합니다."""
    keys = [
        os.getenv("NOTION_API_KEY"),
        os.getenv("NOTION_ARCHITECTS_KEY"),
        os.getenv("NOTION_GUIDE_KEY"),
    ]
    return [Client(auth=k) for k in keys if k]


def _try_clients(fn):
    """두 키 중 성공하는 클라이언트로 실행합니다."""
    last_error = None
    for client in _clients():
        try:
            return fn(client)
        except Exception as e:
            last_error = e
    raise last_error


def _extract_text(rich_text: list) -> str:
    return "".join(t.get("plain_text", "") for t in rich_text)


def _extract_page_title(page: dict) -> str:
    props = page.get("properties", {})
    for v in props.values():
        if v.get("type") == "title":
            return _extract_text(v.get("title", []))
    title_arr = page.get("title", [])
    if title_arr:
        return _extract_text(title_arr)
    return "제목 없음"


@tool
def search_notion(query: str) -> str:
    """노션에서 페이지나 데이터베이스를 키워드로 검색합니다. 페이지 ID와 제목을 반환합니다."""
    try:
        all_results = []
        seen_ids = set()
        for client in _clients():
            try:
                results = client.search(query=query, page_size=10).get("results", [])
                for r in results:
                    pid = r.get("id", "")
                    if pid not in seen_ids:
                        seen_ids.add(pid)
                        all_results.append(r)
            except Exception:
                continue
        if not all_results:
            return "검색 결과 없음"
        lines = []
        for r in all_results:
            obj_type = r.get("object", "")
            page_id = r.get("id", "")
            title = _extract_page_title(r)
            lines.append(f"[{obj_type}] {title}  |  ID: {page_id}")
        return "\n".join(lines)
    except Exception as e:
        return f"검색 오류: {e}"


@tool
def get_notion_page_content(page_id: str) -> str:
    """노션 페이지의 블록 내용을 전부 읽어옵니다. page_id는 하이픈 포함 또는 32자리 형식."""
    try:
        def fn(client):
            blocks = client.blocks.children.list(block_id=page_id).get("results", [])
            lines = []
            for b in blocks:
                btype = b.get("type", "")
                data = b.get(btype, {})
                text = _extract_text(data.get("rich_text", []))
                block_id = b.get("id", "")
                if text:
                    lines.append(f"[{btype}|{block_id}] {text}")
                else:
                    lines.append(f"[{btype}|{block_id}] (내용 없음)")
            return "\n".join(lines) if lines else "내용 없음"
        return _try_clients(fn)
    except Exception as e:
        return f"페이지 조회 오류: {e}"


@tool
def append_text_to_notion_page(page_id: str, text: str) -> str:
    """노션 페이지 맨 아래에 단락 텍스트를 추가합니다."""
    try:
        def fn(client):
            client.blocks.children.append(
                block_id=page_id,
                children=[{
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": text}}]
                    }
                }]
            )
            return f"추가 완료 (page: {page_id})"
        return _try_clients(fn)
    except Exception as e:
        return f"추가 오류: {e}"


@tool
def update_notion_block_text(block_id: str, new_text: str) -> str:
    """특정 블록의 텍스트 내용을 새 내용으로 교체합니다. block_id는 get_notion_page_content로 확인하세요."""
    try:
        def fn(client):
            block = client.blocks.retrieve(block_id=block_id)
            btype = block.get("type", "paragraph")
            client.blocks.update(
                block_id=block_id,
                **{btype: {
                    "rich_text": [{"type": "text", "text": {"content": new_text}}]
                }}
            )
            return f"블록({block_id}) 업데이트 완료"
        return _try_clients(fn)
    except Exception as e:
        return f"블록 업데이트 오류: {e}"


@tool
def update_notion_page_title(page_id: str, new_title: str) -> str:
    """노션 페이지의 제목을 변경합니다."""
    try:
        def fn(client):
            client.pages.update(
                page_id=page_id,
                properties={
                    "title": {
                        "title": [{"type": "text", "text": {"content": new_title}}]
                    }
                }
            )
            return f"제목 변경 완료 → '{new_title}' (page: {page_id})"
        return _try_clients(fn)
    except Exception as e:
        return f"제목 변경 오류: {e}"


@tool
def create_notion_page(parent_page_id: str, title: str, content: str) -> str:
    """노션에 새 하위 페이지를 생성합니다. parent_page_id 아래에 만들어집니다."""
    try:
        def fn(client):
            new_page = client.pages.create(
                parent={"page_id": parent_page_id},
                properties={
                    "title": {
                        "title": [{"type": "text", "text": {"content": title}}]
                    }
                },
                children=[{
                    "object": "block",
                    "type": "paragraph",
                    "paragraph": {
                        "rich_text": [{"type": "text", "text": {"content": content}}]
                    }
                }]
            )
            return f"페이지 생성 완료 (ID: {new_page['id']}, 제목: {title})"
        return _try_clients(fn)
    except Exception as e:
        return f"페이지 생성 오류: {e}"


@tool
def delete_notion_block(block_id: str) -> str:
    """노션 특정 블록을 삭제합니다. 되돌릴 수 없으니 신중히 사용하세요."""
    try:
        def fn(client):
            client.blocks.delete(block_id=block_id)
            return f"블록({block_id}) 삭제 완료"
        return _try_clients(fn)
    except Exception as e:
        return f"블록 삭제 오류: {e}"


def get_all_tools():
    return [
        search_notion,
        get_notion_page_content,
        append_text_to_notion_page,
        update_notion_block_text,
        update_notion_page_title,
        create_notion_page,
        delete_notion_block,
    ]
