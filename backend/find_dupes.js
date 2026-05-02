import { originalProblems } from './prisma/data/problems_original.js';
import { easyProblems } from './prisma/data/problems_easy.js';
import { mediumProblems } from './prisma/data/problems_medium.js';
import { hardProblems } from './prisma/data/problems_hard.js';

const originalTitles = new Set(originalProblems.map(p => p.title));

const findDupes = (set, setName) => {
    const dupes = set.filter(p => originalTitles.has(p.title));
    if (dupes.length > 0) {
        console.log(`Duplicates in ${setName}:`, dupes.map(p => p.title));
    }
    return dupes;
};

findDupes(easyProblems, "Easy");
findDupes(mediumProblems, "Medium");
findDupes(hardProblems, "Hard");
