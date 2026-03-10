const fs = require('fs');
const path = require('path');

const uiDir = path.join(__dirname, 'libs/shared/ui/src/lib');

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

const files = walk(uiDir);

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    // Fix utilities imports to use @gateway-workspace/shared/utils
    const utilImports = [
        'dayjs', 'utils', 'timezone-utils', 'machine-utils', 'battle-pass-utils', 
        'ffood-token-utils', 'work-shift-utils', 'gift-round-utils', 'rank-utils', 
        'token.constant', 'check-in-utils', 'fetcher'
    ];

    utilImports.forEach(util => {
        // Match relative imports like "../util" or "./util"
        // Handle cases with or without trailing extension or index
        const regex = new RegExp(`from\\s+["']\\.\\.?\\/${util}["']`, 'g');
        if (regex.test(content)) {
            console.log(`Fixing ${util} import (relative) in ${file}`);
            content = content.replace(regex, `from "@gateway-workspace/shared/utils"`);
            changed = true;
        }

        // Fix botched alias imports like "@gateway-workspace/shared/utilsutil"
        const botchedRegex = new RegExp(`from\\s+["']@gateway-workspace\\/shared\\/utils${util}["']`, 'g');
        if (botchedRegex.test(content)) {
            console.log(`Fixing botched ${util} import in ${file}`);
            content = content.replace(botchedRegex, `from "@gateway-workspace/shared/utils"`);
            changed = true;
        }
    });

    // Fix hooks imports to use @gateway-workspace/shared/hooks (if they are botched)
    const botchedHookRegex = /from\s+["']@gateway-workspace\/shared\/hooks(\w+)["']/g;
    if (botchedHookRegex.test(content)) {
        console.log(`Fixing botched hook import in ${file}`);
        content = content.replace(botchedHookRegex, 'from "@gateway-workspace/shared/hooks"');
        changed = true;
    }

    // Fix relative imports to hooks if they exist (though most are probably already using aliases)
    const relativeHookRegex = /from\s+["']\.\.\/\.\.\/hooks\/(\w+)["']/g;
    if (relativeHookRegex.test(content)) {
         console.log(`Fixing relative hook import in ${file}`);
         content = content.replace(relativeHookRegex, 'from "@gateway-workspace/shared/hooks"');
         changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
    }
});
