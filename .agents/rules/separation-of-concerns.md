---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🧩 Tách trách nhiệm — SRP + Separation of Concerns"
---

# 🧩 Tách trách nhiệm — SRP + Separation of Concerns

**Nhóm quy tắc kết hợp**: SRP (Single Responsibility Principle) + Separation of Concerns

## Cách áp dụng

- Tách rõ 4 lớp trong một luồng xử lý request: **HTTP layer** (nhận request/trả response) → **Validation** (dữ liệu hợp lệ) → **Phân quyền** (được phép hành động không) → **Nghiệp vụ** (business logic, không biết gì về HTTP).
- Một class/function chỉ nên có **một lý do để thay đổi**. Sửa một tính năng mà phải động vào nhiều phần không liên quan → dấu hiệu vi phạm SRP.
- Business logic không phụ thuộc chi tiết framework/HTTP — để dễ test và tái dùng ở context khác (job nền, CLI).

```javascript
// ❌ Trộn lẫn mọi thứ trong controller
app.post("/orders", async (req, res) => {
  if (!req.body.items) return res.status(400).send("invalid");
  if (!req.user.canCreateOrder) return res.status(403).send("forbidden");
  const order = await db.orders.insert({ ...req.body, userId: req.user.id });
  res.json(order);
});

// ✅ Tách rõ từng lớp
app.post("/orders", authorize("order:create"), validate(orderSchema), async (req, res) => {
  res.json(await orderService.createOrder(req.user, req.body));
});
```
