---
description: Review code hiện tại bằng skill open-code-review:review (OCR)
argument-hint: "[file/diff/PR cần review, tuỳ chọn — mặc định diff hiện tại]"
---

Dùng skill `open-code-review:review` (OpenCodeReview) để review phạm vi sau: $ARGUMENTS (nếu trống, review toàn bộ diff/thay đổi chưa commit hiện tại).

Nếu runtime không có skill/plugin OCR, dùng vai trò [`reviewer-agent`](../../agents/reviewer-agent.md) để review cùng phạm vi, báo rõ phương án đang dùng. Không yêu cầu cài plugin chỉ để thực hiện review thông thường; không báo đã chạy OCR nếu chưa chạy được.

Nếu đối tượng cần review là **kế hoạch (plan)** hoặc **test case** — không phải code — dùng agent [`reviewer-agent`](../../agents/reviewer-agent.md) thay vì skill này (OCR chỉ review code; `reviewer-agent` mới có tiêu chí riêng cho plan/test case).

Nếu yêu cầu là **security review** chuyên sâu (lỗ hổng, xác thực/phân quyền, upload, thanh toán...) — dùng skill [`review-web-security`](../../skills/review-web-security/SKILL.md) thay vì OCR (OCR review chất lượng code tổng quát, không có checklist bảo mật chuyên biệt).

Với code hoặc system design review, đọc `docs/reviews/index.json` trước, tìm bằng title/description/tags và mở report phù hợp qua path. Lưu JSON review chi tiết có `title`, `description`, `tags`, `content`, `createdAt`, `reviewType`, artifact/path, findings, mức độ, căn cứ và khuyến nghị vào `docs/reviews/<title-slug>-<yyyyMMdd>.json`; index chỉ có `title`, `description`, `tags`, `path`, trong đó description hướng dẫn AI khi nào nên tham khảo report. Chỉ tạo báo cáo review, không sửa artifact đang review.
