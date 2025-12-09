import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { LucideIcon } from "lucide-react";
import {
    Award,
    BadgeCheck,
    Briefcase,
    Calendar,
    Edit,
    GraduationCap,
    Mail,
    MapPin,
    Phone,
    Plus,
    Projector,
    User as UserIcon,
    Sparkles,
    CheckCircle2,
    Trash2,
    Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { DialogCVAchievement } from "./EditInformation/DialogCVAchievement";
import { DialogCVCertificate } from "./EditInformation/DialogCVCertificate";
import { DialogCVEducation } from "./EditInformation/DialogCVEducation";
import { DialogCVExperience } from "./EditInformation/DialogCVExperience";
import { DialogCVProject } from "./EditInformation/DialogCVProject";
import { DialogCVTaxonomy } from "./EditInformation/DialogCVTaxonomy";
import { CVAchievementServices } from "@/services/cv-achievement.service";
import { CVCertificateServices } from "@/services/cv-certificate.service";
import { CVEducationServices } from "@/services/cv-education.service";
import { CVExperienceServices } from "@/services/cv-experience.service";
import { CVProjectServices } from "@/services/cv-project.service";
import { CandidateTaxonomyService } from "@/services/candidate-taxonomy.service";
import { UserServices } from "@/services/user.service";
import { DialogCVInformation } from "./EditInformation/DialogCVInformation";
import { DialogCVProfile } from "./EditInformation/DialogCVProfile";
import { User } from "@/models/user";
import { CVProfile } from "@/models/cv-profile";
import { CVProfileService } from "@/services/cv-profile.service";
import { CVAchievement } from "@/models/cv-achievement";
import { CVCertificate } from "@/models/cv-certificate";
import { CVEducation, EducationLevel as EducationLevelMap } from "@/models/cv-education";
import { CVExperience } from "@/models/cv-experience";
import { CVProject } from "@/models/cv-project";
import { CandidateTaxonomy } from "@/models/candidate-taxonomy";
import { toast } from "sonner";
import { format } from "date-fns";

const getEducationLevelLabel = (educationLevelId: number): string => {
    return EducationLevelMap[educationLevelId as keyof typeof EducationLevelMap] || "Khác";
};

const ProfileCvPage = () => {
    const [isAchievementDialogOpen, setIsAchievementDialogOpen] = useState(false);
    const [achievements, setAchievements] = useState<CVAchievement[]>([]);
    const [selectedAchievement, setSelectedAchievement] = useState<CVAchievement | null>(null);

    const [isCertificateDialogOpen, setIsCertificateDialogOpen] = useState(false);
    const [certificates, setCertificates] = useState<CVCertificate[]>([]);
    const [selectedCertificate, setSelectedCertificate] = useState<CVCertificate | null>(null);

    const [isEducationDialogOpen, setIsEducationDialogOpen] = useState(false);
    const [educations, setEducations] = useState<CVEducation[]>([]);
    const [selectedEducation, setSelectedEducation] = useState<CVEducation | null>(null);

    const [isExperienceDialogOpen, setIsExperienceDialogOpen] = useState(false);
    const [experiences, setExperiences] = useState<CVExperience[]>([]);
    const [selectedExperience, setSelectedExperience] = useState<CVExperience | null>(null);

    const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
    const [projects, setProjects] = useState<CVProject[]>([]);
    const [selectedProject, setSelectedProject] = useState<CVProject | null>(null);

    const [isTaxonomyDialogOpen, setIsTaxonomyDialogOpen] = useState(false);
    const [taxonomies, setTaxonomies] = useState<CandidateTaxonomy[]>([]);
    const [selectedTaxonomy, setSelectedTaxonomy] = useState<CandidateTaxonomy | null>(null);

    const [isInfoDialogOpen, setIsInfoDialogOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<User | null>(null);

    const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
    const [cvProfile, setCvProfile] = useState<CVProfile | null>(null);


    // Alert Dialog state for delete confirmation
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deleteItem, setDeleteItem] = useState<{
        type: "achievement" | "certificate" | "education" | "experience" | "project" | "taxonomy";
        id: number;
        name: string;
    } | null>(null);

    // Tính toán độ mạnh hồ sơ dựa trên các phần đã hoàn thành
    const profileCompletion = useMemo(() => {
        let totalScore = 0;
        let maxScore = 0;

        // Điểm cho thông tin cơ bản (Contact Details) - 15 điểm
        const contactScore = 15;
        totalScore += contactScore;
        maxScore += 15;

        // Điểm cho Hồ sơ ứng tuyển (CV Profile) - 15 điểm
        if (cvProfile && cvProfile.aboutMe) {
            totalScore += 15;
        }
        maxScore += 15;

        // Điểm cho Học vấn (Education) - 20 điểm
        if (educations.length > 0) {
            totalScore += 20;
        }
        maxScore += 20;

        // Điểm cho Kinh nghiệm làm việc (Experience) - 20 điểm
        if (experiences.length > 0) {
            totalScore += 20;
        }
        maxScore += 20;

        // Điểm cho Dự án (Projects) - 15 điểm
        if (projects.length > 0) {
            totalScore += 15;
        }
        maxScore += 15;

        // Điểm cho Chứng chỉ (Certificates) - 10 điểm
        if (certificates.length > 0) {
            totalScore += 10;
        }
        maxScore += 10;

        // Điểm cho Giải thưởng (Achievements) - 5 điểm
        if (achievements.length > 0) {
            totalScore += 5;
        }
        maxScore += 5;

        // Điểm cho Kỹ năng (Taxonomies) - 10 điểm
        if (taxonomies.length > 0) {
            totalScore += 10;
        }
        maxScore += 10;

        // Tính phần trăm hoàn thành
        return Math.round((totalScore / maxScore) * 100);
    }, [cvProfile, educations, experiences, projects, certificates, achievements, taxonomies]);

    const fetchAchievements = async () => {
        try {
            const response = await CVAchievementServices.getMyAchievements();
            setAchievements(response.result);
        } catch (error) {
            console.error("Failed to fetch achievements", error);
        }
    };

    const fetchCertificates = async () => {
        try {
            const response = await CVCertificateServices.getMyCertificates();
            setCertificates(response.result);
        } catch (error) {
            console.error("Failed to fetch certificates", error);
        }
    };

    const fetchEducations = async () => {
        try {
            const response = await CVEducationServices.getMyEducations();
            setEducations(response.result);
        } catch (error) {
            console.error("Failed to fetch educations", error);
        }
    };

    const fetchExperiences = async () => {
        try {
            const response = await CVExperienceServices.getMyExperiences();
            setExperiences(response.result);
        } catch (error) {
            console.error("Failed to fetch experiences", error);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await CVProjectServices.getMyProjects();
            setProjects(response.result);
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    const fetchTaxonomies = async () => {
        try {
            const response = await CandidateTaxonomyService.getMyTaxonomies();
            setTaxonomies(response.result);
        } catch (error) {
            console.error("Failed to fetch taxonomies", error);
        }
    };

    const fetchUserProfile = async () => {
        try {
            const response = await UserServices.getUserProfile();
            setUserProfile(response.result);
            console.log(response.result);
        } catch (error) {
            console.error("Failed to fetch user profile", error);
        }
    };

    const fetchCVProfile = async () => {
        try {
            const response = await CVProfileService.getMyProfile();
            setCvProfile(response.result);
        } catch (error) {
            console.error("Failed to fetch CV profile", error);
        }
    };

    useEffect(() => {
        fetchAchievements();
        fetchCertificates();
        fetchEducations();
        fetchExperiences();
        fetchProjects();
        fetchTaxonomies();
        fetchUserProfile();
        fetchCVProfile();
    }, []);

    // Achievement handlers
    const handleEditAchievement = (achievement: CVAchievement) => {
        setSelectedAchievement(achievement);
        setIsAchievementDialogOpen(true);
    };

    const handleDeleteAchievement = (achievement: CVAchievement) => {
        if (!achievement.id) return;
        setDeleteItem({
            type: "achievement",
            id: achievement.id,
            name: achievement.title,
        });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteAchievement = async () => {
        if (!deleteItem || deleteItem.type !== "achievement") return;
        try {
            await CVAchievementServices.delete(deleteItem.id.toString());
            toast.success("Xóa giải thưởng thành công");
            fetchAchievements();
        } catch (error) {
            console.error("Failed to delete achievement", error);
            toast.error("Xóa giải thưởng thất bại");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        }
    };

    // Certificate handlers
    const handleEditCertificate = (certificate: CVCertificate) => {
        setSelectedCertificate(certificate);
        setIsCertificateDialogOpen(true);
    };

    const handleDeleteCertificate = (certificate: CVCertificate) => {
        if (!certificate.id) return;
        setDeleteItem({
            type: "certificate",
            id: certificate.id,
            name: certificate.name,
        });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteCertificate = async () => {
        if (!deleteItem || deleteItem.type !== "certificate") return;
        try {
            await CVCertificateServices.delete(deleteItem.id.toString());
            toast.success("Xóa chứng chỉ thành công");
            fetchCertificates();
        } catch (error) {
            console.error("Failed to delete certificate", error);
            toast.error("Xóa chứng chỉ thất bại");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        }
    };

    // Education handlers
    const handleEditEducation = (education: CVEducation) => {
        setSelectedEducation(education);
        setIsEducationDialogOpen(true);
    };

    const handleDeleteEducation = (education: CVEducation) => {
        if (!education.id) return;
        setDeleteItem({
            type: "education",
            id: education.id,
            name: education.schoolName,
        });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteEducation = async () => {
        if (!deleteItem || deleteItem.type !== "education") return;
        try {
            await CVEducationServices.delete(deleteItem.id.toString());
            toast.success("Xóa thông tin học vấn thành công");
            fetchEducations();
        } catch (error) {
            console.error("Failed to delete education", error);
            toast.error("Xóa thông tin học vấn thất bại");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        }
    };

    // Experience handlers
    const handleEditExperience = (experience: CVExperience) => {
        setSelectedExperience(experience);
        setIsExperienceDialogOpen(true);
    };

    const handleDeleteExperience = (experience: CVExperience) => {
        if (!experience.id) return;
        setDeleteItem({
            type: "experience",
            id: experience.id,
            name: experience.companyName,
        });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteExperience = async () => {
        if (!deleteItem || deleteItem.type !== "experience") return;
        try {
            await CVExperienceServices.delete(deleteItem.id.toString());
            toast.success("Xóa kinh nghiệm làm việc thành công");
            fetchExperiences();
        } catch (error) {
            console.error("Failed to delete experience", error);
            toast.error("Xóa kinh nghiệm làm việc thất bại");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        }
    };

    // Project handlers
    const handleEditProject = (project: CVProject) => {
        setSelectedProject(project);
        setIsProjectDialogOpen(true);
    };

    const handleDeleteProject = (project: CVProject) => {
        if (!project.id) return;
        setDeleteItem({
            type: "project",
            id: project.id,
            name: project.projectName,
        });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteProject = async () => {
        if (!deleteItem || deleteItem.type !== "project") return;
        try {
            await CVProjectServices.delete(deleteItem.id.toString());
            toast.success("Xóa dự án thành công");
            fetchProjects();
        } catch (error) {
            console.error("Failed to delete project", error);
            toast.error("Xóa dự án thất bại");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        }
    };

    // Taxonomy handlers
    const handleEditTaxonomy = (taxonomy: CandidateTaxonomy) => {
        setSelectedTaxonomy(taxonomy);
        setIsTaxonomyDialogOpen(true);
    };

    const handleDeleteTaxonomy = (taxonomy: CandidateTaxonomy) => {
        if (!taxonomy.id) return;
        setDeleteItem({
            type: "taxonomy",
            id: taxonomy.id,
            name: taxonomy.taxonomyName,
        });
        setDeleteDialogOpen(true);
    };

    const confirmDeleteTaxonomy = async () => {
        if (!deleteItem || deleteItem.type !== "taxonomy") return;
        try {
            await CandidateTaxonomyService.delete(deleteItem.id);
            toast.success("Xóa kỹ năng thành công");
            fetchTaxonomies();
        } catch (error) {
            console.error("Failed to delete taxonomy", error);
            toast.error("Xóa kỹ năng thất bại");
        } finally {
            setDeleteDialogOpen(false);
            setDeleteItem(null);
        }
    };

    const handleDialogClose = (open: boolean) => {
        setIsAchievementDialogOpen(open);
        if (!open) {
            setSelectedAchievement(null);
        }
    };

    const handleCertificateDialogClose = (open: boolean) => {
        setIsCertificateDialogOpen(open);
        if (!open) {
            setSelectedCertificate(null);
        }
    };

    const handleEducationDialogClose = (open: boolean) => {
        setIsEducationDialogOpen(open);
        if (!open) {
            setSelectedEducation(null);
        }
    };

    const handleExperienceDialogClose = (open: boolean) => {
        setIsExperienceDialogOpen(open);
        if (!open) {
            setSelectedExperience(null);
        }
    };

    const handleProjectDialogClose = (open: boolean) => {
        setIsProjectDialogOpen(open);
        if (!open) {
            setSelectedProject(null);
        }
    };

    const handleTaxonomyDialogClose = (open: boolean) => {
        setIsTaxonomyDialogOpen(open);
        if (!open) {
            setSelectedTaxonomy(null);
        }
    };

    const handleDialogSuccess = () => {
        fetchAchievements();
    };

    const handleCertificateDialogSuccess = () => {
        fetchCertificates();
    };

    const handleEducationDialogSuccess = () => {
        fetchEducations();
    };

    const handleExperienceDialogSuccess = () => {
        fetchExperiences();
    };

    const handleProjectDialogSuccess = () => {
        fetchProjects();
    };

    const handleTaxonomyDialogSuccess = () => {
        fetchTaxonomies();
    };

    // Get delete confirmation message based on type
    const getDeleteMessage = () => {
        if (!deleteItem) return "";
        const messages = {
            achievement: "Bạn có chắc chắn muốn xóa giải thưởng này?",
            certificate: "Bạn có chắc chắn muốn xóa chứng chỉ này?",
            education: "Bạn có chắc chắn muốn xóa thông tin học vấn này?",
            experience: "Bạn có chắc chắn muốn xóa kinh nghiệm làm việc này?",
            project: "Bạn có chắc chắn muốn xóa dự án này?",
            taxonomy: "Bạn có chắc chắn muốn xóa kỹ năng này?",
        };
        return messages[deleteItem.type];
    };

    // Handle confirm delete action
    const handleConfirmDelete = async () => {
        if (!deleteItem) return;
        switch (deleteItem.type) {
            case "achievement":
                await confirmDeleteAchievement();
                break;
            case "certificate":
                await confirmDeleteCertificate();
                break;
            case "education":
                await confirmDeleteEducation();
                break;
            case "experience":
                await confirmDeleteExperience();
                break;
            case "project":
                await confirmDeleteProject();
                break;
            case "taxonomy":
                await confirmDeleteTaxonomy();
                break;
        }
    };

    // Tạo danh sách gợi ý cải thiện động
    const improvementSuggestions = useMemo(() => {
        const suggestions: { text: string; completed: boolean }[] = [];

        // Kiểm tra CVProfile
        if (!cvProfile || !cvProfile.aboutMe) {
            suggestions.push({
                text: "Thêm hồ sơ ứng tuyển và giới thiệu bản thân",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm hồ sơ ứng tuyển",
                completed: true,
            });
        }

        // Kiểm tra từng phần và thêm gợi ý nếu chưa hoàn thành
        if (educations.length === 0) {
            suggestions.push({
                text: "Thêm thông tin học vấn của bạn",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm thông tin học vấn",
                completed: true,
            });
        }

        if (experiences.length === 0) {
            suggestions.push({
                text: "Thêm kinh nghiệm làm việc",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm kinh nghiệm làm việc",
                completed: true,
            });
        }

        if (projects.length === 0) {
            suggestions.push({
                text: "Thêm dự án nổi bật",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm dự án nổi bật",
                completed: true,
            });
        }

        if (certificates.length === 0) {
            suggestions.push({
                text: "Thêm chứng chỉ chuyên môn",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm chứng chỉ chuyên môn",
                completed: true,
            });
        }

        if (achievements.length === 0) {
            suggestions.push({
                text: "Thêm giải thưởng và thành tích",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm giải thưởng và thành tích",
                completed: true,
            });
        }

        if (taxonomies.length === 0) {
            suggestions.push({
                text: "Thêm kỹ năng chuyên môn",
                completed: false,
            });
        } else {
            suggestions.push({
                text: "Đã thêm kỹ năng chuyên môn",
                completed: true,
            });
        }

        // Sắp xếp: chưa hoàn thành lên trên, đã hoàn thành xuống dưới
        return suggestions.sort((a, b) => (a.completed === b.completed ? 0 : a.completed ? 1 : -1));
    }, [cvProfile, educations, experiences, projects, certificates, achievements, taxonomies]);

    // Calculate circular progress for the visual widget if needed,
    // but we will focus on the linear bar as requested.
    const completionDegree = (profileCompletion / 100) * 360;

    const userSection = [
        {
            icon: Mail,
            value: userProfile?.email || "Chưa cập nhật",
            label: "Email"
        },
        {
            icon: Phone,
            value: userProfile?.phoneNumber || "Chưa cập nhật",
            label: "Phone"
        },
        {
            icon: Calendar,
            value: userProfile?.birthday ? format(new Date(userProfile.birthday), "dd/MM/yyyy") : "Chưa cập nhật",
            label: "DOB"
        },
        {
            icon: UserIcon,
            value: userProfile?.gender === true ? "Nam" : (userProfile?.gender === false ? "Nữ" : "Chưa cập nhật"),
            label: "Gender"
        },
        {
            icon: MapPin,
            value: userProfile?.address || "Chưa cập nhật",
            label: "Address"
        },
    ];

    const profileSections: SectionCardConfig[] = [
        {
            title: "Hồ sơ ứng tuyển",
            description: "Vị trí mong muốn và giới thiệu bản thân",
            icon: UserIcon,
            action: cvProfile ? "Chỉnh sửa" : "Thêm mới",
            onActionClick: () => {
                setIsProfileDialogOpen(true);
            },
            ...(cvProfile && {
                children: (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                   
                            <div>
                                <p className="text-sm text-gray-500">Vị trí ứng tuyển</p>
                                <p className="text-base font-semibold text-gray-900">
                                    {cvProfile.positionName || "Chưa cập nhật"}
                                </p>
                            </div>
                        </div>
                        <div className="border-t border-gray-100 pt-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">Giới thiệu bản thân</p>
                            <p className="text-base text-gray-700 whitespace-pre-line leading-relaxed">
                                {cvProfile.aboutMe || "Chưa có thông tin giới thiệu"}
                            </p>
                        </div>
                    </div>
                ),
            }),
        },
        {
            title: "Học vấn",
            description: "Chia sẻ quá trình học tập và bằng cấp",
            icon: GraduationCap,
            action: "Thêm học vấn",
            onActionClick: () => {
                setSelectedEducation(null);
                setIsEducationDialogOpen(true);
            },
            ...(educations.length > 0 && {
                children: (
                    <div className="space-y-4">
                        {educations.map((education) => (
                            <div
                                key={education.id}
                                className="flex flex-col gap-2 border-t border-gray-100 pt-4 first:border-none first:pt-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-[18px] font-semibold text-gray-900">
                                            {education.schoolName}
                                        </h4>
                                        <p className="text-base text-gray-800">
                                            {education.major} - {getEducationLevelLabel(education.educationLevelId)}
                                        </p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {education.startDate
                                                ? format(new Date(education.startDate), "dd/MM/yyyy")
                                                : ""}{" "}
                                            -{" "}
                                            {education.endDate
                                                ? format(new Date(education.endDate), "dd/MM/yyyy")
                                                : "Hiện tại"}
                                        </p>
                                        {education.description && (
                                            <p className="text-base text-gray-900 mt-1 line-clamp-2">
                                                {education.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-emerald-600"
                                            onClick={() => handleEditEducation(education)}
                                        >
                                            <Edit className="h-10 w-10" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-red-500"
                                            onClick={() => handleDeleteEducation(education)}
                                        >
                                            <Trash2 className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ),
            }),
        },
        {
            title: "Kinh nghiệm làm việc",
            description: "Chi tiết lịch sử làm việc và thành tựu",
            icon: Briefcase,
            action: "Thêm kinh nghiệm",
            onActionClick: () => {
                setSelectedExperience(null);
                setIsExperienceDialogOpen(true);
            },
            ...(experiences.length > 0 && {
                children: (
                    <div className="space-y-4">
                        {experiences.map((experience) => (
                            <div
                                key={experience.id}
                                className="flex flex-col gap-2 border-t border-gray-100 pt-4 first:border-none first:pt-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-[18px] font-semibold text-gray-900">
                                            {experience.companyName}
                                        </h4>
                                        <p className="text-base text-gray-800">
                                            {experience.position}
                                        </p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {experience.startDate
                                                ? format(new Date(experience.startDate), "dd/MM/yyyy")
                                                : ""}{" "}
                                            -{" "}
                                            {experience.endDate
                                                ? format(new Date(experience.endDate), "dd/MM/yyyy")
                                                : "Hiện tại"}
                                        </p>
                                        {experience.description && (
                                            <p className="text-base text-gray-900 mt-1 line-clamp-2">
                                                {experience.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-emerald-600"
                                            onClick={() => handleEditExperience(experience)}
                                        >
                                            <Edit className="h-10 w-10" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-red-500"
                                            onClick={() => handleDeleteExperience(experience)}
                                        >
                                            <Trash2 className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ),
            }),
        },
        {
            title: "Dự án nổi bật",
            description: "Các dự án cá nhân hoặc công ty đã tham gia",
            icon: Projector,
            action: "Thêm dự án",
            onActionClick: () => {
                setSelectedProject(null);
                setIsProjectDialogOpen(true);
            },
            ...(projects.length > 0 && {
                children: (
                    <div className="space-y-4">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="flex flex-col gap-2 border-t border-gray-100 pt-4 first:border-none first:pt-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-[18px] font-semibold text-gray-900">
                                            {project.projectName}
                                        </h4>
                                        <p className="text-base text-gray-900 mt-1">
                                            {project.startDate
                                                ? format(new Date(project.startDate), "dd/MM/yyyy")
                                                : ""}{" "}
                                            -{" "}
                                            {project.endDate
                                                ? format(new Date(project.endDate), "dd/MM/yyyy")
                                                : "Hiện tại"}
                                        </p>
                                        {project.description && (
                                            <p className="text-base text-gray-900 mt-1 line-clamp-2">
                                                {project.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-emerald-600"
                                            onClick={() => handleEditProject(project)}
                                        >
                                            <Edit className="h-10 w-10" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-red-500"
                                            onClick={() => handleDeleteProject(project)}
                                        >
                                            <Trash2 className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ),
            }),
        },
        {
            title: "Chứng chỉ",
            description: "Các chứng chỉ chuyên môn đã đạt được",
            icon: BadgeCheck,
            action: "Thêm chứng chỉ",
            onActionClick: () => {
                setSelectedCertificate(null);
                setIsCertificateDialogOpen(true);
            },
            ...(certificates.length > 0 && {
                children: (
                    <div className="space-y-4">
                        {certificates.map((certificate) => (
                            <div
                                key={certificate.id}
                                className="flex flex-col gap-2 border-t border-gray-100 pt-4 first:border-none first:pt-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-[18px] font-semibold text-gray-900">
                                            {certificate.name}
                                        </h4>
                                        <p className="text-base text-gray-800">
                                            {certificate.organization}
                                        </p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {certificate.certificateAt
                                                ? format(new Date(certificate.certificateAt), "dd/MM/yyyy")
                                                : ""}
                                        </p>
                                        {certificate.link && (
                                            <a
                                                href={certificate.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-sm text-emerald-600 hover:underline mt-1 block"
                                            >
                                                Xem chứng chỉ
                                            </a>
                                        )}
                                        {certificate.description && (
                                            <p className="text-base text-gray-900 mt-1 line-clamp-2">
                                                {certificate.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-emerald-600"
                                            onClick={() => handleEditCertificate(certificate)}
                                        >
                                            <Edit className="h-10 w-10" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-red-500"
                                            onClick={() => handleDeleteCertificate(certificate)}
                                        >
                                            <Trash2 className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ),
            }),
        },
        {
            title: "Giải thưởng",
            description: "Các giải thưởng và ghi nhận",
            icon: Award,
            action: "Thêm giải thưởng",
            onActionClick: () => {
                setSelectedAchievement(null);
                setIsAchievementDialogOpen(true);
            },
            ...(achievements.length > 0 && {
                children: (
                    <div className="space-y-4">
                        {achievements.map((achievement) => (
                            <div
                                key={achievement.id}
                                className="flex flex-col gap-2 border-t border-gray-100 pt-4 first:border-none first:pt-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-[18px] font-semibold text-gray-900">
                                            {achievement.title}
                                        </h4>
                                        <p className="text-base text-gray-800">
                                            {achievement.organization}
                                        </p>
                                        <p className="text-base text-gray-900 mt-1">
                                            {achievement.achievedAt
                                                ? format(new Date(achievement.achievedAt), "dd/MM/yyyy")
                                                : ""}
                                        </p>
                                        {achievement.description && (
                                            <p className="text-base text-gray-900 mt-1 line-clamp-2">
                                                {achievement.description}
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-emerald-600"
                                            onClick={() => handleEditAchievement(achievement)}
                                        >
                                            <Edit className="h-10 w-10" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-red-500"
                                            onClick={() => handleDeleteAchievement(achievement)}
                                        >
                                            <Trash2 className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ),
            }),
        },
        {
            title: "Kỹ năng",
            description: "Các kỹ năng chuyên môn của bạn",
            icon: Wrench,
            action: "Thêm kỹ năng",
            onActionClick: () => {
                setSelectedTaxonomy(null);
                setIsTaxonomyDialogOpen(true);
            },
            ...(taxonomies.length > 0 && {
                children: (
                    <div className="space-y-4">
                        {taxonomies.map((taxonomy) => (
                            <div
                                key={taxonomy.id}
                                className="flex flex-col gap-2 border-t border-gray-100 pt-4 first:border-none first:pt-0"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="text-[18px] font-semibold text-gray-900">
                                            {taxonomy.taxonomyName}
                                        </h4>
                                        <p className="text-base text-gray-800">
                                            {taxonomy.experienceYear !== undefined && taxonomy.experienceYear !== null
                                                ? `${taxonomy.experienceYear} năm kinh nghiệm`
                                                : "Chưa cập nhật số năm kinh nghiệm"}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-emerald-600"
                                            onClick={() => handleEditTaxonomy(taxonomy)}
                                        >
                                            <Edit className="h-10 w-10" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="lg"
                                            className="h-10 w-10 text-gray-800 hover:bg-transparent hover:text-red-500"
                                            onClick={() => handleDeleteTaxonomy(taxonomy)}
                                        >
                                            <Trash2 className="h-8 w-8" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ),
            }),
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50/40 py-8 px-4 sm:px-6">
            {/* Container giới hạn width khoảng 70% màn hình lớn hoặc max-w-5xl để đẹp mắt */}
            <div className="mx-auto max-w-5xl space-y-8">
                {/* Header Section */}
                <Card className="overflow-hidden p-0 border-none shadow-md ring-1 ring-black/5">
                    <div className="h-32 bg-linear-to-r from-emerald-500 to-teal-500 opacity-90"></div>
                    <CardContent className="relative px-8 pb-8">
                        <div className="-mt-12 mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-end sm:justify-between">
                            <div className="flex items-end gap-6">
                                <Avatar className="h-40 w-40 rounded-full border-4 border-white shadow-lg ring-1 ring-gray-100">
                                    <AvatarImage src={userProfile?.avatarUrl || ""} className="object-cover" />
                                    <AvatarFallback className="bg-emerald-50 text-2xl font-bold text-emerald-600">
                                        {userProfile?.fullName ? userProfile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : "VN"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="mb-2 space-y-1">
                                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                                        {userProfile?.fullName || "User Name"}
                                    </h1>
                                    <p className="text-base font-medium text-gray-500">
                                        {userProfile?.role || "Candidate"}
                                    </p>
                                </div>
                            </div>
                            <Button
                                className="mb-2 gap-2 rounded-full bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 hover:text-emerald-600"
                                onClick={() => setIsInfoDialogOpen(true)}
                            >
                                <Edit className="h-4 w-4" />
                                <span>Chỉnh sửa hồ sơ</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-y-4 gap-x-8 border-t border-gray-100 pt-6 sm:grid-cols-2 lg:grid-cols-3">
                            {userSection.map(({ icon: Icon, value, label }) => (
                                <div key={label} className="flex items-center gap-3 text-sm">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs text-gray-400">{label}</span>
                                        <span className="font-medium text-gray-700 truncate max-w-[200px]">
                                            {value}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    {/* Left Column: Main Content (Chiếm phần lớn) */}
                    <div className="space-y-6 lg:col-span-8">
                        <div className="grid gap-4">
                            {profileSections.map((section) => (
                                <ProfileSectionCard key={section.title} {...section} />
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Sidebar (Progress & Tips) */}
                    <div className="space-y-6 lg:col-span-4">
                        {/* Progress Card */}
                        <Card className="sticky top-6 overflow-hidden p-0 border-emerald-100 shadow-sm ring-1 ring-emerald-50">
                            <CardHeader className="bg-emerald-50/50 pb-4 pt-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold text-gray-900">
                                        Độ mạnh hồ sơ
                                    </CardTitle>
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                        {profileCompletion}%
                                    </Badge>
                                </div>
                                <CardDescription className="mt-2">
                                    Hoàn thành{" "}
                                    <span className="font-medium text-emerald-600">
                                        {profileCompletion}%
                                    </span>{" "}
                                    để mở khóa CV mẫu IT chuyên nghiệp.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 pt-6 pb-4">
                                {/* Linear Progress Bar - Fixed */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs font-medium text-gray-500">
                                        <span>Tiến độ</span>
                                        <span>{profileCompletion}/100</span>
                                    </div>
                                    <Progress
                                        value={profileCompletion}
                                        className="h-2.5 bg-emerald-100"
                                        indicatorClassName="bg-emerald-500"
                                    />
                                </div>

                                {/* Circular Progress Visual */}
                                <div className="flex justify-center py-2">
                                    <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-emerald-50">
                                        <div
                                            className="absolute inset-0 rounded-full"
                                            style={{
                                                background: `conic-gradient(#10b981 ${completionDegree}deg, transparent ${completionDegree}deg)`,
                                                maskImage:
                                                    "radial-gradient(transparent 55%, black 56%)",
                                                WebkitMaskImage:
                                                    "radial-gradient(transparent 55%, black 56%)",
                                            }}
                                        />
                                        <div className="flex flex-col items-center">
                                            <span className="text-3xl font-bold text-gray-900">
                                                {profileCompletion}%
                                            </span>
                                            <span className="text-[10px] uppercase font-semibold text-gray-400">
                                                Hoàn tất
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
                                    <div className="mb-2 flex items-center gap-2 font-semibold text-gray-900">
                                        <Sparkles className="h-4 w-4 text-yellow-500" />
                                        Gợi ý cải thiện
                                    </div>
                                    <ul className="space-y-2 pl-1">
                                        {improvementSuggestions.slice(0, 5).map((suggestion, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                                <CheckCircle2
                                                    className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${suggestion.completed
                                                        ? "text-emerald-500"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                                <span className={suggestion.completed ? "line-through text-gray-400" : ""}>
                                                    {suggestion.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <Button
                                    asChild
                                    className="w-full rounded-full bg-emerald-500 font-semibold hover:bg-emerald-600 shadow-md shadow-emerald-200"
                                >
                                    <Link to="/profile-cv/cv-templates">Xem trước & Tải CV</Link>
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Quick Tips */}
                        <Card className="border-none shadow-none bg-transparent">
                            <CardHeader className="px-0 pt-0">
                                <CardTitle className="text-base font-semibold text-gray-900">
                                    Mẹo nhanh
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-0 space-y-3">
                                {[
                                    "Viết About Me súc tích (3-4 câu) nhấn mạnh thế mạnh.",
                                    "Dùng số liệu cụ thể cho Work Experience.",
                                    "Ưu tiên kỹ năng liên quan đến vị trí ứng tuyển.",
                                ].map((tip, i) => (
                                    <div
                                        key={i}
                                        className="flex gap-3 rounded-lg border border-gray-100 bg-white p-3 text-sm text-gray-600 shadow-sm"
                                    >
                                        <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                                        <p>{tip}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <DialogCVAchievement
                open={isAchievementDialogOpen}
                onOpenChange={handleDialogClose}
                onSuccess={handleDialogSuccess}
                achievementToEdit={selectedAchievement}
            />

            <DialogCVCertificate
                open={isCertificateDialogOpen}
                onOpenChange={handleCertificateDialogClose}
                onSuccess={handleCertificateDialogSuccess}
                certificateToEdit={selectedCertificate}
            />

            <DialogCVEducation
                open={isEducationDialogOpen}
                onOpenChange={handleEducationDialogClose}
                onSuccess={handleEducationDialogSuccess}
                educationToEdit={selectedEducation}
            />

            <DialogCVExperience
                open={isExperienceDialogOpen}
                onOpenChange={handleExperienceDialogClose}
                onSuccess={handleExperienceDialogSuccess}
                experienceToEdit={selectedExperience}
            />

            <DialogCVProject
                open={isProjectDialogOpen}
                onOpenChange={handleProjectDialogClose}
                onSuccess={handleProjectDialogSuccess}
                projectToEdit={selectedProject}
            />

            <DialogCVTaxonomy
                open={isTaxonomyDialogOpen}
                onOpenChange={handleTaxonomyDialogClose}
                onSuccess={handleTaxonomyDialogSuccess}
                taxonomyToEdit={selectedTaxonomy}
            />

            <DialogCVInformation
                open={isInfoDialogOpen}
                onOpenChange={setIsInfoDialogOpen}
                onSuccess={fetchUserProfile}
                userProfileToEdit={userProfile}
            />

            <DialogCVProfile
                open={isProfileDialogOpen}
                onOpenChange={setIsProfileDialogOpen}
                onSuccess={fetchCVProfile}
                profileToEdit={cvProfile}
            />

            {/* Delete Confirmation Alert Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
                        <AlertDialogDescription>
                            {getDeleteMessage()}
                            {deleteItem && (
                                <span className="block mt-2 font-semibold text-gray-900">
                                    "{deleteItem.name}"
                                </span>
                            )}
                            <span className="block mt-2 text-red-600">
                                Hành động này không thể hoàn tác.
                            </span>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

type SectionCardConfig = {
    title: string;
    description: string;
    icon: LucideIcon;
    action: string;
    isDropdown?: boolean;
    onActionClick?: () => void;
    children?: React.ReactNode;
};

const ProfileSectionCard = ({
    title,
    description,
    icon: Icon,
    action,
    isDropdown,
    onActionClick,
    children,
}: SectionCardConfig) => {
    return (
        <Card className="group transition-all hover:shadow-md border-gray-100 p-0">
            <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-500 transition-colors group-hover:bg-emerald-50 group-hover:text-emerald-500">
                        <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                            {title}
                        </h3>
                        <p className="text-sm text-gray-500">{description}</p>
                    </div>
                </div>

                {isDropdown ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="shrink-0 gap-2 rounded-full border-dashed border-gray-300 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">{action}</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>Chọn loại kỹ năng</DropdownMenuLabel>
                            <DropdownMenuItem>Kỹ năng chuyên môn</DropdownMenuItem>
                            <DropdownMenuItem>Kỹ năng mềm</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button
                        variant="outline"
                        className="shrink-0 gap-2 rounded-full border-dashed border-gray-300 text-gray-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                        onClick={onActionClick}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">{action}</span>
                    </Button>
                )}
            </CardContent>
            {children && (
                <CardContent className="pt-0 px-5 pb-5 ">{children}</CardContent>
            )}
        </Card>
    );
};

export default ProfileCvPage;
