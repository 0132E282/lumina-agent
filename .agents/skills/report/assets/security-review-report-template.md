# Mẫu Báo Cáo Security Review

Dùng để trình bày lại kết quả đã review theo skill [`review-web-security`](../../review-web-security/SKILL.md) (mục "Định dạng báo cáo") — không tự review, không bịa thêm trường ngoài mẫu này.

```markdown

-------------

## 🔐 Báo cáo security review

**Tổng quan**: [X] lỗi đã xác nhận, mức cao nhất [Critical/High/Medium/Low], phạm vi đã review: [...]

-------------

### Finding #1 — [Tiêu đề]
- **Severity / Confidence**: [Critical/High/Medium/Low] / [Xác nhận | Cần xác minh]
- **Vị trí**: `path/to/file.ext:line` hoặc route
  ```[lang]
  // đoạn code tối thiểu, che dữ liệu nhạy cảm
  ```
- **Nguyên nhân gốc**: [luồng dữ liệu/quyền bị vi phạm]
- **Điều kiện khai thác**: [tiền đề + kịch bản tái hiện tối thiểu trong môi trường thử nghiệm]
- **Tác động**: [phạm vi dữ liệu/tài khoản/tenant bị ảnh hưởng]
- **Cách sửa**: [patch cụ thể hoặc hướng xử lý]
- **Kiểm thử hồi quy**: [case hợp lệ vẫn pass / case vượt quyền bị chặn / side effect cần tránh]
- **CWE/OWASP**: [mapping nếu xác minh được — bỏ qua nếu không chắc, không dùng mapping thay bằng chứng]

-------------

### Kết luận
- Đã kiểm thử: [...] | Chưa truy cập/chưa kiểm thử: [...] | Nghi vấn cần thêm dữ kiện: [...]
- Thứ tự xử lý đề xuất: [...]
```

Không có lỗi xác nhận → ghi "Chưa phát hiện lỗi trong phạm vi đã kiểm tra", không ghi "Không có lỗ hổng".
