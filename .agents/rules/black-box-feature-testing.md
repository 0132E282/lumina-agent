---
trigger: model_decision
description: "Áp dụng khi kiểm thử theo tính năng/module bằng kỹ thuật hộp đen và chạy nhiều module trong cùng một đợt"
---

# Kiểm thử hộp đen theo module/tính năng

## Phạm vi

- Chỉ áp dụng khi nhiệm vụ yêu cầu thiết kế hoặc thực thi test cho một hay nhiều module.
- Trong rule này, **một module tương ứng một tính năng/luồng** được kiểm thử.

## Nguyên tắc

- Thiết kế và đánh giá Pass/Fail từ yêu cầu/contract, input, output quan sát được và side effect được phép kiểm chứng.
- Không dùng implementation bên trong để quyết định kết quả hộp đen.
- Áp dụng phân vùng tương đương, giá trị biên, bảng quyết định, chuyển trạng thái hoặc pairwise khi phù hợp; mỗi case phải truy vết được về yêu cầu và input/output kỳ vọng.

## Lập lịch thực thi

- Đưa toàn bộ module trong phạm vi task vào scheduler cùng một đợt; không chạy tuần tự từng tính năng nếu không có dependency hoặc giới hạn môi trường rõ ràng.
- Trong mỗi module, runner/helper phải nhận toàn bộ danh sách case, chia đều và chạy đủ; không gọi thủ công từng case, không bỏ hoặc chạy trùng case.
- Worker pool được điều tiết theo CPU, memory, rate limit, database, session và fixture isolation. Giới hạn worker chỉ điều tiết tài nguyên, không được làm mất module/case.
- Module/case có phụ thuộc thứ tự, state chung hoặc cleanup chung phải gom vào dependency group và chạy theo thứ tự cần thiết; các module độc lập vẫn được lập lịch cùng đợt.

## Báo cáo

- Ghi rõ tổng module/tính năng và tổng test case đầu vào.
- Đối soát số case đã phân bổ, thực thi, Pass, Fail, Blocked, Skipped và Not Run; tổng số phải giải thích được, không tự đánh dấu Pass khi chưa chạy.
- Ghi lý do hạ concurrency, chạy tuần tự hoặc chưa chạy nếu có.
- Nếu có `docs/testcases/index.json`, đọc trước và ghi testcase/kết quả thực thi vào chính file đó; giữ ID và trạng thái các lần chạy trước, chỉ cập nhật kết quả có bằng chứng.
