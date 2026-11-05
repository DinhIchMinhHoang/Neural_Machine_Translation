# Neural Machine Translation EN <-> VI

**English summary**
- A comparison project for English-Vietnamese neural machine translation (NMT). This repo currently covers **Phase 1: data preparation + tokenizer study**.
- `data_prep/` cleans and merges MTet + PhoMT + IWSLT'15 into a 5.25M-pair training set (valid 20,191 / test 20,259) and compares word-level, BPE and SentencePiece tokenizers.
- Model trainers: download the cleaned data zip from Google Drive (link below), unzip into `data_prep/data/clean/`, run `python data_prep/verify_clean.py`. Pre-trained tokenizers are in git (`data_prep/tokenizers/`).
- Notebooks are kept with saved outputs and `worklog/*.md` are the readable reports (reference only). To rerun from scratch see "Tái tạo từ đầu".
- `front_end/` is a demo UI (React + Vite) that currently uses a mock translator. Read `DATA_LICENSES.md` before using or redistributing the data (PhoMT is CC BY-NC-ND 4.0).

---

## Tổng quan

Dự án so sánh các mô hình dịch máy thần kinh Anh <-> Việt. Kho này hiện là **Giai đoạn 1**: chuẩn bị dữ liệu và nghiên cứu tokenizer.

- **Chuẩn bị dữ liệu** (`data_prep/data_prep.ipynb`): làm sạch và gộp MTet + PhoMT + IWSLT'15, xuất `train/valid/test`.
- **Tokenizer** (`data_prep/tokenizer.ipynb`): so sánh word-level (NLTK / PyVi), BPE (HuggingFace `tokenizers`) và SentencePiece (unigram, BPE) về fertility, OOV, tốc độ, khả đảo; huấn luyện sẵn các tokenizer lưu trong `data_prep/tokenizers/`.
- **Giao diện demo** (`front_end/`, package `lumen-nmt`, tiêu đề "Translatetor"): ứng dụng React + Vite, hiển thị bản dịch, token và ma trận attention; **hiện dùng bộ dịch giả lập** (`src/lib/api.js` là hợp đồng để thay bằng dịch vụ thật), chưa nối với mô hình nào.

## Cấu trúc thư mục

```
.
├── README.md, DATA_LICENSES.md, requirements.txt, .gitignore
├── data_prep/
│   ├── data_prep.ipynb        # làm sạch + gộp dữ liệu (có output đã lưu)
│   ├── tokenizer.ipynb        # so sánh tokenizer (có output đã lưu)
│   ├── tok_utils.py           # hàm worker cho multiprocessing của tokenizer.ipynb
│   ├── download_raw.py        # tải dữ liệu thô vào data/raw/
│   ├── verify_clean.py        # kiểm tra data/clean/ theo clean_manifest.json
│   ├── clean_manifest.json    # kích thước, sha256, số dòng của data/clean/
│   ├── tokenizers/            # tokenizer đã huấn luyện (trong git, ~39 MB)
│   ├── results/               # bảng CSV + hình của tokenizer.ipynb
│   └── data/                  # figs/ (hình, trong git); raw/, interim/, clean/ KHÔNG nằm trong git
├── worklog/                   # báo cáo đọc được: 01_data_prep.md, 02_tokenizer.md
└── front_end/                 # giao diện demo (React + Vite)
```

## Bắt đầu nhanh cho người huấn luyện mô hình

Bạn **không cần** chạy notebook. Chỉ cần tải dữ liệu đã làm sạch.

1. Tải dữ liệu sạch, chọn một trong hai nguồn (nội dung giống nhau):
   - **Hugging Face (khuyên dùng, tải từng file):** https://huggingface.co/datasets/DinhIchMinhHoang/NMT_Dataset
     ```bash
     python -c "from huggingface_hub import snapshot_download as d; d('DinhIchMinhHoang/NMT_Dataset', repo_type='dataset', local_dir='data_prep/data/clean')"
     ```
   - **Google Drive (một file zip):** https://drive.google.com/file/d/1nHMPgSuev-k2IEC-m3keOFxtgqOb2AL7/view?usp=sharing
2. Với bản zip, giải nén sao cho các file nằm trực tiếp trong `data_prep/data/clean/` (có `train.en`, `train.vi`, `train.parquet`, ...). Với Hugging Face thì lệnh trên đã đặt đúng chỗ.
3. Kiểm tra toàn vẹn (không cần GPU, vài giây):
   ```bash
   pip install pyarrow          # nếu chưa có; script chỉ dùng thư viện chuẩn + pyarrow
   python data_prep/verify_clean.py
   ```
   Kết quả mong đợi: mỗi file `PASS` rồi `ALL PASS` (exit code 0). `--dir PATH` để chỉ định thư mục khác.

