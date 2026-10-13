---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📦 Commit có kỷ luật — Explicit Authorization + Conventional Commits"
---

# 📦 Commit có kỷ luật — Explicit Authorization + Conventional Commits

**Nhóm quy tắc kết hợp**: Explicit Commit Authorization + Conventional Commits

## Cách áp dụng

- **Tuyệt đối không tự ý commit** khi chưa có lệnh rõ ràng từ người dùng (ví dụ: "commit đi"). Viết xong code **không đồng nghĩa** được phép commit — luôn chờ yêu cầu.
- **Không commit vụn vặt**: gộp các thay đổi liên quan của task hiện tại thành **một commit có ý nghĩa**, không commit từng bước nhỏ (`fix typo`, `fix typo 2`, `wip`...).
- Mỗi lần yêu cầu commit tương ứng đúng phạm vi được giao — không tự ý gộp thêm thay đổi khác, cũng không tách lẻ trừ khi người dùng chỉ định.
- **Phạm vi push chỉ có 2 kiểu hợp lệ**: "push hết" (toàn bộ thay đổi hiện có, khi người dùng nói rõ) hoặc "push theo tính năng" (chỉ file/đoạn code thật sự liên quan task đang làm, mặc định khi không chỉ định). **Cả hai kiểu đều tuyệt đối không bao giờ** được kèm file tmp/scratch/debug/test thử nghiệm hoặc file rác không thuộc deliverable — dọn bằng skill [`cleanup-temp-files`](../skills/cleanup-temp-files/SKILL.md) trước khi `git add`, luôn rà lại `git status` để xác nhận.
- **Format Conventional Commits**:
  - Tiêu đề: `<type>: <mô tả ngắn gọn>` — **không quá 75 ký tự**. `type` phổ biến: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `build`, `ci`.
  - Mô tả (body): liệt kê thay đổi/tính năng chính, nêu rõ vấn đề được giải quyết hoặc cái gì được thêm vào — ưu tiên "why" hơn "what".

```
feat: thêm hook tự động format code bằng Prettier sau khi edit

- Thêm PostToolUse hook chạy `prettier --write` sau mỗi lần Edit/Write
- Bỏ qua êm nếu project không có Prettier, không chặn agent
- Giải quyết vấn đề: code không đồng nhất format giữa các lần sửa thủ công
```

❌ Sai: tự động `git commit` ngay sau khi sửa xong mà chưa được yêu cầu. ❌ Sai: commit riêng từng file nhỏ lẻ trong cùng task. ❌ Sai: tiêu đề dài dòng thay vì tóm tắt trọng tâm.
