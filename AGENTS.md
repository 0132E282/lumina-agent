# Hướng dẫn chung cho Claude Code, Codex và Antigravity

Đọc [`CONTRACT.md`](./CONTRACT.md) trước — ràng buộc cứng, không vi phạm dù có vẻ hợp lý cho task.

Repo cấu hình agent phát triển phần mềm, không phải ứng dụng. Nội dung hướng dẫn viết tiếng Việt; README gốc viết tiếng Anh. Skill thiết kế import giữ ngôn ngữ nguồn.

## Nguồn chung và quy tắc

- Nội dung agent/rule/skill tự viết dùng tiếng Việt; README gốc dùng tiếng Anh, skill import giữ ngôn ngữ nguồn. Đọc file liên quan trước khi sửa, giữ convention hiện có. `.agents/rules/` là nguồn chung; `.claude/rules/` và `.codex/rules/` liên kết tới đó. Khi code, đọc toàn bộ file rule trong `.agents/rules/`, áp dụng phần liên quan đến nhiệm vụ; không tự mở rộng phạm vi.
- TypeScript không dùng `any`, ưu tiên type có sẵn/dẫn xuất và gom theo domain trong `types/`.
- UI/Figma có sẵn là mẫu chuẩn: không tự redesign, đổi theme hoặc tạo design system nếu chưa được yêu cầu. Đọc mẫu thật; không truy cập được thì nêu rõ, không đoán.
- Thao tác database thật mặc định read-only; viết migration không đồng nghĩa được phép chạy. Commit/push/deploy chỉ trong phạm vi được người dùng yêu cầu rõ.
- Sau sửa, chạy check phù hợp có sẵn, tự review diff và đồng bộ tài liệu liên quan. Không bịa kết quả test, benchmark hoặc kết quả tool.
- Với báo cáo coding/sửa code có thuật toán hoặc luồng xử lý phụ thuộc dữ liệu, phân tích và ghi Big O Before/After gồm time complexity, space complexity, allocation nếu đáng kể, chi phí khởi tạo/preprocessing, input `n`/`m`, căn cứ đo, hành vi giữ nguyên và kết quả kiểm chứng; đồng thời phải có đánh giá coding gồm kết luận, trade-off, rủi ro còn lại và khuyến nghị. Với rule, skill, docs, template hoặc config thuần túy, ghi rõ `Không áp dụng — không có thuật toán/runtime phụ thuộc input`, không bịa Big O từ việc agent đọc file.
- Khi setup hoặc thay đổi rule/template, mọi agent (Codex, Claude Code, Antigravity) phải báo cáo dạng text theo mẫu: `- File:`, `Mô tả:`, `Điều kiện kích hoạt:`; kèm kiểm tra đã thực hiện và vấn đề còn tồn tại. Không dùng bảng cho mẫu báo cáo này.
- Mỗi lần báo cáo kết quả của task coding/sửa code, phải dùng skill [`complexity-performance`](./.agents/skills/complexity-performance/SKILL.md) để phân tích phần xử lý liên quan trước khi xuất report; task chỉ đổi rule, skill, docs, template hoặc config thuần túy thì không cần kích hoạt skill này.
- Nếu task có query/database, kết hợp skill [`database`](./.agents/skills/database/SKILL.md) với `complexity-performance`: kiểm tra schema, semantics, index, query plan, tải query và trade-off; vẫn giữ nguyên nguyên tắc database read-only.

Các file Markdown trong `.codex/rules/` được đọc theo hướng dẫn này, không phải rule thực thi lệnh dạng `.rules`. Liên kết tương đối bên trong được giải quyết từ thư mục nguồn `.agents/rules/`.

## Skill, vai trò và workflow

- `.codex/skills/` là đường dẫn liên kết để quản lý cùng bộ skill; Codex khám phá skill qua `.agents/skills/`. `.agents/skills/` là nguồn skill chung; `.claude/skills/` và `.codex/skills/` cùng liên kết tới đó. Giải quyết liên kết và script theo thư mục nguồn `.agents/skills/<name>/`; `.agents/agents`, `.agents/hook` và `.agents/commands` liên kết tới tài nguyên Claude để giữ các tham chiếu tương đối.
- `.codex/agents/*.toml` định nghĩa custom agent tương ứng `.claude/agents/*.md`, kế thừa model của phiên. Chỉ delegation khi nhiệm vụ/workflow được giao yêu cầu; đọc tài liệu vai trò trước khi thực hiện.
- Workflow gọi bằng `$workflow-analyze`, `$workflow-plan`, `$workflow-implement`, `$workflow-test`, `$workflow-review`, `$workflow-report`, `$workflow-commit`, `$workflow-pr`, `$workflow-cleanup`, `$workflow-audit-workspace`. Chúng chuyển hành vi từ `.claude/commands/lumina/` (Claude gọi bằng slash command namespace `/lumina:...`), không phải slash command Claude trên Codex.
- Bàn giao bằng file trong `docs/` theo vai trò, giữ điểm duyệt của workflow. Không tự chạy toàn pipeline từ phân tích tới commit.
- Hoàn thành task (dù tự làm trực tiếp hay qua subagent) → bắt buộc xuất báo cáo bằng skill `report`, mặc định ngắn gọn, chỉ chi tiết khi được yêu cầu ([`rules/mandatory-report`](./.agents/rules/mandatory-report.md)).