**Đọc dữ liệu.** Mỗi split có 3 dạng cùng nội dung: `{train,valid,test}.parquet` (cột `en`, `vi`, `source` với `source` in `mtet|phomt|iwslt15`) và `{split}.en`, `{split}.vi` (mỗi dòng một câu, **dòng thứ i của `.en` khớp dòng thứ i của `.vi`**, tách theo `\n`, UTF-8). Train đã được xáo trộn.

```python
import pandas as pd
df = pd.read_parquet("data_prep/data/clean/valid.parquet")   # cột: en, vi, source
```

**Tokenizer huấn luyện sẵn** (`data_prep/tokenizers/`, vocab 32k, id 0..3 = `<pad> <unk> <bos> <eos>`): SentencePiece `spm_{unigram,bpe}_{en,vi}.model`, `spm_unigram_joint.model`; HuggingFace byte-level BPE `bpe_{en,vi}/tokenizer.json` (cùng `bpe_*_8000`, `bpe_*_16000`, `bpe_joint`). Chúng được huấn luyện trên chính dữ liệu `clean` này. Ví dụ (đã chạy thành công, chạy từ thư mục gốc repo):

```python
import sentencepiece as spm
from tokenizers import Tokenizer

TOK = "data_prep/tokenizers"
text = "The students are studying machine translation."
sp = spm.SentencePieceProcessor(model_file=f"{TOK}/spm_unigram_en.model")
ids = sp.encode(text)                       # [280, 1338, 289, 3546, 2149, 5614, 261]
print(sp.encode(text, out_type=str), sp.decode(ids))
bpe = Tokenizer.from_file(f"{TOK}/bpe_en/tokenizer.json")
enc = bpe.encode(text)                      # enc.ids = [346, 2952, 386, 6275, 4392, 10468, 17]
print(enc.tokens, bpe.decode(enc.ids))
```

**Số liệu bộ dữ liệu** (từ `stats.json`; số dòng sau làm sạch):

| Nguồn | train | valid | test |
|---|---:|---:|---:|
| PhoMT | 2,766,424 | 18,705 | 19,070 |
| MTet | 2,461,326 | 0 | 0 |
| IWSLT'15 | 19,768 | 1,486 | 1,189 |
| **Tổng** | **5,247,518** | **20,191** | **20,259** |

MTet chỉ đóng góp cho train: valid/test của MTet có 0 dòng sau làm sạch vì toàn bộ là bản sao hai chiều của IWSLT (xem `worklog/01_data_prep.md`). Dòng dữ liệu thô: PhoMT train 2,977,999; MTet train 8,327,706; IWSLT'15 train 133,317.

## Tái tạo từ đầu

Chỉ cần nếu bạn muốn tự chạy lại toàn bộ pipeline.

**Yêu cầu**: Windows hoặc Linux, Python 3.12, tối thiểu ~16 GB RAM, ~12 GB ổ đĩa trống, kết nối mạng. Thời gian tổng ~40-60 phút (tải dữ liệu tuỳ mạng; `data_prep` ~20 phút; `tokenizer` ~14 phút; số đo của tác giả: 19.7 và 13.6 phút).

```bash
python -m venv .venv
# Windows: .venv\Scripts\activate        Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python -c "import nltk; nltk.download('punkt_tab')"    # dữ liệu cho nltk.word_tokenize
python data_prep/download_raw.py                        # ~5 GB (MTet 4.47 GB, PhoMT 0.53 GB); xem --dry-run, --only {mtet,phomt,iwslt15}
```

`download_raw.py` tạo `data_prep/data/raw/{mtet,phomt,iwslt15}/` đúng như notebook mong đợi và bỏ qua file đã có đủ kích thước. Chạy `--dry-run` để xem danh sách và dung lượng trước.

**Chạy notebook theo thứ tự, từ thư mục `data_prep/`** (các notebook dùng đường dẫn tương đối `data/...`, `tokenizers/`, `results/`; `tokenizer.ipynb` còn `import tok_utils` nên **bắt buộc** chạy với thư mục làm việc là `data_prep/`; `data_prep.ipynb` có đoạn tự `chdir` vào `data_prep` nếu thấy `data_prep/data/raw` ở thư mục hiện tại, nhưng hãy cứ đứng trong `data_prep/`):

