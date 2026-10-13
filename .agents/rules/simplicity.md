---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🎯 Đơn giản — KISS + YAGNI"
---

# 🎯 Đơn giản — KISS + YAGNI

**Nhóm quy tắc kết hợp**: KISS + YAGNI (You Ain't Gonna Need It)

## Cách áp dụng

- Chọn **giải pháp đơn giản nhất** đáp ứng đúng yêu cầu hiện tại — không thêm config/interface/layer trừu tượng cho nhu cầu *giả định* tương lai.
- Xác định phạm vi theo yêu cầu người dùng hoặc task đã được duyệt. Chỉ sửa file và hành vi cần thiết để hoàn thành phạm vi đó; không tự tiện sửa page/component đang hoạt động ở phần không được yêu cầu.
- Khi phát hiện lỗi, cải thiện hoặc nhu cầu thay đổi hành vi ngoài phạm vi, ghi rõ file, tác động và lý do cần sửa rồi hỏi người dùng trước khi thay đổi phần đó. Có thể tiếp tục phần độc lập đã được giao; không dùng việc phát hiện vấn đề làm lý do chặn phần không liên quan.
- Không coi sửa “nhỏ”, làm sạch, đồng bộ giao diện, accessibility, tối ưu hay tuân thủ convention là sự cho phép ngầm nếu chúng làm đổi hành vi hoặc phạm vi yêu cầu.
- Ba dòng lặp lại còn tốt hơn một abstraction sinh non "phòng khi cần mở rộng".
- Giải pháp cần vẽ sơ đồ mới giải thích được → đang quá phức tạp, đơn giản hóa lại.

```javascript
// ❌ Factory + strategy pattern cho 2 loại discount cố định
class DiscountStrategyFactory { ... }
// ✅ KISS: xử lý trực tiếp
function calculateDiscount(order) {
  return order.total * (order.type === "VIP" ? 0.2 : 0.1);
}
```
