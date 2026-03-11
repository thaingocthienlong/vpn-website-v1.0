import os

sections_dir = r"c:\Users\longt\Desktop\website\new\src\components\sections"
news_dir = r"c:\Users\longt\Desktop\website\new\src\components\news"

def replace_in_dir(directory, replacements):
    for filename in os.listdir(directory):
        if not filename.endswith('.tsx'): continue
        filepath = os.path.join(directory, filename)
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
            pass

# Section Components
replace_in_dir(sections_dir, [
    ('bg-white/5', 'bg-white/50'), # ContactSection info cards
    ('bg-emerald-500/20', 'bg-green-100'), # ContactSection success
    ('text-emerald-400', 'text-green-600'), # ContactSection success icon
    ('isDark ? "text-white" : "text-white"', 'isDark ? "text-white" : "text-slate-800"'), # SectionHeader title/subtitle check
    ('glass-card', 'bg-white'), # Gallery/Videos/News sections
    ('text-white', 'text-slate-800'), # General text replacement where it affects headings
    ('border-white/10', 'border-slate-200'),
    ('text-slate-300', 'text-slate-600'),
    ('bg-gradient-blue-section', 'bg-slate-50') # The background of contact section
])

# News Components (NewsSidebar, NewsList, NewsPagination)
replace_in_dir(news_dir, [
    ('glass-card', 'bg-white'),
    ('bg-white/5', 'bg-white'),
    ('border-white/10', 'border-slate-200'),
    ('text-white', 'text-slate-800'),
    ('text-slate-300', 'text-slate-600'),
    ('hover:bg-white/10', 'hover:bg-slate-100'),
])
