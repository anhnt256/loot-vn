import os
import re

mappings = [
    (r'"@gateway-workspace/shared/utils"[^"]*"', '"@gateway-workspace/shared/utils"'),
    (r'"@gateway-workspace/shared/ui"[^"]*"', '"@gateway-workspace/shared/ui"'),
    (r'"@gateway-workspace/shared/hooks"[^"]*"', '"@gateway-workspace/shared/hooks"'),
    (r'"@gateway-workspace/database"[^"]*"', '"@gateway-workspace/database"'),
]

root_dirs = [
    r'd:\Project\gateway-app\apps\frontend\src\app',
    r'd:\Project\gateway-app\libs\shared\ui\src\lib',
    r'd:\Project\gateway-app\libs\shared\hooks\src\lib',
    r'd:\Project\gateway-app\libs\shared\utils\src\lib',
    r'd:\Project\gateway-app\libs\database\src\lib',
]

def update_file(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return False
    
    new_content = content
    for pattern, replacement in mappings:
        new_content = re.sub(pattern, replacement, new_content)
    
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

count = 0
for root_dir in root_dirs:
    if not os.path.exists(root_dir):
        continue
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                if update_file(os.path.join(root, file)):
                    count += 1

print(f"Fixed {count} files.")
