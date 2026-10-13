---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📖 Dễ đọc — Clean Code + Coding Convention"
---

# 📖 Dễ đọc — Clean Code + Coding Convention

**Nhóm quy tắc kết hợp**: Clean Code + Coding Convention

## Cách áp dụng

- **Tên rõ nghĩa**, không viết tắt trừ thuật ngữ chuẩn ngành (`id`, `url`): `user` thay vì `usr`, `temporaryToken` thay vì `tmp`.
- **Hàm làm một việc**: tên cần chữ "và" (`validateAndSave`) để mô tả → tách nhỏ hơn.
- **Format thống nhất** với codebase hiện có — không áp đặt style cá nhân.
- **Early return** để tránh lồng `if/else` sâu.
- Quy tắc viết comment nằm trong [`comments.md`](./comments.md).

```javascript
// ❌ function p(u) { if (u) { if (u.a) return u.n; } }
// ✅
function getUserDisplayName(user) {
  if (!user || !user.isActive) return null;
  return user.name;
}
```
