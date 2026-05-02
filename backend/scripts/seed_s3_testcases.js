import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import S3Service from "../src/services/s3.service.js";
import { originalProblems } from "../prisma/data/problems_original.js";
import { easyProblems } from "../prisma/data/problems_easy.js";
import { mediumProblems } from "../prisma/data/problems_medium.js";
import { hardProblems } from "../prisma/data/problems_hard.js";

const prisma = new PrismaClient();

async function seedS3() {
    try {
        console.log("🚀 Starting Cloudflare R2 hidden test case upload...\n");

        const problems = await prisma.problem.findMany({ select: { id: true, title: true } });
        if (problems.length === 0) {
            console.error("❌ No problems found in DB. Run `npx prisma db seed` first!");
            process.exit(1);
        }
        const titleToId = Object.fromEntries(problems.map((p) => [p.title, p.id]));

        const allSets = [originalProblems, easyProblems, mediumProblems, hardProblems];
        let uploaded = 0;
        let skipped = 0;

        for (const set of allSets) {
            for (const prob of set) {
                const problemId = titleToId[prob.title];
                const cases = prob.hiddenCases || [];

                if (!problemId) {
                    console.warn(`⚠️  Problem "${prob.title}" not in DB — skipping.`);
                    skipped++;
                    continue;
                }

                if (cases.length === 0) {
                    console.log(`ℹ️  No hidden cases for "${prob.title}".`);
                    continue;
                }

                console.log(`📤 Uploading ${cases.length} hidden cases for "${prob.title}"...`);
                await S3Service.uploadTestCases(problemId, cases);
                uploaded++;
            }
        }

        console.log(`\n✅ Done! Uploaded hidden cases for ${uploaded} problem(s). Skipped: ${skipped}`);
    } catch (err) {
        console.error("❌ Seed S3 failed:", err.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

seedS3();
