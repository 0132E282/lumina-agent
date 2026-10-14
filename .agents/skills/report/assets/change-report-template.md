# Mẫu Báo Cáo Thay Đổi

Mỗi file là một mục giữ `Path`, không dùng `Title` hay `Description`. Nhóm nội dung theo `Đã sửa:`, `Đã thêm mới:` hoặc `Đã xóa:`; Nhóm có đúng một thay đổi thì ghi nội dung cùng hàng với nhãn, không dùng bullet, ví dụ `Đã sửa: [29](link): nội dung`. Nhóm có từ hai thay đổi trở lên thì đặt nhãn trên dòng riêng và liệt kê từng thay đổi bằng bullet. Nhóm không có thay đổi thì ẩn hoàn toàn. Nội dung có link khoảng dòng rồi dấu `:` và mô tả. Chỉ xuất nhóm có thay đổi thực tế, kể cả khi vừa sửa vừa thêm nội dung trong cùng file. Nhãn liên kết chỉ hiển thị số dòng hoặc khoảng dòng, ví dụ `3–27`; đường dẫn chỉ nằm trong đích Markdown `[3–27](/absolute/path/to/file:3)`, không viết thêm đường dẫn hay `file:dòng` trong ngoặc sau link. Nhãn link hiển thị khoảng dòng; đích dùng đường dẫn tuyệt đối và mở tại dòng đầu. Mỗi thay đổi trong `Đã xóa:` phải nêu nội dung đã xóa và lý do xóa dựa trên thay đổi/yêu cầu thực tế, không suy đoán lý do. Không bịa số dòng; nội dung xóa không còn vị trí truy cập được thì ghi mô tả kèm lý do, không tạo link giả.

Xuất ngoài code fence để link bấm được; riêng dòng gạch dùng inline code. Chừa dòng trống trước mỗi danh sách bullet. Dùng dòng 80 dấu `-` ở đầu và cuối danh sách file; giữa hai file chỉ có một dòng chung. Sau danh sách, ghi kiểm chứng, Big O khi áp dụng và đánh giá ngắn. Không dùng bảng, đếm dòng hoặc thêm code cũ/mới nếu chưa được yêu cầu.

`--------------------------------------------------------------------------------`

Path: path/to/file.ext

Đã sửa:

- [23-34](/absolute/path/to/file.ext:23): Nêu thay đổi và vấn đề được giải quyết.
- [40-45](/absolute/path/to/file.ext:40): Nêu thay đổi khác.

Đã thêm mới:

- [50-58](/absolute/path/to/file.ext:50): Nêu nội dung mới bổ sung.
- [60-65](/absolute/path/to/file.ext:60): Nêu nội dung mới khác.

Đã xóa: Xóa [nội dung đã xóa]. Lý do: [lý do thực tế].

`--------------------------------------------------------------------------------`

Path: path/to/new-file.ext

Đã thêm mới: [1-20](/absolute/path/to/new-file.ext:1): Nêu nội dung file mới.

`--------------------------------------------------------------------------------`

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
