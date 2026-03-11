import os
import re

base_dir = r"c:\Users\longt\Desktop\website\new\src\app"

def replace_in_files():
    for root, dirs, files in os.walk(base_dir):
        # Exclude admin and api
        if 'admin' in root.split(os.sep) or 'api' in root.split(os.sep): continue
        
        for filename in files:
            if not filename.endswith('.tsx'): continue
            filepath = os.path.join(root, filename)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
                
            original_content = content
            
            # Exact replacements
            replacements = [
                ('bg-white/5', 'bg-white'),
                ('glass-card', 'bg-white shadow-sm'),
                ('border-white/10', 'border-slate-200'),
                ('border-[rgba(255,255,255,0.18)]', 'border-slate-200'),
                ('bg-[rgba(255,255,255,0.08)]', 'bg-white'),
                ('text-white/80', 'text-slate-600'),
                ('text-white/90', 'text-slate-700'),
                ('text-slate-300', 'text-slate-600'),
                ('prose-p:text-slate-300', 'prose-p:text-slate-600'),
                ('prose-li:text-slate-300', 'prose-li:text-slate-600'),
                ('prose-strong:text-white', 'prose-strong:text-slate-800'),
                ('prose-headings:text-white', 'prose-headings:text-slate-800'),
                ('text-muted-foreground', 'text-slate-600'),
                ('text-foreground', 'text-slate-800'),
                # Specific heading patterns
                ('h1 className="text-4xl md:text-5xl font-heading font-bold text-white', 'h1 className="text-4xl md:text-5xl font-heading font-bold text-slate-800'),
                ('h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-white', 'h1 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-slate-800'),
                ('h2 className="text-2xl md:text-3xl font-heading font-bold text-white', 'h2 className="text-2xl md:text-3xl font-heading font-bold text-slate-800'),
                ('h2 className="text-xl md:text-2xl font-heading font-bold text-white', 'h2 className="text-xl md:text-2xl font-heading font-bold text-slate-800'),
                ('h2 className="text-3xl font-bold font-heading text-white', 'h2 className="text-3xl font-bold font-heading text-slate-800'),
                ('h2 className="text-2xl font-bold font-heading text-white', 'h2 className="text-2xl font-bold font-heading text-slate-800'),
                ('h3 className="text-xl font-bold text-white mb-6"', 'h3 className="text-xl font-bold text-slate-800 mb-6"'),
                ('h3 className="text-lg font-bold text-white mb-6"', 'h3 className="text-lg font-bold text-slate-800 mb-6"'),
            ]
            
            for old, new in replacements:
                content = content.replace(old, new)
                
            # Line by line for text-white in elements that are obviously headings or paragraphs
            lines = content.split('\n')
            for i, line in enumerate(lines):
                if 'className=' in line and 'bg-blue' not in line and 'bg-gradient' not in line and 'badge' not in line.lower() and 'button' not in line.lower() and 'btn' not in line.lower():
                    if '<h' in line or '<p' in line or '<span' in line or '<div' in line:
                        lines[i] = re.sub(r'(?<![-a-zA-Z])text-white(?![-a-zA-Z])', 'text-slate-800', line)
            
            content = '\n'.join(lines)
            
            if content != original_content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                print(f"Updated {filepath}")

replace_in_files()
