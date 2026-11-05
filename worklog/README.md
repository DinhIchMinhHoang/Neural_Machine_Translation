# Worklog: Neural Machine Translation EN–VI

| # | Báo cáo | Nội dung |
|---|---|---|
| 01 | [01_data_prep.md](01_data_prep.md) | Làm sạch và gộp MTet + PhoMT + IWSLT'15 (`data_prep/data_prep.ipynb`): pipeline v2: sửa mojibake, detokenizer, các luật lọc mới (r01, r08, r11 đến r16), dedup theo cặp/khoá EN/khoá VI, chống rò rỉ, chốt chặn mất mát (`GUARD_OVERRIDE`), audit trước/sau; kết quả train 5,247,518 / valid 20,191 / test 20,259 |
| 02 | [02_tokenizer.md](02_tokenizer.md) | So sánh word-level / BPE / SentencePiece (`data_prep/tokenizer.ipynb`): fertility, độ dài, OOV, tốc độ, round trip, joint vs separate; chạy lại trên dữ liệu v2, kèm mục "Lưu ý chạy lại" |

Các báo cáo này chỉ để tham khảo. Tổng quan, cách tải dữ liệu sạch và cách chạy lại: [../README.md](../README.md); giấy phép dữ liệu: [../DATA_LICENSES.md](../DATA_LICENSES.md).

Thứ tự đọc: 01 rồi 02 (tokenizer huấn luyện trên `data_prep/data/clean`, đầu ra của 01).
Số liệu lấy từ `data_prep/data/clean/stats.json`, `data_prep/results/*.csv` và output notebook ở trạng thái cuối.
