# Mẫu Báo Cáo Kế Hoạch (Plan Summary)

Dùng ngay sau khi agent [`planner-agent`](../../../agents/planner-agent.md) `Write` xong plan JSON trong `docs/plans/`, trước khi dừng chờ người dùng duyệt. Copy khối dưới đây và điền — không chép lại nguyên văn plan, chỉ tóm tắt để duyệt nhanh.

```markdown

## 📐 Báo cáo kế hoạch

**Phạm vi**: [tên tính năng/plan] — **File**: `[docs/plans/<title-slug>-<yyyyMMdd>.json]`

| Mục | Số lượng |
|---|---|
| Yêu cầu (REQ/BR) | [N] |
| Task | [N] (P0: [n], P1: [n], P2: [n]) |
| Câu hỏi mở cần chốt | [N] |
| Rủi ro còn lại | [N] |

### Câu hỏi mở cần chốt (nếu có — dùng bảng theo [rules/open-questions-table](../../../rules/open-questions-table.md) khi ≥2 câu)

| # | Câu hỏi | Đề xuất mặc định |
|---|---|---|
| 1 | [câu hỏi] | [đề xuất, hoặc "Không có đề xuất — cần người dùng quyết"] |

### Rủi ro chính
- [rủi ro quan trọng nhất + mitigation, nếu có]

### Bước tiếp theo
- [ ] Chờ người dùng xác nhận câu hỏi mở (nếu có) và duyệt kế hoạch.
- [ ] Sau khi duyệt → giao `coding-agent` theo đúng `executionOrder` trong plan.
```
