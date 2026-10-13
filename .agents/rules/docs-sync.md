---
trigger: model_decision
description: 'Áp dụng khi nhiệm vụ liên quan: 📚 Đồng bộ tài liệu — Docs-as-Code Sync'
---

# 📚 Đồng bộ tài liệu — Docs-as-Code Sync

**Nhóm quy tắc kết hợp**: Documentation as Code + Definition of Done (bao gồm docs)

Khi đọc hoặc sửa file trong `docs/`, agent phải đọc `index.json` phù hợp trước, tìm bằng `title`, `description`, `tags`, rồi mở file chi tiết qua `path`. Mỗi entry trong index menu/catalog chỉ có `title`, `description`, `tags`, `path`; nội dung nằm trong file chi tiết (`.md` cho tài liệu, `.json` cho plan/review). File Markdown chi tiết có title, description, tags và content; description của menu plan/review hướng dẫn AI khi nào nên tham khảo file. Ngoại lệ: `docs/testcases/index.json` là dữ liệu testcase và kết quả chạy theo schema testcase chuyên biệt, không phải menu. Cập nhật index/record tương ứng cùng lượt, không nhúng nội dung tài liệu vào menu.

## Cách áp dụng

- Sau khi hoàn thành một plan ([`planner-agent`](../agents/planner-agent.md)) **và** `coding-agent` đã triển khai xong (tạo/sửa/xóa file, đổi API, đổi cấu trúc, đổi tên agent/skill/command), luôn kiểm tra `README.md`/`CLAUDE.md`/`docs/` có đoạn nào nhắc tới phần vừa đổi không — có thì **cập nhật ngay trong cùng lượt**, không để lại "làm sau".
- **"Hoàn thành" (DONE)** của một task không chỉ là code chạy đúng + test pass ([`rules/quality-assurance`](./quality-assurance.md)) — còn phải gồm: docs liên quan (nếu có nhắc tới phần vừa đổi) đã phản ánh đúng thay đổi.
- Dùng skill [`docs`](../skills/docs/SKILL.md) để rà nhanh khi phạm vi ảnh hưởng tới docs lớn hoặc không chắc hết những đâu đang nhắc tới phần vừa đổi (đổi tên agent/skill/command, xóa/thêm module) — không tự nhớ thủ công từng chỗ rồi bỏ sót.
- Chỉ cập nhật đúng phần thực sự bị ảnh hưởng — không viết lại toàn bộ docs hay mở rộng phạm vi khi không cần ([`rules/simplicity`](./simplicity.md)).

```javascript
// ❌ Code xong, báo hoàn thành — quên README vẫn nhắc API cũ
function finishTask() {
  implementFeature()
  runTests()
  reportDone() // docs vẫn nói "endpoint /v1/old" dù đã đổi sang /v2/new
}

// ✅ Definition of Done gồm cả docs bị ảnh hưởng
function finishTask() {
  implementFeature()
  runTests()
  syncAffectedDocs() // cập nhật đúng đoạn README/CLAUDE.md/docs nhắc tới phần vừa đổi
  reportDone()
}
```

## Khi áp dụng

- Ngay sau khi `coding-agent` hoàn thành một task trong `docs/plans/*.json` mà task đó đổi API/cấu trúc/convention đang được nhắc trong docs.
- Trước khi báo "hoàn thành task" với người dùng — tự hỏi: _"README/CLAUDE.md/docs có đoạn nào giờ sai không?"_
- **Không áp dụng** cho thay đổi nội bộ không ảnh hưởng gì tới nội dung đã viết trong docs (ví dụ đổi tên biến cục bộ, refactor không đổi hành vi/giao diện công khai).
