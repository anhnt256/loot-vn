const fs = require('fs');
const path = require('path');

const projectDir = path.join(__dirname, 'apps/frontend/src/app');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.resolve(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(projectDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix botched hook imports
    const botchedHookRegex = /from\s+["']@gateway-workspace\/shared\/hooks(\w+)["']/g;
    if (botchedHookRegex.test(content)) {
        console.log(`Fixing botched hook import in ${file}`);
        content = content.replace(botchedHookRegex, 'from "@gateway-workspace/shared/hooks"');
        changed = true;
    }

    // Fix @/app imports to be relative
    // This is a bit tricky because we need to calculate the relative path based on the file depth
    const aliasRegex = /from\s+["']@\/app\/(.*?)["']/g;
    if (aliasRegex.test(content)) {
        console.log(`Fixing @/app import in ${file}`);
        content = content.replace(aliasRegex, (match, p1) => {
            const relativePathToFile = path.relative(path.dirname(file), path.join(projectDir, p1));
            let normalizedPath = relativePathToFile.split(path.sep).join('/');
            if (!normalizedPath.startsWith('.')) normalizedPath = './' + normalizedPath;
            return `from "${normalizedPath}"`;
        });
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
