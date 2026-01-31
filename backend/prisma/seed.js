import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Create some simple problems
  const problem1 = await prisma.problem.create({
    data: {
      title: "Sum of Two Numbers",
      description: "Read two integers from input and print their sum.",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2", output: "3", isHidden: false },
          { input: "5 7", output: "12", isHidden: false },
          { input: "100 200", output: "300", isHidden: true },
        ],
      },
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      title: "Multiply Two Numbers",
      description: "Read two integers from input and print their product.",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3 4", output: "12", isHidden: false },
          { input: "5 6", output: "30", isHidden: false },
          { input: "10 10", output: "100", isHidden: true },
        ],
      },
    },
  });

  const problem3 = await prisma.problem.create({
    data: {
      title: "Check Even or Odd",
      description: "Read an integer and print 'Even' or 'Odd'.",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2", output: "Even", isHidden: false },
          { input: "7", output: "Odd", isHidden: false },
          { input: "0", output: "Even", isHidden: true },
        ],
      },
    },
  });

  console.log("Seeded problems:", problem1.title, problem2.title, problem3.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
