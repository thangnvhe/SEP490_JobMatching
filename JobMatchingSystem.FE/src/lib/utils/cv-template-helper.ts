import { format } from "date-fns";
import { CVProfile } from "@/models/cv-profile";
import { User } from "@/models/user";
import { CVEducation, EducationLevel as EducationLevelMap } from "@/models/cv-education";
import { CVExperience } from "@/models/cv-experience";
import { CVProject } from "@/models/cv-project";
import { CVCertificate } from "@/models/cv-certificate";
import { CVAchievement } from "@/models/cv-achievement";

// ==========================================
// INTERFACES
// ==========================================
export interface CVDataCollection {
    userProfile: User;
    cvProfile: CVProfile | null;
    educations: CVEducation[];
    experiences: CVExperience[];
    projects: CVProject[];
    certificates: CVCertificate[];
    achievements: CVAchievement[];
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

// 1. Format Date Helper
const formatDate = (dateString?: string | Date | null, formatStr: string = "dd/MM/yyyy"): string => {
    if (!dateString) return "Hiện tại";
    try {
        return format(new Date(dateString), formatStr);
    } catch (e) {
        return "";
    }
};

// 2. Get Education Level Label Helper
const getEducationLevelLabel = (educationLevelId: number): string => {
    return EducationLevelMap[educationLevelId as keyof typeof EducationLevelMap] || "Khác";
};

// ==========================================
// MAIN GENERATOR FUNCTION
// ==========================================

/**
 * Hàm này nhận vào chuỗi HTML Template thô và cục dữ liệu CVDataCollection.
 * Nó sẽ thực hiện thay thế toàn bộ các placeholder {{KEY}} bằng dữ liệu thật.
 * 
 * @param rawHtml Chuỗi HTML mẫu (chứa các biến {{...}})
 * @param data Dữ liệu người dùng
 * @returns Chuỗi HTML đã được điền dữ liệu
 */
export const generateCVHtml = (rawHtml: string, data: CVDataCollection): string => {
    let html = rawHtml;
    const { userProfile, cvProfile, educations, experiences, projects, certificates, achievements } = data;

    // ---------------------------------------------------------
    // A. THAY THẾ THÔNG TIN CÁ NHÂN (BASIC INFO)
    // ---------------------------------------------------------
    const basicInfoReplacements: Record<string, string> = {
        "{{FULL_NAME}}": userProfile.fullName || "Your Name",
        // Sử dụng positionName từ CVProfile làm tiêu đề/vị trí ứng tuyển
        "{{USER_POSITION}}": cvProfile?.positionName?.toUpperCase() || "",
        "{{EMAIL}}": userProfile.email || "",
        "{{PHONE}}": userProfile.phoneNumber || "",
        "{{ADDRESS}}": userProfile.address || "",
        "{{DATE_OF_BIRTH}}": formatDate(userProfile.birthday),
        "{{GENDER}}": userProfile.gender === true ? "Nam" : (userProfile.gender === false ? "Nữ" : "")
    };

    // Replace Avatar Image HTML
    // Logic: Nếu có avatar -> render thẻ IMG. Nếu không -> render Placeholder (chữ cái đầu).
    let avatarHtml = `<div class="cv-avatar-placeholder">${userProfile.fullName?.charAt(0).toUpperCase() || "U"}</div>`;
    if (userProfile.avatarUrl) {
        const avatarSrc = userProfile.avatarUrl;
        
        // Thêm crossorigin="anonymous" để tránh lỗi CORS khi in ấn/canvas nếu cần
        avatarHtml = `<img src="${avatarSrc}" class="cv-avatar" alt="Avatar" crossorigin="anonymous" />`;
    }
    html = html.replace("{{AVATAR_HTML}}", avatarHtml);

    // Replace About Me / Introduction
    // Không cần replace \n thành <br/> vì class .cv-description đã có white-space: pre-line
    const aboutMeHtml = cvProfile?.aboutMe || "";
    html = html.replace("{{ABOUT_ME}}", aboutMeHtml);

    // Thực hiện replace các trường text cơ bản
    Object.entries(basicInfoReplacements).forEach(([key, value]) => {
        // Sử dụng split().join() để replace all occurrences (thay thế tất cả vị trí)
        html = html.split(key).join(value);
    });


    // ---------------------------------------------------------
    // B. THAY THẾ DANH SÁCH (LOOPS / SECTIONS)
    // ---------------------------------------------------------
    // Logic: Tạo ra một chuỗi HTML dài từ mảng dữ liệu, sau đó nhét vào placeholder danh sách.
    
    // 1. KINH NGHIỆM LÀM VIỆC (Experiences)
    const experiencesHtml = experiences.length > 0 ? experiences.map(exp => `
        <div class="cv-item">
            <div class="cv-item-title">${exp.companyName}</div>
            <div class="cv-item-subtitle">
                <span>${exp.position}</span>
                <span class="cv-date">${formatDate(exp.startDate)} - ${formatDate(exp.endDate)}</span>
            </div>
            <div class="cv-description">${exp.description || ''}</div>
        </div>
    `).join("") : "<p class='cv-empty-msg'>Chưa cập nhật kinh nghiệm làm việc</p>";
    
    html = html.replace("{{EXPERIENCES_LIST}}", experiencesHtml);


    // 2. DỰ ÁN (Projects)
    const projectsHtml = projects.length > 0 ? projects.map(proj => `
        <div class="cv-item">
            <div class="cv-item-title">${proj.projectName}</div>
            <div class="cv-item-subtitle">
                <span class="cv-date">${formatDate(proj.startDate)} - ${formatDate(proj.endDate)}</span>
            </div>
            <div class="cv-description">${proj.description || ''}</div>
        </div>
    `).join("") : ""; // Nếu không có dự án thì để trống, không hiện message lỗi để tránh xấu CV

    html = html.replace("{{PROJECTS_LIST}}", projectsHtml);


    // 3. HỌC VẤN (Educations)
    const educationsHtml = educations.length > 0 ? educations.map(edu => `
        <div class="cv-education-item">
            <div class="cv-education-school">${edu.schoolName}</div>
            <div class="cv-education-degree">${getEducationLevelLabel(edu.educationLevelId)} - ${edu.major}</div>
            <div class="cv-date">${formatDate(edu.startDate)} - ${formatDate(edu.endDate)}</div>
            ${edu.description ? `<div class="cv-description" style="font-size: 12px; margin-top: 2px;">${edu.description}</div>` : ''}
        </div>
    `).join("") : "<p class='cv-empty-msg'>Chưa cập nhật học vấn</p>";

    html = html.replace("{{EDUCATIONS_LIST}}", educationsHtml);


    // 4. CHỨNG CHỈ (Certificates)
    const certificatesHtml = certificates.length > 0 ? certificates.map(cert => `
        <div class="cv-certificate-item">
            <div class="cv-certificate-name">${cert.name}</div>
            <div class="cv-certificate-org">${cert.organization}</div>
            <div class="cv-date">${formatDate(cert.certificateAt)}</div>
            ${cert.link ? `<a href="${cert.link}" target="_blank" class="cv-link" style="word-break: break-all;">${cert.link}</a>` : ''}
            ${cert.description ? `<div class="cv-description" style="font-size: 12px;">${cert.description}</div>` : ''}
        </div>
    `).join("") : "";

    html = html.replace("{{CERTIFICATES_LIST}}", certificatesHtml);


    // 5. GIẢI THƯỞNG (Achievements)
    const achievementsHtml = achievements.length > 0 ? achievements.map(ach => `
        <div class="cv-item">
            <div class="cv-item-title">${ach.title}</div>
            <div class="cv-item-subtitle">
                <span>${ach.organization}</span>
                <span class="cv-date">${formatDate(ach.achievedAt)}</span>
            </div>
            <div class="cv-description">${ach.description || ''}</div>
        </div>
    `).join("") : "";

    html = html.replace("{{ACHIEVEMENTS_LIST}}", achievementsHtml);


    // 6. KỸ NĂNG (Skills) - Placeholder xử lý tạm thời
    // Vì hiện tại User Model chưa có mảng Skills cụ thể, ta sẽ:
    // - Nếu template có placeholder {{SKILLS_SECTION_HTML}}, ta sẽ thay bằng rỗng hoặc một đoạn HTML mặc định nếu muốn demo.
    // - Sau này khi có API Skills, bạn chỉ cần query data và generate HTML tương tự như trên.
    
    // Kiểm tra xem có placeholder này không
    if (html.includes("{{SKILLS_SECTION_HTML}}")) {
        // Code mẫu nếu sau này có skills:
        /*
        const skillsHtml = skills.map(s => `<span class="cv-skill-tag">${s.name}</span>`).join("");
        const sectionHtml = `
            <h4 class="cv-sidebar-title">Kỹ năng</h4>
            <div class="cv-skill-tags">${skillsHtml}</div>
        `;
        html = html.replace("{{SKILLS_SECTION_HTML}}", sectionHtml);
        */
        
        // Hiện tại replace bằng rỗng để không hiện lỗi trên CV
    html = html.replace("{{SKILLS_SECTION_HTML}}", "");
    }

    // ---------------------------------------------------------
    // C. INJECT CSS ĐỂ ẨN HEADER/FOOTER KHI IN (Browser Default)
    // ---------------------------------------------------------
    // Thêm style @page { margin: 0 } để loại bỏ ngày tháng, url, title mặc định của trình duyệt
    const printStyles = `
    <style>
        @page {
            margin: 0;
            size: auto;
        }
        @media print {
            html, body {
                margin: 0 !important;
                padding: 0 !important;
            }
            /* Đảm bảo background màu được in ra đúng */
            * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
            }
        }
    </style>
    `;

    // Chèn vào trước thẻ đóng </head> hoặc đầu file nếu không tìm thấy
    if (html.includes("</head>")) {
        html = html.replace("</head>", `${printStyles}</head>`);
    } else {
        html = printStyles + html;
    }

    return html;
};
