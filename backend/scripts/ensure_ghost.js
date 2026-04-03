import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log("🛠️ Ensuring ChallengX AI Ghost User exists...");
  
  const ghostPassword = await bcrypt.hash("ghost_protocol_99", 10);
  
  const ghost = await prisma.user.upsert({
    where: { username: "CHALLENGX_GHOST" },
    update: {
      role: "USER", // Can be USER as the logic handles it by username
      rankPoints: 1200
    },
    create: {
      email: "ghost@challengx.ai",
      username: "CHALLENGX_GHOST",
      password: ghostPassword,
      role: "USER",
      rankPoints: 1200
    }
  });

  console.log("✅ AI Ghost User verified!");
  console.log("-----------------------------------------");
  console.log("Username: " + ghost.username);
  console.log("Sync ID: " + ghost.id);
  console.log("-----------------------------------------");
}

main()
  .catch(e => {
    console.error("❌ Failed to ensure AI Ghost:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
