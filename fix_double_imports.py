import os
import re

# Fix double package names like "@gateway-workspace/database"@gateway-workspace/shared/utils"
# This likely happened because of multiple regex passes.

pattern = r'"(@gateway-workspace/[^"]+)"(@gateway-workspace/[^"]+)"'

root_dirs = [
    r'd:\Project\gateway-app\apps\frontend\src\app',
    r'd:\Project\gateway-app\libs\shared\ui\src\lib',
    r'd:\Project\gateway-app\libs\shared\hooks\src\lib',
    r'd:\Project\gateway-app\libs\shared\utils\src\lib',
    r'd:\Project\gateway-app\libs\database\src\lib',
]

def fix_double_imports(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except UnicodeDecodeError:
        return False
    
    # We want to keep the one that makes more sense, but usually the first one is the intended replacement
    # Or we just keep the LAST one if the first one was a partial replacement.
    # In 'import { db } from "@gateway-workspace/database"@gateway-workspace/shared/utils"', 
    # 'database' is correct for 'db'.
    
    # Actually, let's just restore it to a simpler form first.
    new_content = re.sub(pattern, r'"\1"', content)
    
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
                if fix_double_imports(os.path.join(root, file)):
                    count += 1

print(f"Fixed {count} files with double imports.")
