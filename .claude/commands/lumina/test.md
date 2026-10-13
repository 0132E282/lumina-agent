---
description: Phân tích yêu cầu, thiết kế và chạy test bằng agent qa-tester-agent
argument-hint: "<tính năng/luồng/bug cần kiểm thử>"
---

Giao cho agent `qa-tester-agent` kiểm thử: $ARGUMENTS

Agent đọc `docs/testcases/index.json` trước nếu có, giữ ID hiện hữu, thiết kế test case (phân vùng tương đương/giá trị biên/bảng quyết định/chuyển trạng thái), lưu case và kết quả thực thi tại file này. Case/suite mới ghi `title` + `createdAt`; lần chạy ghi `executedAt`; Pass/Fail chỉ ghi khi có bằng chứng. Agent truy vết bằng ma trận bao phủ, báo cáo bug kèm đánh giá rủi ro còn lại. Không tự triển khai tính năng mới, không tự sửa code ứng dụng để làm test đạt.
