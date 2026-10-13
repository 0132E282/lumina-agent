---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🧱 Dễ mở rộng — SOLID + Composition over Inheritance"
---

# 🧱 Dễ mở rộng — SOLID + Composition over Inheritance

**Nhóm quy tắc kết hợp**: SOLID + Composition over Inheritance

## Cách áp dụng

- **O (Open/Closed)**: mở rộng bằng code mới, không sửa code cũ đang chạy ổn định.
- **L (Liskov)**: subclass phải thay thế được superclass mà không phá vỡ hành vi.
- **I (Interface Segregation)**: interface nhỏ, chuyên biệt — không ép implement method không cần.
- **D (Dependency Inversion)**: phụ thuộc abstraction, không phụ thuộc class cụ thể.
- **Composition over Inheritance**: chỉ kế thừa khi quan hệ thật sự "is-a" và ổn định; cần tái dùng hành vi thì inject/compose nhiều object nhỏ thay vì xây cây kế thừa sâu.
- Dùng interface/DI **khi có nhu cầu thay thế thật** (ví dụ swap 2 payment provider) — không tạo interface "phòng xa" cho 1 implementation duy nhất (xem [simplicity.md](./simplicity.md)).

```javascript
// ❌ Kế thừa sâu: Penguin extends Bird nhưng move() throw lỗi — vi phạm LSP
// ✅ Composition + DI
class Bird {
  constructor(movement) { this.movement = movement; }
  move() { this.movement.move(); }
}
new Bird(new FlyBehavior());
new Bird(new SwimBehavior());
```
