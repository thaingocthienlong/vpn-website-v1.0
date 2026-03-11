"""
Phase 2-6: Sweep all component files to replace dark theme tokens with new Soft UI light tokens.
Covers: ui/, cards/, sections/, skeletons/, news/, layout/, app/[locale]/ pages
"""
import os
import re

SRC_DIR = r"c:\Users\longt\Desktop\website\new\src"

# Comprehensive replacement map: old → new
REPLACEMENTS = [
    # Glass backgrounds → solid white
    ("bg-white/5", "bg-white"),
    ("bg-white/8", "bg-white"),
    ("bg-white/10", "bg-white"),
    ("bg-white/15", "bg-white"),
    ("bg-white/20", "bg-white"),
    ("bg-white/50", "bg-white"),
    ("bg-[rgba(255,255,255,0.08)]", "bg-white"),
    ("bg-[rgba(255,255,255,0.05)]", "bg-white"),
    
    # Glass borders → slate borders
    ("border-white/10", "border-slate-200"),
    ("border-white/20", "border-slate-200"),
    ("border-white/15", "border-slate-200"),
    ("border-[rgba(255,255,255,0.18)]", "border-slate-200"),
    ("border-[rgba(255,255,255,0.15)]", "border-slate-200"),
    ("border-[rgba(255,255,255,0.1)]", "border-slate-200"),
    
    # Text colors: white-on-dark → dark-on-light
    ("text-white/80", "text-slate-600"),
    ("text-white/70", "text-slate-500"),
    ("text-white/60", "text-slate-500"),
    ("text-white/90", "text-slate-700"),
    ("text-white/50", "text-slate-400"),
    ("text-slate-300", "text-slate-600"),
    ("text-slate-400", "text-slate-500"),
    
    # Badge colors: dark variants → light solid
    ("bg-blue-500/20", "bg-blue-50"),
    ("text-blue-300", "text-blue-700"),
    ("bg-emerald-500/20", "bg-green-50"),
    ("text-emerald-300", "text-green-700"),
    ("bg-orange-500/20", "bg-orange-50"),
    ("text-orange-300", "text-orange-700"),
    ("bg-red-500/20", "bg-red-50"),
    ("text-red-300", "text-red-700"),
    
    # Skeleton shimmer
    ("via-white/5", "via-slate-100"),
    ("via-white/10", "via-slate-100"),
    
    # Hover states
    ("hover:bg-white/10", "hover:bg-slate-100"),
    ("hover:bg-white/5", "hover:bg-slate-50"),
    ("hover:bg-white/20", "hover:bg-slate-100"),
    ("hover:border-white/30", "hover:border-slate-300"),
    ("hover:border-white/40", "hover:border-slate-300"),
    
    # Focus states
    ("focus:border-white/40", "focus:border-blue-500"),
    ("focus:ring-white/20", "focus:ring-blue-500/20"),
    ("focus:ring-sky-400/30", "focus:ring-blue-500/20"),
    
    # Ring
    ("ring-white/20", "ring-blue-500/20"),
    
    # Placeholder
    ("placeholder:text-slate-500", "placeholder:text-slate-400"),
    ("placeholder:text-white/30", "placeholder:text-slate-400"),
    
    # Old font references (in classNames, not CSS)
    ("font-['Momo_Display']", "font-heading"),
    ("font-['Momo_Sans']", "font-sans"),
    
    # Prose modifiers
    ("prose-strong:text-white", "prose-strong:text-slate-800"),
    ("prose-p:text-white/80", "prose-p:text-slate-600"),
    ("prose-headings:text-white", "prose-headings:text-slate-900"),
    ("prose-a:text-sky-400", "prose-a:text-blue-600"),
    
    # Foreground/muted
    ("text-foreground", "text-slate-800"),
    ("text-muted-foreground", "text-slate-500"),
    
    # Backdrop/blur patterns that shouldn't be on cards
    ("backdrop-blur-sm", ""),
    ("backdrop-blur-md", ""),
    
    # Sky-based accents → blue
    ("text-sky-400", "text-blue-500"),
    ("text-sky-300", "text-blue-400"),
    ("text-sky-400/40", "text-blue-300"),
    ("bg-sky-400/10", "bg-blue-50"),
    ("border-sky-400/30", "border-blue-200"),
    
    # Ring sky → blue
    ("ring-sky-400", "ring-blue-500"),
]

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    original = content
    
    # Apply all string replacements
    for old, new in REPLACEMENTS:
        content = content.replace(old, new)
    
    # Replace standalone `text-white` but NOT inside gradient/button/bg contexts
    # Only in className attributes
    lines = content.split('\n')
    new_lines = []
    for line in lines:
        if 'className=' in line:
            # Don't replace text-white inside gradient or btn contexts
            if 'bg-gradient' not in line and 'btn' not in line.lower() and 'bg-primary' not in line and 'bg-blue' not in line and 'bg-navy' not in line and 'bg-slate-900' not in line and 'Footer' not in line:
                line = re.sub(r'(?<![-a-zA-Z/])text-white(?![-a-zA-Z/])', 'text-slate-800', line)
        new_lines.append(line)
    content = '\n'.join(new_lines)
    
    if content != original:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

# Walk all TSX files in src/
count = 0
for root, dirs, files in os.walk(SRC_DIR):
    # Skip admin pages and node_modules
    if 'admin' in root or 'node_modules' in root:
        continue
    for fname in files:
        if fname.endswith('.tsx') or fname.endswith('.ts'):
            filepath = os.path.join(root, fname)
            if process_file(filepath):
                relpath = os.path.relpath(filepath, SRC_DIR)
                print(f"Updated: {relpath}")
                count += 1

print(f"\nTotal files updated: {count}")
