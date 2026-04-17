import asyncio
import asyncpg

async def main():
    conn = await asyncpg.connect('postgresql://postgres:admin@localhost:5432/HOUSE6')
    db = await conn.fetchrow('SELECT current_database(), current_user()')
    print(db)
    rows = await conn.fetch("SELECT table_name FROM information_schema.tables WHERE table_schema='public'")
    print([r['table_name'] for r in rows])
    await conn.close()

if __name__ == '__main__':
    asyncio.run(main())
