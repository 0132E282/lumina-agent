---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: ❓ Câu hỏi mở — Bảng quyết định"
---

# ❓ Câu hỏi mở — Bảng quyết định

**Phạm vi**: áp dụng cho **mọi** agent/skill (không riêng `planner-agent`) khi cần người dùng chốt nhiều câu hỏi mở/giả định/quyết định trước khi tiếp tục — là quy ước trình bày trong hội thoại (chat), khác với [`rules/plan-format`](./plan-format.md) (định dạng file JSON của `planner-agent`).

## Cách áp dụng

- Có **từ 2 câu hỏi mở trở lên** cần người dùng xác nhận trước khi tiếp tục → trình bày bằng **bảng Markdown**, không liệt kê số thứ tự/bullet rời rạc từng câu.
- Cột tối thiểu: `#` | `Câu hỏi` | `Đề xuất mặc định` (nếu có đề xuất). Thêm `Lý do`/`Ảnh hưởng nếu chọn sai` khi quyết định đó rủi ro cao (tiền, mất dữ liệu, phân quyền — [`rules/data-safety`](./data-safety.md)).
- Chỉ có **1 câu hỏi duy nhất** thì không cần bảng — hỏi thẳng bằng câu bình thường.
- Không áp dụng cho `AskUserQuestion` hoặc tool hỏi có UI riêng của runtime — rule này chỉ áp dụng khi câu hỏi được viết ra dưới dạng văn bản/Markdown thuần (sub-agent trả chữ, hoặc runtime không có tool hỏi riêng).

```markdown
<!-- ❌ Liệt kê rời rạc, khó so sánh đề xuất với từng câu -->
1. Giữ song song customer_groups legacy hay thay hoàn toàn bằng Segment?
2. Segment tạo từ Sapo customer_group nên là static hay dynamic?
3. Mapping Sapo id ↔ Segment: tái dùng SapoCdpMappingStore hay cần bảng riêng?

<!-- ✅ Bảng quyết định — so sánh câu hỏi và đề xuất mặc định cùng lúc -->
| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| 1 | Giữ song song `customer_groups` legacy hay thay hoàn toàn bằng Segment? | Thay thế dần |
| 2 | Segment tạo từ Sapo customer_group nên là static hay dynamic? | Static |
| 3 | Mapping Sapo id ↔ Segment: tái dùng `SapoCdpMappingStore` hay cần bảng riêng? | Tái dùng mapping store |
```
