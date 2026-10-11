---
trigger: model_decision
description: "Áp dụng khi đọc, viết hoặc cập nhật tài liệu Markdown; đọc file đích trước khi sửa và duy trì mục lục khi tài liệu có nhiều heading"
---

# Đọc tài liệu và duy trì mục lục

## Tra cứu registry trước

- Mỗi agent phải đọc `docs/documentation-index.json` trước khi đọc hoặc viết docs, rồi tìm tài liệu phù hợp theo `title`, `url` hoặc `description`.
- Registry này chỉ quản lý file nằm trong `docs/`; không thêm README, AGENTS, CLAUDE, rule hoặc skill vào đây.
- Mỗi entry bắt buộc có `title`, `url` và `description`; dùng `url` tương đối từ gốc repo.
- Ưu tiên sửa tài liệu có `source_of_truth: true`; không tạo tài liệu mới nếu registry đã có entry phù hợp.
- Mỗi lần tạo hoặc sửa file trong `docs/`, cập nhật entry `title`, `url` và `description` trong `docs/documentation-index.json` cùng lượt; khi đổi tên hoặc xóa thì sửa/xóa entry tương ứng.

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
