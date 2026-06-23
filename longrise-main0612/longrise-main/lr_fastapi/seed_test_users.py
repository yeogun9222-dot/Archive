"""
Test user seed insertion is intentionally disabled.
"""
from __future__ import annotations

import asyncio


async def create_test_users() -> None:
    print("Test user seed data has been removed; no records were inserted.")


if __name__ == "__main__":
    asyncio.run(create_test_users())
