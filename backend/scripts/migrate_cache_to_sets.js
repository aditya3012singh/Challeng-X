import RedisClient from "../src/core/cache/redis.client.js";
import logger from "../src/core/logger/logger.js";

/**
 * Migration script to convert old List-based problem caches to Sets
 * This fixes the WRONGTYPE error when using SRANDMEMBER
 */
async function migrateCacheToSets() {
    console.log("Starting cache migration from Lists to Sets...");
    
    const redis = RedisClient.client;
    
    try {
        // Find all old problem list keys
        const keys = await redis.keys("problems:cached:*");
        
        if (keys.length === 0) {
            console.log("No old List keys found. Migration not needed.");
            return;
        }
        
        console.log(`Found ${keys.length} old List keys to convert to Sets.`);
        
        for (const key of keys) {
            try {
                // First, try to get items as a List
                let items = await redis.lrange(key, 0, -1);
                
                if (items.length > 0) {
                    // Delete the old key (List or Set)
                    await redis.del(key);
                    
                    // Add items to a new Set
                    const setKey = key.replace(":cached:", ":cached:");
                    await redis.sadd(setKey, items);
                    
                    console.log(`✅ Converted ${key} (${items.length} items) to Set`);
                } else {
                    // Empty, just delete
                    await redis.del(key);
                    console.log(`🗑️  Deleted empty key: ${key}`);
                }
            } catch (err) {
                // If lrange fails, try to delete anyway (might already be a Set)
                try {
                    await redis.del(key);
                    console.log(`🗑️  Deleted key: ${key}`);
                } catch (delErr) {
                    console.error(`❌ Error processing key ${key}:`, err.message);
                }
            }
        }
        
        console.log("\n✅ Migration complete!");
        console.log("Old List keys have been converted to Sets.");
        console.log("The WRONGTYPE error should now be resolved.");
        
    } catch (error) {
        console.error("❌ Migration failed:", error);
    } finally {
        process.exit(0);
    }
}

migrateCacheToSets();
