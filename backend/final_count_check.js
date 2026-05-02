import { originalProblems } from './prisma/data/problems_original.js';
import { easyProblems } from './prisma/data/problems_easy.js';
import { mediumProblems } from './prisma/data/problems_medium.js';
import { hardProblems } from './prisma/data/problems_hard.js';

const allProblems = [...originalProblems, ...easyProblems, ...mediumProblems, ...hardProblems];
const titles = allProblems.map(p => p.title);
const uniqueTitles = new Set(titles);

console.log("Total Problems (incl. duplicates):", titles.length);
console.log("Unique Problems:", uniqueTitles.size);

if (titles.length !== uniqueTitles.size) {
    const counts = {};
    titles.forEach(t => counts[t] = (counts[t] || 0) + 1);
    const dupes = Object.entries(counts).filter(([t, c]) => c > 1);
    console.log("Remaining Duplicates:", dupes);
}
