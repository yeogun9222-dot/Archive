"""
Admin seed insertion is intentionally disabled.
"""
from __future__ import annotations

import asyncio


async def seed() -> None:
    print("Admin seed data has been removed; no records were inserted.")


if __name__ == "__main__":
    asyncio.run(seed())
