import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import "dotenv/config";

const s3Config = {
    region: process.env.S3_REGION || "auto",
    endpoint: process.env.S3_ENDPOINT,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
    forcePathStyle: true,
};

const s3Client = new S3Client(s3Config);
const AVATAR_BUCKET = process.env.S3_AVATAR_BUCKET || "profile";

async function setupCors() {
    console.log(`🚀 Setting up CORS for bucket: ${AVATAR_BUCKET}...`);
    
    const corsConfig = {
        Bucket: AVATAR_BUCKET,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedHeaders: ["*"],
                    AllowedMethods: ["PUT", "POST", "GET", "HEAD"],
                    AllowedOrigins: ["*"], // In production, replace with your specific domain
                    ExposeHeaders: ["ETag"],
                    MaxAgeSeconds: 3000
                },
            ],
        },
    };

    try {
        await s3Client.send(new PutBucketCorsCommand(corsConfig));
        console.log("✅ CORS configured successfully! Frontend can now upload directly to R2.");
    } catch (error) {
        console.error("❌ Failed to set CORS:", error.message);
        if (error.name === "NoSuchBucket") {
            console.error(`   Bucket "${AVATAR_BUCKET}" not found. Please create it first in Cloudflare dashboard.`);
        }
    }
}

setupCors();
