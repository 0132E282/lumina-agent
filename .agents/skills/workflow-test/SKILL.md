---
name: workflow-test
description: "Phân tích yêu cầu, thiết kế và chạy test bằng agent qa-tester-agent"
---

# workflow-test

Đọc và thực hiện workflow trong `.claude/commands/lumina/test.md`. Thay `$ARGUMENTS` bằng yêu cầu/đường dẫn người dùng cung cấp; giải quyết link từ `.claude/commands/lumina/`. Đọc `.claude/agents/qa-tester-agent.md` và `docs/testcases/index.json` (nếu có) trước khi thiết kế hoặc chạy; giữ ID, ghi kết quả có bằng chứng vào JSON này và không đánh dấu Pass/Fail khi chưa chạy. Khi workflow yêu cầu delegation và có công cụ, dùng agent cùng vai trò do runtime hỗ trợ (Codex dùng custom agent cùng tên). Nếu không có delegation, thực hiện tuần tự theo cùng phạm vi và nêu rõ cách thực hiện. Không coi slash command/hook Claude là chức năng Codex tự chạy. Giữ điểm bàn giao, kiểm chứng và phạm vi cho phép của workflow.
