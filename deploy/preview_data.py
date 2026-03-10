import json, glob, os

base = os.path.join(os.path.dirname(os.path.dirname(__file__)))
files = glob.glob(os.path.join(base, '**', '*.json'), recursive=True)
mold_files = [f for f in files if '模具' in os.path.basename(f) or '模压' in os.path.basename(f) or '口型' in os.path.basename(f) or '接角' in os.path.basename(f)]

if not mold_files:
    for f in files:
        parent = os.path.basename(os.path.dirname(f))
        if '编号' in parent or '模具' in parent:
            mold_files.append(f)

for f in sorted(mold_files):
    with open(f, 'r', encoding='utf-8') as fh:
        data = json.load(fh)
    print(f"\n=== {os.path.basename(f)} ({len(data)} records) ===")
    for item in data[:2]:
        print(json.dumps(item, ensure_ascii=False, indent=2))
    if len(data) > 2:
        print(f"  ... and {len(data)-2} more")
    keys = set()
    for item in data:
        keys.update(item.keys())
    print(f"  All keys: {sorted(keys)}")
