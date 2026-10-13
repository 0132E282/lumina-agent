---
name: report
description: CHỈ tạo báo cáo (report), KHÔNG tự thực hiện review/phân tích code. (1) Báo cáo thay đổi/commit: file nào bị sửa, sửa gì, tại sao — dùng ngay sau khi hoàn thành một task code (Edit/Write) hoặc trước khi soạn commit. (2) Báo cáo kế hoạch: tóm tắt plan vừa `planner-agent` viết xong (số REQ/task/câu hỏi mở/rủi ro) trước khi chờ duyệt. (3) Báo cáo kết quả review: trình bày lại issue, mức độ nghiêm trọng, đề xuất xử lý, độ phức tạp Big O theo format chuẩn — dùng sau khi việc review/audit đã được thực hiện (bởi coding-agent hoặc skill review khác), không dùng skill này để tự đi tìm lỗi.
license: MIT
metadata:
  version: "1.5"
---

# 📊 Report

Skill này **chỉ format và xuất báo cáo** — không tự đi tìm lỗi, không tự đánh giá chất lượng code. Việc review/phân tích là của subagent [`coding-agent`](../../agents/coding-agent.md) hoặc một skill review khác; skill này nhận kết quả đó (hoặc diff/thay đổi đã làm) và trình bày lại theo format chuẩn, dễ đọc, dễ copy vào PR/commit.

| Loại báo cáo | Input là gì | Dùng khi | Template |
|---|---|---|---|
| **Báo cáo thay đổi/commit** | Danh sách file + diff vừa Edit/Write | Vừa sửa code xong, hoặc trước khi soạn commit message | [`assets/change-report-template.md`](./assets/change-report-template.md) |
| **Báo cáo kế hoạch (Plan Summary)** | Plan JSON vừa ghi trong `docs/plans/` | Agent `planner-agent` vừa xong một plan, trước khi dừng chờ duyệt | [`assets/plan-summary-report-template.md`](./assets/plan-summary-report-template.md) |
| **Báo cáo kết quả review** | Finding đã có sẵn — code, plan (`planner-agent`/`system-design-agent`) hoặc test case (`qa-tester-agent`) | Sau khi agent `reviewer-agent` (hoặc coding-agent tự review) đã xong, cần trình bày lại | [`assets/review-report-template.md`](./assets/review-report-template.md) |
| **Báo cáo security review** | Finding đã có sẵn từ skill `review-web-security` | Sau khi security review xong — format riêng vì có field confidence/exploit condition/CWE mà bảng review thường không cần | [`assets/security-review-report-template.md`](./assets/security-review-report-template.md) |
| **Báo cáo dependency audit** | Kết quả audit đã có sẵn từ skill `dependency-audit` | Sau khi audit dependency xong, cần trình bày danh sách lỗ hổng + lệnh đề xuất | [`assets/dependency-audit-report-template.md`](./assets/dependency-audit-report-template.md) |
| **Báo cáo test (digest)** | Kết quả đã thiết kế/thực thi từ agent `qa-tester-agent` | Cần bản tóm tắt ngắn để copy vào PR/commit, không cần nguyên văn chi tiết của `qa-tester-agent` | [`assets/qa-test-report-template.md`](./assets/qa-test-report-template.md) |
| **Báo cáo Bug/Feedback** | Bug/feedback phát hiện trong lúc làm việc (không phải kết quả review có sẵn, không phải bug ứng dụng từ test case) | Ghi nhận nhanh: type, title, url (vị trí cần sửa), description | [`assets/bug-feedback-report-template.md`](./assets/bug-feedback-report-template.md) |

Tất cả bắt buộc theo [quality-assurance.md](../../rules/quality-assurance.md) — báo cáo là bước cuối, không được bỏ qua.

Các report dùng đúng template tương ứng. Riêng **Review Report** bắt buộc dùng format text trong `assets/review-report-template.md`, không dùng pipe-table; các template khác giữ cấu trúc riêng đã định nghĩa.

## 1. Báo cáo thay đổi (Change Report)

Copy khung `assets/change-report-template.md`, điền bảng tóm tắt `Trạng thái (Tạo/Sửa/Xóa) | File | Mô tả` cho toàn bộ file đổi + mục Tóm tắt. Với báo cáo kết quả của task coding/sửa code, đọc và áp dụng skill [`complexity-performance`](../complexity-performance/SKILL.md) trước khi format report; nếu có query/database, kết hợp thêm skill [`database`](../database/SKILL.md). **Chỉ khi thay đổi có code hoặc luồng xử lý phụ thuộc dữ liệu** mới phân tích Big O Before/After: time complexity, space complexity, allocation nếu đáng kể và chi phí khởi tạo/preprocessing (ghi rõ số lần chạy hoặc Lazy). Nêu `n`, `m` và căn cứ đo; với rule, skill, docs, template hoặc config thuần túy, ghi `Không áp dụng — không có thuật toán/runtime phụ thuộc input`, không bịa Big O từ việc agent đọc file hoặc số lượng file. Báo cáo cũng phải ghi hành vi giữ nguyên, lệnh kiểm chứng và kết quả thực tế; nếu chưa chạy thì ghi rõ; cuối cùng phải có **Đánh giá của coding** gồm kết luận, trade-off, rủi ro còn lại và khuyến nghị. **Mặc định dừng ở khung báo cáo này — không thêm code cũ/mới** dù thay đổi có vẻ đáng kể; chỉ thêm chi tiết đó khi người dùng yêu cầu rõ. Chỉ liệt kê những gì **thật sự thay đổi**, không diễn giải lại toàn bộ file; phần "Mô tả" trả lời *"vấn đề gì đang được giải quyết"* ([commit-discipline.md](../../rules/commit-discipline.md) — body commit có thể lấy thẳng từ đó).

