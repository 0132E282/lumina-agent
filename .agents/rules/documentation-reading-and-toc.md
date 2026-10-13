---
trigger: model_decision
description: 'Áp dụng khi đọc, viết hoặc cập nhật tài liệu Markdown; đọc file đích trước khi sửa và duy trì mục lục khi tài liệu có nhiều heading'
---

# Đọc tài liệu và duy trì mục lục

## Tra cứu registry trước

- Mỗi agent phải đọc `index.json` trước khi đọc hoặc viết docs, rồi tìm tài liệu phù hợp theo `id`, `title`, `url`, `description` hoặc `tags`.
- Registry này chỉ quản lý file nằm trong `docs/`; không thêm README, AGENTS, CLAUDE, rule hoặc skill vào đây.
- Mỗi entry bắt buộc có `id`, `title`, `url`, `description` và `tags`.
- `id` phải duy nhất, ổn định, dạng kebab-case; giữ nguyên khi chỉ đổi title hoặc description.
- `url` tương đối từ thư mục `docs/`.
- `tags` là mảng từ khóa ngắn, chữ thường, ưu tiên kebab-case; mô tả chủ đề, loại tài liệu và công nghệ liên quan để AI tìm kiếm.
- Ưu tiên sửa tài liệu có `source_of_truth: true`; không tạo tài liệu mới nếu registry đã có entry phù hợp.
- Mỗi lần tạo hoặc sửa file trong `docs/`, cập nhật entry `id`, `title`, `url`, `description` và `tags` trong `index.json` cùng lượt; giữ `id` ổn định, khi đổi tên hoặc xóa thì cập nhật/xóa entry tương ứng.

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
