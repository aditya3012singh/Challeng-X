import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { originalProblems } from "./data/problems_original.js";
import { easyProblems } from "./data/problems_easy.js";
import { mediumProblems } from "./data/problems_medium.js";
import { hardProblems } from "./data/problems_hard.js";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // 1. CLEAN DATABASE
  // Using a more robust strategy for PostgreSQL cleaning
  console.log("🧹 Wiping old data...");
  const tableNames = [
    "TestCase", "Submission", "Battle", "SquidGameRound",
    "TeamBattleMatch", "ContestProblem", "Problem", "Tag", "UserHint"
  ];

  for (const table of tableNames) {
    try {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`);
    } catch (e) {
      console.log(`⚠️  Could not truncate table ${table} (might not exist yet):`, e.message);
    }
  }
  console.log("✅ Database wiped clean.\n");

  // 2. SEED USERS
  console.log("👤 Generating Users...");
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "admin@challengx.com" },
    update: { role: "ADMIN", password: hashedAdminPassword },
    create: {
      email: "admin@challengx.com",
      username: "ChallengXAdmin",
      password: hashedAdminPassword,
      role: "ADMIN",
      rankPoints: 5000
    }
  });

  await prisma.user.upsert({
    where: { email: "guest@challengx.com" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000000",
      email: "guest@challengx.com",
      username: "Guest",
      role: "USER"
    }
  });
  console.log("✅ Admin & Guest users seeded.\n");

  // 3. SEED PROBLEMS
  const allSets = [
    { name: "Original 58", data: originalProblems },
    { name: "New Easy", data: easyProblems },
    { name: "New Medium", data: mediumProblems },
    { name: "New Hard", data: hardProblems }
  ];

  console.log("📚 Seeding problem sets...");
  let totalCount = 0;

  for (const set of allSets) {
    console.log(`\n🔹 Seeding set: ${set.name} (${set.data.length} problems)`);

    for (const prob of set.data) {
      try {
        // Normalize the data (Handle both old/new nested structures)
        const normalizedTestcases = prob.testcases.create
          ? prob.testcases.create
          : prob.testcases;

        const normalizedTags = prob.tags || [];

        await prisma.problem.create({
          data: {
            title: prob.title,
            description: prob.description,
            constraints: prob.constraints,
            difficulty: prob.difficulty,
            timeLimitMs: prob.timeLimitMs || 2000,
            hints: prob.hints || [],
            tags: {
              connectOrCreate: normalizedTags.map(name => ({
                where: { name },
                create: { name }
              }))
            },
            testcases: {
              create: normalizedTestcases.map(tc => ({
                input: tc.input,
                output: tc.output,
                isHidden: tc.isHidden ?? false,
                isSample: tc.isSample ?? true
              }))
            }
          }
        });
        totalCount++;
      } catch (err) {
        console.error(`❌ Error seeding problem "${prob.title}":`, err.message);
      }
    }
  }

  console.log(`\n✨ Seeding completed! Total problems inserted: ${totalCount}`);
  console.log("🚀 Now run: npm run seed:s3 — to upload hidden test cases to Cloudflare R2");
}

main()
  .catch((e) => {
    console.error("Critical error in seed main:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
