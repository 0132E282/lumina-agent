---
trigger: model_decision
description: "Kiểm soát độ phức tạp thuật toán, query/API, bộ nhớ và tài nguyên khi code hoặc review"
---

# Độ phức tạp và hiệu năng

- Với xử lý phụ thuộc dữ liệu, xác định `n`/`m`, time/space complexity, allocation và chi phí khởi tạo đáng kể. Phân tích vòng lặp theo kích thước từng tập; không suy `O(n²)` chỉ từ cú pháp lồng nhau.
- Kiểm tra query/API fan-out, N+1, dữ liệu tải vào RAM và retry không giới hạn. Với database, xét số query, filter/join/sort, cột đọc, index, pagination và record quét/trả về; dùng query log, profiler hoặc plan khi có thể.
- Xem số nhánh, độ dài hàm, tham số và độ sâu lồng nhau là tín hiệu review, không phải ngưỡng tự động từ chối hoặc lý do refactor ngoài phạm vi.
- Chọn giới hạn tài nguyên từ yêu cầu hoặc phép đo. Retry phải có timeout, số lần thử và điều kiện dừng.
- Không kết luận nhanh hơn nếu chưa đo. Khi review, ghi vị trí, điều kiện gây tải, tác động, bằng chứng và trade-off.

> Quy trình và định dạng báo cáo chi tiết: [`complexity-performance`](../skills/complexity-performance/SKILL.md). Nếu có database, kết hợp [`database`](../skills/database/SKILL.md).
