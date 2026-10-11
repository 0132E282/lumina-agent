---
name: docs
description: Viết hoặc đồng bộ tài liệu dự án (README.md, CLAUDE.md, docs/) — (1) ĐỒNG BỘ khi đã có tài liệu, đối chiếu với trạng thái THỰC TẾ của codebase, phát hiện phần lỗi thời/sai và sửa lại; (2) VIẾT MỚI khi project/module chưa có gì để đối chiếu — quét stack/lệnh/convention thật rồi viết gọn, giống `/init` nhưng tối ưu hơn (không liệt kê dư). Mặc định viết theo chế độ AI-readable để agent đọc và truy vết; chỉ dùng human-readable khi người dùng yêu cầu tài liệu cho người đọc. Khi tài liệu cần sơ đồ cấu trúc, ERD hoặc user/system flow, kết hợp skill `system-diagrams`; không dùng `docs` để tự thiết kế HLD/LLD mới.
license: MIT
metadata:
  version: '1.3'
---

# 🔄 Docs

Hai chế độ cho tài liệu dự án (README.md, CLAUDE.md, docs/) — không phải đặc tả kiến trúc hệ thống (xem [`system-design-agent`](../../agents/system-design-agent.md), skill này không tự thiết kế HLD/LLD). Khi cần sơ đồ, dùng [`system-diagrams`](../system-diagrams/SKILL.md). Mọi kết luận "đúng/sai" hoặc nội dung viết mới phải có bằng chứng (đọc file, Glob, Grep), theo [`rules/search-priority`](../../rules/search-priority.md) — không bịa lệnh/convention chưa xác minh.

Khi đọc hoặc sửa file trong `docs/`, agent phải đọc `index.json` trước để tìm entry theo `title`, `url`, `description`, rồi áp dụng thêm rule [`documentation-reading-and-toc`](../../rules/documentation-reading-and-toc.md). Mỗi lần viết/sửa docs phải cập nhật index cùng lượt. Registry không quản lý README, AGENTS, CLAUDE, rule hoặc skill.

## Hai chế độ đọc tài liệu

### AI-readable — mặc định

- Viết ngắn, có cấu trúc ổn định, heading rõ; chỉ giữ thông tin cần cho quyết định hoặc bước tiếp theo.
- Ưu tiên facts, path/file/dòng, contract, input/output, dependency, điều kiện và kết quả kiểm chứng.
- Dùng sơ đồ Mermaid khi có quan hệ/flow phức tạp; không lặp lại toàn bộ sơ đồ bằng prose.
- Gắn nhãn rõ `Đã xác minh`, `Giả định`, `Chưa kiểm tra`, `Không áp dụng`.
- Không thêm lời dẫn marketing, ví dụ trang trí hoặc diễn giải dài không giúp agent ra quyết định.
- Chỉ đọc và ghi phần liên quan task; không dump toàn repo, log dài, file đã biết không ảnh hưởng hoặc lịch sử không cần thiết.
- Tóm tắt một lần ở nguồn chuẩn, nơi khác chỉ link tới nguồn đó; không sao chép cùng một contract/flow vào nhiều tài liệu.
- Dùng progressive disclosure: lớp đầu là mục tiêu, trạng thái, rủi ro và đường dẫn; chi tiết schema/query/implementation chỉ mở khi task cần.
- Ưu tiên bullet ngắn và bảng nhỏ; mỗi mục trả lời một câu hỏi, bỏ mục không áp dụng thay vì để placeholder dài.

### Human-readable — chỉ khi được yêu cầu

- Viết giải thích theo ngữ cảnh người đọc, có thể thêm narrative, ví dụ, glossary và hướng dẫn từng bước.
- Vẫn giữ path, nguồn kiểm chứng, cảnh báo và trạng thái chưa xác minh; không hy sinh tính chính xác để văn phong dễ đọc.
- Có thể diễn giải lại sơ đồ bằng prose nếu người đọc cần hướng dẫn tuần tự.

Nếu không được chỉ định đối tượng đọc, luôn chọn `AI-readable` và tối ưu cho context nhỏ nhất đủ dùng.

## Giảm tải đọc hiểu bằng sơ đồ

- Khi tài liệu có từ 3 thành phần liên quan, luồng nhiều bước, hierarchy hoặc dependency khó đọc tuyến tính, ưu tiên dùng sơ đồ Mermaid để AI và người đọc nắm quan hệ nhanh hơn.
- Dùng sơ đồ cho quan hệ, ownership, sequence, boundary và dependency; dùng văn bản cho mục đích, assumption, constraint, caveat và chi tiết không thể hiện tốt bằng hình.
- Không lặp lại toàn bộ nội dung sơ đồ bằng prose. Sau sơ đồ chỉ ghi kết luận, điểm dễ nhầm và nguồn kiểm chứng.
- Sơ đồ phải có nhãn ngắn, ít node cần thiết và phân biệt `Đã xác minh`/`Giả định`; nếu sơ đồ làm tài liệu khó đọc hơn thì giữ bản text ngắn và ghi lý do.

