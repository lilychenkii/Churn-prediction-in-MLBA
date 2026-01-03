import re
from collections import defaultdict

# Đọc file SQL
with open('dataforml_item.sql', 'r', encoding='utf-8') as f:
    content = f.read()

# Parse INSERT statements
pattern = r"\((\d+),\d+,(\d+),'([^']+)'"
matches = re.findall(pattern, content)

# Group by categoryid
categories = defaultdict(list)
for itemid, categoryid, name in matches:
    categories[categoryid].append((itemid, name))

# Print mapping
print("=" * 80)
print("CATEGORY MAPPING FROM DATABASE")
print("=" * 80)

for cat_id in sorted(categories.keys(), key=int):
    items = categories[cat_id]
    print(f"\nCategory ID: {cat_id} ({len(items)} items)")
    print("-" * 80)
    for item_id, name in items[:5]:  # Show first 5 items
        print(f"  • #{item_id}: {name}")
    if len(items) > 5:
        print(f"  ... and {len(items) - 5} more items")
