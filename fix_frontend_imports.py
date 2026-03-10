import os
import re

dirs_to_fix = [
    r"d:\Project\gateway-app\apps\frontend\src",
    r"d:\Project\gateway-app\libs\shared\utils\src"
]

patterns = [
    # Fix @gateway-workspace/shared/utils[typo]
    (re.compile(r"@gateway-workspace/shared/utils([a-zA-Z0-9_\-\.]+)"), r"@gateway-workspace/shared/utils"),
    # Fix @gateway-workspace/database/prisma/generated/[anything]
    (re.compile(r"@gateway-workspace/database/prisma/generated/([a-zA-Z0-9_\-\./]+)"), r"@gateway-workspace/database"),
    # Fix relative db imports
    (re.compile(r"from ['\"](\.\./)+db['\"]"), r"from '@gateway-workspace/database'"),
]

def fix_imports(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return
    
    new_content = content
    for pattern, replacement in patterns:
        new_content = pattern.sub(replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed: {file_path}")

for d in dirs_to_fix:
    if not os.path.exists(d):
        print(f"Directory not found: {d}")
        continue
    for root, _, files in os.walk(d):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                fix_imports(os.path.join(root, file))
