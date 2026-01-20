# Tài liệu Chi tiết Logic Matching System & Test Cases

Tài liệu này mô tả chi tiết cách hoạt động của `JobMatchingService.cs` sau khi cập nhật trọng số và logic tính toán, cùng với các ví dụ test case cụ thể.

## 1. Cơ Chế Hoạt Động

Hệ thống tính điểm phù hợp (Matching Score) dựa trên hai yếu tố chính: **Kỹ năng (Skills)** và **Học vấn (Education)**.

### Trọng số (Weights)
*   **Kỹ năng (Skill Weight)**: 90% (0.90)
*   **Học vấn (Education Weight)**: 10% (0.10)
*   **Kinh nghiệm & Vị trí**: 0% (Không tham gia vào tổng điểm cuối cùng).

### Công thức Tổng Quát
```csharp
TotalScore = (SkillScore * 0.90) + (EducationScore * 0.10)
```
Kết quả được làm tròn đến 2 chữ số thập phân.

---

## 2. Chi Tiết Tính Điểm Thành Phần

### A. Điểm Kỹ Năng (Skill Score)

Điểm kỹ năng được tính trung bình cộng dựa trên mức độ đáp ứng từng kỹ năng mà Job yêu cầu.

**Quy trình:**
1.  Lấy danh sách kỹ năng Job yêu cầu.
2.  Với mỗi kỹ năng yêu cầu, tìm kỹ năng tốt nhất tương ứng trong hồ sơ ứng viên.
3.  Tính điểm cho từng cặp kỹ năng (Pair Score).
4.  **Skill Score** = (Tổng điểm các cặp / Số lượng kỹ năng yêu cầu).

**Công thức tính điểm từng cặp (Single Skill Pair Score):**
```
PairScore = Similarity * ExperienceRatio * 100
```

Trong đó:
*   **Similarity (Độ tương đồng):**
    *   `1.0`: Khớp chính xác (Exact Match).
    *   `0.6`: Quan hệ Cha-Con (Parent Match - ví dụ: biết Java nhưng yêu cầu Spring Boot).
    *   `0.4`: Quan hệ Anh-Em (Sibling Match - ví dụ: cùng thuộc một nhóm công nghệ).
    *   `0.0`: Không khớp.
*   **ExperienceRatio (Tỷ lệ kinh nghiệm):** 
    *   `Ratio = Số năm kinh nghiệm ứng viên / Số năm Job yêu cầu`.
    *   Nếu Job không yêu cầu kinh nghiệm (`<=0`), Ratio = 1.0.
    *   `Ratio` tối đa là 1.0 (Nếu ứng viên làm lâu hơn yêu cầu cũng chỉ tính là 100%).

### B. Điểm Học Vấn (Education Score)

Điểm học vấn dựa trên sự so sánh giữa "Giá trị bằng cấp" (Rank Score) của ứng viên và Job.

**Quy trình:**
1.  Lấy bằng cấp cao nhất của ứng viên (có `Value` lớn nhất).
2.  Lấy bằng cấp yêu cầu của Job.

**Công thức:**
```
Nếu Job không yêu cầu bằng cấp => Score = 100
Nếu Ứng viên không có thông tin => Score = 0
Ngược lại:
    Ratio = Giá trị bằng ứng viên / Giá trị bằng Job yêu cầu
    Score = Min(Ratio, 1.0) * 100
```
*Lưu ý: Nếu bằng cấp ứng viên cao hơn yêu cầu, điểm tối đa vẫn là 100.*

---

## 3. Test Cases (Các Trường Hợp Kiểm Thử)

Giả sử Database có các giá trị quy ước sau:

**Dữ liệu Job mẫu:**
*   **Yêu cầu Kỹ năng:**
    1.  Java (Yêu cầu 3 năm)
    2.  SQL (Yêu cầu 2 năm)
    3.  Angular (Yêu cầu 3 năm)
*   **Yêu cầu Học vấn:** Đại học (Value = 3)

### Case 1: Perfect Match (Khớp hoàn toàn)
**Ứng viên A:**
*   **Kỹ năng:**
    *   Java (4 năm) -> Similarity 1.0, ExpRatio 1.0 (4/3 > 1) -> Score 100.
    *   SQL (2 năm) -> Similarity 1.0, ExpRatio 1.0 (2/2) -> Score 100.
    *   Angular (3 năm) -> Similarity 1.0, ExpRatio 1.0 (3/3) -> Score 100.
*   **Học vấn:** Thạc sĩ (Value = 4).

