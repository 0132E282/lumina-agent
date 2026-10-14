# Mẫu Báo Cáo Thay Đổi

Dùng sau khi hoàn tất task có thay đổi. Mỗi file thay đổi có một khối riêng theo đúng mẫu `Path`, `Title`, `Description`; đặt các khối trong code fence `text`. Sau danh sách file, chỉ ghi kiểm chứng, Big O khi áp dụng và đánh giá ngắn theo yêu cầu ở dưới. Không dùng bảng, đếm dòng hoặc thêm code cũ/mới nếu chưa được yêu cầu.

```text
--------------------------------------------------------------------------------
Path: path/to/file.ext
Title: Tiêu đề ngắn
Description: Nêu thay đổi và vấn đề được giải quyết.
--------------------------------------------------------------------------------
```

### Độ phức tạp thuật toán

> Chỉ áp dụng khi thay đổi có code hoặc luồng xử lý phụ thuộc dữ liệu. Với rule, skill, docs, template hoặc config thuần túy, ghi: **Không áp dụng — không có thuật toán/runtime phụ thuộc input; không suy diễn Big O từ việc agent đọc file.**

`n` là [kích thước input]. Before: time [O(...)], space [O(...)]. After: time [O(...)], space [O(...)]. Ghi allocation, preprocessing và căn cứ đo khi đáng kể. Với database, nêu số query, dạng `WHERE`/`JOIN`/`ORDER BY`, record quét/trả về và index/query plan. Không dùng số file cấu hình làm `n` của thuật toán ứng dụng.

### Kiểm chứng và đánh giá

- **Kiểm chứng**: `[lệnh]` — [kết quả thực tế]. Nêu giới hạn chưa kiểm tra nếu có.
- **Đánh giá**: [kết luận ngắn, trade-off và rủi ro còn lại; `Không có` nếu không có].

## Chỉ dùng khi người dùng yêu cầu rõ ("chi tiết hơn", "xem code cụ thể")

Chỉ thêm code cũ/mới hoặc giải thích chi tiết khi người dùng yêu cầu rõ.

```markdown

### Chi tiết thay đổi

#### 1. [Tên file]
**Dòng [X-Y]**: [mô tả thay đổi]

🔴 Code cũ:
```[lang]
// code cũ
```

🟢 Code mới:
```[lang]
// code mới
```

**Lý do**: [tại sao thay đổi — vấn đề nghiệp vụ/kỹ thuật nào được giải quyết]
```
