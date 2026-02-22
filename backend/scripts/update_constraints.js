import "dotenv/config";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function updateConstraints() {
    console.log("Updating problem constraints...");

    const updates = [
        {
            title: "Two Sum",
            constraints: "• 2 ≤ nums.length ≤ 10,000\n• -10⁹ ≤ nums[i] ≤ 10⁹\n• -10⁹ ≤ target ≤ 10⁹\n• Only one valid answer exists."
        },
        {
            title: "Binary Search",
            constraints: "• 1 ≤ nums.length ≤ 10,000\n• -10,000 < nums[i], target < 10,000\n• All the integers in nums are unique.\n• nums is sorted in ascending order."
        },
        {
            title: "Palindrome Number",
            constraints: "• -2³¹ ≤ x ≤ 2³¹ - 1"
        },
        {
            title: "Sum of Two Numbers",
            constraints: "• -10⁹ ≤ a, b ≤ 10⁹"
        },
        {
            title: "Multiply Two Numbers",
            constraints: "• -10⁹ ≤ a, b ≤ 10⁹"
        },
        {
            title: "Check Even or Odd",
            constraints: "• -2³¹ ≤ n ≤ 2³¹ - 1"
        }
    ];

    for (const item of updates) {
        await prisma.problem.updateMany({
            where: { title: item.title },
            data: { constraints: item.constraints }
        });
        console.log(`✅ Updated: ${item.title}`);
    }

    console.log("Constraints updated successfully.");
}

updateConstraints()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
