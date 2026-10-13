---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: ⚙️ Backend — Contract + Nội dung + Bảo mật"
---

# ⚙️ Backend — Contract + Nội dung + Bảo mật

**Nhóm quy tắc kết hợp**: API Correctness + Content Lifecycle + Secure Data Handling

## Cách áp dụng

- **Theo stack và contract thật**: đọc schema, route, model/service và API contract trước khi sửa; tái sử dụng cấu trúc hiện có. Tách HTTP, validation, phân quyền và nghiệp vụ; không tự đổi kiến trúc hoặc phá contract ngoài phạm vi yêu cầu.
- **Khoanh phạm vi hành vi**: chỉ đổi endpoint, module và hành vi cần thiết cho yêu cầu. Giữ nguyên luồng đang hoạt động ngoài phạm vi. Nếu cần thay đổi contract, module dùng chung hoặc hành vi khác để triển khai, nêu file/tác động và xin người dùng chấp thuận trước khi sửa.
- **Quyền kiểm tra tại backend**: kiểm tra quyền trên từng tài nguyên/tenant, validate input tại boundary, allowlist field ghi và parameterize query. Không tin frontend đã kiểm tra quyền hoặc dữ liệu.
- **Vòng đời nội dung đúng**: API công khai chỉ trả nội dung đã xuất bản được phép truy cập; draft/preview cần quyền. Lịch đăng có timezone rõ và job chạy lại không tạo tác dụng trùng. Thao tác nhiều bước cần atomicity dùng transaction phù hợp.
- **URL và SEO nhất quán**: slug unique đúng phạm vi bằng constraint phù hợp; đổi slug giữ redirect theo yêu cầu, tránh loop/chain. Metadata có fallback từ dữ liệu thật; canonical dùng host/protocol tin cậy. Sitemap chỉ gồm URL canonical công khai, đã xuất bản, indexable; `lastmod` phản ánh cập nhật có ý nghĩa. Chỉ thêm đa ngôn ngữ/hreflang khi có phiên bản thật.
- **HTTP status đúng**: trả status theo contract; không bọc mọi lỗi trong 200. Phân biệt không tìm thấy, không có quyền, validation và lỗi server; trang gỡ vĩnh viễn/redirect theo chính sách URL. Không lộ stack trace hoặc secret ra response.
- **Không dùng robots để bảo mật**: robots.txt quản lý crawl; noindex quản lý index khi crawler đọc được. Trang riêng tư luôn cần xác thực/phân quyền.
- **Query và cache có giới hạn**: tránh N+1, phân trang có thứ tự ổn định, chọn field cần thiết và index theo truy vấn thật. Cache không lẫn tenant/quyền/ngôn ngữ; invalidate sau commit cho nội dung, metadata, sitemap và URL liên quan. Không kết luận nhanh hơn khi chưa đo.
- **Media và HTML an toàn**: kiểm tra quyền upload, kích thước và loại file thực tế; không cho file upload thực thi. Sanitize HTML không tin cậy bằng thư viện phù hợp, không lọc XSS bằng regex; giữ alt/biến thể ảnh theo contract.
- **Vận hành có kiểm soát**: timeout/retry có giới hạn, idempotency khi cần; log có ngữ cảnh nhưng không chứa secret/PII. Tuân thủ [database-read-only](./database-read-only.md) khi chạy migration, seed, ghi database hoặc flush cache; không tự thao tác production.

## Kiểm chứng

Kiểm tra contract/status, validation, quyền và truy cập chéo tenant nếu có; trạng thái publish/draft, đổi slug và cache invalidation nếu liên quan. Chạy test/lint/type check phù hợp theo [quality-assurance](./quality-assurance.md); ghi rõ phần chưa chạy hoặc chưa áp dụng vào database/deployment.

## Khi áp dụng

Khi viết, sửa hoặc review backend/API/CMS. Chỉ áp dụng mục liên quan đến task; không tự bổ sung CMS, SEO, media hoặc đa ngôn ngữ vào dự án không cần chúng. Quy trình chi tiết ở [coding-backend](../skills/coding-backend/SKILL.md); TypeScript tuân thủ [type-safety](./type-safety.md).
