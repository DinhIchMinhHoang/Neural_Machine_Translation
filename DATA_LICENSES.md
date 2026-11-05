# Giấy phép và nguồn dữ liệu / Data licenses and sources

Kho mã này **không chứa** dữ liệu thô hay dữ liệu đã làm sạch. This repository contains no raw or cleaned corpus data.
Dữ liệu `data_prep/data/clean/` là sản phẩm làm sạch và gộp từ ba nguồn dưới đây.

| Nguồn / Source | URL | Giấy phép như được ghi / License as stated |
|---|---|---|
| **PhoMT** (Doan et al., EMNLP 2021) | Bản gốc: https://github.com/VinAIResearch/PhoMT ; bản dùng để tải: https://huggingface.co/datasets/ura-hcmut/PhoMT | `cc-by-nc-nd-4.0` theo phần metadata trong README của trang Hugging Face (Creative Commons Attribution-NonCommercial-NoDerivatives 4.0). |
| **MTet** (VietAI) | https://huggingface.co/datasets/phongmt184172/mtet (bản sao của https://github.com/vietai/mTet) | Không được ghi trên trang Hugging Face (README không có trường `license`). Xem https://github.com/vietai/mTet. Not stated on the HF page. |
| **IWSLT'15 En-Vi** | Trang Stanford NLP: https://nlp.stanford.edu/projects/nmt/ ; bản mirror dùng để tải: https://github.com/stefan-it/nmt-en-vi | **Chưa kiểm chứng** / license not verified. Xem trang Stanford NLP và trang chủ IWSLT. |

Mã nguồn dùng để tải dữ liệu thô (`data_prep/download_raw.py`) chỉ lấy dữ liệu trực tiếp từ các URL trên.

## Redistribution notice / Lưu ý về phân phối lại

- Bộ dữ liệu sạch (`train/valid/test` ở dạng `.en`, `.vi`, `.parquet`) là **sản phẩm phái sinh** (đã lọc, chuẩn hoá, gộp, loại trùng) của các nguồn trên.
  The cleaned corpus is a derivative of the datasets listed above.
- Người bảo trì kho này lưu trữ bản nén của bộ dữ liệu sạch **công khai trên Google Drive**; kho git không chứa nó.
  The maintainer hosts a zip of the cleaned corpus publicly on Google Drive; it is not part of this git repository.
- Giấy phép của PhoMT là **NonCommercial-NoDerivatives** (CC BY-NC-ND 4.0). Giấy phép của MTet và IWSLT'15 chưa được xác nhận ở đây.
  PhoMT is licensed NonCommercial-NoDerivatives; the MTet and IWSLT'15 licenses are not confirmed here.
- **Người dùng phải tự kiểm tra giấy phép của từng nguồn** trước khi sử dụng hoặc phân phối lại dữ liệu hay các sản phẩm tạo ra từ nó (ví dụ mô hình đã huấn luyện, tokenizer).
  Users must check each source's license before use or redistribution.
- Dữ liệu và kho này nhằm phục vụ **nghiên cứu và giáo dục**.
  Intended for research and education.
- Những người bảo trì **không đưa ra tuyên bố pháp lý** nào về tình trạng bản quyền hay quyền sử dụng của dữ liệu. Không có nội dung nào trong kho này là tư vấn pháp lý.
  The maintainers make no legal claim and give no legal advice.

Giấy phép của **mã nguồn** trong kho này: chưa chọn (TODO của người bảo trì).
