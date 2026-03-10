import os
import re

root_dirs = [
    r'd:\Project\gateway-app\libs\shared\utils\src\lib',
    r'd:\Project\gateway-app\libs\shared\ui\src\lib',
    r'd:\Project\gateway-app\libs\shared\hooks\src\lib',
]

def fix_db_imports(root_dir):
    count = 0
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                except:
                    continue
                
                changed = False
                new_lines = []
                for line in lines:
                    new_line = line
                    # Look for internal imports to 'db' or './db' or '../db'
                    # and change them to @gateway-workspace/database
                    if 'from "./db"' in line or 'from "../db"' in line or 'from "../../db"' in line:
                        new_line = re.sub(r'from "\.\.?/(\.\.?/)*db"', 'from "@gateway-workspace/database"', line)
                        changed = True
                    elif 'from "./lib/db"' in line or 'from "@/lib/db"' in line:
                         new_line = re.sub(r'from "(@/|./)lib/db"', 'from "@gateway-workspace/database"', line)
                         changed = True
                    
                    new_lines.append(new_line)
                
                if changed:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)
                    count += 1
    return count

total = 0
for d in root_dirs:
    total += fix_db_imports(d)

print(f"Total files updated: {total}")
