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
  await prisma.teamBattleMatch.deleteMany({});
  await prisma.contestProblem.deleteMany({});
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

  // ─── 9. Palindrome String ────────────────────────────────────────────────
  const p9 = await prisma.problem.create({
    data: {
      title: "Palindrome String",
      description: `Given a string \`s\`, print \`true\` if it is a palindrome, otherwise print \`false\`.
      
A palindrome reads the same forwards and backwards (case-sensitive).`,
      constraints: "1 ≤ |s| ≤ 10^5",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "racecar\n", output: "true\n", isHidden: false, isSample: true },
          { input: "hello\n", output: "false\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 10. Factorial of a Number ───────────────────────────────────────────
  const p10 = await prisma.problem.create({
    data: {
      title: "Factorial of a Number",
      description: `Given a non-negative integer \`n\`, calculate its factorial.
      
Factorial of \`n\` (n!) is the product of all positive integers less than or equal to \`n\`. 0! = 1.`,
      constraints: "0 ≤ n ≤ 20",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "5\n", output: "120\n", isHidden: false, isSample: true },
          { input: "0\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 11. Fibonacci Number ────────────────────────────────────────────────
  const p11 = await prisma.problem.create({
    data: {
      title: "Fibonacci Number",
      description: `Given an integer \`n\`, find the \`n\`-th Fibonacci number.
      
The Fibonacci sequence starts with 0 and 1: 0, 1, 1, 2, 3, 5, 8, 13, ...`,
      constraints: "0 ≤ n ≤ 45",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "6\n", output: "8\n", isHidden: false, isSample: true },
          { input: "0\n", output: "0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 12. Find Maximum in Array ───────────────────────────────────────────
  const p12 = await prisma.problem.create({
    data: {
      title: "Find Maximum in Array",
      description: `Given \`n\` integers on a single line, find the maximum value.
      
**Input format:**
Line 1: space-separated integers`,
      constraints: "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 5 3 9 2\n", output: "9\n", isHidden: false, isSample: true },
          { input: "-10 -20 -30\n", output: "-10\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 13. Find Minimum in Array ───────────────────────────────────────────
  const p13 = await prisma.problem.create({
    data: {
      title: "Find Minimum in Array",
      description: `Given \`n\` integers on a single line, find the minimum value.
      
**Input format:**
Line 1: space-separated integers`,
      constraints: "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 5 3 9 2\n", output: "1\n", isHidden: false, isSample: true },
          { input: "-10 -20 -30\n", output: "-30\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 14. Count Vowels in String ──────────────────────────────────────────
  const p14 = await prisma.problem.create({
    data: {
      title: "Count Vowels in String",
      description: `Given a string \`s\`, count the number of vowels (a, e, i, o, u) in it. The check should be case-insensitive.`,
      constraints: "1 ≤ |s| ≤ 10^5",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "hello\n", output: "2\n", isHidden: false, isSample: true },
          { input: "AEIOU\n", output: "5\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 15. Check Prime Number ──────────────────────────────────────────────
  const p15 = await prisma.problem.create({
    data: {
      title: "Check Prime Number",
      description: `Given an integer \`n\`, print \`true\` if it is prime, otherwise print \`false\`.`,
      constraints: "-10^9 ≤ n ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "7\n", output: "true\n", isHidden: false, isSample: true },
          { input: "4\n", output: "false\n", isHidden: false, isSample: true },
          { input: "1\n", output: "false\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 16. Sum of Digits ───────────────────────────────────────────────────
  const p16 = await prisma.problem.create({
    data: {
      title: "Sum of Digits",
      description: `Given a non-negative integer \`n\`, print the sum of its digits.`,
      constraints: "0 ≤ n ≤ 10^18",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "123\n", output: "6\n", isHidden: false, isSample: true },
          { input: "0\n", output: "0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 17. Calculate Power (a^b) ───────────────────────────────────────────
  const p17 = await prisma.problem.create({
    data: {
      title: "Calculate Power (a^b)",
      description: `Given two integers \`a\` and \`b\`, print the result of \`a\` raised to the power \`b\` (\`a^b\`).`,
      constraints: "0 ≤ a, b ≤ 15",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2 3\n", output: "8\n", isHidden: false, isSample: true },
          { input: "5 0\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 18. Find Second Largest in Array ─────────────────────────────────────
  const p18 = await prisma.problem.create({
    data: {
      title: "Find Second Largest in Array",
      description: `Given \`n\` unique integers on a single line, find the second largest value.`,
      constraints: "2 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 5 3 9 2\n", output: "5\n", isHidden: false, isSample: true },
          { input: "-10 -20 0\n", output: "-10\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 19. Array Rotation (Left) ───────────────────────────────────────────
  const p19 = await prisma.problem.create({
    data: {
      title: "Array Rotation (Left)",
      description: `Given \`n\` integers and a value \`d\`, rotate the array to the left by \`d\` positions.
      
**Input format:**
Line 1: n d
Line 2: n space-separated integers`,
      constraints: "1 ≤ n ≤ 10^5\n0 ≤ d ≤ n\n-10^9 ≤ elements ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "5 2\n1 2 3 4 5\n", output: "3 4 5 1 2\n", isHidden: false, isSample: true },
          { input: "3 0\n10 20 30\n", output: "10 20 30\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 20. Remove Duplicates from Sorted Array ────────────────────────────
  const p20 = await prisma.problem.create({
    data: {
      title: "Remove Duplicates from Sorted Array",
      description: `Given a sorted array of \`n\` integers, print the unique elements in the same order.`,
      constraints: "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9 (Sorted)",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 1 2 2 3\n", output: "1 2 3\n", isHidden: false, isSample: true },
          { input: "5 5 5\n", output: "5\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 21. Binary to Decimal Conversion ────────────────────────────────────
  const p21 = await prisma.problem.create({
    data: {
      title: "Binary to Decimal Conversion",
      description: `Given a binary string \`s\`, print its decimal (base-10) equivalent.`,
      constraints: "1 ≤ |s| ≤ 60",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1010\n", output: "10\n", isHidden: false, isSample: true },
          { input: "111\n", output: "7\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 22. Decimal to Binary Conversion ────────────────────────────────────
  const p22 = await prisma.problem.create({
    data: {
      title: "Decimal to Binary Conversion",
      description: `Given a non-negative integer \`n\`, print its binary (base-2) equivalent string.`,
      constraints: "0 ≤ n ≤ 10^18",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "10\n", output: "1010\n", isHidden: false, isSample: true },
          { input: "0\n", output: "0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 23. Check Anagram ───────────────────────────────────────────────────
  const p23 = await prisma.problem.create({
    data: {
      title: "Check Anagram",
      description: `Given two strings \`s1\` and \`s2\` on separate lines, print \`true\` if they are anagrams, otherwise \`false\`.
      
Two strings are anagrams if they contain the same characters with the same frequencies.`,
      constraints: "1 ≤ |s1|, |s2| ≤ 10^5",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "listen\nsilent\n", output: "true\n", isHidden: false, isSample: true },
          { input: "rat\ncar\n", output: "false\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 24. Find GCD of Two Numbers ─────────────────────────────────────────
  const p24 = await prisma.problem.create({
    data: {
      title: "Find GCD of Two Numbers",
      description: `Given two integers \`a\` and \`b\` on a single line, find their Greatest Common Divisor (GCD).`,
      constraints: "1 ≤ a, b ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "12 18\n", output: "6\n", isHidden: false, isSample: true },
          { input: "13 17\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 25. Find LCM of Two Numbers ─────────────────────────────────────────
  const p25 = await prisma.problem.create({
    data: {
      title: "Find LCM of Two Numbers",
      description: `Given two integers \`a\` and \`b\` on a single line, find their Least Common Multiple (LCM).`,
      constraints: "1 ≤ a, b ≤ 10^6",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "12 18\n", output: "36\n", isHidden: false, isSample: true },
          { input: "5 7\n", output: "35\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 26. Count Occurrences of a Character ─────────────────────────────────
  const p26 = await prisma.problem.create({
    data: {
      title: "Count Occurrences of a Character",
      description: `Given a string \`s\` on line 1 and a character \`c\` on line 2, count how many times \`c\` appears in \`s\`.`,
      constraints: "1 ≤ |s| ≤ 10^5",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "hello world\nl\n", output: "3\n", isHidden: false, isSample: true },
          { input: "aaaaa\nb\n", output: "0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 27. Capitalize First Letter ─────────────────────────────────────────
  const p27 = await prisma.problem.create({
    data: {
      title: "Capitalize First Letter",
      description: `Given a string \`s\`, capitalize the first letter of each word. Words are separated by a single space.`,
      constraints: "1 ≤ |s| ≤ 10^5",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "hello world\n", output: "Hello World\n", isHidden: false, isSample: true },
          { input: "code arena is great\n", output: "Code Arena Is Great\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 28. Check if Array is Sorted ─────────────────────────────────────────
  const p28 = await prisma.problem.create({
    data: {
      title: "Check if Array is Sorted",
      description: `Given \`n\` integers on a single line, print \`true\` if the array is sorted in non-decreasing order, otherwise \`false\`.`,
      constraints: "1 ≤ n ≤ 10^5\n-10^9 ≤ elements ≤ 10^9",
      difficulty: "EASY",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2 3 4 5\n", output: "true\n", isHidden: false, isSample: true },
          { input: "1 3 2 4 5\n", output: "false\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 29. Length of Longest Substring ─────────────────────────────────────
  const p29 = await prisma.problem.create({
    data: {
      title: "Length of Longest Substring",
      description: `Given a string \`s\`, find the length of the **longest substring** without repeating characters.`,
      constraints: "0 ≤ |s| ≤ 5 * 10^4\n\`s\` consists of English letters, digits, symbols and spaces.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "abcabcbb\n", output: "3\n", isHidden: false, isSample: true },
          { input: "bbbbb\n", output: "1\n", isHidden: false, isSample: true },
          { input: "pwwkew\n", output: "3\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 30. Container With Most Water ────────────────────────────────────────
  const p30 = await prisma.problem.create({
    data: {
      title: "Container With Most Water",
      description: `You are given an integer array \`height\` of length \`n\`. There are \`n\` vertical lines drawn such that the two endpoints of the \`i\`th line are \`(i, 0)\` and \`(i, height[i])\`.
      
Find two lines that together with the x-axis form a container, such that the container contains the most water. Return the **maximum amount of water** a container can store.`,
      constraints: "n == height.length\n2 ≤ n ≤ 10^5\n0 ≤ height[i] ≤ 10^4",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 8 6 2 5 4 8 3 7\n", output: "49\n", isHidden: false, isSample: true },
          { input: "1 1\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 31. 3Sum ─────────────────────────────────────────────────────────────
  const p31 = await prisma.problem.create({
    data: {
      title: "3Sum",
      description: `Given an integer array \`nums\`, return all the triplets \`[nums[i], nums[j], nums[k]]\` such that \`i != j\`, \`i != k\`, and \`j != k\`, and \`nums[i] + nums[j] + nums[k] == 0\`.
      
The solution set must not contain duplicate triplets. Print each triplet on a new line, sorted internally and externally.`,
      constraints: "3 ≤ nums.length ≤ 3000\n-10^5 ≤ nums[i] ≤ 10^5",
      difficulty: "MEDIUM",
      timeLimitMs: 3000,
      testcases: {
        create: [
          { input: "-1 0 1 2 -1 -4\n", output: "-1 -1 2\n-1 0 1\n", isHidden: false, isSample: true },
          { input: "0 1 1\n", output: "\n", isHidden: false, isSample: true },
          { input: "0 0 0\n", output: "0 0 0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 32. Group Anagrams ─────────────────────────────────────────────────
  const p32 = await prisma.problem.create({
    data: {
      title: "Group Anagrams",
      description: `Given an array of strings \`strs\`, group the **anagrams** together. You can return the answer in any order.
      
Print each group on a new line, elements sorted within each line.`,
      constraints: "1 ≤ strs.length ≤ 10^4\n0 ≤ strs[i].length ≤ 100\n\`strs[i]\` consists of lowercase English letters.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "eat tea tan ate nat bat\n", output: "ate eat tea\nnat tan\nbat\n", isHidden: false, isSample: true },
          { input: "\n", output: "\n\n", isHidden: false, isSample: true },
          { input: "a\n", output: "a\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 33. Merge Intervals ──────────────────────────────────────────────────
  const p33 = await prisma.problem.create({
    data: {
      title: "Merge Intervals",
      description: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and print the merged intervals.
      
**Input format:**
Line 1: space-separated integers in pairs: s1 e1 s2 e2 ...`,
      constraints: "1 ≤ intervals.length ≤ 10^4\n0 ≤ start_i ≤ end_i ≤ 10^4",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 3 2 6 8 10 15 18\n", output: "1 6 8 10 15 18\n", isHidden: false, isSample: true },
          { input: "1 4 4 5\n", output: "1 5\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 34. Rotate Image ───────────────────────────────────────────────────
  const p34 = await prisma.problem.create({
    data: {
      title: "Rotate Image",
      description: `You are given an \`n x n\` 2D matrix representing an image, rotate the image by **90 degrees (clockwise)**.
      
**Input format:**
Line 1: n
Line 2 to n+1: space-separated integers for each row.`,
      constraints: "n == matrix.length == matrix[i].length\n1 ≤ n ≤ 20\n-1000 ≤ matrix[i][j] ≤ 1000",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3\n1 2 3\n4 5 6\n7 8 9\n", output: "7 4 1\n8 5 2\n9 6 3\n", isHidden: false, isSample: true },
          { input: "2\n1 2\n3 4\n", output: "3 1\n4 2\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 35. Spiral Matrix ────────────────────────────────────────────────────
  const p35 = await prisma.problem.create({
    data: {
      title: "Spiral Matrix",
      description: `Given an \`m x n\` matrix, return all elements of the matrix in **spiral order**.
      
**Input format:**
Line 1: m n
Line 2 to m+1: space-separated integers for each row.`,
      constraints: "m == matrix.length\nn == matrix[i].length\n1 ≤ m, n ≤ 10\n-100 ≤ matrix[i][j] ≤ 100",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3 3\n1 2 3\n4 5 6\n7 8 9\n", output: "1 2 3 6 9 8 7 4 5\n", isHidden: false, isSample: true },
          { input: "3 4\n1 2 3 4\n5 6 7 8\n9 10 11 12\n", output: "1 2 3 4 8 12 11 10 9 5 6 7\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 36. Subsets ────────────────────────────────────────────────────────
  const p36 = await prisma.problem.create({
    data: {
      title: "Subsets",
      description: `Given an integer array \`nums\` of unique elements, return all possible **subsets** (the power set).
      
The solution set must not contain duplicate subsets. Print each subset on a new line, elements sorted within each line, and subsets sorted lexicographically.`,
      constraints: "1 ≤ nums.length ≤ 10\n-10 ≤ nums[i] ≤ 10\nAll elements are unique.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2 3\n", output: "\n1\n1 2\n1 2 3\n1 3\n2\n2 3\n3\n", isHidden: false, isSample: true },
          { input: "0\n", output: "\n0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 37. Permutations ─────────────────────────────────────────────────────
  const p37 = await prisma.problem.create({
    data: {
      title: "Permutations",
      description: `Given an array \`nums\` of distinct integers, return all the possible **permutations**. You can return the answer in any order.
      
Print each permutation on a new line, sorted lexicographically.`,
      constraints: "1 ≤ nums.length ≤ 6\n-10 ≤ nums[i] ≤ 10\nAll elements are unique.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2 3\n", output: "1 2 3\n1 3 2\n2 1 3\n2 3 1\n3 1 2\n3 2 1\n", isHidden: false, isSample: true },
          { input: "0 1\n", output: "0 1\n1 0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 38. Lowest Common Ancestor ──────────────────────────────────────────
  const p38 = await prisma.problem.create({
    data: {
      title: "Lowest Common Ancestor",
      description: `Given a binary tree, find the lowest common ancestor (LCA) of two given nodes, \`p\` and \`q\`.
      
According to the definition of LCA on Wikipedia: “The lowest common ancestor is defined between two nodes \`p\` and \`q\` as the lowest node in T that has both \`p\` and \`q\` as descendants (where we allow a node to be a descendant of itself).”
      
**Input format:**
Line 1: Tree elements in level-order (use 'null' for empty children)
Line 2: Value of node p
Line 3: Value of node q`,
      constraints: "The number of nodes in the tree is in the range [2, 10^5].\n-10^9 ≤ Node.val ≤ 10^9\nAll Node.val are unique.\np != q\np and q exist in the tree.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3 5 1 6 2 0 8 null null 7 4\n5\n1\n", output: "3\n", isHidden: false, isSample: true },
          { input: "3 5 1 6 2 0 8 null null 7 4\n5\n4\n", output: "5\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 39. Kth Largest Element ─────────────────────────────────────────────
  const p39 = await prisma.problem.create({
    data: {
      title: "Kth Largest Element",
      description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\`th largest element in the array.
      
Note that it is the \`k\`th largest element in the sorted order, not the \`k\`th distinct element.
      
**Input format:**
Line 1: k
Line 2: space-separated integers`,
      constraints: "1 ≤ k ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2\n3 2 1 5 6 4\n", output: "5\n", isHidden: false, isSample: true },
          { input: "4\n3 2 3 1 2 4 5 5 6\n", output: "4\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 40. Top K Frequent Elements ─────────────────────────────────────────
  const p40 = await prisma.problem.create({
    data: {
      title: "Top K Frequent Elements",
      description: `Given an integer array \`nums\` and an integer \`k\`, return the \`k\` most frequent elements. You may return the answer in **any order**.
      
Print the elements space-separated, sorted ascending.`,
      constraints: "1 ≤ nums.length ≤ 10^5\nk is in the range [1, the number of unique elements in the array].\nIt is guaranteed that the answer is unique.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2\n1 1 1 2 2 3\n", output: "1 2\n", isHidden: false, isSample: true },
          { input: "1\n1\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 41. Search in Rotated Sorted Array ───────────────────────────────
  const p41 = await prisma.problem.create({
    data: {
      title: "Search in Rotated Sorted Array",
      description: `There is an integer array \`nums\` sorted in ascending order (with distinct values).
      
Prior to being passed to your function, \`nums\` is **possibly rotated** at an unknown pivot index \`k\` (\`1 <= k < nums.length\`) such that the resulting array is \`[nums[k], nums[k+1], ..., nums[n-1], nums[0], nums[1], ..., nums[k-1]]\` (0-indexed).
      
Given the array \`nums\` **after** the rotation and an integer \`target\`, return the index of \`target\` if it is in \`nums\`, or \`-1\` if it is not in \`nums\`.
      
**Input format:**
Line 1: target
Line 2: space-separated integers`,
      constraints: "1 ≤ nums.length ≤ 5000\n-10^4 ≤ nums[i] ≤ 10^4\nAll values of \`nums\` are unique.\n\`nums\` is an ascending array that is possibly rotated.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "0\n4 5 6 7 0 1 2\n", output: "4\n", isHidden: false, isSample: true },
          { input: "3\n4 5 6 7 0 1 2\n", output: "-1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 42. Coin Change ──────────────────────────────────────────────────────
  const p42 = await prisma.problem.create({
    data: {
      title: "Coin Change",
      description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.
      
Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.
      
**Input format:**
Line 1: amount
Line 2: space-separated integers (denominations)`,
      constraints: "1 ≤ coins.length ≤ 12\n1 ≤ coins[i] ≤ 2^31 - 1\n0 ≤ amount ≤ 10^4",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "11\n1 2 5\n", output: "3\n", isHidden: false, isSample: true },
          { input: "3\n2\n", output: "-1\n", isHidden: false, isSample: true },
          { input: "0\n1\n", output: "0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 43. Longest Palindromic Substring ────────────────────────────────────
  const p43 = await prisma.problem.create({
    data: {
      title: "Longest Palindromic Substring",
      description: `Given a string \`s\`, return the **longest palindromic substring** in \`s\`.`,
      constraints: "1 ≤ |s| ≤ 1000\n\`s\` consist of only digits and English letters.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "babad\n", output: "bab\n", isHidden: false, isSample: true },
          { input: "cbbd\n", output: "bb\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 44. Valid Sudoku ────────────────────────────────────────────────────
  const p44 = await prisma.problem.create({
    data: {
      title: "Valid Sudoku",
      description: `Determine if a 9 x 9 Sudoku board is valid. Only the filled cells need to be validated according to the following rules:
      
1. Each row must contain the digits 1-9 without repetition.
2. Each column must contain the digits 1-9 without repetition.
3. Each of the nine 3 x 3 sub-boxes of the grid must contain the digits 1-9 without repetition.
      
**Input format:**
9 lines, each with 9 space-separated characters (1-9 or '.').`,
      constraints: "board.length == 9\nboard[i].length == 9\n\`board[i][j]\` is a digit 1-9 or '.'.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n", output: "true\n", isHidden: false, isSample: true },
          { input: "8 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n", output: "false\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 45. Generate Parentheses ───────────────────────────────────────────
  const p45 = await prisma.problem.create({
    data: {
      title: "Generate Parentheses",
      description: `Given \`n\` pairs of parentheses, write a function to generate all combinations of well-formed parentheses.
      
Print each combination on a new line, sorted lexicographically.`,
      constraints: "1 ≤ n ≤ 8",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3\n", output: "((()))\n(()())\n(())()\n()(())\n()()()\n", isHidden: false, isSample: true },
          { input: "1\n", output: "()\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 46. Product of Array Except Self ───────────────────────────────────
  const p46 = await prisma.problem.create({
    data: {
      title: "Product of Array Except Self",
      description: `Given an integer array \`nums\`, return an array \`answer\` such that \`answer[i]\` is equal to the product of all the elements of \`nums\` except \`nums[i]\`.
      
The algorithm must run in **O(n)** time and **without** using the division operation.
      
**Input format:**
Line 1: space-separated integers`,
      constraints: "2 ≤ nums.length ≤ 10^5\n-30 ≤ nums[i] ≤ 30\nThe product of any prefix or suffix of \`nums\` is guaranteed to fit in a 32-bit integer.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2 3 4\n", output: "24 12 8 6\n", isHidden: false, isSample: true },
          { input: "-1 1 0 -3 3\n", output: "0 0 9 0 0\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 47. Sort Colors ──────────────────────────────────────────────────────
  const p47 = await prisma.problem.create({
    data: {
      title: "Sort Colors",
      description: `Given an array \`nums\` with \`n\` objects colored red, white, or blue, sort them **in-place** so that objects of the same color are adjacent, with the colors in the order red, white, and blue.
      
We will use the integers 0, 1, and 2 to represent the color red, white, and blue, respectively.
      
**Input format:**
Line 1: space-separated integers (0s, 1s, and 2s)`,
      constraints: "n == nums.length\n1 ≤ n ≤ 300\n\`nums[i]\` is either 0, 1, or 2.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "2 0 2 1 1 0\n", output: "0 0 1 1 2 2\n", isHidden: false, isSample: true },
          { input: "2 0 1\n", output: "0 1 2\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 48. Find All Anagrams in a String ──────────────────────────────────
  const p48 = await prisma.problem.create({
    data: {
      title: "Find All Anagrams in a String",
      description: `Given two strings \`s\` and \`p\`, return an array of all the start indices of \`p\`'s anagrams in \`s\`. You may return the answer in **any order**.
      
Print the indices space-separated, sorted ascending.
      
**Input format:**
Line 1: s
Line 2: p`,
      constraints: "1 ≤ |s|, |p| ≤ 3 * 10^4\n\`s\` and \`p\` consist of lowercase English letters.",
      difficulty: "MEDIUM",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "cbaebabacd\nabc\n", output: "0 6\n", isHidden: false, isSample: true },
          { input: "abab\nab\n", output: "0 1 2\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 49. Median of Two Sorted Arrays ──────────────────────────────────────
  const p49 = await prisma.problem.create({
    data: {
      title: "Median of Two Sorted Arrays",
      description: `Given two sorted arrays \`nums1\` and \`nums2\` of size \`m\` and \`n\` respectively, return the **median** of the two sorted arrays.
      
The overall run time complexity should be **O(log (m+n))**.
      
**Input format:**
Line 1: space-separated integers (nums1)
Line 2: space-separated integers (nums2)`,
      constraints: "m == nums1.length\nn == nums2.length\n0 ≤ m ≤ 1000\n0 ≤ n ≤ 1000\n1 ≤ m + n ≤ 2000\n-10^6 ≤ nums1[i], nums2[i] ≤ 10^6",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 3\n2\n", output: "2.0\n", isHidden: false, isSample: true },
          { input: "1 2\n3 4\n", output: "2.5\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 50. Regular Expression Matching ─────────────────────────────────────
  const p50 = await prisma.problem.create({
    data: {
      title: "Regular Expression Matching",
      description: `Given an input string \`s\` and a pattern \`p\`, implement regular expression matching with support for \'.\' and \'*\' where:
      
- \'.\' Matches any single character.
- \'*\' Matches zero or more of the preceding element.
      
The matching should cover the **entire** input string (not partial).
      
**Input format:**
Line 1: s
Line 2: p`,
      constraints: "1 ≤ s.length ≤ 20\n1 ≤ p.length ≤ 30\n\`s\` contains only lowercase English letters.\n\`p\` contains only lowercase English letters, \'.\', and \'*\'.\nIt is guaranteed for each appearance of the character \'*\', there will be a previous valid character to match.",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "aa\na\n", output: "false\n", isHidden: false, isSample: true },
          { input: "aa\na*\n", output: "true\n", isHidden: false, isSample: true },
          { input: "ab\n.*\n", output: "true\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 51. Merge k Sorted Lists ───────────────────────────────────────────
  const p51 = await prisma.problem.create({
    data: {
      title: "Merge K Sorted Lists",
      description: `You are given an array of \`k\` linked-lists \`lists\`, each linked-list is sorted in ascending order.
      
Merge all the linked-lists into one sorted linked-list and return it.
      
**Input format:**
Line 1: k
Next k lines: space-separated integers for each sorted list.`,
      constraints: "k == lists.length\n0 ≤ k ≤ 10^4\n0 ≤ lists[i].length ≤ 500\n-10^4 ≤ lists[i][j] ≤ 10^4\n\`lists[i]\` is sorted in ascending order.\nThe sum of \`lists[i].length\` will not exceed 10^4.",
      difficulty: "HARD",
      timeLimitMs: 3000,
      testcases: {
        create: [
          { input: "3\n1 4 5\n1 3 4\n2 6\n", output: "1 1 2 3 4 4 5 6\n", isHidden: false, isSample: true },
          { input: "0\n", output: "\n", isHidden: false, isSample: true },
          { input: "1\n\n", output: "\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 52. Trapping Rain Water ──────────────────────────────────────────────
  const p52 = await prisma.problem.create({
    data: {
      title: "Trapping Rain Water",
      description: `Given \`n\` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.
      
**Input format:**
Line 1: space-separated integers`,
      constraints: "n == height.length\n1 ≤ n ≤ 2 * 10^4\n0 ≤ height[i] ≤ 10^5",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "0 1 0 2 1 0 1 3 2 1 2 1\n", output: "6\n", isHidden: false, isSample: true },
          { input: "4 2 0 3 2 5\n", output: "9\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 53. Edit Distance ────────────────────────────────────────────────────
  const p53 = await prisma.problem.create({
    data: {
      title: "Edit Distance",
      description: `Given two strings \`word1\` and \`word2\`, return the minimum number of operations required to convert \`word1\` to \`word2\`.
      
You have the following three operations permitted on a word:
1. Insert a character
2. Delete a character
3. Replace a character
      
**Input format:**
Line 1: word1
Line 2: word2`,
      constraints: "0 ≤ word1.length, word2.length ≤ 500\n\`word1\` and \`word2\` consist of lowercase English letters.",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "horse\nros\n", output: "3\n", isHidden: false, isSample: true },
          { input: "intention\nexecution\n", output: "5\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 54. Word Search II ──────────────────────────────────────────────────
  const p54 = await prisma.problem.create({
    data: {
      title: "Word Search II",
      description: `Given an \`m x n\` board of characters and a list of strings \`words\`, return all words on the board.
      
Each word must be constructed from letters of sequentially adjacent cells, where **adjacent** cells are horizontally or vertically neighboring. The same letter cell may not be used more than once in a word.
      
**Input format:**
Line 1: m n
Next m lines: n characters separated by space
Next line: space-separated words`,
      constraints: "m == board.length\nn == board[i].length\n1 ≤ m, n ≤ 12\nboard[i][j] is a lowercase English letter.\n1 ≤ words.length ≤ 10^4\n1 ≤ words[i].length ≤ 10\nwords[i] consists of lowercase English letters.\nAll strings in words are unique.",
      difficulty: "HARD",
      timeLimitMs: 4000,
      testcases: {
        create: [
          { input: "4 4\no a a n\ne t a e\ni h k r\ni f l v\noath pea eat rain\n", output: "eat oath\n", isHidden: false, isSample: true },
          { input: "2 2\na b\nc d\nabcb\n", output: "\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 55. Sliding Window Maximum ──────────────────────────────────────────
  const p55 = await prisma.problem.create({
    data: {
      title: "Sliding Window Maximum",
      description: `You are given an array of integers \`nums\`, there is a sliding window of size \`k\` which is moving from the very left of the array to the very right. You can only see the \`k\` numbers in the window. Each time the sliding window moves right by one position.
      
Return the **max** sliding window.
      
**Input format:**
Line 1: k
Line 2: space-separated integers`,
      constraints: "1 ≤ nums.length ≤ 10^5\n-10^4 ≤ nums[i] ≤ 10^4\n1 ≤ k ≤ nums.length",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "3\n1 3 -1 -3 5 3 6 7\n", output: "3 3 5 5 6 7\n", isHidden: false, isSample: true },
          { input: "1\n1\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 56. First Missing Positive ──────────────────────────────────────────
  const p56 = await prisma.problem.create({
    data: {
      title: "First Missing Positive",
      description: `Given an unsorted integer array \`nums\`, return the smallest missing positive integer.
      
You must implement an algorithm that runs in **O(n)** time and uses **O(1)** auxiliary space.
      
**Input format:**
Line 1: space-separated integers`,
      constraints: "1 ≤ nums.length ≤ 10^5\n-2^31 ≤ nums[i] ≤ 2^31 - 1",
      difficulty: "HARD",
      timeLimitMs: 2000,
      testcases: {
        create: [
          { input: "1 2 0\n", output: "3\n", isHidden: false, isSample: true },
          { input: "3 4 -1 1\n", output: "2\n", isHidden: false, isSample: true },
          { input: "7 8 9 11 12\n", output: "1\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 57. Sudoku Solver ────────────────────────────────────────────────────
  const p57 = await prisma.problem.create({
    data: {
      title: "Sudoku Solver",
      description: `Write a program to solve a Sudoku puzzle by filling the empty cells.
      
A sudoku solution must satisfy all of the following rules:
1. Each of the digits 1-9 must occur exactly once in each row.
2. Each of the digits 1-9 must occur exactly once in each column.
3. Each of the digits 1-9 must occur exactly once in each of the nine 3 x 3 sub-boxes of the grid.
      
The '.' character indicates empty cells.
      
**Input format:**
9 lines, each with 9 space-separated characters (1-9 or '.').
      
**Output format:**
9 lines, each with 9 space-separated digits.`,
      constraints: "board.length == 9\nboard[i].length == 9\n\`board[i][j]\` is a digit 1-9 or '.'.\nIt is guaranteed that the input board has only one solution.",
      difficulty: "HARD",
      timeLimitMs: 5000,
      testcases: {
        create: [
          { input: "5 3 . . 7 . . . .\n6 . . 1 9 5 . . .\n. 9 8 . . . . 6 .\n8 . . . 6 . . . 3\n4 . . 8 . 3 . . 1\n7 . . . 2 . . . 6\n. 6 . . . . 2 8 .\n. . . 4 1 9 . . 5\n. . . . 8 . . 7 9\n", output: "5 3 4 6 7 8 9 1 2\n6 7 2 1 9 5 3 4 8\n1 9 8 3 4 2 5 6 7\n8 5 9 7 6 1 4 2 3\n4 2 6 8 5 3 7 9 1\n7 1 3 9 2 4 8 5 6\n9 6 1 5 3 7 2 8 4\n2 8 7 4 1 9 6 3 5\n3 4 5 2 8 6 1 7 9\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  // ─── 58. N-Queens ─────────────────────────────────────────────────────────
  const p58 = await prisma.problem.create({
    data: {
      title: "N-Queens",
      description: `The n-queens puzzle is the problem of placing \`n\` queens on an \`n x n\` chessboard such that no two queens attack each other.
      
Given an integer \`n\`, return all distinct solutions to the **n-queens puzzle**. You may return the answer in any order.
      
Each solution contains a distinct board configuration of the n-queens' placement, where 'Q' and '.' both indicate a queen and an empty space, respectively.
      
**Input format:**
Line 1: n
      
**Output format:**
Each solution separated by a blank line. For each solution, print \`n\` lines with \`n\` characters.`,
      constraints: "1 ≤ n ≤ 9",
      difficulty: "HARD",
      timeLimitMs: 5000,
      testcases: {
        create: [
          { input: "4\n", output: ". Q . .\n. . . Q\nQ . . .\n. . Q .\n\n. . Q .\nQ . . .\n. . . Q\n. Q . .\n", isHidden: false, isSample: true },
          { input: "1\n", output: "Q\n", isHidden: false, isSample: true },
        ],
      },
    },
  });

  console.log("\n✅ Seeded problems:");
  for (const p of [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10, p11, p12, p13, p14, p15, p16, p17, p18, p19, p20, p21, p22, p23, p24, p25, p26, p27, p28, p29, p30, p31, p32, p33, p34, p35, p36, p37, p38, p39, p40, p41, p42, p43, p44, p45, p46, p47, p48, p49, p50, p51, p52, p53, p54, p55, p56, p57, p58]) {
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
