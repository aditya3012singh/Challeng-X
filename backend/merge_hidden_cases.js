import fs from 'fs';
import { originalProblems } from './prisma/data/problems_original.js';

const s3Content = fs.readFileSync('d:/challeng-x/backend/scripts/seed_s3_testcases.js', 'utf8');

// Extract HIDDEN_CASES object using a simple regex-based parser
const hiddenCasesMatch = s3Content.match(/const HIDDEN_CASES = ({[\s\S]+?});/);
if (!hiddenCasesMatch) {
    console.error("Could not find HIDDEN_CASES in seed_s3_testcases.js");
    process.exit(1);
}

// We'll use a hacky way to evaluate the object without full JS parsing
// Since it's a simple object with arrays and strings
let hiddenCases;
try {
    // Replace array-from hacks in the source to make it evaluatable
    let cleanObjStr = hiddenCasesMatch[1]
        .replace(/Array\.from\([\s\S]+?\)\.join\("\\n"\) \+ "\\n"/g, '"[COMPUTED_VALUE]"');

    // Use a temporary function to get the object
    hiddenCases = new Function(`return ${cleanObjStr}`)();
} catch (e) {
    console.error("Error evaluating HIDDEN_CASES:", e);
    process.exit(1);
}

const updatedProblems = originalProblems.map(p => {
    if (hiddenCases[p.title]) {
        return { ...p, hiddenCases: hiddenCases[p.title] };
    }
    return p;
});

const finalFile = `export const originalProblems = ${JSON.stringify(updatedProblems, null, 2)};`;

fs.writeFileSync('d:/challeng-x/backend/prisma/data/problems_original.js', finalFile);
console.log(`Updated ${updatedProblems.length} original problems with hidden cases.`);
