import os, json, sys

sys.stdout.reconfigure(encoding='utf-8')

base_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
target_dir = None
for d in os.listdir(base_dir):
    full = os.path.join(base_dir, d)
    if os.path.isdir(full) and '编号' in d:
        target_dir = full
        break

if not target_dir:
    print("NOT FOUND")
    sys.exit(1)

print(f"DIR: {target_dir}")
all_data = {}
for f in os.listdir(target_dir):
    if f.endswith('.json'):
        fp = os.path.join(target_dir, f)
        print(f"\nFILE: {f} ({os.path.getsize(fp)} bytes)")
        with open(fp, 'r', encoding='utf-8') as fh:
            data = json.load(fh)
        print(f"  Records: {len(data)}")
        if data:
            print(f"  Keys: {list(data[0].keys())}")
            print(f"  Sample[0]: {json.dumps(data[0], ensure_ascii=False)}")
            if len(data) > 1:
                print(f"  Sample[1]: {json.dumps(data[1], ensure_ascii=False)}")
        all_data[f] = data

with open(os.path.join(base_dir, 'mold_data_all_preview.txt'), 'w', encoding='utf-8') as out:
    for fname, data in all_data.items():
        out.write(f"\n=== {fname} ({len(data)}) ===\n")
        for item in data:
            out.write(json.dumps(item, ensure_ascii=False) + '\n')

print(f"\nFull data written to mold_data_all_preview.txt")
