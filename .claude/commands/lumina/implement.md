---
description: Triển khai code bằng agent coding-agent theo đúng phạm vi được giao (task cụ thể hoặc plan JSON trong docs/plans/)
argument-hint: "<task/tính năng cần code, hoặc 'theo plan' để chọn plan phù hợp trong docs/plans/>"
---

Giao cho agent `coding-agent` triển khai: $ARGUMENTS

- Nếu người dùng yêu cầu triển khai theo plan mà không chỉ định task cụ thể, đọc `docs/plans/index.json`, tìm theo title/description/tags, mở plan JSON liên quan qua `path`, rồi đọc task `TODO`/`IN_PROGRESS`, `filesToChange` và dependency — triển khai đúng task được giao theo thứ tự dependency.
- Tuân thủ toàn bộ 18 rule bắt buộc trong [`rules/`](../../rules) — không tự ý mở rộng phạm vi, không refactor ngoài task, không tự thêm tính năng.
- Sau khi code xong: chạy test/lint liên quan, kiểm tra README/CLAUDE.md/docs có đoạn nào nhắc tới phần vừa đổi mà giờ sai không — có thì cập nhật luôn (dùng skill `docs` nếu phạm vi lớn/không chắc hết chỗ — [`rules/docs-sync`](../../rules/docs-sync.md)), rồi xuất báo cáo thay đổi (skill `report`), và dừng lại chờ người dùng xác nhận trước khi `reviewer-agent` review hoặc commit.
