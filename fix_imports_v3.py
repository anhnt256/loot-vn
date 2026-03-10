import os
import re

def fix_imports_safely(root_dir, is_internal=False, pkg_name=None):
    count = 0
    # Common mappings for external imports
    external_mappings = [
        (r'@/lib/db', '@gateway-workspace/database'),
        (r'@/prisma/', '@gateway-workspace/database/prisma/'),
        (r'@/lib/', '@gateway-workspace/shared/utils'),
        (r'@/actions/', '@gateway-workspace/shared/utils'),
        (r'@/queries/', '@gateway-workspace/shared/utils'),
        (r'@/server/', '@gateway-workspace/shared/utils'),
        (r'@/constants/', '@gateway-workspace/shared/utils'),
        (r'@/types/', '@gateway-workspace/shared/utils'),
        (r'@/type/', '@gateway-workspace/shared/utils'),
        (r'@/config/', '@gateway-workspace/shared/utils'),
        (r'@/hooks/', '@gateway-workspace/shared/hooks'),
        (r'@/components/', '@gateway-workspace/shared/ui'),
        # Relative versions
        (r'\.\./\.\./components/', '@gateway-workspace/shared/ui'),
        (r'\.\./\.\./hooks/', '@gateway-workspace/shared/hooks'),
        (r'\.\./\.\./lib/', '@gateway-workspace/shared/utils'),
        (r'\.\./components/', '@gateway-workspace/shared/ui'),
        (r'\.\./hooks/', '@gateway-workspace/shared/hooks'),
        (r'\.\./lib/', '@gateway-workspace/shared/utils'),
    ]

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
                    if 'from "' in line or "from '" in line:
                        # Internal refactoring: if we are in shared/utils, and importing from "@/lib/something"
                        if is_internal and pkg_name:
                            # If it's the SAME package, make it relative
                            # This is approximate but safer than before
                            if '@/lib/' in line or '@/hooks/' in line or '@/components/' in line or '@/actions/' in line:
                                # We need to check if the path being imported is part of the current library
                                # For shared/utils, it's everything in constants, actions, types, etc.
                                rel_path_to_lib_root = os.path.relpath(root_dir, root).replace('\\', '/')
                                if rel_path_to_lib_root == '.':
                                    rel_prefix = './'
                                else:
                                    rel_prefix = rel_path_to_lib_root + '/'

                                # Replace @/lib/ with relative prefix
                                new_line = re.sub(r'@/(lib|actions|queries|server|constants|types|type|config)/', rel_prefix, new_line)
                                # Clean up if it became .//
                                new_line = new_line.replace('.//', './')
                                
                        # Apply external mappings if not already changed to relative or if it's an app
                        for pattern, replacement in external_mappings:
                            if pattern in new_line:
                                new_line = new_line.replace(pattern, replacement)
                    
                    if new_line != line:
                        changed = True
                    new_lines.append(new_line)
                
                if changed:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.writelines(new_lines)
                    count += 1
    return count

# Run for App
print(f"App: {fix_imports_safely(r'd:\Project\gateway-app\apps\frontend\src\app')}")

# Run for Libs with internal=True
print(f"UI Lib: {fix_imports_safely(r'd:\Project\gateway-app\libs\shared\ui\src\lib', True, '@gateway-workspace/shared/ui')}")
print(f"Hooks Lib: {fix_imports_safely(r'd:\Project\gateway-app\libs\shared\hooks\src\lib', True, '@gateway-workspace/shared/hooks')}")
print(f"Utils Lib: {fix_imports_safely(r'd:\Project\gateway-app\libs\shared\utils\src\lib', True, '@gateway-workspace/shared/utils')}")
print(f"DB Lib: {fix_imports_safely(r'd:\Project\gateway-app\libs\database\src\lib', True, '@gateway-workspace/database')}")
