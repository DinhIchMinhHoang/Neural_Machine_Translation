/* flat keys (st.*, info.*) are merged into t(); `topics` is read directly by InfoPanel */
export default {
  en:{
    "st.title":"Numbers","st.dims":"Matrix T × S","st.counts":"Source → target tokens","st.model":"Model","st.beam":"Beam size","st.ms":"Latency",
    "st.steps":"Per-step attention","st.tgt":"Target","st.arg":"Top source","st.max":"Max",
    "st.meanMax":"Mean max weight","st.meanH":"Mean entropy (nats)","st.covMin":"Coverage min","st.covMean":"Coverage mean","st.covMax":"Coverage max","st.under":"Under-covered tokens (<0.5·mean)",
    "st.logP":"log P(Y|X)","st.alpha":"α (length norm)","st.beta":"β (coverage)","st.lp":"lp(Y)","st.cp":"cp(X;Y)","st.score":"GNMT score s(Y,X)","st.bleu":"BLEU","st.na":"n/a (needs reference)",
    "info.title":"Learn more",
    topics:[
      {id:"seq",title:"Seq2seq",pts:["An encoder reads the source and a decoder writes the target one token at a time.","Without attention, the whole source is squeezed into one fixed-size context vector: a bottleneck for long sentences.","GNMT: 8 LSTM layers in the encoder and decoder, residual connections, and the first encoder layer is bidirectional."],f:"p(Y|X) = ∏ₜ p(yₜ | y<ₜ, X)"},
      {id:"att",title:"Attention: Bahdanau vs Luong",pts:["Bahdanau (additive) uses the previous decoder state; Luong (dot / general) uses the current one.","Scores go through a softmax to get weights, and the weighted sum of encoder states is the context vector.","GNMT uses one additive-style attention from decoder layer 1 to the top encoder layer."],f:"Bahdanau: score = vᵀ tanh(W₁hₜ + W₂h̄ₛ)\nLuong: score = hₜᵀ W h̄ₛ  (dot: hₜᵀ h̄ₛ)\naₜₛ = softmax(score), cₜ = Σₛ aₜₛ h̄ₛ"},
      {id:"trf",title:"Transformer",pts:["Vaswani et al. 2017, \"Attention Is All You Need\": self-attention, multi-head, no recurrence, positional encoding.","NOT used here: this demo models a pure RNN+attention GNMT system; shown for comparison."],f:"Attention(Q,K,V) = softmax(QKᵀ/√dₖ) V"},
      {id:"bpe",title:"BPE / WordPiece",pts:["Words are split into subword units, so rare or new words become known pieces.","The vocabulary stays small and there are no unknown-word holes.","GNMT used about 32k wordpieces."],f:"unhappiness → un + happi + ness"},
      {id:"beam",title:"Beam search",pts:["Keep the top-k partial hypotheses at every step instead of only the best one.","Length normalization stops short outputs from winning on raw log-probability.","The coverage penalty rewards hypotheses that attend to every source token."],f:"s(Y,X) = log P(Y|X) / lp(Y) + cp(X;Y)\nlp(Y) = ((5+|Y|)/6)^α\ncp(X;Y) = β · Σₛ ln(min(Σₜ aₜₛ, 1))"},
      {id:"bleu",title:"BLEU",pts:["Geometric mean of modified n-gram precisions up to n = 4, times a brevity penalty.","Computed at corpus level; it always needs one or more reference translations.","Hence this demo shows n/a: there is no reference."],f:"BLEU = BP · exp(Σₙ₌₁⁴ ¼ ln pₙ)\nBP = min(1, e^(1−r/c))"}
    ]
  },
  vi:{
    "st.title":"Số liệu","st.dims":"Ma trận T × S","st.counts":"Token nguồn → đích","st.model":"Mô hình","st.beam":"Kích thước beam","st.ms":"Độ trễ",
    "st.steps":"Attention theo từng bước","st.tgt":"Đích","st.arg":"Nguồn cao nhất","st.max":"Max",
    "st.meanMax":"Trọng số max trung bình","st.meanH":"Entropy trung bình (nat)","st.covMin":"Độ phủ nhỏ nhất","st.covMean":"Độ phủ trung bình","st.covMax":"Độ phủ lớn nhất","st.under":"Token thiếu độ phủ (<0,5·TB)",
    "st.logP":"log P(Y|X)","st.alpha":"α (chuẩn hóa độ dài)","st.beta":"β (độ phủ)","st.lp":"lp(Y)","st.cp":"cp(X;Y)","st.score":"Điểm GNMT s(Y,X)","st.bleu":"BLEU","st.na":"n/a (cần bản tham chiếu)",
    "info.title":"Tìm hiểu thêm",
    topics:[
      {id:"seq",title:"Seq2seq",pts:["Bộ mã hóa đọc câu nguồn, bộ giải mã sinh câu đích từng token một.","Không có attention, cả câu nguồn bị nén vào một vector ngữ cảnh cố định: nút thắt cổ chai với câu dài.","GNMT: 8 lớp LSTM ở cả encoder và decoder, có kết nối residual, lớp encoder đầu tiên là hai chiều."],f:"p(Y|X) = ∏ₜ p(yₜ | y<ₜ, X)"},
      {id:"att",title:"Attention: Bahdanau và Luong",pts:["Bahdanau (cộng) dùng trạng thái decoder trước đó; Luong (dot / general) dùng trạng thái hiện tại.","Điểm số qua softmax thành trọng số, tổng có trọng số các trạng thái encoder là vector ngữ cảnh.","GNMT dùng một attention kiểu cộng, từ lớp decoder 1 tới lớp encoder trên cùng."],f:"Bahdanau: score = vᵀ tanh(W₁hₜ + W₂h̄ₛ)\nLuong: score = hₜᵀ W h̄ₛ  (dot: hₜᵀ h̄ₛ)\naₜₛ = softmax(score), cₜ = Σₛ aₜₛ h̄ₛ"},
      {id:"trf",title:"Transformer",pts:["Vaswani và cộng sự 2017, \"Attention Is All You Need\": self-attention, nhiều đầu, không dùng hồi quy, có mã hóa vị trí.","KHÔNG dùng ở đây: bản demo này mô phỏng hệ GNMT thuần RNN+attention; chỉ nêu để so sánh."],f:"Attention(Q,K,V) = softmax(QKᵀ/√dₖ) V"},
      {id:"bpe",title:"BPE / WordPiece",pts:["Từ được tách thành đơn vị con, nên từ hiếm hoặc mới vẫn ghép được từ các mảnh đã biết.","Từ vựng nhỏ gọn và không còn từ lạ không biết xử lý.","GNMT dùng khoảng 32 nghìn wordpiece."],f:"unhappiness → un + happi + ness"},
      {id:"beam",title:"Beam search",pts:["Giữ k giả thuyết tốt nhất ở mỗi bước thay vì chỉ một.","Chuẩn hóa độ dài tránh việc câu ngắn thắng chỉ nhờ log-xác suất thô.","Phạt độ phủ thưởng cho giả thuyết đã chú ý tới mọi token nguồn."],f:"s(Y,X) = log P(Y|X) / lp(Y) + cp(X;Y)\nlp(Y) = ((5+|Y|)/6)^α\ncp(X;Y) = β · Σₛ ln(min(Σₜ aₜₛ, 1))"},
      {id:"bleu",title:"BLEU",pts:["Trung bình nhân của độ chính xác n-gram đã hiệu chỉnh đến n = 4, nhân với phạt độ ngắn.","Tính ở mức corpus; luôn cần ít nhất một bản dịch tham chiếu.","Vì vậy bản demo hiển thị n/a: không có bản tham chiếu."],f:"BLEU = BP · exp(Σₙ₌₁⁴ ¼ ln pₙ)\nBP = min(1, e^(1−r/c))"}
    ]
  }
};