```bash
cd data_prep
jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=-1 data_prep.ipynb
jupyter nbconvert --to notebook --execute --inplace --ExecutePreprocessor.timeout=-1 tokenizer.ipynb
cd .. && python data_prep/verify_clean.py      # so với manifest
```

Lưu ý `--inplace` ghi đè notebook (kể cả output đã lưu trong git); dùng `--output tên_khác.ipynb` nếu muốn giữ bản gốc. Có thể mở bằng Jupyter/VS Code thay cho nbconvert.

**Các cờ trong ô cấu hình** (giá trị đã lưu trong notebook ở dạng chạy đầy đủ):

| Cờ | Notebook | Mặc định đã lưu | Ý nghĩa |
|---|---|---|---|
| `SAMPLE` | cả hai | `False` | `True`: chạy thử nhanh trên mẫu nhỏ. `data_prep`: 30k dòng train/nguồn. `tokenizer`: 50k câu, vocab 8k, đầu ra vào thư mục con `sample/` (`tokenizers/sample`, `results/sample`, không nằm trong git) |
| `REUSE` | `tokenizer.ipynb` | `False` | `True`: nạp lại model/bộ đếm từ đã có trên đĩa thay vì huấn luyện lại. Nếu `data/clean` đổi, **phải** dùng `False` |
| `GUARD_OVERRIDE` | `data_prep.ipynb` | `True` | Chốt chặn mất mát (train < 4.5M dòng hoặc một luật mới loại > 3% so với v1) có kêu thì `True` vẫn ghi `data/clean` và ghi `passed=False` vào `stats.json`; `False` thì dừng trước khi ghi đè |

**Lưu ý và lỗi thường gặp**
- `data_prep.ipynb` **xoá sạch `data/interim/`** khi chạy, và ghi đè `data/clean/`.
- `MemoryError` ở ô huấn luyện SentencePiece joint (ghép EN+VI, 2M câu) trên máy 16 GB: giải phóng RAM hoặc restart kernel, xoá file joint dở dang (`tokenizers/spm_unigram_joint.*`, `tokenizers/bpe_joint/`) rồi chạy lại.
- Thiếu `punkt_tab`: `tok_utils` tự dùng `NLTKWordTokenizer` thay thế, số liệu word-level EN có thể lệch nhẹ.
- Tất định: theo hai lần chạy của tác giả, số dòng sau làm sạch trùng khớp hoàn toàn; các số đếm mức từ (word-level) có thể lệch khoảng ±1 đến 10.

**Đầu ra mong đợi**: `data_prep/data/clean/` (11 file) khớp `clean_manifest.json` (kiểm bằng `verify_clean.py`; số dòng cố định, byte/sha256 có thể khác nếu phiên bản thư viện khác), `data_prep/data/figs/`, `data_prep/tokenizers/`, `data_prep/results/`. Môi trường tác giả (pandas 3.1.0, pyarrow 26.0.1, tokenizers 0.23.3, sentencepiece 0.2.2, nltk 3.10.4, pyvi 0.1.1, Python 3.12.10) ghi trong `clean_manifest.json`; `requirements.txt` không ghim phiên bản.

**Báo cáo và notebook tham khảo**: `worklog/01_data_prep.md`, `worklog/02_tokenizer.md` (mục lục: `worklog/README.md`). Notebook lưu sẵn output nên có thể đọc trực tiếp trên GitHub mà không cần chạy.

## Giấy phép và trích dẫn

Xem [`DATA_LICENSES.md`](DATA_LICENSES.md) (**đọc trước khi dùng hoặc phân phối lại dữ liệu**; PhoMT: CC BY-NC-ND 4.0). Giấy phép mã nguồn: chưa chọn.

- **PhoMT**: https://github.com/VinAIResearch/PhoMT
  ```bibtex
  @inproceedings{PhoMT,
  title     = {{PhoMT: A High-Quality and Large-Scale Benchmark Dataset for Vietnamese-English Machine Translation}},
  author    = {Long Doan and Linh The Nguyen and Nguyen Luong Tran and Thai Hoang and Dat Quoc Nguyen},
  booktitle = {Proceedings of the 2021 Conference on Empirical Methods in Natural Language Processing},
  year      = {2021},
  pages     = {4495--4503}
  }
  ```
- **MTet** (VietAI): https://github.com/vietai/mTet (dùng bản sao HF `phongmt184172/mtet`).
- **IWSLT'15 En-Vi**: Stanford NLP https://nlp.stanford.edu/projects/nmt/ , tải qua mirror https://github.com/stefan-it/nmt-en-vi .
