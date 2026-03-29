import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Achievements & Badges...");

  // 1. Create Badges
  const badges = [
    {
      name: "Code Warrior",
      description: "Won your first battle in the Arena.",
      iconUrl: "/assets/badges/warrior.svg",
      rarity: "COMMON",
    },
    {
      name: "Cyber Elite",
      description: "Reached a win streak of 5.",
      iconUrl: "/assets/badges/elite.svg",
      rarity: "RARE",
    },
    {
      name: "Shadow Legend",
      description: "Completed 50 total battles.",
      iconUrl: "/assets/badges/legend.svg",
      rarity: "EPIC",
    }
  ];

  for (const badge of badges) {
    await prisma.badge.upsert({
      where: { name: badge.name },
      update: badge,
      create: badge,
    });
  }

  // 2. Create Achievements
  const achievements = [
    {
      name: "First Blood",
      description: "Win 1 Battle",
      criteria: { type: "BATTLE_WIN", threshold: 1 },
      rewardType: "CORES",
      rewardValue: "100",
    },
    {
      name: "Consistent Coder",
      description: "Login 7 days in a row",
      criteria: { type: "LOGIN_STREAK", threshold: 7 },
      rewardType: "CORES",
      rewardValue: "500",
    },
    {
      name: "Arena Mastery",
      description: "Win 10 Battles",
      criteria: { type: "BATTLE_WIN", threshold: 10 },
      rewardType: "BADGE",
      rewardValue: (await prisma.badge.findUnique({ where: { name: "Code Warrior" } })).id,
    }
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: ach,
      create: ach,
    });
  }

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
