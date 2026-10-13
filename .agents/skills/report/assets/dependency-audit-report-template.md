# Mẫu Báo Cáo Dependency Audit

Dùng sau khi skill [`dependency-audit`](../../dependency-audit/SKILL.md) chạy audit read-only. Copy khối dưới và điền — chỉ liệt kê lệnh để người dùng tự chạy, không tự upgrade.

```markdown

## 📦 Báo cáo dependency audit

**Ecosystem**: [npm/yarn/pnpm/composer/pip/cargo/go] — **Tool đã chạy**: `[npm audit / composer audit / pip-audit ...]`

| Package | Severity (theo tool) | Version hiện tại | Version fix tối thiểu | Loại thay đổi | Lệnh đề xuất |
|---|---|---|---|---|---|
| `pkg-name` | [critical/high/medium/low] | `x.y.z` | `x.y.z` | [patch/minor/major] | `npm install pkg@x.y.z` |

### Rủi ro breaking change (bản fix nhảy major)
- `pkg-name`: [mô tả thay đổi breaking, cần test lại phần nào trước khi upgrade]

### Không audit được
- [Package/ecosystem thiếu tool tương ứng — ghi rõ, không bịa kết quả]

**Đề xuất tiếp theo**: [liệt kê lệnh cụ thể, chờ người dùng tự chạy]
```
