import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // WIPE EXISTING DATA TO PREVENT DUPLICATES
  await prisma.testCase.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.battle.deleteMany({});
  await prisma.squidGameRound.deleteMany({});
  await prisma.problem.deleteMany({});
  console.log("🧹 Wiped old problems and testcases.");

  // ─── 1. Sum of Two Numbers ───────────────────────────────────────────────
  const p1 = await prisma.problem.create({
    data: {
      title: "Sum of Two Numbers",
      description: `Given two integers \`a\` and \`b\` on a single line separated by a space, print their sum.

**Example Input:**
\`\`\`
3 5
\`\`\`
**Example Output:**
\`\`\`
8
\`\`\``,
      constraints: "-10^9 ≤ a, b ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3 5\n", output: "8\n", isHidden: false, isSample: true },
          { input: "-1 1\n", output: "0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 2. Reverse a String ─────────────────────────────────────────────────
  const p2 = await prisma.problem.create({
    data: {
      title: "Reverse a String",
      description: `Given a string \`s\`, print the reverse of \`s\`.

**Example Input:**
\`\`\`
hello
\`\`\`
**Example Output:**
\`\`\`
olleh
\`\`\``,
      constraints: "1 ≤ |s| ≤ 10^5",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "hello\n", output: "olleh\n", isHidden: false, isSample: true },
          { input: "abcde\n", output: "edcba\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 3. Check Even or Odd ─────────────────────────────────────────────────
  const p3 = await prisma.problem.create({
    data: {
      title: "Check Even or Odd",
      description: `Given an integer \`n\`, print \`Even\` if it is even, or \`Odd\` if it is odd.

**Example Input:**
\`\`\`
4
\`\`\`
**Example Output:**
\`\`\`
Even
\`\`\``,
      constraints: "-10^9 ≤ n ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "4\n", output: "Even\n", isHidden: false, isSample: true },
          { input: "7\n", output: "Odd\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 4. FizzBuzz ─────────────────────────────────────────────────────────
  const p4 = await prisma.problem.create({
    data: {
      title: "FizzBuzz",
      description: `Given an integer \`n\`, for each number \`i\` from 1 to \`n\` (inclusive):
- Print \`FizzBuzz\` if \`i\` is divisible by both 3 and 5
- Print \`Fizz\` if \`i\` is divisible by 3
- Print \`Buzz\` if \`i\` is divisible by 5
- Otherwise print \`i\`

Each on its own line.

**Example Input:**
\`\`\`
5
\`\`\`
**Example Output:**
\`\`\`
1
2
Fizz
4
Buzz
\`\`\``,
      constraints: "1 ≤ n ≤ 10^4",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "5\n", output: "1\n2\nFizz\n4\nBuzz\n", isHidden: false, isSample: true },
          { input: "15\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 5. Two Sum ───────────────────────────────────────────────────────────
  const p5 = await prisma.problem.create({
    data: {
      title: "Two Sum",
      description: `Given an array of integers and a target, find the **0-based indices** of the two numbers that add up to the target. You may assume exactly one solution exists.

**Input format:**
Line 1: space-separated integers (the array)
Line 2: the target integer

**Example Input:**
\`\`\`
2 7 11 15
9
\`\`\`
**Example Output:**
\`\`\`
0 1
\`\`\``,
      constraints: "2 ≤ n ≤ 10^4\n-10^9 ≤ nums[i], target ≤ 10^9\nExactly one valid answer exists.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2 7 11 15\n9\n", output: "0 1\n", isHidden: false, isSample: true },
          { input: "3 2 4\n6\n", output: "1 2\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 6. Binary Search ────────────────────────────────────────────────────
  const p6 = await prisma.problem.create({
    data: {
      title: "Binary Search",
      description: `Given a sorted array of integers and a target, return the **0-based index** of the target. If not found, return \`-1\`.

**Input format:**
Line 1: space-separated sorted integers
Line 2: the target

**Example Input:**
\`\`\`
-1 0 3 5 9 12
9
\`\`\`
**Example Output:**
\`\`\`
4
\`\`\``,
      constraints: "1 ≤ n ≤ 10^4\nAll integers unique, sorted ascending.",
      difficulty: "MEDIUM",
      timeLimitMs: 1500,
      testcases: {
        create: [
          { input: "-1 0 3 5 9 12\n9\n", output: "4\n", isHidden: false, isSample: true },
          { input: "-1 0 3 5 9 12\n2\n", output: "-1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 7. Palindrome Number ────────────────────────────────────────────────
  const p7 = await prisma.problem.create({
    data: {
      title: "Palindrome Number",
      description: `Given an integer \`x\`, print \`true\` if it is a palindrome, otherwise print \`false\`.

A number is a palindrome if it reads the same forwards and backwards. Negative numbers are **not** palindromes.

**Example Input:**
\`\`\`
121
\`\`\`
**Example Output:**
\`\`\`
true
\`\`\``,
      constraints: "-2^31 ≤ x ≤ 2^31 - 1",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "121\n", output: "true\n", isHidden: false, isSample: true },
          { input: "-121\n", output: "false\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 8. Longest Common Prefix ────────────────────────────────────────────
  const p8 = await prisma.problem.create({
    data: {
      title: "Longest Common Prefix",
      description: `Given \`n\` words on separate lines, find the **longest common prefix** shared by all words. If there is no common prefix, print an empty line.

**Input format:**
Line 1: n (number of words)
Next n lines: one word each

**Example Input:**
\`\`\`
3
flower
flow
flight
\`\`\`
**Example Output:**
\`\`\`
fl
\`\`\``,
      constraints: "1 ≤ n ≤ 200\n0 ≤ word length ≤ 200\nAll lowercase English letters.",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3\nflower\nflow\nflight\n", output: "fl\n", isHidden: false, isSample: true },
          { input: "3\ndog\nracecar\ncar\n", output: "\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  console.log("\n✅ Seeded problems:");
  for (const p of [p1, p2, p3, p4, p5, p6, p7, p8]) {
    console.log(`   [${p.difficulty}] ${p.title} (id: ${p.id})`);
  }
  console.log("\n🚀 Now run: npm run seed:s3  — to upload hidden test cases to Cloudflare R2");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
