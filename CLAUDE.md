# Claude Code

@CONTRACT.md

Đọc và tuân thủ [AGENTS.md](./AGENTS.md) trước khi làm việc. `.agents/rules/` và `.agents/skills/` là nguồn chung duy nhất; `.claude/rules/` và `.claude/skills/` liên kết tới đó, không tạo bản sao riêng.

## Cấu hình riêng

- `.claude/agents/*.md`: vai trò, tools và model cho Claude Code.
- `.claude/commands/*.md`: slash command trực tiếp như `/review`, `/git`, `/cleanup`; skill `workflow-*` dùng cùng nguồn quy trình trên các công cụ khác. Planning dùng Plan mode có sẵn kết hợp `.agents/skills/workflow-plan/SKILL.md`, không cần command riêng.
- `.claude/settings.json` và `.claude/hooks/`: hook Claude, không tự chạy trên Codex hoặc Antigravity.
- `.claude/storage/` bị ignore; không commit log/file tạm. Tài liệu bàn giao `docs/` là deliverable.
- Docs mặc định là `AI-readable`: context tối thiểu, chỉ đọc phần liên quan, tóm tắt một lần ở nguồn chuẩn, link thay vì lặp và dùng `system-diagrams` khi quan hệ/flow phức tạp. `human-readable` chỉ dùng khi người dùng yêu cầu.

## Pipeline

Yêu cầu người dùng → Plan mode + `workflow-plan` (khi cần) → triển khai theo rule chung → `/test` → `/review` → `/git commit` → `/git main`.

Chạy bước được giao, giữ điểm bàn giao/duyệt; không tự chạy toàn pipeline. Khi chuyển project, copy cùng `.agents/`, `.claude/`, `AGENTS.md` và `CLAUDE.md`, giữ symlink tương đối.

Triển khai code luôn giao subagent `coding-agent` theo rule implementation và Agent tool — phiên chính không tự `Edit`/`Write` code sản phẩm trực tiếp. Setup tool/thư viện/runtime/ứng dụng (không phải viết code) giao `setup-agent`, không phải `coding-agent`. Phiên chính vẫn được tự sửa file cấu hình/docs (`AGENTS.md`, `CLAUDE.md`, `README.md`, rule/skill...) khi task không phải triển khai tính năng.

Hoàn thành bất kỳ task nào (kể cả khi phiên chính tự `Edit`/`Write` file cấu hình/docs, hay giao subagent) → bắt buộc xuất báo cáo bằng skill `report`, mặc định ngắn gọn, chỉ chi tiết khi được yêu cầu ([`rules/mandatory-report`](./.agents/rules/mandatory-report.md)).

## Execution discipline

Ưu tiên hoàn thành task với effort tương xứng độ lớn/độ mơ hồ/rủi ro — không mặc định chạy đủ analyze → Plan mode → review cho mọi thay đổi; chỉ dùng khi độ phức tạp, rủi ro hoặc yêu cầu thật sự cần.

- Đọc rule/tài liệu liên quan, khảo sát đúng phần bị ảnh hưởng; đủ bằng chứng cho một thay đổi nhỏ, đúng phạm vi thì triển khai luôn — không tiếp tục dò thêm phương án hay edge case giả định.
- Dùng pattern/component có sẵn; không tách file, thêm abstraction, hay refactor phần không liên quan chỉ để "cho gọn" hoặc nhất quán hình thức.
- Trước khi coding, khoanh rõ file/hành vi được giao. Chỉ sửa đúng phạm vi; giữ nguyên component/page/module và luồng đang hoạt động ngoài yêu cầu. Nếu cần đổi phần ngoài phạm vi, dừng phần đó, nêu file/tác động và xin người dùng chấp thuận trước; lỗi có sẵn ngoài phạm vi không được tự tiện sửa.
- Trước khi hoàn thành task code, rà từng file/hunk và đường chạy bị ảnh hưởng để bắt thay đổi component/page ngoài phạm vi, render/state/effect loop và N+1 xuyên stack. Kiểm tra API call theo item ở frontend, query/lazy-load theo record ở backend/ORM (Laravel/Eloquent, EF/SQL hoặc tương ứng); đếm query/request bằng công cụ sẵn có hoặc ghi rõ chỉ kiểm tra tĩnh. Chỉ sửa lỗi do thay đổi hiện tại gây ra hoặc được giao; lỗi ngoài phạm vi phải báo và xin chấp thuận.
- Khi coding xong toàn bộ task của một plan, tạo testcase cấp repo dạng Markdown tại `docs/repo/<title-slug>-<yyyyMMdd>.md`, dựa trên code thực tế; ghi `Not Run`, không tự chạy bộ testcase này. Cập nhật `docs/repo/index.json` và `docs/index.json`; mỗi entry menu chỉ có title, description, tags, path. Test/check trực tiếp theo task vẫn theo rule QA.
- Task rõ ràng, nhỏ → giao thẳng `coding-agent`; chỉ dùng plan/subagent/review độc lập khi độ phức tạp, rủi ro, hoặc khối lượng việc tách biệt thật sự cần.
- Giữ nguyên quyết định người dùng đã chốt và kết quả đã kiểm chứng trừ khi có bằng chứng mới mâu thuẫn; việc nhỏ, đảo ngược được thì tự quyết, không hỏi lại.
- Giới hạn phạm vi tìm kiếm/tool output đúng câu hỏi còn lại — không đọc lại file không đổi, dump nguyên văn log dài, hay poll trạng thái lặp lại không cần thiết.
- Review đúng phần hành vi/contract bị đổi rồi dừng — không mở rộng sang audit/dọn test/lỗi nền không liên quan; lỗi do task gây ra thì sửa, lỗi không liên quan thì báo riêng cho người dùng.

## Điều phối giữa subagent

- Subagent sau đọc **bàn giao** của subagent trước qua file trong `docs/` (ví dụ `requirement-analysis.md`, `system-design.md`, hoặc plan JSON được tìm qua `docs/plans/index.json`) — không diễn giải lại nội dung đã có trong file đó khi gọi `Agent`.
- Mỗi subagent chỉ làm đúng vai trò được giao, không tự lấn sang vai trò khác trong cùng chuỗi: `reviewer-agent` không tự sửa code, `planner-agent` không tự triển khai, `qa-tester-agent` không tự sửa code ứng dụng để test đạt.
- Bàn giao cũ còn hợp lệ (yêu cầu chưa đổi) → tái dùng, không gọi lại subagent đã chạy xong cho cùng input.
- Gọi `Agent` cho subagent sau kèm đúng file/diff/phạm vi cụ thể cần xử lý trong prompt — không bắt subagent tự dò lại toàn repo hoặc toàn bộ hội thoại trước đó để suy ra phạm vi.
