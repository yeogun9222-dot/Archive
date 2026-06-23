# Longrise Agent Guide

## Notion task database

- When the user asks about Notion, task rows, issues, or `작업 상태`, use the Longrise Notion task database.
- The Notion integration is `LONGRISE AI` in workspace `안동현_p`.
- Read credentials from direnv-provided environment variables only:
  - `NOTION_TOKEN`
  - `NOTION_DATABASE_ID`
- Do not print, commit, or copy the Notion token into tracked files.
- The task database ID is `3766b752ad07802fac88fe1270a54d29`.
- The `작업 상태` property is a Notion `status` property. Valid status names:
  - `시작 전`
  - `진행 중`
  - `개발완료 & test 전`
  - `테스트 완료`

## Notion API usage

- For direct API checks, run commands through `direnv exec .` so `.envrc` loads `.env.notion`.
- Query one row with:

```bash
direnv exec . sh -c 'curl -sS -X POST "https://api.notion.com/v1/databases/$NOTION_DATABASE_ID/query" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  --data "{\"page_size\":1}"'
```

- Update `작업 상태` with:

```bash
direnv exec . sh -c 'curl -sS -X PATCH "https://api.notion.com/v1/pages/<PAGE_ID>" \
  -H "Authorization: Bearer $NOTION_TOKEN" \
  -H "Notion-Version: 2022-06-28" \
  -H "Content-Type: application/json" \
  --data "{\"properties\":{\"작업 상태\":{\"status\":{\"name\":\"<STATUS_NAME>\"}}}}"'
```
