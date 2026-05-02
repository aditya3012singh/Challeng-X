import { originalProblems } from '../backend/prisma/data/problems_original.js';
import { easyProblems } from '../backend/prisma/data/problems_easy.js';
import { mediumProblems } from '../backend/prisma/data/problems_medium.js';
import { hardProblems } from '../backend/prisma/data/problems_hard.js';

const allProblems = [
    ...originalProblems,
    ...easyProblems,
    ...mediumProblems,
    ...hardProblems
];

console.log(`Total Problems: ${allProblems.length}`);
let totalHidden = 0;
const counts = allProblems.map(p => {
    const count = p.hiddenCases ? p.hiddenCases.length : 0;
    totalHidden += count;
    return { title: p.title, count };
});

const avg = totalHidden / allProblems.length;
console.log(`Total Hidden Cases: ${totalHidden}`);
console.log(`Average Hidden Cases per Problem: ${avg.toFixed(2)}`);

// Show distribution
const distribution = {};
counts.forEach(c => {
    distribution[c.count] = (distribution[c.count] || 0) + 1;
});

console.log('\nDistribution (Count: Number of Problems):');
Object.entries(distribution).sort((a, b) => Number(a[0]) - Number(b[0])).forEach(([count, num]) => {
    console.log(`${count}: ${num}`);
});
