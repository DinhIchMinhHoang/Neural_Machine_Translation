"""Verify data_prep/data/clean/ against clean_manifest.json (size, sha256, line/row count per file).

Usage: python data_prep/verify_clean.py [--dir PATH]     exit 0 = all PASS, 1 = any FAIL/missing.
"""
import argparse
import hashlib
import json
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent


def scan(path):
    """One pass: (bytes, sha256, number of b'\\n' = line count as the notebooks split on '\\n')."""
    h, size, nl = hashlib.sha256(), 0, 0
    with open(path, 'rb') as f:
        while chunk := f.read(1 << 24):
            h.update(chunk)
            size += len(chunk)
            nl += chunk.count(b'\n')
    return size, h.hexdigest(), nl


def parquet_rows(path):
    import pyarrow.parquet as pq
    return pq.ParquetFile(path).metadata.num_rows


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--dir', type=Path, default=HERE / 'data' / 'clean', help='folder with the unzipped clean data')
    ap.add_argument('--manifest', type=Path, default=HERE / 'clean_manifest.json')
    a = ap.parse_args()
    man = json.loads(a.manifest.read_text(encoding='utf-8'))
    print(f'checking {a.dir.resolve()} against {a.manifest.name}')
    failed = 0
    for name, exp in man['files'].items():
        p = a.dir / name
        if not p.is_file():
            print(f'FAIL {name}: missing'); failed += 1; continue
        size, sha, nl = scan(p)
        errs = []
        if size != exp['bytes']:
            errs.append(f"size {size} != {exp['bytes']}")
        if sha != exp['sha256']:
            errs.append('sha256 mismatch')
        if 'lines' in exp and nl != exp['lines']:
            errs.append(f"lines {nl} != {exp['lines']}")
        if 'rows' in exp:
            try:
                rows = parquet_rows(p)
            except Exception as e:  # corrupt parquet
                rows = f'unreadable ({e})'
            if rows != exp['rows']:
                errs.append(f"rows {rows} != {exp['rows']}")
        print(f'PASS {name}' if not errs else f"FAIL {name}: {'; '.join(errs)}")
        failed += bool(errs)
    print('ALL PASS' if not failed else f'{failed} FILE(S) FAILED')
    sys.exit(1 if failed else 0)


if __name__ == '__main__':
    main()
