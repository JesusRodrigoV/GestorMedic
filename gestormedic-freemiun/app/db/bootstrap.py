from pathlib import Path

from sqlalchemy.ext.asyncio import AsyncConnection


def _split_sql_statements(sql_text: str) -> list[str]:
    return [stmt.strip() for stmt in sql_text.split(';') if stmt.strip()]


async def apply_sql_file(connection: AsyncConnection, sql_file: Path) -> int:
    sql_text = sql_file.read_text(encoding='utf-8')
    statements = _split_sql_statements(sql_text)

    executed = 0
    for stmt in statements:
        await connection.exec_driver_sql(stmt)
        executed += 1

    return executed
