import os
import re

# Internal imports within libraries should be relative
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

def fix_internal_imports(root_dir, pkg_name):
    count = 0
    for root, dirs, files in os.walk(root_dir):
        for file in files:
            if file.endswith(('.ts', '.tsx', '.js', '.jsx')):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                except:
                    continue
                
                # Replace workspace import with relative import if it's the same package
                # This is a bit complex because we need to know the depth
                # For simplicity, if it's internal we can often just use a relative path to the lib root
                # But since we're in 'lib', and most things are in 'lib' or subfolders...
                
                rel_path_to_lib = os.path.relpath(root_dir, root).replace('\\', '/')
                if rel_path_to_lib == '.':
                    rel_prefix = './'
                else:
                    rel_prefix = rel_path_to_lib + '/'
                
                # Check for imports like: import { ... } from "@gateway-workspace/shared/utils"
                # This usually refers to the index.ts in src/
                # We want to change it to refer to internal files or the internal index if it exists.
                
                new_content = content
                
                # Case 1: Import from the package root
                pattern = f'from ["\']{pkg_name}["\']'
                # This is hard to fix automatically without knowing WHICH file it needs.
                # However, many files were previously using @/lib/something
                # My script changed it to @gateway-workspace/shared/utils
                # We should try to find if there was a filename suffix that got lost.
                
                # Wait, my fix_corrupted_imports.py removed the suffixes!
                # I should have kept them for internal imports.
                
                if new_content != content:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    count += 1
    return count

# I'll use a'different approach. I'll search for files that HAVE internal imports
# and manually fix them if the count is low, or use a better script.
