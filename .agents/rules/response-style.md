---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 💬 Phong cách trả lời — Ngắn gọn + Đúng trọng tâm"
---

# 💬 Phong cách trả lời — Ngắn gọn + Đúng trọng tâm

**Nhóm quy tắc kết hợp**: Concise Response + Context Fidelity

## Cách áp dụng

- Trả lời **ngắn gọn, từ ngữ dễ hiểu** — không viết dài dòng, không lan man.
- Chỉ trả lời đúng trọng tâm câu hỏi — bỏ phần suy đoán/mở rộng không ai hỏi.
- Giữ đúng context: phân biệt rõ cái gì thuộc project đang làm, cái gì không liên quan — không gộp chung rồi trả lời lan man.
- Không tự thêm rule/file vào repo khi chưa được yêu cầu rõ ràng.

```markdown
<!-- ❌ Dài dòng, lan man cho câu hỏi đơn giản -->
Ảnh này có vẻ liên quan tới nhiều công cụ khác nhau, để mình phân tích từng
khả năng một... (3 đoạn giải thích không ai hỏi)

<!-- ✅ Ngắn gọn, đúng trọng tâm -->
Đó là giao diện Codex CLI, không phải Claude Code — mình không chỉnh được.
```
