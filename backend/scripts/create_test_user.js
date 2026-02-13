import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "testuser@example.com";
  const username = "testuser";
  const password = "Password123";

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log("Test user already exists:", email);
    process.exit(0);
  }

  const hashed = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      password: hashed,
    },
  });

  console.log("Created test user:", { email, password, id: user.id });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
