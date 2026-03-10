const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules') && !file.includes('.next')) {
                results = results.concat(walk(fullPath));
            }
        } else {
            if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
                results.push(fullPath);
            }
        }
    });
    return results;
}

const libDir = 'd:/Project/gateway-app/libs/shared/utils/src/lib';
const files = walk(libDir);

const allExportNames = {};

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    // Simplified regex to catch most exports
    const regex = /export\s+(?:const|function|interface|type|enum|class)\s+(\w+)/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
        const name = match[1];
        if (!allExportNames[name]) allExportNames[name] = [];
        allExportNames[name].push(path.relative(libDir, file));
    }
});

let found = false;
for (const name in allExportNames) {
    if (allExportNames[name].length > 1) {
        // Ignore known conflicts if we want, but let's see them all
        console.log(`CONFLICT: "${name}" found in: ${allExportNames[name].join(', ')}`);
        found = true;
    }
}

if (!found) {
    console.log("No duplicate exports found in lib directory.");
}