## Chế độ 1 — Đồng bộ (đã có tài liệu)

Phạm vi mặc định: `README.md`, `CLAUDE.md` (nếu có), `docs/**/*.md` (nếu có). Người dùng có thể giới hạn vào một file cụ thể.

1. Trích "claim" kiểm chứng được: đường dẫn, tên agent/skill/command/hook, số lượng/liệt kê, mô tả hành vi cụ thể.
2. Đối chiếu từng claim với thực tế: đường dẫn → `Glob`; tên agent/skill/command → danh sách thật trong `.claude/agents|skills|commands/` (đọc frontmatter, không suy diễn); mô tả hành vi → đọc đúng file nguồn để so khớp.
3. Phân loại: **sai rõ ràng** (file không còn tồn tại, tên đổi, số liệu sai) → sửa ngay theo thực tế vừa đọc; **không chắc** (mơ hồ, không kiểm chứng trực tiếp được) → không tự xóa, đưa vào "cần hỏi thêm" (giống cách [`workspace-auditor-agent`](../../agents/workspace-auditor-agent.md) xử lý phần không chắc).
4. Sửa trực tiếp phần đã xác nhận sai, giữ văn phong/cấu trúc tài liệu — không viết lại toàn bộ file, không tự thêm tính năng/mục mới ngoài việc sửa đúng-sai ([`rules/simplicity`](../../rules/simplicity.md)).
5. Báo cáo theo `change-report-template.md` của skill [`report`](../report/SKILL.md): mỗi chỗ sửa ghi _trước → sau_ + bằng chứng, cộng danh sách "cần hỏi thêm" nếu có.

## Chế độ 2 — Viết mới (chưa có gì để đối chiếu)

Dùng khi project/module/feature chưa có CLAUDE.md/README, cần viết lần đầu — tương tự lệnh `/init` có sẵn nhưng **gọn và tối ưu hơn**: chỉ ghi điều thực sự cần để làm việc hiệu quả trong repo, không liệt kê toàn bộ cấu trúc file hay lặp lại thông tin Glob/Grep tự tra được.

1. Xác định stack/ngôn ngữ chính từ file manifest thật (`package.json`, `composer.json`, `pyproject.toml`, `go.mod`...) — không đoán theo tên thư mục.
2. Đọc lệnh dev/build/test/lint **thật đang dùng** (scripts trong manifest, `Makefile`, CI config) — chỉ ghi lệnh đã xác minh tồn tại, không bịa lệnh "thường gặp" của stack đó.
3. Đọc vài file mẫu đại diện (không phải toàn bộ codebase) để rút convention thật đang áp dụng — quy ước đặt tên, cấu trúc module lặp lại, test pattern — không áp khung convention chung của stack khi code thật làm khác.
4. Viết theo cấu trúc gọn, mỗi mục một đoạn ngắn, bỏ mục không áp dụng kèm lý do thay vì để trống:
   - **Mục đích dự án** (1–2 câu).
   - **Cấu trúc thư mục chính** — chỉ cấp cao mang ý nghĩa điều hướng, không liệt kê từng file.
   - **Lệnh thường dùng** (dev/build/test/lint) — chỉ lệnh đã xác minh chạy được.
   - **Convention quan trọng cần biết trước khi sửa code** — quy ước/rule bắt buộc nếu có, pattern lặp lại thật đang dùng.
5. Không tự thiết kế kiến trúc hệ thống (HLD/LLD) — phần đó thuộc agent [`system-design-agent`](../../agents/system-design-agent.md). Nếu chỉ cần minh họa cấu trúc/flow đã có trong codebase, dùng [`system-diagrams`](../system-diagrams/SKILL.md).

## Khi áp dụng

- **Đồng bộ**: ngay sau khi xóa/đổi tên/thêm agent-skill-command, đổi cấu trúc thư mục lớn, hoặc khi nghi ngờ docs lỗi thời.
- **Viết mới**: project/module/feature chưa có CLAUDE.md/README, cần viết lần đầu một cách gọn gàng.
- Không dùng cho đặc tả kiến trúc hệ thống (HLD/LLD); sơ đồ mô tả hệ thống hiện có thì kết hợp skill `system-diagrams`.
