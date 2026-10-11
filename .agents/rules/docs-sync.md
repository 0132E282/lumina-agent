---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📚 Đồng bộ tài liệu — Docs-as-Code Sync"
---

# 📚 Đồng bộ tài liệu — Docs-as-Code Sync

**Nhóm quy tắc kết hợp**: Documentation as Code + Definition of Done (bao gồm docs)

Khi đọc hoặc sửa file trong `docs/`, agent phải đọc `docs/documentation-index.json` trước, tìm entry theo `title`, `url`, `description` và áp dụng thêm rule [`documentation-reading-and-toc`](./documentation-reading-and-toc.md). Mỗi lần viết/sửa docs phải cập nhật index cùng lượt. Registry chỉ quản lý file trong `docs/`.

## Cách áp dụng

- Sau khi hoàn thành một plan ([`planner-agent`](../agents/planner-agent.md)) **và** `coding-agent` đã triển khai xong (tạo/sửa/xóa file, đổi API, đổi cấu trúc, đổi tên agent/skill/command), luôn kiểm tra `README.md`/`CLAUDE.md`/`docs/` có đoạn nào nhắc tới phần vừa đổi không — có thì **cập nhật ngay trong cùng lượt**, không để lại "làm sau".
- **"Hoàn thành" (DONE)** của một task không chỉ là code chạy đúng + test pass ([`rules/quality-assurance`](./quality-assurance.md)) — còn phải gồm: docs liên quan (nếu có nhắc tới phần vừa đổi) đã phản ánh đúng thay đổi.
- Dùng skill [`docs`](../skills/docs/SKILL.md) để rà nhanh khi phạm vi ảnh hưởng tới docs lớn hoặc không chắc hết những đâu đang nhắc tới phần vừa đổi (đổi tên agent/skill/command, xóa/thêm module) — không tự nhớ thủ công từng chỗ rồi bỏ sót.
- Chỉ cập nhật đúng phần thực sự bị ảnh hưởng — không viết lại toàn bộ docs hay mở rộng phạm vi khi không cần ([`rules/simplicity`](./simplicity.md)).

```javascript
// ❌ Code xong, báo hoàn thành — quên README vẫn nhắc API cũ
function finishTask() {
  implementFeature();
  runTests();
  reportDone(); // docs vẫn nói "endpoint /v1/old" dù đã đổi sang /v2/new
}

// ✅ Definition of Done gồm cả docs bị ảnh hưởng
function finishTask() {
  implementFeature();
  runTests();
  syncAffectedDocs(); // cập nhật đúng đoạn README/CLAUDE.md/docs nhắc tới phần vừa đổi
  reportDone();
}
```

## Khi áp dụng

- Ngay sau khi `coding-agent` hoàn thành một task từ `docs/implementation-plan.json` mà task đó đổi API/cấu trúc/convention đang được nhắc trong docs.
- Trước khi báo "hoàn thành task" với người dùng — tự hỏi: *"README/CLAUDE.md/docs có đoạn nào giờ sai không?"*
- **Không áp dụng** cho thay đổi nội bộ không ảnh hưởng gì tới nội dung đã viết trong docs (ví dụ đổi tên biến cục bộ, refactor không đổi hành vi/giao diện công khai).
