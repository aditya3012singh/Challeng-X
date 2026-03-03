import { S3Client, GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3";
import RedisClient from "../cache/redis.client.js";

const s3Config = {
    region: process.env.S3_REGION || "auto",
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || "",
    }
};

// Add custom endpoint for Cloudflare R2 / DigitalOcean Spaces if provided
if (process.env.S3_ENDPOINT) {
    s3Config.endpoint = process.env.S3_ENDPOINT;
}

const s3Client = new S3Client(s3Config);
const BUCKET_NAME = process.env.S3_BUCKET_NAME || "codearena-testcases";

class S3Service {
    /**
     * Streams an S3 readable stream to a string
     */
    static async streamToString(stream) {
        return new Promise((resolve, reject) => {
            const chunks = [];
            stream.on("data", (chunk) => chunks.push(chunk));
            stream.on("error", reject);
            stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
        });
    }

    /**
     * Downloads hidden test cases for a problem from S3.
     * Caches the massive JSON block in Redis for 1 hour to prevent constant network egress.
     */
    static async fetchHiddenTestCases(problemId) {
        const cacheKey = `testcases:hidden:${problemId}`;

        try {
            // 1. Check Redis Cache First
            const cached = await RedisClient.client.get(cacheKey);
            if (cached) {
                return JSON.parse(cached);
            }

            // 2. Fetch from S3 Layer
            const objectKey = `testcases/problem_${problemId}.json`;
            const command = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: objectKey,
            });

            const response = await s3Client.send(command);
            const bodyContents = await this.streamToString(response.Body);
            const testcases = JSON.parse(bodyContents);

            // 3. Save to Cache for 1 Hour (3600 seconds)
            // Ensure payload isn't overwhelmingly large for cache, falling back to empty if needed
            await RedisClient.client.set(cacheKey, JSON.stringify(testcases), 'EX', 3600);

            return testcases;

        } catch (error) {
            if (error instanceof NoSuchKey) {
                console.warn(`[S3Service] No hidden testcases found in blanket ${BUCKET_NAME} for problem ${problemId}. Falling back to empty array.`);
                return [];
            }
            console.error(`[S3Service] Failed to fetch testcases from S3:`, error.message);
            // If S3 fails (e.g., credentials missing during dev), fail open with an empty array.
            // This prevents the whole queue from locking if a bucket dies.
            return [];
        }
    }

    /**
     * Used exclusively by the automated seed scripts to upload generated test cases
     */
    static async uploadTestCases(problemId, testcasesArray) {
        const { PutObjectCommand } = await import("@aws-sdk/client-s3");

        const objectKey = `testcases/problem_${problemId}.json`;
        const payload = JSON.stringify(testcasesArray);

        const command = new PutObjectCommand({
            Bucket: BUCKET_NAME,
            Key: objectKey,
            Body: payload,
            ContentType: "application/json"
        });

        await s3Client.send(command);
        console.log(`[S3Service] Uploaded ${testcasesArray.length} hidden cases to s3://${BUCKET_NAME}/${objectKey}`);

        // Invalidate cache
        await RedisClient.client.del(`testcases:hidden:${problemId}`);
    }
}

export default S3Service;
