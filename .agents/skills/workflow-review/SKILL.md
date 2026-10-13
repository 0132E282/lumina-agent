---
name: workflow-review
description: "Review code hiện tại bằng skill open-code-review:review (OCR)"
---

# workflow-review

Đọc và thực hiện workflow trong `.claude/commands/lumina/review.md`. Thay `$ARGUMENTS` bằng yêu cầu/đường dẫn người dùng cung cấp; giải quyết link từ `.claude/commands/lumina/`. Với code hoặc system design review, đọc `docs/reviews/index.json`, tìm theo title/description/tags và mở report liên quan qua path; lưu report JSON chi tiết có metadata/nội dung, tên file từ title + ngày, rồi cập nhật index chỉ với title/description/tags/path. Đọc hướng dẫn vai trò liên quan trong `.claude/agents/`; khi workflow yêu cầu delegation và có công cụ, dùng agent cùng vai trò do runtime hỗ trợ (Codex dùng custom agent cùng tên). Nếu không có delegation, thực hiện tuần tự theo cùng phạm vi và nêu rõ cách thực hiện. Không coi slash command/hook Claude là chức năng Codex tự chạy. Giữ điểm bàn giao, kiểm chứng và phạm vi cho phép của workflow.
