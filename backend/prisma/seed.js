import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // WIPE EXISTING SEEDS TO PREVENT DUPLICATES
  await prisma.testCase.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.battle.deleteMany({});
  await prisma.squidGameRound.deleteMany({});
  await prisma.problem.deleteMany({});
  console.log("🧹 Wiped old problems and testcases to prevent duplicates.");

  // 1. Create some simple problems
  const problem1 = await prisma.problem.create({
    data: {
      title: "Sum of Two Numbers",
      description: "Read two integers from input and print their sum.",
      constraints: "The given integers will be in the range [-1000, 1000].",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2\n", output: "3\n", isHidden: false, isSample: true },
          { input: "5 7\n", output: "12\n", isHidden: false, isSample: true },
          { input: "100 200\n", output: "300\n", isHidden: true, isSample: false },
        ],
      },
    },
  });

  const problem2 = await prisma.problem.create({
    data: {
      title: "Multiply Two Numbers",
      description: "Read two integers from input and print their product.",
      constraints: "The given integers will be in the range [0, 500].",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3 4\n", output: "12\n", isHidden: false, isSample: true },
          { input: "5 6\n", output: "30\n", isHidden: false, isSample: true },
          { input: "10 10\n", output: "100\n", isHidden: true, isSample: false },
        ],
      },
    },
  });

  const problem3 = await prisma.problem.create({
    data: {
      title: "Check Even or Odd",
      description: "Read an integer and print 'Even' or 'Odd'.",
      constraints: "The integer will be in the range [-10000, 10000].",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2\n", output: "Even\n", isHidden: false, isSample: true },
          { input: "7\n", output: "Odd\n", isHidden: false, isSample: true },
          { input: "0\n", output: "Even\n", isHidden: true, isSample: false },
        ],
      },
    },
  });

  // 4. Add more complex problems
  const problem4 = await prisma.problem.create({
    data: {
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
Input: [2,7,11,15] 9
Output: [0,1]`,
      constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "[2,7,11,15]\n9\n", output: "[0,1]\n", isHidden: false, isSample: true },
          { input: "[3,2,4]\n6\n", output: "[1,2]\n", isHidden: true, isSample: true },
          { input: "[3,3]\n6\n", output: "[0,1]\n", isHidden: true, isSample: false },
        ],
      },
    },
  });

  const problem5 = await prisma.problem.create({
    data: {
      title: "Binary Search",
      description: `Given an array of integers nums which is sorted in ascending order, and an integer target, write a function to search target in nums. If target exists, then return its index. Otherwise, return -1.

You must write an algorithm with O(log n) runtime complexity.

**Example:**
Input: [-1,0,3,5,9,12] 9
Output: 4`,
      constraints: "1 <= nums.length <= 10^4\n-10^4 < nums[i], target < 10^4\nAll the integers in nums are unique.\nnums is sorted in ascending order.",
      difficulty: "MEDIUM",
      timeLimitMs: 1500,
      testcases: {
        create: [
          { input: "[-1,0,3,5,9,12]\n9\n", output: "4\n", isHidden: false, isSample: true },
          { input: "[-1,0,3,5,9,12]\n2\n", output: "-1\n", isHidden: false, isSample: true },
          { input: "[1]\n1\n", output: "0\n", isHidden: true, isSample: false },
        ],
      },
    },
  });

  const problem6 = await prisma.problem.create({
    data: {
      title: "Palindrome Number",
      description: `Given an integer x, return true if x is a palindrome, and false otherwise.

**Example:**
Input: 121
Output: true

Input: -121
Output: false`,
      constraints: "-2^31 <= x <= 2^31 - 1",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "121\n", output: "true\n", isHidden: false, isSample: true },
          { input: "-121\n", output: "false\n", isHidden: false, isSample: true },
          { input: "10\n", output: "false\n", isHidden: true, isSample: false },
        ],
      },
    },
  });

  console.log("Seeded problems:",
    problem1.title,
    problem2.title,
    problem3.title,
    problem4.title,
    problem5.title,
    problem6.title
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
