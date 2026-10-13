---
name: workflow-implement
description: "Triển khai code bằng agent coding-agent theo task cụ thể hoặc plan JSON trong docs/plans/"
---

# workflow-implement

Đọc và thực hiện workflow trong `.claude/commands/lumina/implement.md`. Thay `$ARGUMENTS` bằng yêu cầu/đường dẫn người dùng cung cấp; giải quyết link từ `.claude/commands/lumina/`. Khi triển khai theo plan, đọc `docs/plans/index.json`, tìm bằng title/description/tags rồi mở plan JSON liên quan qua `path` để lấy task, `filesToChange` và dependency. Chỉ sửa file/hành vi cần thiết cho task đã giao; bảo toàn hành vi hiện có ngoài phạm vi. Nếu cần mở rộng sang component/page/module khác hoặc đổi hành vi đang hoạt động ngoài yêu cầu, dừng phần mở rộng, nêu file và tác động rồi xin người dùng chấp thuận; tiếp tục phần độc lập đã được giao. Trước khi hoàn thành, rà từng file/hunk và đường chạy bị ảnh hưởng: phát hiện sửa component/page ngoài phạm vi, render/state/effect loop và N+1 xuyên stack (API call theo item ở frontend, query/lazy loading theo record ở backend/ORM); đếm query/request bằng công cụ có sẵn hoặc ghi rõ chỉ kiểm tra tĩnh. Chỉ sửa lỗi ngoài yêu cầu nếu người dùng đồng ý; nếu lỗi do diff hiện tại gây ra thì sửa trước khi bàn giao. Đọc hướng dẫn vai trò liên quan trong `.claude/agents/`; khi workflow yêu cầu delegation và có công cụ, dùng agent cùng vai trò do runtime hỗ trợ (Codex dùng custom agent cùng tên). Nếu không có delegation, thực hiện tuần tự theo cùng phạm vi và nêu rõ cách thực hiện. Không coi slash command/hook Claude là chức năng Codex tự chạy. Giữ điểm bàn giao, kiểm chứng và phạm vi cho phép của workflow.

## Sau khi hoàn tất toàn bộ plan

Khi coding cho tất cả task trong plan đã hoàn tất, tạo tài liệu testcase cấp repo tại `docs/repo/<title-slug>-<yyyyMMdd>.md`, dựa trên code/luồng thực tế sau triển khai. Chỉ thiết kế testcase, không tự chạy bộ testcase này; ghi `Not Run`. Cập nhật cả `docs/repo/index.json` (mục lục con) và `docs/index.json`, entry chỉ gồm title/description/tags/path. Đây là testcase cấp repository, không thay thế testcase/kết quả theo feature ở `docs/testcases/index.json`.