## Execution discipline

Ưu tiên hoàn thành task với effort tương xứng độ lớn/độ mơ hồ/rủi ro — không mặc định chạy đủ chuỗi `requirement-analysis-agent`/`planner-agent`/`reviewer-agent`/`qa-tester-agent` cho mọi thay đổi; chỉ dùng khi độ phức tạp, rủi ro hoặc yêu cầu thật sự cần.

- Đọc rule/tài liệu liên quan, khảo sát đúng phần bị ảnh hưởng; đủ bằng chứng cho một thay đổi nhỏ, đúng phạm vi thì triển khai luôn — không tiếp tục dò thêm phương án hay edge case giả định.
- Dùng pattern/component có sẵn; không tách file, thêm abstraction, hay refactor phần không liên quan chỉ để "cho gọn" hoặc nhất quán hình thức.
- Trước khi coding, khoanh rõ file/hành vi được giao. Chỉ sửa đúng phạm vi; giữ nguyên component/page/module và luồng đang hoạt động ngoài yêu cầu. Nếu cần đổi phần ngoài phạm vi, dừng phần đó, nêu file/tác động và xin người dùng chấp thuận trước; lỗi có sẵn ngoài phạm vi không được tự tiện sửa.
- Trước khi hoàn thành task code, rà từng file/hunk và các đường chạy bị ảnh hưởng để bắt thay đổi component/page ngoài phạm vi, render/state/effect loop và N+1 xuyên stack. Kiểm tra API call theo item ở frontend, query/lazy-load theo record ở backend/ORM (Laravel/Eloquent, EF/SQL hoặc tương ứng); đếm query/request bằng công cụ sẵn có hoặc ghi rõ chỉ kiểm tra tĩnh. Chỉ sửa lỗi do thay đổi hiện tại gây ra hoặc được giao; lỗi ngoài phạm vi phải báo và xin chấp thuận.
- Khi coding xong toàn bộ task của một plan, tạo testcase cấp repo dạng Markdown tại `docs/repo/<title-slug>-<yyyyMMdd>.md`, dựa trên code thực tế; ghi `Not Run`, không tự chạy bộ testcase này. Cập nhật `docs/repo/index.json` và `docs/index.json`; mỗi entry menu chỉ có title, description, tags, path. Test/check trực tiếp theo task vẫn theo rule QA.
- Task rõ ràng, nhỏ → giao thẳng `coding-agent`; chỉ dùng plan/subagent/review độc lập khi độ phức tạp, rủi ro, hoặc khối lượng việc tách biệt thật sự cần.
- Giữ nguyên quyết định người dùng đã chốt và kết quả đã kiểm chứng trừ khi có bằng chứng mới mâu thuẫn; việc nhỏ, đảo ngược được thì tự quyết, không hỏi lại.
- Giới hạn phạm vi tìm kiếm/tool output đúng câu hỏi còn lại — không đọc lại file không đổi, dump nguyên văn log dài, hay poll trạng thái lặp lại không cần thiết.
- Review đúng phần hành vi/contract bị đổi rồi dừng — không mở rộng sang audit/dọn test/lỗi nền không liên quan; lỗi do task gây ra thì sửa, lỗi không liên quan thì báo riêng cho người dùng.

## Hook và format

`.claude/settings.json` và các script hook nhận payload Claude không tự được kích hoạt bởi cấu hình này trên Codex. Các quy tắc tương ứng vẫn phải được thực hiện qua hướng dẫn/workflow; không báo hook đã chạy khi chưa có runtime tích hợp.

Sau sửa file, dùng formatter/linter/test runner đã có trong project với đúng file/phạm vi. Nếu có Prettier local, chạy qua binary local hoặc package script; không tự tải package bằng `npx` khi chưa được giao cài. Repo chưa có formatter thì nêu rõ; không giả lập format. Trước commit kiểm tra diff và dùng script `.claude/skills/git-workflow/scripts/validate-commit-message.sh` theo workflow git.

## Antigravity

