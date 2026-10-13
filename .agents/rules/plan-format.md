---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📋 Viết plan — JSON Schema + Task dạng bảng"
---

# 📋 Viết plan — JSON Schema + Task dạng bảng

**Phạm vi**: mở rộng riêng cho kế hoạch triển khai (implementation plan) do agent [`planner-agent`](../agents/planner-agent.md) xuất ra — không áp dụng cho report ([`rules/docs-sync`](./docs-sync.md) vẫn Markdown) hay tài liệu `system-design-agent`/`requirement-analysis-agent`.

## Cách áp dụng

- Kế hoạch triển khai ghi thành file **JSON hợp lệ** trong `docs/plans/` (mặc định `docs/plans/<title-slug>-<yyyyMMdd>.json`); file chi tiết có `title`, `description`, `tags`, `content`, `createdAt` theo `YYYY-MM-DD`. `content` chứa kế hoạch có cấu trúc theo schema bên dưới. Cập nhật `docs/plans/index.json` cùng lượt với entry chỉ gồm `title`, `description`, `tags`, `path`; description hướng dẫn AI khi nào nên tham khảo plan. Không dùng Markdown tự do hay bảng Markdown rời rạc làm plan.
- `tasks` là một **mảng object đồng nhất field** (dạng bảng): mọi task dùng đúng bộ field theo bảng dưới. Field không có dữ liệu để `null`/`[]`, không xóa key — giữ mọi task cùng cấu trúc để so sánh/truy vết được như một bảng thật.

| Field | Kiểu | Nội dung |
|---|---|---|
| `id` | string | `TASK-xxx` |
| `title` | string | Tên nêu rõ kết quả |
| `status` | enum | `TODO \| IN_PROGRESS \| BLOCKED \| DONE` |
| `priority` | enum | `P0 \| P1 \| P2` |
| `priorityReason` | string | Lý do ưu tiên |
| `requirements` | string[] | `REQ-xxx`/`BR-xxx` liên quan |
| `acceptanceCriteria` | string[] | `AC-xxx` liên quan |
| `inScope` | string | Trong phạm vi task |
| `outOfScope` | string | Ngoài phạm vi task |
| `dependencies` | string[] | `TASK-xxx` phụ thuộc, hoặc `[]` |
| `approach` | string | Hướng triển khai |
| `filesToChange` | object[] | Danh sách file repo-relative cần sửa; mỗi object có `path` và `changes` mô tả chính xác thay đổi dự kiến |
| `test` | string | Dữ liệu, thao tác, kết quả mong đợi |
| `doneWhen` | string | Điều kiện hoàn thành đo được |

- Các mục có nhiều bản ghi cùng cấu trúc khác (`requirements`, `acceptanceCriteria`, `traceability`, `remainingRisks`...) cũng là mảng object cùng field, theo nguyên tắc tương tự — xem bảng cấu trúc top-level ở [`agents/planner-agent.md`](../agents/planner-agent.md#định-dạng-kế-hoạch-đầu-ra).
- Mô tả dài (giải pháp kỹ thuật trong `technicalSolution`, ghi chú rủi ro) vẫn được phép là string nhiều dòng trong field tương ứng — JSON không ép mọi thứ thành bảng, chỉ ép phần có nhiều bản ghi cùng cấu trúc phải đồng nhất field.
- Ghi tuần tự theo từng phần (như định dạng kế hoạch đầu ra ở `agents/planner-agent.md`), nhưng mỗi lần `Write` phải là JSON hợp lệ — phần chưa làm để `null`/`[]`, không ghi JSON dở dang không parse được.

```json
// ❌ Markdown tự do — mỗi task một khối prose khác cấu trúc, khó tra cứu bằng field cố định
### TASK-001: Thêm API tạo đơn
- Trạng thái: TODO
- Ưu tiên: P0 — ảnh hưởng doanh thu

// ✅ JSON — tasks là mảng object đồng nhất field, đọc/tra cứu như một bảng
{
  "tasks": [
    {
      "id": "TASK-001",
      "title": "Thêm API tạo đơn",
      "status": "TODO",
      "priority": "P0",
      "priorityReason": "Ảnh hưởng doanh thu",
      "requirements": ["REQ-001"],
      "acceptanceCriteria": ["AC-001"],
      "inScope": "Tạo đơn qua API /orders",
      "outOfScope": "Thanh toán",
      "dependencies": [],
      "approach": "1. Validate input 2. Tạo transaction 3. Trả response",
      "filesToChange": [
        {"path": "src/orders/order.controller.ts", "changes": "Thêm POST /orders và gọi OrderService sau khi xác thực request."},
        {"path": "src/orders/order.service.ts", "changes": "Tạo đơn trong transaction và trả entity đã lưu."}
      ],
      "test": "POST /orders với payload hợp lệ/không hợp lệ",
      "doneWhen": "AC-001 pass, có test, không lỗi linter"
    }
  ]
}
```

## Khi áp dụng

- Agent `planner-agent` (hoặc agent khác được giao viết kế hoạch triển khai) đọc `docs/plans/index.json`, xuất plan JSON mới trong `docs/plans/`, rồi thêm/cập nhật mục lục. Mỗi task nêu file path cần sửa và thay đổi cụ thể; chỉ ghi path đã xác minh từ repository, điểm chưa xác định chuyển thành câu hỏi mở.
- `reviewer-agent` review plan, hoặc `coding-agent`/`/lumina:implement` đọc plan để biết task nào `TODO` — đọc đúng theo field JSON đã định nghĩa, không suy đoán cấu trúc tự do.
- **Không áp dụng** cho báo cáo thay đổi/review report của skill [`report`](../skills/report/SKILL.md) (vẫn Markdown) hay tài liệu `docs/system-design.md`/`docs/requirement-analysis.md` (không phải "plan", giữ Markdown).
