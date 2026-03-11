import os

base_dir = r"c:\Users\longt\Desktop\website\new\src\components\skeletons"

def replace_in_files(replacements):
    for filename in os.listdir(base_dir):
        if not filename.endswith('.tsx'): continue
        filepath = os.path.join(base_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        for old, new in replacements:
            content = content.replace(old, new)
                
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filename}")
        else:
            print(f"No changes made to {filename}")

replace_in_files([
    ('bg-white/5', 'bg-white/70 backdrop-blur-md'),
    ('glass-card', 'bg-white/70 backdrop-blur-md'),
    ('border-white/10', 'border-slate-100')
])
