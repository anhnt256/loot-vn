import os
import re

lib_configs = [
    {
        'root': r'd:\Project\gateway-app\libs\shared\ui\src\lib',
        'pkg': '@gateway-workspace/shared/ui'
    },
    {
        'root': r'd:\Project\gateway-app\libs\shared\hooks\src\lib',
        'pkg': '@gateway-workspace/shared/hooks'
    },
    {
        'root': r'd:\Project\gateway-app\libs\shared\utils\src\lib',
        'pkg': '@gateway-workspace/shared/utils'
    },
    {
        'root': r'd:\Project\gateway-app\libs\database\src\lib',
        'pkg': '@gateway-workspace/database'
    }
]

def fix_internal_imports_v2(root_dir, pkg_name):
    count = 0
    # Collect all filenames in the root_dir (without extension) for matching
    all_files = set()
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            name = os.path.splitext(file)[0]
            all_files.add(name)

    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except:
                    continue
                
                new_content = content
                
                # The task is to find 'from "@pkg"' and replace it with a relative path to the correct file
                # This is hard because we lost the filename in the previous step.
                # However, many imports were likely 'import { ... } from "@pkg/lib/filename"' originally
                # or 'import { ... } from "@/lib/filename"'.
                
                # Let's try to restore the filename if the import is like 'import X from "@pkg"'
                # and we can find X.ts in the current lib.
                
                # Find all import lines from the package
                lines = new_content.split('\n')
                for i, line in enumerate(lines):
                    if pkg_name in line and ('import ' in line or 'export ' in line):
                        # Extract the imported name
                        match = re.search(r'(?:import|export)\s+(?:{\s*([^}]+)\s*}|([a-zA-Z0-9_]+))\s+from\s+["\']' + pkg_name + r'["\']', line)
                        if match:
                            imported_name = match.group(1) or match.group(2)
                            # Clean up names if it's a list
                            names = [n.strip().split(' as ')[0] for n in (imported_name.split(',') if ',' in imported_name else [imported_name])]
                            
                            # Try to find a file matching one of the names
                            target_file = None
                            for name in names:
                                if name in all_files:
                                    target_file = name
                                    break
                                # Try lowercase or common mappings
                                if name.lower() in all_files:
                                    target_file = name.lower()
                                    break
                            
                            if target_file:
                                # Calculate relative path from current file to target_file
                                # For simplicity, since all these files are likely in the same flat dir or subdirs
                                # We'll try to find where target_file is
                                for r, d, f in os.walk(root_dir):
                                    if any(os.path.splitext(fl)[0] == target_file for fl in f):
                                        target_path = os.path.join(r, target_file)
                                        rel_path = os.path.relpath(target_path, root).replace('\\', '/')
                                        if not rel_path.startswith('.'):
                                            rel_path = './' + rel_path
                                        
                                        lines[i] = re.sub(f'["\']{pkg_name}["\']', f'"{rel_path}"', line)
                                        break
                
                new_content = '\n'.join(lines)
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
    return count

total = 0
for config in lib_configs:
    c = fix_internal_imports_v2(config['root'], config['pkg'])
    print(f"Fixed {c} files in {config['pkg']}")
    total += c

print(f"Total fixed: {total}")
