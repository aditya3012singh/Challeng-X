import prisma from "../config/db.js";

/**
 * Generate a unique 6-digit battle code
 * @returns {Promise<string>} A unique 6-digit code
 */
export async function generateBattleCode() {
  let code;
  let isUnique = false;
  let attempts = 0;
  const maxAttempts = 10;

  while (!isUnique && attempts < maxAttempts) {
    // Generate random 6-digit code (100000 to 999999)
    code = Math.floor(100000 + Math.random() * 900000).toString();

    // Check if code already exists
    const existing = await prisma.battle.findUnique({
      where: { battleCode: code }
    });

    if (!existing) {
      isUnique = true;
    }
    attempts++;
  }

  if (!isUnique) {
    throw new Error("Failed to generate unique battle code");
  }

  return code;
}
