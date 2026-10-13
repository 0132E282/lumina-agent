---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🔐 An toàn dữ liệu — Phân quyền + Transaction"
---

# 🔐 An toàn dữ liệu — Phân quyền + Transaction

**Nhóm quy tắc kết hợp**: Phân quyền (Authorization) + Transaction

## Cách áp dụng

- **Luôn kiểm tra quyền ở backend** — không tin vào việc ẩn nút/route ở frontend như một biện pháp bảo mật. Client-side chỉ là UX, không phải authorization.
- Kiểm tra phân quyền **càng sớm càng tốt**, trước khi chạm dữ liệu, và đúng cấp độ: *resource nào, hành động nào, của ai*.
- **Dùng transaction** cho nhóm thao tác ghi phải **thành công hoặc thất bại cùng nhau** (trừ tiền A + cộng tiền B) — không để xảy ra trạng thái nửa vời.
- Không thực hiện side-effect không thể hoàn tác (gửi email, gọi API ngoài) **bên trong** transaction — nếu rollback, side-effect đó không rollback theo được.

```javascript
// ❌ Không transaction — có thể mất tiền nếu lỗi giữa chừng
await db.query("UPDATE accounts SET balance = balance - ? WHERE id = ?", [amount, fromId]);
await db.query("UPDATE accounts SET balance = balance + ? WHERE id = ?", [amount, toId]);

// ✅ Transaction đảm bảo tính toàn vẹn
await db.transaction(async (trx) => {
  await trx("accounts").where({ id: fromId }).decrement("balance", amount);
  await trx("accounts").where({ id: toId }).increment("balance", amount);
});
```
