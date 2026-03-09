import fs from 'fs';
process.on('uncaughtException', err => {
    fs.writeFileSync('crash.txt', err.stack || err.message);
    process.exit(1);
});
process.on('unhandledRejection', err => {
    fs.writeFileSync('crash.txt', err.stack || err.message);
    process.exit(1);
});

async function run() {
    try {
        await import('./src/index.js');
    } catch (err) {
        fs.writeFileSync('crash.txt', err.stack || err.message);
    }
}
run();
