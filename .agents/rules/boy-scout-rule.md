---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🏕️ Cải thiện dần — Boy Scout Rule"
---

# 🏕️ Cải thiện dần — Boy Scout Rule

**Nhóm quy tắc kết hợp**: Boy Scout Rule

## Cách áp dụng

- "Để lại khu cắm trại sạch hơn lúc bạn đến" không cấp quyền mở rộng yêu cầu. Chỉ sửa hành vi được giao và phần kỹ thuật tối thiểu để thay đổi đó hoạt động.
- Không tự tiện dọn code, đổi hành vi, sửa component/page đang chạy hoặc mở rộng sang file/module khác, kể cả khi lỗi nằm ngay trong cùng function/block nhưng không thuộc yêu cầu.
- Nếu thay đổi ngoài phạm vi là cần thiết để hoàn thành đúng yêu cầu, dừng trước khi sửa phần đó; nêu file, thay đổi và tác động dự kiến, rồi xin người dùng chấp thuận. Có thể tiếp tục các phần độc lập đã được giao.

```javascript
// Task: fix bug tính sai discount trong hàm calculateTotal

// ✅ Hợp lý: chỉ sửa phép tính được yêu cầu
function calculateTotal(order) {
  const dr = order.isVip ? 0.2 : 0.1;
  return order.subtotal * (1 - dr);
}

// ❌ Vượt phạm vi: tiện tay đổi tên biến/refactor hoặc đổi hành vi khác không được yêu cầu
```

## Khi áp dụng

- Khi sửa file, chỉ dọn phần trùng với thay đổi đã được yêu cầu; không tạo thêm hunk cleanup riêng nếu người dùng chưa yêu cầu.
- Không dùng quy tắc này để biện minh cho việc refactor, cleanup hoặc đổi hành vi ngoài yêu cầu; nếu cần, hỏi người dùng trước.