## 2. Báo cáo kế hoạch (Plan Summary)

Copy khung `assets/plan-summary-report-template.md`, điền ngay sau khi `planner-agent` `Write` xong plan JSON trong `docs/plans/`: số REQ/task/câu hỏi mở/rủi ro, bảng câu hỏi mở cần chốt (nếu ≥2 câu — theo [rules/open-questions-table](../../rules/open-questions-table.md)), rủi ro chính, bước tiếp theo. Không chép lại nguyên văn plan — chỉ tóm tắt để người dùng duyệt nhanh.

## 3. Báo cáo kết quả review (Review Report)

Trình bày lại kết quả review **đã có** (do agent `reviewer-agent`, `coding-agent` tự review, hoặc con người cung cấp) — không tự review. Dùng chung cho cả 3 loại artifact `reviewer-agent` review (code/plan/test case). Copy khung text `assets/review-report-template.md`, gồm:

- **4 mức nghiêm trọng** (bắt buộc dùng đúng khi phân loại lại finding): CRITICAL 🚨 (lỗi logic nặng/bảo mật/crash), WARNING ⚠️ (code smell/hiệu năng/thiếu edge case), SUGGESTION 💡 (gợi ý refactor nhỏ), GOOD ✅ (giải pháp tốt, nên nhân rộng).
- Mỗi finding ghi dạng text: `File`, `Type`, `Severity`, `Big O`, `Chi tiết`, `Đề xuất`, `Kiểm chứng`.
- Với review code có xử lý phụ thuộc dữ liệu, Big O bắt buộc ghi Time/Space Before/After, `n`/`m`, query/API/I/O và preprocessing nếu có; không liên quan runtime thì ghi `N/A — không áp dụng`.
- **Thống kê cuối**: số `Issue`, `Suggestion`, `Good` và finding chưa kiểm chứng.

## 4. Báo cáo chuyên biệt (security, dependency, test)

Ba loại còn lại trong bảng trên có **field riêng không fit khung review chung** — copy đúng template tương ứng, không gộp vào `review-report-template.md`:

- **Security**: 9 field bắt buộc theo đúng mục "Định dạng báo cáo" của skill [`review-web-security`](../review-web-security/SKILL.md) (severity+confidence, điều kiện khai thác, CWE/OWASP...).
- **Dependency audit**: package/severity theo tool/version hiện tại→fix/loại thay đổi/lệnh đề xuất — không tự chạy lệnh, chỉ đề xuất.
- **Test (digest)**: bản tóm tắt từ kết quả `qa-tester-agent`, không thay thế ma trận bao phủ hay bug report chi tiết mà agent đó đã tạo riêng.

## 5. Báo cáo Bug/Feedback

Copy khung `assets/bug-feedback-report-template.md`, điền đúng 3 dòng dạng `Field: nội dung` (**ngoại lệ duy nhất không dùng pipe-table** — đơn giản hơn cho ghi chú nhanh): `Title` (dạng `[Type] tiêu đề` — Type tự do, không ràng buộc enum cố định), `URL` (vị trí cần sửa — `file:dòng`, URL, hoặc "chưa xác định"), `Description` (hiện tượng + đã làm gì). Dùng cho bug/feedback phát hiện ngẫu nhiên trong lúc làm việc — **không** thay thế mẫu bug report chi tiết của `qa-tester-agent` (phát hiện qua test case có severity/priority/bước tái hiện riêng) hay draft của tool `SendFeedback` (về chính Claude Code).

## Khi áp dụng

- Báo cáo thay đổi/commit: ngay sau khi hoàn thành một task Edit/Write, trước khi báo "xong" hoặc trước khi soạn commit message (xem [git-workflow](../git-workflow/SKILL.md)).
- Báo cáo kế hoạch: ngay sau khi `planner-agent` `Write` xong plan JSON trong `docs/plans/`, trước khi dừng chờ người dùng duyệt.
- Báo cáo review/security/dependency/test: ngay sau khi việc tương ứng đã hoàn tất (ở nơi khác) và cần trình bày lại kết quả — không dùng skill này để tự thực hiện review/audit/test.
- Báo cáo Bug/Feedback: ngay khi phát hiện một vấn đề ngoài phạm vi task chính đang làm, cần ghi lại nhanh để không quên.
