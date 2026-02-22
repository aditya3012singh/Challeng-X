import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function generateTwoSumTestCases() {
    console.log("🚀 Starting Pro Test Case Generation for 'Two Sum'...");

    // 1. Find the problem
    const problem = await prisma.problem.findFirst({
        where: { title: "Two Sum" }
    });

    if (!problem) {
        console.error("❌ 'Two Sum' problem not found in database. Run seed first.");
        return;
    }

    // 2. Clear existing cases for a clean slate
    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });

    const testCases = [];

    // HELPER: Professional Two Sum Solver (Ground Truth)
    const solve = (nums, target) => {
        const map = new Map();
        for (let i = 0; i < nums.length; i++) {
            const diff = target - nums[i];
            if (map.has(diff)) return [map.get(diff), i];
            map.set(nums[i], i);
        }
        return null;
    };

    // --- CATEGORY 1: SAMLPES (Public) ---
    testCases.push({
        input: "[2,7,11,15]\n9",
        output: "[0,1]",
        isSample: true,
        isHidden: false
    });
    testCases.push({
        input: "[3,2,4]\n6",
        output: "[1,2]",
        isSample: true,
        isHidden: false
    });

    // --- CATEGORY 2: EDGE CASES (Hidden) ---
    // Zeroes
    testCases.push({
        input: "[0,4,3,0]\n0",
        output: "[0,3]",
        isSample: false,
        isHidden: true
    });
    // Negative numbers
    testCases.push({
        input: "[-1,-2,-3,-4,-5]\n-8",
        output: "[2,4]",
        isSample: false,
        isHidden: true
    });
    // Large numbers
    testCases.push({
        input: "[1000000000,500,1000000000]\n2000000000",
        output: "[0,2]",
        isSample: false,
        isHidden: true
    });

    // --- CATEGORY 3: STRESS CASES (Performance) ---
    console.log("⏲  Generating Stress Cases (N=10,000)...");

    // Test Case: Solution at the very end (Worst case for linear scan)
    const largeArr = Array.from({ length: 10000 }, (_, i) => i * 2);
    const target = (9998 * 2) + (9999 * 2); // Sum of last two elements
    testCases.push({
        input: `${JSON.stringify(largeArr)}\n${target}`,
        output: JSON.stringify(solve(largeArr, target)),
        isSample: false,
        isHidden: true
    });

    // Test Case: Large array with negatives and randoms
    const randomLarge = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 20000) - 10000);
    // Force a solution
    randomLarge[100] = 5000;
    randomLarge[5000] = 5000;
    const randomTarget = 10000;
    testCases.push({
        input: `${JSON.stringify(randomLarge)}\n${randomTarget}`,
        output: JSON.stringify(solve(randomLarge, randomTarget)),
        isSample: false,
        isHidden: true
    });

    // 3. Batch Insert
    console.log(`📦 Inserting ${testCases.length} Pro test cases...`);
    await prisma.testCase.createMany({
        data: testCases.map(tc => ({
            ...tc,
            problemId: problem.id
        }))
    });

    console.log("✅ Initialization successful. 'Two Sum' is now a Pro-Grade problem.");
}

async function generateBinarySearchTestCases() {
    console.log("🚀 Starting Pro Test Case Generation for 'Binary Search'...");

    const problem = await prisma.problem.findFirst({
        where: { title: "Binary Search" }
    });

    if (!problem) {
        console.error("❌ 'Binary Search' problem not found.");
        return;
    }

    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });

    const testCases = [];

    // HELPER: Binary Search Solver
    const solve = (nums, target) => {
        let l = 0, r = nums.length - 1;
        while (l <= r) {
            let m = Math.floor((l + r) / 2);
            if (nums[m] === target) return m;
            if (nums[m] < target) l = m + 1;
            else r = m - 1;
        }
        return -1;
    };

    // --- SAMPLES ---
    testCases.push({
        input: "[-1,0,3,5,9,12]\n9",
        output: "4",
        isSample: true,
        isHidden: false
    });
    testCases.push({
        input: "[-1,0,3,5,9,12]\n2",
        output: "-1",
        isSample: true,
        isHidden: false
    });

    // --- EDGE & STRESS ---
    console.log("⏲  Generating Stress Cases (N=50,000)...");
    const largeSorted = Array.from({ length: 50000 }, (_, i) => i * 2);

    // Boundary checks
    testCases.push({ input: `${JSON.stringify(largeSorted)}\n0`, output: "0", isSample: false, isHidden: true });
    testCases.push({ input: `${JSON.stringify(largeSorted)}\n99998`, output: "49999", isSample: false, isHidden: true });

    // Random lookup
    const randIdx = Math.floor(Math.random() * 50000);
    const randTarget = largeSorted[randIdx];
    testCases.push({ input: `${JSON.stringify(largeSorted)}\n${randTarget}`, output: `${randIdx}`, isSample: false, isHidden: true });

    // Not found
    testCases.push({ input: `${JSON.stringify(largeSorted)}\n100001`, output: "-1", isSample: false, isHidden: true });

    await prisma.testCase.createMany({
        data: testCases.map(tc => ({ ...tc, problemId: problem.id }))
    });
    console.log("✅ 'Binary Search' logic fortified.");
}

async function generatePalindromeNumberTestCases() {
    console.log("🚀 Starting Pro Test Case Generation for 'Palindrome Number'...");

    const problem = await prisma.problem.findFirst({
        where: { title: "Palindrome Number" }
    });

    if (!problem) {
        console.error("❌ 'Palindrome Number' problem not found.");
        return;
    }

    await prisma.testCase.deleteMany({ where: { problemId: problem.id } });

    const solve = (x) => {
        if (x < 0) return false;
        const s = x.toString();
        return s === s.split('').reverse().join('');
    };

    const testCases = [];

    // Samples
    testCases.push({ input: "121", output: "true", isSample: true, isHidden: false });
    testCases.push({ input: "-121", output: "false", isSample: true, isHidden: false });
    testCases.push({ input: "10", output: "false", isSample: true, isHidden: false });

    // Edges
    testCases.push({ input: "0", output: "true", isSample: false, isHidden: true });
    testCases.push({ input: "11", output: "true", isSample: false, isHidden: true });
    testCases.push({ input: "12321", output: "true", isSample: false, isHidden: true });
    testCases.push({ input: "12322", output: "false", isSample: false, isHidden: true });
    testCases.push({ input: "2147483647", output: "false", isSample: false, isHidden: true });

    await prisma.testCase.createMany({
        data: testCases.map(tc => ({ ...tc, problemId: problem.id }))
    });
    console.log("✅ 'Palindrome Number' logic fortified.");
}

async function runAll() {
    await generateTwoSumTestCases();
    await generateBinarySearchTestCases();
    await generatePalindromeNumberTestCases();
}

runAll()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
