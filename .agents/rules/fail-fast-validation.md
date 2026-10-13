---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: ⛔ Kiểm soát lỗi — Fail Fast + Validation"
---

# ⛔ Kiểm soát lỗi — Fail Fast + Validation

**Nhóm quy tắc kết hợp**: Fail Fast + Validation

## Cách áp dụng

- Kiểm tra dữ liệu đầu vào và điều kiện nghiệp vụ **trước khi** ghi/sửa dữ liệu — không bắt đầu rồi mới phát hiện lỗi giữa chừng.
- **Fail fast**: điều kiện tiên quyết không thỏa → dừng ngay, trả lỗi rõ ràng — không chạy tiếp với dữ liệu không hợp lệ.
- Validate ở **boundary** (input người dùng, request client, response API ngoài) — không lặp lại validate ở mọi layer nội bộ, tin tưởng dữ liệu đã qua boundary.
- Thông báo lỗi **cụ thể, hữu ích** (field nào sai, vì sao sai) — không chỉ `"Invalid input"`.

```javascript
// ❌ Sửa dữ liệu trước, validate sau — có thể để lại state nửa vời
async function transferMoney(fromId, toId, amount) {
  await debit(fromId, amount);
  if (amount <= 0) throw new Error("invalid amount"); // quá trễ!
  await credit(toId, amount);
}

// ✅ Fail fast: validate toàn bộ trước khi chạm dữ liệu
async function transferMoney(fromId, toId, amount) {
  if (amount <= 0) throw new InvalidAmountError(amount);
  if (await getBalance(fromId) < amount) throw new InsufficientFundsError(fromId, amount);
  await debit(fromId, amount);
  await credit(toId, amount);
}
```
