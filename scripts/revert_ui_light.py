import os

base_dir = r"c:\Users\longt\Desktop\website\new\src\components\ui"

def replace_in_file(filename, replacements):
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        print(f"File not found: {filename}")
        return
        
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    original_content = content
    for old, new in replacements:
        if old in content:
            content = content.replace(old, new)
        else:
            print(f"Warning: '{old}' not found in {filename}")
            
    if content != original_content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"No changes made to {filename}")

# 1. Skeleton.tsx
replace_in_file("Skeleton.tsx", [
    ('const baseStyles = "bg-white/10";', 'const baseStyles = "bg-slate-200";'),
    ('before:via-white/5', 'before:via-white/60')
])

# 2. Button.tsx
replace_in_file("Button.tsx", [
    ('"bg-white/10 text-white hover:bg-white/20 focus:ring-white/30 shadow-md hover:shadow-lg border border-white/10"', 
     '"bg-white text-slate-900 border-slate-200"'),
    ('"border-2 border-blue-400/30 bg-transparent text-blue-400 hover:bg-blue-500/10 hover:border-blue-400/50 focus:ring-blue-500"', 
     '"bg-white text-blue-600 border-blue-200"'),
    ('"bg-transparent text-white hover:bg-white/10 focus:ring-white/20"', 
     '"text-slate-700 hover:bg-slate-100"')
])

# 3. Input.tsx
replace_in_file("Input.tsx", [
    ('normalStyles =\n            "border-white/10 focus:ring-blue-500/50 focus:border-blue-400 bg-white/5 text-white placeholder:text-slate-500";',
     'normalStyles =\n            "border-slate-200 focus:ring-blue-500/50 focus:border-blue-400 bg-white placeholder:text-slate-500";'),
    ('errorStyles =\n            "border-red-400 focus:ring-red-500/50 focus:border-red-400 text-white";',
     'errorStyles =\n            "border-red-400 focus:ring-red-500/50 focus:border-red-400";'),
    ('text-white', 'text-slate-700'), # Will fix specifics below
    ('text-slate-400', 'text-slate-500'),
    ('text-red-400', 'text-red-600')
])

# 4. Select.tsx
replace_in_file("Select.tsx", [
    ('normalStyles =\n            "border-white/10 focus:ring-blue-500/50 focus:border-blue-400 bg-white/5 text-white placeholder:text-slate-500 focus:bg-white/5";',
     'normalStyles =\n            "border-slate-200 focus:ring-blue-500/50 focus:border-blue-400 bg-white placeholder:text-slate-500 focus:bg-white";'),
    ('errorStyles =\n            "border-red-400 focus:ring-red-500/50 focus:border-red-400 text-white focus:bg-white/5";',
     'errorStyles =\n            "border-red-400 focus:ring-red-500/50 focus:border-red-400 focus:bg-white";'),
    ('text-white', 'text-slate-700'),
    ('text-red-400', 'text-red-600')
])

# 5. Textarea.tsx
replace_in_file("Textarea.tsx", [
    ('normalStyles =\n            "border-white/10 focus:ring-blue-500/50 focus:border-blue-400 bg-white/5 text-white placeholder:text-slate-500";',
     'normalStyles =\n            "border-slate-200 focus:ring-blue-500/50 focus:border-blue-400 bg-white placeholder:text-slate-500";'),
    ('errorStyles =\n            "border-red-400 focus:ring-red-500/50 focus:border-red-400 text-white";',
     'errorStyles =\n            "border-red-400 focus:ring-red-500/50 focus:border-red-400";'),
    ('text-white', 'text-slate-700'),
    ('text-red-400', 'text-red-600')
])

# 6. Badge.tsx
replace_in_file("Badge.tsx", [
    ('"bg-blue-500/20 text-blue-300"', '"bg-blue-50 text-blue-600"'),
    ('"bg-white/10 text-white"', '"bg-slate-100 text-slate-700"'),
    ('"bg-emerald-500/20 text-emerald-300"', '"bg-green-50 text-green-700"'),
    ('"bg-orange-500/20 text-orange-300"', '"bg-orange-50 text-orange-700"'),
    ('"bg-red-500/20 text-red-300"', '"bg-red-50 text-red-700"')
])

# 7. ClayCard.tsx
replace_in_file("ClayCard.tsx", [
    ('"bg-white/5 border border-white/10"', '"bg-white border border-slate-200"')
])

# 8. Modal.tsx
replace_in_file("Modal.tsx", [
    ('border-white/10', 'border-slate-200'),
    ('text-white', 'text-slate-800'),
    ('hover:bg-white/10', 'hover:bg-slate-100'),
    ('text-slate-400', 'text-slate-500')
])

# 9. SearchDialog.tsx
replace_in_file("SearchDialog.tsx", [
    ('bg-white/5', 'bg-white'),
    ('border-white/10', 'border-slate-200'),
    ('text-white', 'text-slate-800'),
    ('text-slate-300', 'text-slate-700'),
    ('hover:bg-white/10', 'hover:bg-slate-100')
])
