"""Download the raw corpora into data_prep/data/raw/ exactly as data_prep.ipynb (section 1) expects.

  raw/mtet/     <- HF dataset phongmt184172/mtet   (14 train shards + validation + test parquet, ~4.2 GB)
  raw/phomt/    <- HF dataset ura-hcmut/PhoMT      (PhoMT_{training,validation,test}.csv, ~0.5 GB)
  raw/iwslt15/  <- github.com/stefan-it/nmt-en-vi  (3 .tgz, ~10 MB; extracted to train/tst2012/tst2013 .en/.vi)

Usage: python data_prep/download_raw.py [--out DIR] [--only mtet|phomt|iwslt15 ...] [--dry-run]
Files that already exist with the expected size are skipped. No credentials needed (public data).
"""
import argparse
import sys
import tarfile
from pathlib import Path

import requests

HF_REPOS = {'mtet': 'phongmt184172/mtet', 'phomt': 'ura-hcmut/PhoMT'}
APPROX = {'mtet': '~4.2 GB', 'phomt': '~0.5 GB', 'iwslt15': '~10 MB'}
IWSLT_BASE = 'https://github.com/stefan-it/nmt-en-vi/raw/master/data/'
# archive -> {member: expected size in bytes}
IWSLT = {
    'train-en-vi.tgz': {'train.en': 13603614, 'train.vi': 18074646},
    'dev-2012-en-vi.tgz': {'tst2012.en': 140250, 'tst2012.vi': 188396},
    'test-2013-en-vi.tgz': {'tst2013.en': 132264, 'tst2013.vi': 183855},
}


def mb(n):
    return f'{n / 1e6:,.1f} MB'


def hf_files(repo):
    from huggingface_hub import HfApi
    info = HfApi().dataset_info(repo, files_metadata=True)
    return {s.rfilename: s.size for s in info.siblings}


def do_hf(name, out, dry):
    repo, dest = HF_REPOS[name], out / name
    files = hf_files(repo)
    todo = {f: s for f, s in files.items() if not ((dest / f).is_file() and (dest / f).stat().st_size == s)}
    print(f'[{name}] {repo}: {len(files)} files, {mb(sum(files.values()))} total; {len(todo)} to download ({mb(sum(todo.values()))}) -> {dest}')
    for f, s in sorted(todo.items()):
        print(f'    {"would get" if dry else "get"} {f} ({mb(s)})')
    if dry or not todo:
        return
    from huggingface_hub import snapshot_download
    snapshot_download(repo_id=repo, repo_type='dataset', local_dir=dest, allow_patterns=list(todo))
    bad = [f for f, s in files.items() if not (dest / f).is_file() or (dest / f).stat().st_size != s]
    if bad:
        sys.exit(f'[{name}] size mismatch after download: {bad}')


def extract(tgz, wanted, dest):
    """Write only the expected regular files, by basename; reject absolute paths and '..' members."""
    with tarfile.open(tgz, 'r:gz') as tf:
        for m in tf.getmembers():
            p = Path(m.name)
            if p.is_absolute() or '..' in p.parts or m.name.startswith(('/', '\\')):
                sys.exit(f'unsafe path in {tgz}: {m.name!r}')
            if not m.isfile():
                continue
            if m.name not in wanted:
                print(f'    ignoring unexpected member {m.name!r}')
                continue
            with tf.extractfile(m) as src, open(dest / m.name, 'wb') as dst:
                dst.write(src.read())


def do_iwslt(out, dry):
    dest = out / 'iwslt15'
    todo = [a for a, ms in IWSLT.items()
            if not all((dest / m).is_file() and (dest / m).stat().st_size == s for m, s in ms.items())]
    print(f'[iwslt15] {IWSLT_BASE}: {len(IWSLT)} archives; {len(todo)} to download/extract (~10 MB) -> {dest}')
    for a in todo:
        print(f'    {"would get" if dry else "get"} {a} -> {", ".join(IWSLT[a])}')
    if dry or not todo:
        return
    dest.mkdir(parents=True, exist_ok=True)
    for a in todo:
        tgz = dest / a
        r = requests.get(IWSLT_BASE + a, stream=True, timeout=(15, 60))  # (connect, read) seconds
        r.raise_for_status()
        with open(tgz, 'wb') as f:
            for chunk in r.iter_content(1 << 20):
                f.write(chunk)
        extract(tgz, IWSLT[a], dest)
        for m, s in IWSLT[a].items():
            got = (dest / m).stat().st_size if (dest / m).is_file() else None
            if got != s:
                sys.exit(f'[iwslt15] {m}: size {got} != expected {s} (upstream changed?)')


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--out', type=Path, default=Path(__file__).resolve().parent / 'data' / 'raw',
                    help='output dir (default: data_prep/data/raw next to this script)')
    ap.add_argument('--only', choices=['mtet', 'phomt', 'iwslt15'], action='append',
                    help='download only this source (repeatable); default: all')
    ap.add_argument('--dry-run', action='store_true', help='list what would be downloaded, with sizes')
    a = ap.parse_args()
    out = a.out.resolve()
    print(f'output dir: {out}' + ('  (dry run)' if a.dry_run else ''))
    for name in a.only or ['iwslt15', 'phomt', 'mtet']:
        try:
            do_iwslt(out, a.dry_run) if name == 'iwslt15' else do_hf(name, out, a.dry_run)
        except (requests.RequestException, OSError) as e:
            sys.exit(f'[{name}] failed: {e}')
    print('done.' if not a.dry_run else 'dry run finished, nothing downloaded.')


if __name__ == '__main__':
    main()