- Antigravity khám phá skill và rule trực tiếp trong `.agents/skills/` và `.agents/rules/`; không cần bản sao riêng. Rule có frontmatter `trigger: model_decision`, nhưng khi code vẫn phải đọc các rule theo hướng dẫn chung ở trên. README danh mục có trigger manual.
- Gọi `/coding-frontend`, `/coding-backend`, `/workflow-plan` hoặc `/workflow-implement` khi cần. Dùng công cụ và khả năng delegation thực tế của Antigravity; file TOML trong `.codex/agents/` không phải cấu hình agent Antigravity. Nếu không có custom agent tương ứng, thực hiện vai trò tuần tự từ `.claude/agents/`, giữ ranh giới trách nhiệm.
- Không tự chạy hook Claude trên Antigravity. Format, lint và test theo công cụ project; không giả lập kết quả.

## Chọn skill theo nhiệm vụ

- Setup tool/thư viện/runtime/ứng dụng: giao vai trò `setup-agent`, đọc `.claude/agents/setup-agent.md`; Codex dùng adapter `.codex/agents/setup-agent.toml`. Cài và kiểm chứng đúng phạm vi yêu cầu, không tự upgrade toàn hệ thống.
- Khảo sát hệ thống hoặc cần sơ đồ hiện trạng: dùng `system-understanding`; dùng `system-diagrams` cho sơ đồ cấu trúc thư mục, ERD và user/system flow; dùng `database` bổ sung khi cần phân tích schema/query/index.
- Khi viết docs có từ 3 thành phần liên quan, flow nhiều bước, hierarchy hoặc dependency phức tạp, ưu tiên sơ đồ trực quan để giảm tải đọc hiểu cho AI; giữ văn bản cho context, giả định, constraint và kết luận.
- Tài liệu có hai chế độ: `AI-readable` là mặc định để agent đọc, truy vết và ra quyết định; `human-readable` chỉ dùng khi người dùng yêu cầu rõ tài liệu cho người đọc. Nếu không chỉ định, luôn chọn `AI-readable`.
- Với docs `AI-readable`, giảm context đến mức nhỏ nhất đủ dùng: chỉ đọc phần liên quan, tóm tắt một lần ở nguồn chuẩn, link thay vì lặp lại, progressive disclosure và không dump repo/log/file không ảnh hưởng.
- Triển khai: luôn giao vai trò `coding-agent` (subagent Claude; adapter `.codex/agents/coding-agent.toml` trên Codex; vai trò tương đương trên Antigravity) — không tự `Edit`/`Write` code trực tiếp ở phiên chính. `coding-agent` áp dụng skill `coding-frontend`/`coding-backend` theo đúng stack, đọc rule tương ứng và tái sử dụng stack/component/contract hiện có.
- UI mới/redesign được yêu cầu: vai trò `ux-ui-designer-agent`; admin ưu tiên usability và mẫu project, website có thể dùng `design-taste-frontend`. Không áp phong cách marketing lên admin hoặc ghi đè Figma.
- SEO kỹ thuật: `seo-website`; nội dung: `seo-content-website`; debug: `debugs`. Chỉ đọc skill phù hợp, không tải toàn bộ thư viện.
- Sau khi sửa backend/API hoặc frontend liên quan dữ liệu cần bảo vệ theo điều kiện (đáp án đúng khi đề còn mở, giá/nội dung chưa công bố, PII...): vai trò `leak-hunter` — chỉ tìm và liệt kê nơi nghi ngờ rò rỉ, không tự sửa; không tự kích hoạt khi không được giao.
- Thiếu công cụ/plugin thì dùng phương án thực tế cùng phạm vi và báo giới hạn, không giả lập kết quả.

## Điều phối giữa agent

- Agent sau đọc **bàn giao** của agent trước qua file trong `docs/` (ví dụ `requirement-analysis.md`, `system-design.md`, hoặc plan JSON được tìm qua `docs/plans/index.json`) — không bắt người dùng diễn giải lại nội dung đã có trong file đó.
- Mỗi agent chỉ làm đúng vai trò được giao, không tự lấn sang vai trò agent khác trong cùng chuỗi: `reviewer-agent` không tự sửa code, `planner-agent` không tự triển khai, `qa-tester-agent` không tự sửa code ứng dụng để test đạt.
- Bàn giao cũ còn hợp lệ (yêu cầu chưa đổi) → tái dùng, không chạy lại agent đã làm xong cho cùng input.
- Giao task cho agent sau kèm đúng file/diff/phạm vi cụ thể cần xử lý — không bắt agent sau tự dò lại toàn repo hoặc toàn bộ hội thoại trước đó để suy ra phạm vi.

## Bảo trì cấu hình

Chỉnh rule/skill tại `.agents/`; giữ adapter theo runtime, không nhân bản nội dung. Kiểm tra README/docs bị ảnh hưởng sau thay đổi. Chạy `python3 scripts/check-agent-config.py` để kiểm tra symlink, skill và agent TOML. Copy nguyên cấu trúc chung khi chuyển project, không copy riêng một adapter.
