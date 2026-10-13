---
trigger: model_decision
description: 'Áp dụng khi đọc, viết hoặc cập nhật tài liệu Markdown; đọc file đích trước khi sửa và duy trì mục lục khi tài liệu có nhiều heading'
---

# Đọc tài liệu và duy trì mục lục

## Tra cứu registry trước

- Mỗi agent phải đọc `index.json` phù hợp trước khi đọc hoặc viết tài liệu; dùng `title`, `description`, `tags` để tìm tài liệu và mở file chi tiết qua `path` khi phù hợp.
- Mỗi entry menu/catalog chỉ gồm `title`, `description`, `tags`, `path`. `path` tương đối từ gốc repository. Không thêm `id`, `url`, `content` hoặc ngày tạo vào entry.
- File Markdown chi tiết phải có đủ `title`, `description`, `tags`, `content` (metadata title/description/tags trong frontmatter, phần thân Markdown là content). Plan/review JSON cũng giữ metadata và nội dung đầy đủ trong file chi tiết theo schema riêng.
- `docs/index.json` chỉ catalog tài liệu Markdown. Không đưa plan/testcase/review JSON vào catalog này.
- `docs/plans/index.json` là menu tài liệu theo schema chung `title`, `description`, `tags`, `path`; description nêu khi nào AI nên tham khảo plan. Metadata và nội dung plan đầy đủ nằm trong file JSON chi tiết.
- `docs/repo/index.json` là mục lục con cho testcase cấp repo trong `docs/repo/`; mỗi entry chỉ gồm `title`, `description`, `tags`, `path`. Description hướng dẫn AI chọn testcase phù hợp, nội dung đầy đủ nằm trong file Markdown. Nếu chưa có menu, tạo JSON array rỗng trước khi thêm entry.
- `docs/testcases/index.json` là nguồn dữ liệu testcase và kết quả thực thi, không phải menu file. Đọc trước khi thêm/sửa case; giữ ID ổn định, ghi `createdAt` cho suite/case mới và chỉ cập nhật trạng thái/kết quả/evidence sau lần chạy thật.
- `docs/reviews/index.json` là menu tài liệu theo schema chung `title`, `description`, `tags`, `path`; description nêu loại review và khi nào AI nên tham khảo. Findings và nội dung review nằm trong file JSON chi tiết.
- Tên file JSON plan/review dùng `<title-slug>-<yyyyMMdd>.json`; file có `title` và `createdAt` (`YYYY-MM-DD`). Không suy ra ngày tạo cho artifact cũ nếu không có nguồn xác minh.
- Các catalog chỉ quản lý nội dung trong `docs/`; không thêm README, AGENTS, CLAUDE, rule hoặc skill vào đó.
- Trong mọi `index.json` dạng menu, `tags` là mảng từ khóa ngắn, chữ thường, ưu tiên kebab-case; description giúp AI quyết định có nên mở file chi tiết hay không. `docs/index.json` entry chỉ có `title`, `description`, `tags`, `path`; `content` nằm trong file `.md` được trỏ tới.
- Ưu tiên cập nhật file chi tiết hiện có nếu đã có entry phù hợp; tránh tạo tài liệu trùng.
- Khi tạo/sửa Markdown, cập nhật `docs/index.json`; khi tạo/sửa plan, cập nhật `docs/plans/index.json`; khi tạo testcase cấp repo, cập nhật `docs/repo/index.json` và `docs/index.json`; khi tạo/sửa testcase hoặc kết quả chạy theo feature, cập nhật `docs/testcases/index.json`; khi tạo/sửa review, cập nhật `docs/reviews/index.json` cùng lượt.

## Đọc trước khi sửa

- Trước khi cập nhật tài liệu, đọc toàn bộ file đích trong phạm vi có thể ảnh hưởng; không chỉ đọc đoạn định sửa rồi kết luận về cấu trúc hoặc nội dung.
- Đọc thêm file nguồn, tài liệu liên kết và convention liên quan khi chúng quyết định nội dung cần sửa.
- Nếu file quá lớn, generated hoặc không thể đọc hết, ghi rõ phạm vi đã đọc và phần chưa kiểm tra; không giả định phần còn lại.

## Mục lục Markdown

- Với file Markdown có từ **3 heading cấp 2 trở lên**, thêm hoặc cập nhật mục `## Mục lục`/`## Table of Contents` ngay sau phần giới thiệu ngắn.
- Mục lục chỉ liệt kê heading điều hướng chính, dùng anchor Markdown hợp lệ và giữ thứ tự đúng với nội dung.
- Khi thêm, đổi tên, xóa hoặc di chuyển heading, cập nhật mục lục trong cùng lượt; không để link mục lục hỏng hoặc trỏ tới tiêu đề cũ.
- File ngắn, chỉ có 1–2 heading cấp 2, template fragment hoặc tài liệu có convention mục lục riêng có thể không cần mục lục; ghi rõ `Không áp dụng` nếu cần giải thích.
- Không tạo mục lục lồng quá sâu hoặc lặp toàn bộ heading chi tiết nếu làm tăng context mà không giúp điều hướng.

## Kiểm chứng

- Kiểm tra heading và anchor sau khi sửa; rà link nội bộ nếu công cụ kiểm tra có sẵn.
- Báo cáo file đã đọc, mục lục đã tạo/cập nhật hoặc lý do không áp dụng, cùng phần chưa kiểm tra nếu có.
