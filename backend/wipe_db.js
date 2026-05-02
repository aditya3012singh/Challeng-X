import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function clean() {
    console.log("🔍 Discovering tables...");
    const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public';`;
    console.log("Tables found:", tables.map(t => t.tablename));

    console.log("🧹 Wiping ALL tables...");
    for (const table of tables) {
        if (table.tablename === "_prisma_migrations") continue;
        try {
            await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table.tablename}" RESTART IDENTITY CASCADE;`);
            console.log(`✅ Truncated ${table.tablename}`);
        } catch (e) {
            console.log(`❌ Failed to truncate ${table.tablename}:`, e.message);
        }
    }
}

clean().finally(() => prisma.$disconnect());
