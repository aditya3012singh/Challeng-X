import fs from 'fs';
import { originalProblems } from './prisma/data/problems_original.js';

const updatedProblems = originalProblems.map(p => {
    const cases = p.hiddenCases || [];

    // Add some specific ones based on title or generic ones
    if (p.title === "Sum of Two Numbers") {
        cases.push({ input: "1000000000 1000000000\n", output: "2000000000\n" });
        cases.push({ input: "-1000000000 -1000000000\n", output: "-2000000000\n" });
    } else if (p.title === "Reverse a String") {
        cases.push({ input: " \n", output: " \n" });
        cases.push({ input: "!@#$%^&*()\n", output: ")(*&^%$#@!\n" });
    } else if (p.title === "Check Even or Odd") {
        cases.push({ input: "2147483647\n", output: "Odd\n" });
        cases.push({ input: "-2147483648\n", output: "Even\n" });
    } else if (p.title === "FizzBuzz") {
        cases.push({ input: "1\n", output: "1\n" });
        cases.push({ input: "100\n", output: Array.from({ length: 100 }, (_, i) => { const n = i + 1; if (n % 15 === 0) return "FizzBuzz"; if (n % 3 === 0) return "Fizz"; if (n % 5 === 0) return "Buzz"; return String(n); }).join("\n") + "\n" });
    } else if (p.title === "Palindrome Number") {
        cases.push({ input: "1000000001\n", output: "true\n" });
        cases.push({ input: "1234567899\n", output: "false\n" });
    } else {
        // Generic extra cases if we don't have specific ones
        // Just identifying a few more important ones
    }

    return { ...p, hiddenCases: Array.from(new Set(cases.map(JSON.stringify))).map(JSON.parse) };
});

const finalFile = `export const originalProblems = ${JSON.stringify(updatedProblems, null, 2)};`;
fs.writeFileSync('d:/challeng-x/backend/prisma/data/problems_original.js', finalFile);
console.log(`Beefed up ${updatedProblems.length} original problems.`);