**Tính toán:**
*   Skill Score = (100 + 100 + 100) / 3 = **100**.
*   Education Score = Min(4/3, 1.0) * 100 = **100**.
*   **Total Score** = (100 * 0.9) + (100 * 0.1) = **100**.

### Case 2: Partial Match (Khớp một phần)
**Ứng viên B:**
*   **Kỹ năng:**
    *   Java (1.5 năm) -> Similarity 1.0, ExpRatio 0.5 (1.5/3) -> Score = 1.0 * 0.5 * 100 = 50.
    *   MySQL (Con của SQL) -> Giả sử Similarity 0.5 (Cha con?), Exp 2 năm -> ExpRatio 1.0 -> Score = 0.5 * 1.0 * 100 = 50.
    *   (Không biết Angular) -> Score = 0.
*   **Học vấn:** Cao đẳng (Value = 2).

**Tính toán:**
*   Skill Score = (50 + 50 + 0) / 3 = 100 / 3 ≈ **33.33**.
*   Education Score = Min(2/3, 1.0) * 100 = 0.666 * 100 ≈ **66.67**.
*   **Total Score** = (33.33 * 0.9) + (66.67 * 0.1) 
    = 30.0 + 6.67 = **36.67**.

### Case 3: High Skills, Low Education (Giỏi nghề nhưng bằng cấp thấp)
**Ứng viên C:**
*   **Kỹ năng:** Đáp ứng hoàn toàn (Skill Score = **100**).
*   **Học vấn:** Tốt nghiệp phổ thông (Value = 1).

**Tính toán:**
*   Skill Score = **100**.
*   Education Score = Min(1/3, 1.0) * 100 = **33.33**.
*   **Total Score** = (100 * 0.9) + (33.33 * 0.1) 
    = 90 + 3.33 = **93.33**.

### Case 4: No Match (Không khớp)
**Ứng viên D:**
*   **Kỹ năng:** Python, Photoshop (Không liên quan Angular, Java, SQL) -> Skill Score = **0**.
*   **Học vấn:** Không có thông tin -> Education Score = **0**.

**Tính toán:** Total Score = **0**.

### Case 5: Relationship Match (Khớp theo quan hệ cây kỹ năng)
**Ứng viên E:**
*   **Job yêu cầu:** Spring Boot (3 năm).
*   **Ứng viên có:** Java (Cha của Spring Boot, 5 năm).
*   **Giả định:** Quan hệ Parent (Java là cha) có Similarity = 0.5.

**Tính toán:**
*   ExpRatio = Min(5/3, 1.0) = 1.0.
*   Skill Pair Score = 0.5 * 1.0 * 100 = 50.
*   Skill Score Tổng = 50.
*   Nếu Bằng cấp khớp (100) -> Total = (50 * 0.9) + (100 * 0.1) = 45 + 10 = **55**.

### Case 6: User Scenario (Dựa trên yêu cầu của bạn)
Đây là trường hợp bạn mô tả trong prompt trước đó.

**Job (Yêu cầu):**
1. Java (3 năm)
2. ASP.NET API (3 năm)
3. Angular (3 năm)
*   Tổng số kỹ năng: 3
*   Học vấn: Đại học (Value 3)

**Ứng viên:**
1. Spring Boot (2 năm) -> Giả sử là Con/Anh em của Java? 
   *   Nếu tính quan hệ: Similarity ví dụ 0.5. ExpRatio = 2/3 = 0.66. -> Score = 0.5 * 0.66 * 100 = 33.
2. .NET (2 năm) -> Cha của ASP.NET API.
   *   Similarity = 0.5. ExpRatio = 2/3 = 0.66. -> Score = 33.
3. React (2 năm) -> Anh em của Angular.
   *   Similarity = 0.3. ExpRatio = 2/3 = 0.66. -> Score = 0.3 * 0.66 * 100 = 19.8.
4. SQL (2 năm) -> Không có trong Job -> Bỏ qua.

**Tổng Kỹ năng:**
*   Skill Score = (33 + 33 + 19.8) / 3 = 85.8 / 3 = **28.6**.

**Học vấn:**
*   Có 3 bằng, 1 bằng >= Đại học (Value >= 3).
*   Education Score = 100.

**Total Score:**
*   (28.6 * 0.9) + (100 * 0.1) = 25.74 + 10 = **35.74**.

*(Lưu ý: Kết quả này thấp do giả định về độ tương đồng 0.5/0.3. Nếu quan hệ chặt chẽ hơn hoặc tính là exact match thì điểm sẽ cao hơn).*
