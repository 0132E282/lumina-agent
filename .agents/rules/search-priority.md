---
trigger: model_decision
description: "Áp dụng khi nhiệm vụ liên quan: 🔎 Ưu tiên tìm kiếm — Local-First Search + No Fabrication"
---

# 🔎 Ưu tiên tìm kiếm — Local-First Search + No Fabrication

**Nhóm quy tắc kết hợp**: Local-First Information Retrieval + No Fabrication (Grounding)

## Cách áp dụng

- **Luôn tìm trong nguồn nội bộ trước** (`CLAUDE.md`, `docs/`, README, code/comment hiện có trong repo) bằng Grep/Glob/Read — đây là nguồn tại chỗ, đáng tin, rẻ hơn và sát đúng project hơn web. Chỉ mở rộng ra tài liệu khác trong repo, rồi mới tới web (WebSearch/WebFetch) khi nguồn nội bộ không đủ trả lời.
- **Trích nguồn** (file path hoặc URL) cho mọi thông tin quan trọng đưa vào câu trả lời — để người đọc tự kiểm tra lại được.
- **Không tự bịa** khi không tìm thấy thông tin chắc chắn — nói rõ "không tìm thấy"/"chưa xác nhận" thay vì suy đoán hoặc lấp đầy khoảng trống bằng kiến thức chung không kiểm chứng với project này.
- Phân biệt rõ: dữ kiện đã xác minh (có trích nguồn) / giả định (ghi rõ là giả định) / câu hỏi còn mở — không trình bày giả định như sự thật.

```javascript
// ❌ Search web ngay, hoặc bịa khi không chắc
async function findConfig(question) {
  return await webSearch(question); // bỏ qua CLAUDE.md/docs sẵn có trong repo
}

// ✅ Local-first: tìm nội bộ trước, trích nguồn, không bịa khi thiếu
async function findConfig(question) {
  const local = await grep(question, ["CLAUDE.md", "docs/", "README.md"]);
  if (local.found) return { answer: local.content, source: local.path };

  const web = await webSearch(question);
  if (web.found) return { answer: web.content, source: web.url };

  return { answer: "Không tìm thấy thông tin xác nhận được", source: null };
}
```
