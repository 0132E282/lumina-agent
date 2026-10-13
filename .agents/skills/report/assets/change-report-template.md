# Mẫu Báo Cáo Thay Đổi

Dùng ngay sau khi Edit/Write hoàn tất một task code. Copy khối dưới đây và điền vào — **đây là bản mặc định, dừng lại ở "Tóm tắt"**. Không tự thêm mục code cũ/mới hay giải thích quyết định kỹ thuật, kể cả khi thay đổi có vẻ đáng kể.

```markdown

## 📝 Báo cáo thay đổi

Tổng số file đã tạo/sửa/xóa: [N] file ([tóm tắt ngắn, ví dụ: 2 tạo mới, 3 sửa, 1 xóa])

| Trạng thái | File | Mô tả |
|---|---|---|
| Tạo / Sửa / Xóa | `path/to/file.ext` | [mô tả ngắn gọn thay đổi gì] |

### Tóm tắt
- ➕ Thêm mới: [số dòng/function]
- ✏️ Sửa đổi: [số dòng/function]
- ➖ Xóa bỏ: [số dòng/function] (nếu có)

### Độ phức tạp thuật toán

> Chỉ áp dụng khi thay đổi có code hoặc luồng xử lý phụ thuộc dữ liệu. Với rule, skill, docs, template hoặc config thuần túy, ghi: **Không áp dụng — không có thuật toán/runtime phụ thuộc input; không suy diễn Big O từ việc agent đọc file.**

| Phạm vi | Trước | Sau |
|---|---|---|
| Mỗi lần gọi — `file:function` | Time: [O(...)]; Space: [O(...)]; [ghi allocation nếu đáng kể] | Time: [O(...)]; Space: [O(...)]; [ghi allocation nếu đáng kể] |
| Khởi tạo / preprocessing | [O(...) hoặc `0`] | [O(...) — số lần chạy: [mỗi lần / một lần / Lazy]] |

**Căn cứ đo**: `n` là [kích thước input]. [Mô tả ngắn: số vòng lặp, lookup, traversal, sort, allocation; nếu có database: số query, dạng `WHERE`/`JOIN`/`ORDER BY`, record quét/trả về, index hoặc query plan]. Không dùng chi phí agent đọc tài liệu hoặc số lượng file cấu hình làm `n` của thuật toán ứng dụng.

### Hành vi và kiểm chứng

- **Hành vi giữ nguyên**: [input/output hoặc các case tương thích quan trọng]
- **Kiểm chứng**: `[lệnh]` — [kết quả thực tế, ví dụ: `0 error`, `0 warning mới`, `[X]/[Y] tests pass`]
- **Giới hạn**: [chưa chạy/chưa áp dụng hoặc `Không có`]

### Đánh giá của coding

- **Kết luận**: [Đạt / Đạt có điều kiện / Chưa đạt]
- **Trade-off**: [lợi ích chính và chi phí/đánh đổi]
- **Rủi ro còn lại**: [rủi ro cần theo dõi hoặc `Không có`]
- **Khuyến nghị**: [bước tiếp theo hoặc `Không cần`]
```

## Chỉ dùng khi người dùng yêu cầu rõ ("chi tiết hơn", "xem code cụ thể")

Thêm mục này **sau** khối trên, không thay cho nó:

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
