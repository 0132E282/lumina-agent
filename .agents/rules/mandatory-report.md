---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 📊 Báo cáo bắt buộc — Qua skill report, mặc định ngắn gọn"
---

# 📊 Báo cáo bắt buộc — Qua skill `report`, mặc định ngắn gọn

**Phạm vi**: áp dụng cho **mọi** tác vụ hoàn thành (code, plan, review, test, audit...) — cả phiên chính khi tự `Edit`/`Write` trực tiếp (không qua subagent), và mọi subagent (`coding-agent`, `planner-agent`, `reviewer-agent`, `qa-tester-agent`, `workspace-auditor-agent`...).

## Cách áp dụng

- Hoàn thành một task có thay đổi/kết quả cụ thể → **bắt buộc xuất báo cáo bằng skill [`report`](../skills/report/SKILL.md)**, đúng loại tương ứng (change/plan/review/security/dependency/test) — không tự trình bày theo format tự do khác, không bỏ qua report rồi chỉ báo "xong".
- **Mặc định báo cáo ngắn gọn**: dùng skill report; phần liệt kê file/mục trong báo cáo repo dùng text theo mẫu dưới đây, mỗi file/mục một khối, không dùng bảng. Giữ `Path` là đường dẫn thực tế trong repo; bỏ `Title` và `Description`. Dưới mỗi file, nhóm nội dung theo `Đã sửa:`, `Đã thêm mới:` hoặc `Đã xóa:`; Nhóm có đúng một thay đổi thì ghi nội dung cùng hàng với nhãn, không dùng bullet, ví dụ `Đã sửa: [29](link): nội dung`. Nhóm có từ hai thay đổi trở lên thì đặt nhãn trên dòng riêng và liệt kê từng thay đổi bằng bullet. Nhóm không có thay đổi thì ẩn hoàn toàn. Khoảng dòng dùng link mở tại dòng đầu. Nhãn liên kết chỉ hiển thị số dòng hoặc khoảng dòng, ví dụ `3–27`; đường dẫn chỉ nằm trong đích Markdown `[3–27](/absolute/path/to/file:3)`, không viết thêm đường dẫn hay `file:dòng` trong ngoặc sau link. Mỗi thay đổi trong `Đã xóa:` phải nêu nội dung đã xóa và lý do xóa dựa trên thay đổi/yêu cầu thực tế, không suy đoán lý do. Chỉ hiển thị nhóm có thay đổi thực tế; áp dụng cùng cách cho file cũ có thêm nội dung mới. Quy định này ưu tiên hơn phần liệt kê dạng bảng trong template skill report.
- Các phần kiểm chứng, Big O, đánh giá và field chuyên biệt của từng loại report vẫn phải giữ khi áp dụng; không tự mở rộng thêm mục "Chi tiết thay đổi" khi người dùng chưa yêu cầu.
- Dùng dòng phân cách dài 80 dấu `-` ở đầu và cuối danh sách; giữa hai mục liên tiếp chỉ có **một dòng phân cách chung**, không lặp hai dòng gạch. Xuất ngoài code fence để liên kết bấm được. Đặt riêng dòng gạch trong inline code; các dòng nhãn dùng Markdown hard break bằng backslash cuối dòng. Trong từng bullet, ghi khoảng dòng thực tế dưới dạng link, ví dụ `[23-34](/absolute/path/to/file:23)`: nhãn hiển thị khoảng dòng, đích mở tại dòng đầu. Không đặt khoảng dòng trong đích link; dùng đường dẫn tuyệt đối và không bịa số dòng. Với file thêm mới/xóa, chỉ ghi link dòng khi có vị trí thực tế truy cập được.
- Chỉ viết phần chi tiết khi người dùng yêu cầu rõ ("chi tiết hơn", "xem code cụ thể", "giải thích kỹ phần nào") — không suy đoán người dùng muốn chi tiết.
- Áp dụng kể cả khi phiên chính tự `Edit`/`Write` trực tiếp mà không giao qua subagent — không chỉ riêng `coding-agent`/`planner-agent`.
- **Không áp dụng** khi task chỉ là trả lời câu hỏi/tra cứu thông tin, không có thay đổi/kết quả cần báo cáo.

Ví dụ báo cáo repo:

`--------------------------------------------------------------------------------`

Path: path/to/X

Đã sửa:

- [23-34](/absolute/path/to/X:23): Sửa điều kiện xử lý dữ liệu.
- [40-45](/absolute/path/to/X:40): Cập nhật thông báo kết quả.

Đã thêm mới: [50-58](/absolute/path/to/X:50): Bổ sung kiểm tra dữ liệu đầu vào.

`--------------------------------------------------------------------------------`

Path: path/to/Z

Đã thêm mới: [1-20](/absolute/path/to/Z:1): Thêm kiểm thử dữ liệu Y.

`--------------------------------------------------------------------------------`
