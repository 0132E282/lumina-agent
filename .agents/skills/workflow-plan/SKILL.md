---
name: workflow-plan
description: "Pipeline lập kế hoạch đầy đủ — research → system-design-agent (nếu cần) → planner-agent → review kế hoạch → report"
---

# workflow-plan

Đọc và thực hiện workflow trong `.claude/commands/lumina/plan.md`. Thay `$ARGUMENTS` bằng yêu cầu/đường dẫn người dùng cung cấp; giải quyết link từ `.claude/commands/lumina/`. Đọc `docs/plans/index.json`, tìm theo title/description/tags và mở plan liên quan qua path. Lưu plan JSON chi tiết trong `docs/plans/`, mô tả từng file cần sửa trong task, đặt tên từ title + ngày tạo, rồi thêm entry chỉ gồm title/description/tags/path vào index. Đọc hướng dẫn vai trò liên quan trong `.claude/agents/`; khi workflow yêu cầu delegation và có công cụ, dùng agent cùng vai trò do runtime hỗ trợ (Codex dùng custom agent cùng tên). Nếu không có delegation, thực hiện tuần tự theo cùng phạm vi và nêu rõ cách thực hiện. Không coi slash command/hook Claude là chức năng Codex tự chạy. Giữ điểm bàn giao, kiểm chứng và phạm vi cho phép của workflow.
