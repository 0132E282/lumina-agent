---
name: workflow-cleanup
description: "Làm gọn context agent, giữ mục tiêu/quyết định/tiến độ và bước tiếp theo; không dọn file workspace."
---

# workflow-cleanup

Đọc nguồn `.claude/commands/cleanup.md`; Claude dùng `/cleanup`, Codex dùng `$workflow-cleanup`. Rút gọn context và giữ yêu cầu/quyết định/bằng chứng/bước tiếp theo, dùng khả năng compact thật của runtime nếu có. Nếu chỉ tạo tóm tắt thì báo đúng trạng thái đó, không giả lập reset bộ nhớ. Không delegation chỉ để làm gọn context, không xóa file hoặc gọi skill dọn workspace. Không tự lưu handoff nếu chưa được yêu cầu.
