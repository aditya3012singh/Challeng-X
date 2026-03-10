const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const tournaments = await prisma.squidGame.findMany({
      where: { joinCode: null }
    });
    
    console.log(`Found ${tournaments.length} tournaments to update.`);
    
    for (const t of tournaments) {
      let unique = false;
      let code;
      while (!unique) {
        code = Math.floor(100000 + Math.random() * 900000).toString();
        const existing = await prisma.squidGame.findUnique({
          where: { joinCode: code }
        });
        if (!existing) unique = true;
      }
      
      await prisma.squidGame.update({
        where: { id: t.id },
        data: { joinCode: code }
      });
      console.log(`Updated tournament ${t.id} with code ${code}`);
    }
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
