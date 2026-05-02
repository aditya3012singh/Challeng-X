import fs from 'fs';

const content = fs.readFileSync('d:/challeng-x/backend/prisma/seed.js', 'utf8');

const problems = [];
const problemRegex = /const p\d+ = await prisma\.problem\.create\({\s+data: ({[\s\S]+?}),\s+}\);/g;

let match;
while ((match = problemRegex.exec(content)) !== null) {
    try {
        let objStr = match[1];

        // Flatten tags: connectOrCreate to simple array
        objStr = objStr.replace(/tags: {\s+connectOrCreate: \[([\s\S]+?)\]\s+}/g, (m, p1) => {
            const tagMatches = p1.match(/name: "(.+?)"/g);
            const tags = tagMatches ? tagMatches.map(t => t.match(/"(.+?)"/)[1]) : [];
            return `tags: ${JSON.stringify(Array.from(new Set(tags)))}`;
        });

        // Flatten testcases: { create: [ ... ] } to [ ... ]
        // Use a more specific match to avoid leaving trailing braces
        objStr = objStr.replace(/testcases: {\s+create: (\[[\s\S]+?\])\s+}/g, "testcases: $1");

        problems.push(objStr);
    } catch (e) {
        console.error("Error parsing problem:", e);
    }
}

const finalFile = `export const originalProblems = [
${problems.join(',\n')}
];`;

fs.writeFileSync('d:/challeng-x/backend/prisma/data/problems_original.js', finalFile);
console.log(`Extracted ${problems.length} problems.`);
