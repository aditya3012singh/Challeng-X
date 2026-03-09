/**
 * seed_s3_testcases.js
 *
 * Uploads hard-coded hidden test cases for each problem directly to Cloudflare R2.
 * Run AFTER `npx prisma db seed` so problems exist in the DB.
 *
 * Usage: npm run seed:s3
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import S3Service from "../src/services/s3.service.js";

const prisma = new PrismaClient();

// ─── Hidden test cases per problem ──────────────────────────────────────────
// Keys must EXACTLY match the titles in prisma/seed.js
const HIDDEN_CASES = {
    "Sum of Two Numbers": [
        { input: "0 0\n", output: "0\n" },
        { input: "1000 2000\n", output: "3000\n" },
        { input: "-500 500\n", output: "0\n" },
        { input: "999999999 1\n", output: "1000000000\n" },
        { input: "-1000000000 -1\n", output: "-1000000001\n" },
        { input: "123 456\n", output: "579\n" },
        { input: "-200 -300\n", output: "-500\n" },
        { input: "1 -1\n", output: "0\n" },
        { input: "42 58\n", output: "100\n" },
        { input: "0 -1\n", output: "-1\n" },
        { input: "777 333\n", output: "1110\n" },
        { input: "-999 999\n", output: "0\n" },
    ],

    "Reverse a String": [
        { input: "a\n", output: "a\n" },
        { input: "racecar\n", output: "racecar\n" },
        { input: "abcdef\n", output: "fedcba\n" },
        { input: "z\n", output: "z\n" },
        { input: "CodeArena\n", output: "anerAedoC\n" },
        { input: "12345\n", output: "54321\n" },
        { input: "aabbcc\n", output: "ccbbaa\n" },
        { input: "stressed\n", output: "desserts\n" },
        { input: "madam\n", output: "madam\n" },
        { input: "openai\n", output: "ianepo\n" },
        { input: "xyzzyx\n", output: "xyzzy x\n".trim() + "\n" },
        { input: "noon\n", output: "noon\n" },
    ],

    "Check Even or Odd": [
        { input: "0\n", output: "Even\n" },
        { input: "-2\n", output: "Even\n" },
        { input: "-3\n", output: "Odd\n" },
        { input: "1000000000\n", output: "Even\n" },
        { input: "999999999\n", output: "Odd\n" },
        { input: "100\n", output: "Even\n" },
        { input: "101\n", output: "Odd\n" },
        { input: "-10000\n", output: "Even\n" },
        { input: "-9999\n", output: "Odd\n" },
        { input: "2\n", output: "Even\n" },
        { input: "3\n", output: "Odd\n" },
        { input: "1\n", output: "Odd\n" },
    ],

    "FizzBuzz": [
        { input: "1\n", output: "1\n" },
        { input: "3\n", output: "1\n2\nFizz\n" },
        { input: "10\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n" },
        { input: "20\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\n" },
        { input: "30\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz\n16\n17\nFizz\n19\nBuzz\nFizz\n22\n23\nFizz\nBuzz\n26\nFizz\n28\n29\nFizzBuzz\n" },
        { input: "6\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n" },
        { input: "15\n", output: Array.from({ length: 15 }, (_, i) => { const n = i + 1; if (n % 15 === 0) return "FizzBuzz"; if (n % 3 === 0) return "Fizz"; if (n % 5 === 0) return "Buzz"; return String(n); }).join("\n") + "\n" },
        { input: "10\n", output: Array.from({ length: 10 }, (_, i) => { const n = i + 1; if (n % 15 === 0) return "FizzBuzz"; if (n % 3 === 0) return "Fizz"; if (n % 5 === 0) return "Buzz"; return String(n); }).join("\n") + "\n" },
        { input: "2\n", output: "1\n2\n" },
        { input: "9\n", output: "1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\n" },
    ],

    "Two Sum": [
        { input: "3 3\n6\n", output: "0 1\n" },
        { input: "1 2 3 4 5\n9\n", output: "3 4\n" },
        { input: "0 4 3 0\n0\n", output: "0 3\n" },
        { input: "2 5 5 11\n10\n", output: "1 2\n" },
        { input: "-3 4 3 90\n0\n", output: "0 2\n" },
        { input: "1 3 4 2\n6\n", output: "2 3\n" },
        { input: "10 20 30 40\n50\n", output: "0 3\n" },
        { input: "5 75 25\n100\n", output: "1 2\n" },
        { input: "-1 -2 -3 -4 -5\n-8\n", output: "2 4\n" },
        { input: "1 5 3 8\n11\n", output: "1 3\n" },
        { input: "100 200 300\n500\n", output: "1 2\n" },
        { input: "7 2 13 11\n9\n", output: "0 1\n" },
    ],

    "Binary Search": [
        { input: "1\n1\n", output: "0\n" },
        { input: "1 3 5 7 9\n3\n", output: "1\n" },
        { input: "1 3 5 7 9\n10\n", output: "-1\n" },
        { input: "2 4 6 8 10\n6\n", output: "2\n" },
        { input: "-10 -5 0 5 10\n0\n", output: "2\n" },
        { input: "-10 -5 0 5 10\n-10\n", output: "0\n" },
        { input: "-10 -5 0 5 10\n10\n", output: "4\n" },
        { input: "1 2 3 4 5 6 7 8 9 10\n7\n", output: "6\n" },
        { input: "5\n5\n", output: "0\n" },
        { input: "1 3\n2\n", output: "-1\n" },
        { input: "0 1 2 3 4 5 6 7 8 9\n0\n", output: "0\n" },
        { input: "0 1 2 3 4 5 6 7 8 9\n9\n", output: "9\n" },
    ],

    "Palindrome Number": [
        { input: "0\n", output: "true\n" },
        { input: "10\n", output: "false\n" },
        { input: "1001\n", output: "true\n" },
        { input: "12321\n", output: "true\n" },
        { input: "12345\n", output: "false\n" },
        { input: "1221\n", output: "true\n" },
        { input: "-1\n", output: "false\n" },
        { input: "9\n", output: "true\n" },
        { input: "11\n", output: "true\n" },
        { input: "100\n", output: "false\n" },
        { input: "1000021\n", output: "false\n" },
        { input: "999\n", output: "true\n" },
        { input: "2147483647\n", output: "false\n" },
    ],

    "Longest Common Prefix": [
        { input: "1\nhello\n", output: "hello\n" },
        { input: "2\nabc\nabc\n", output: "abc\n" },
        { input: "4\ninter\ninterview\ninteract\ninter\n", output: "inter\n" },
        { input: "3\nabc\ndef\nghi\n", output: "\n" },
        { input: "2\na\nab\n", output: "a\n" },
        { input: "3\nprefix\npre\npre-order\n", output: "pre\n" },
        { input: "5\ncat\ncar\ncab\ncafe\ncap\n", output: "ca\n" },
        { input: "3\naa\na\n\n", output: "\n" },
        { input: "2\nflower\nflow\n", output: "flow\n" },
        { input: "3\ntest\ntesting\ntested\n", output: "test\n" },
        { input: "4\nreflect\nreflection\nreflex\nreflate\n", output: "refl\n" },
        { input: "2\nzoo\nzoom\n", output: "zoo\n" },
    ],
};

// ─── Main ───────────────────────────────────────────────────────────────────
async function seedS3() {
    try {
        console.log("🚀 Starting Cloudflare R2 hidden test case upload...\n");

        // Fetch all problems from DB so we can map title → UUID
        const problems = await prisma.problem.findMany({ select: { id: true, title: true } });

        if (problems.length === 0) {
            console.error("❌ No problems found in DB. Run `npx prisma db seed` first!");
            process.exit(1);
        }

        const titleToId = Object.fromEntries(problems.map((p) => [p.title, p.id]));

        let uploaded = 0;
        let skipped = 0;

        for (const [title, cases] of Object.entries(HIDDEN_CASES)) {
            const problemId = titleToId[title];
            if (!problemId) {
                console.warn(`⚠️  Problem not found in DB: "${title}" — skipping.`);
                skipped++;
                continue;
            }

            console.log(`📤 Uploading ${cases.length} hidden cases for "${title}"...`);
            await S3Service.uploadTestCases(problemId, cases);
            uploaded++;
        }

        console.log(`\n✅ Done! Uploaded hidden cases for ${uploaded} problem(s). Skipped: ${skipped}`);
        console.log("   Hidden cases are now in Cloudflare R2 and will be used on SUBMIT.");

    } catch (err) {
        console.error("❌ Seed S3 failed:", err.message);
        if (err.name === "CredentialsProviderError" || err.code === "InvalidAccessKeyId") {
            console.error("\n⚠️  Check S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_ENDPOINT in backend/.env");
        }
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedS3();
