---
name: workflow-implement
description: "Triển khai code bằng agent coding-agent theo task cụ thể hoặc plan JSON trong docs/plans/"
---

# workflow-implement

Đọc và thực hiện workflow trong `.claude/commands/lumina/implement.md`. Thay `$ARGUMENTS` bằng yêu cầu/đường dẫn người dùng cung cấp; giải quyết link từ `.claude/commands/lumina/`. Khi triển khai theo plan, đọc `docs/plans/index.json`, tìm bằng title/description/tags rồi mở plan JSON liên quan qua `path` để lấy task, `filesToChange` và dependency. Đọc hướng dẫn vai trò liên quan trong `.claude/agents/`; khi workflow yêu cầu delegation và có công cụ, dùng agent cùng vai trò do runtime hỗ trợ (Codex dùng custom agent cùng tên). Nếu không có delegation, thực hiện tuần tự theo cùng phạm vi và nêu rõ cách thực hiện. Không coi slash command/hook Claude là chức năng Codex tự chạy. Giữ điểm bàn giao, kiểm chứng và phạm vi cho phép của workflow.
