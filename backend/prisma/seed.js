import "dotenv/config";
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

  // 4. Add more complex problems
  const problem4 = await prisma.problem.create({
    data: {
      title: "Two Sum",
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

**Example:**
Input: [2,7,11,15] 9
Output: [0,1]`,
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "[2,7,11,15]\n9", output: "[0,1]", isHidden: false },
          { input: "[3,2,4]\n6", output: "[1,2]", isHidden: true },
          { input: "[3,3]\n6", output: "[0,1]", isHidden: true },
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
      difficulty: "MEDIUM",
      timeLimitMs: 1500,
      testcases: {
        create: [
          { input: "[-1,0,3,5,9,12]\n9", output: "4", isHidden: false },
          { input: "[-1,0,3,5,9,12]\n2", output: "-1", isHidden: true },
          { input: "[1]\n1", output: "0", isHidden: true },
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
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "121", output: "true", isHidden: false },
          { input: "-121", output: "false", isHidden: false },
          { input: "10", output: "false", isHidden: true },
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
