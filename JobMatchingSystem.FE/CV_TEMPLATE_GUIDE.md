# Hướng Dẫn Tạo Template CV Mới

Để hệ thống có thể tự động điền dữ liệu vào CV, file HTML template **bắt buộc** phải tuân thủ các quy tắc đặt tên biến (Placeholder) dưới đây.

## 1. Quy Tắc Chung
- File template phải là file **HTML** đơn lẻ (`.html`).
- CSS phải được viết **Inline** hoặc trong thẻ `<style>` nằm trong file HTML đó. Không dùng file CSS ngoài.
- Sử dụng các biến được bao bởi hai dấu ngoặc nhọn `{{VARIABLE_NAME}}`.

## 2. Danh Sách Biến (Placeholders)

### A. Thông Tin Cá Nhân (Bắt buộc)
| Biến | Ý nghĩa | Ghi chú |
| :--- | :--- | :--- |
| `{{FULL_NAME}}` | Họ và tên đầy đủ | Ví dụ: "Nguyễn Văn A" |
| `{{JOB_TITLE}}` | Chức danh / Role | Ví dụ: "Frontend Developer" |
| `{{EMAIL}}` | Email liên hệ | |
| `{{PHONE}}` | Số điện thoại | |
| `{{ADDRESS}}` | Địa chỉ | |
| `{{DATE_OF_BIRTH}}` | Ngày sinh | Định dạng: dd/MM/yyyy |
| `{{GENDER}}` | Giới tính | Nam/Nữ |
| `{{AVATAR_HTML}}` | Thẻ ảnh đại diện | Hệ thống tự sinh thẻ `<img>` hoặc `<div>` placeholder |

### B. Các Mục Danh Sách (Lists)
Các biến này sẽ được hệ thống thay thế bằng một đoạn mã HTML lặp lại (Loop).

| Biến | Ý nghĩa | Cấu trúc HTML sinh ra (mặc định) |
| :--- | :--- | :--- |
| `{{EXPERIENCES_LIST}}` | Kinh nghiệm làm việc | `<div class="cv-item">...</div>` |
| `{{PROJECTS_LIST}}` | Dự án nổi bật | `<div class="cv-item">...</div>` |
| `{{EDUCATIONS_LIST}}` | Học vấn | `<div class="cv-education-item">...</div>` |
| `{{CERTIFICATES_LIST}}` | Chứng chỉ | `<div class="cv-certificate-item">...</div>` |
| `{{ACHIEVEMENTS_LIST}}` | Giải thưởng | `<div class="cv-item">...</div>` |

---

## 3. Cấu Trúc HTML Mẫu Cho CSS

Để template hiển thị đẹp với dữ liệu được sinh ra từ hệ thống, bạn nên CSS cho các class sau trong thẻ `<style>` của file template:

### Class cho mục thông thường (Experience, Project, Achievement)
```css
.cv-item { margin-bottom: 15px; }
.cv-item-title { font-weight: bold; font-size: 16px; }
.cv-item-subtitle { font-style: italic; color: #555; display: flex; justify-content: space-between; }
.cv-date { font-size: 12px; }
.cv-description { margin-top: 5px; font-size: 14px; }
```

### Class cho mục Học vấn (Education)
```css
.cv-education-item { margin-bottom: 15px; }
.cv-education-school { font-weight: bold; }
.cv-education-degree { font-style: italic; }
```

### Class cho mục Chứng chỉ (Certificate)
```css
.cv-certificate-item { margin-bottom: 10px; }
.cv-certificate-name { font-weight: bold; }
/* Thẻ a link chứng chỉ */
.cv-link { color: blue; text-decoration: none; font-size: 12px; }
```

---

## 4. Quy trình upload template mới
1. Tạo file `.html` theo quy tắc trên.
2. Mở thử file trên trình duyệt để xem layout tĩnh.
3. Upload file lên Backend API `/api/TemplateCv`.
4. Vào trang **CV Templates** trên Frontend để kiểm tra kết quả.

