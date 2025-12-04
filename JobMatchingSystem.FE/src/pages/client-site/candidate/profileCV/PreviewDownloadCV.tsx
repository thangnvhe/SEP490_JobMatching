import { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  Download,
  CheckCircle2,
  Palette,
  Languages,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import axios from "axios";

// Services
import { TemplateCvServices } from "@/services/template-cv.service";
import { UserServices } from "@/services/user.service";
import { CVEducationServices } from "@/services/cv-education.service";
import { CVExperienceServices } from "@/services/cv-experience.service";
import { CVProjectServices } from "@/services/cv-project.service";
import { CVCertificateServices } from "@/services/cv-certificate.service";
import { CVAchievementServices } from "@/services/cv-achievement.service";

// Models
import { TemplateCv } from "@/models/template-cv";

// Helper
import { generateCVHtml, CVDataCollection } from "@/lib/utils/cv-template-helper";

// Mock Colors data (Client-side UI only for now)
const COLORS = [
  { id: "default", value: "#333333", bg: "bg-[#333333]" },
  { id: "emerald", value: "#10b981", bg: "bg-emerald-500" },
  { id: "blue", value: "#3b82f6", bg: "bg-blue-500" },
  { id: "purple", value: "#8b5cf6", bg: "bg-purple-500" },
];

// Helper function to get the full URL for the template HTML
const getTemplateUrl = (pathUrl: string) => {
    return pathUrl || "";
};

export default function PreviewDownloadCV() {
  // UI State
  const [templates, setTemplates] = useState<TemplateCv[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateCv | null>(null);
  const [selectedColor, setSelectedColor] = useState("default");
  const [language, setLanguage] = useState<"EN" | "VI">("EN");
  const [htmlContent, setHtmlContent] = useState<string>("");
  
  // Loading State
  const [isTemplatesLoading, setIsTemplatesLoading] = useState(true);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isHtmlGenerating, setIsHtmlGenerating] = useState(false);

  // Data Store (Ref to store data without re-rendering, or State if we need to display it elsewhere)
  // Using State here to trigger re-gen when data is fetched
  const [cvData, setCvData] = useState<CVDataCollection | null>(null);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 1. Fetch Initial Data (User Profile & CV Details)
  useEffect(() => {
      const fetchUserData = async () => {
          try {
              setIsDataLoading(true);
              const [userRes, eduRes, expRes, projRes, certRes, achRes] = await Promise.all([
                  UserServices.getUserProfile(),
                  CVEducationServices.getMyEducations(),
                  CVExperienceServices.getMyExperiences(),
                  CVProjectServices.getMyProjects(),
                  CVCertificateServices.getMyCertificates(),
                  CVAchievementServices.getMyAchievements(),
              ]);

              setCvData({
                  userProfile: userRes.result,
                  educations: eduRes.result,
                  experiences: expRes.result,
                  projects: projRes.result,
                  certificates: certRes.result,
                  achievements: achRes.result
              });
          } catch (error) {
              console.error("Failed to fetch user CV data:", error);
              toast.error("Không thể tải dữ liệu hồ sơ của bạn.");
          } finally {
              setIsDataLoading(false);
          }
      };

      fetchUserData();
  }, []);

  // 2. Fetch Template List
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setIsTemplatesLoading(true);
        const response = await TemplateCvServices.getAllWithPagination({ page: 1, size: 20 });
        if (response.result.items && response.result.items.length > 0) {
          setTemplates(response.result.items);
          console.log(response.result.items);
          setSelectedTemplate(response.result.items[0]); // Select first by default
        }
      } catch (error) {
        console.error("Failed to fetch templates:", error);
        toast.error("Không thể tải danh sách mẫu CV");
      } finally {
        setIsTemplatesLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // 3. Generate HTML (Fetch Raw Template -> Fill Data)
  useEffect(() => {
    const generateContent = async () => {
      if (!selectedTemplate?.pathUrl || !cvData) return;
      
      setIsHtmlGenerating(true);
      try {
        // A. Get Raw HTML
        const fullUrl = getTemplateUrl(selectedTemplate.pathUrl);
        // Important: responseType 'text' to get raw HTML string
        const response = await axios.get(fullUrl, { responseType: 'text' });
        const rawHtml = response.data;

        // B. Fill Data using Helper
        const filledHtml = generateCVHtml(rawHtml, cvData);
        
        // C. (Optional) Inject Selected Color/Theme CSS override here if needed
        // e.g., replacedHtml = filledHtml.replace(':root { --primary-color: ... }', ...)

        setHtmlContent(filledHtml);
      } catch (error) {
        console.error("Failed to generate CV content:", error);
        setHtmlContent("<div class='p-8 text-center text-red-500'>Đã xảy ra lỗi khi tạo CV. Vui lòng thử lại mẫu khác.</div>");
      } finally {
        setIsHtmlGenerating(false);
      }
    };

    generateContent();
  }, [selectedTemplate, cvData, selectedColor, language]); // Re-run when template or data changes


  // Handle Print / Download
  const handleDownloadPdf = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
          // Trigger browser print dialog - users can "Save as PDF"
          iframeRef.current.contentWindow.print();
      } else {
          toast.error("Chưa sẵn sàng để in. Vui lòng đợi nội dung tải xong.");
      }
  };


  return (
    <div className="flex min-h-screen flex-col bg-gray-50/50 font-sans text-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
        <Link
          to="/profile-cv"
          className="group flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-emerald-600"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 transition-colors group-hover:bg-emerald-50">
            <ChevronLeft className="h-4 w-4" />
          </div>
          Back to update profile
        </Link>

        <div className="flex items-center gap-2">
          <span className="font-bold text-xl text-gray-800">
            CV Templates
          </span>
        </div>

        {/* Header Action Placeholder */}
        <div className="w-[140px] flex justify-end">
             {/* Maybe Save Draft button later */}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Template Selection */}
        <aside className="hidden w-80 flex-col border-r border-gray-200 bg-white md:flex">
          <div className="p-6 pb-2">
            <h3 className="font-semibold text-gray-900">Select Template</h3>
            <p className="text-xs text-gray-500 mt-1">
              Choose a layout that fits your style
            </p>
          </div>
          <ScrollArea className="flex-1 px-6 py-4">
             {isTemplatesLoading ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-emerald-500"/>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4 pb-6">
                {templates.map((template) => (
                    <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template)}
                    className={cn(
                        "group cursor-pointer relative rounded-xl border-2 transition-all duration-200 ease-in-out overflow-hidden",
                        selectedTemplate?.id === template.id
                        ? "border-emerald-500 shadow-md shadow-emerald-100"
                        : "border-transparent hover:border-gray-200 hover:shadow-sm bg-gray-50"
                    )}
                    >
                    {/* Thumbnail Preview */}
                    <div className={cn("w-full aspect-[210/297] p-2 transition-colors bg-white")}>
                         {template.imageUrl ? (
                             <img 
                                 src={template.imageUrl} 
                                 alt={template.name} 
                                 className="h-full w-full object-cover rounded-sm border border-gray-200"
                                 loading="lazy"
                             />
                         ) : (
                             <div className="h-full w-full border border-dashed border-gray-300/60 rounded-sm flex flex-col gap-1 p-1 opacity-60 bg-gray-50 overflow-hidden pointer-events-none select-none">
                                 <div className="w-full h-2 bg-gray-200 rounded-sm mb-1"></div>
                                 <div className="flex gap-1 h-full">
                                     <div className="w-1/3 bg-gray-200 h-full rounded-sm"></div>
                                     <div className="w-2/3 bg-gray-100 h-full rounded-sm"></div>
                                 </div>
                             </div>
                         )}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-2 border-t border-gray-100 flex items-center justify-between">
                        <span
                        className={cn(
                            "font-medium text-xs truncate",
                            selectedTemplate?.id === template.id
                            ? "text-emerald-700"
                            : "text-gray-600"
                        )}
                        title={template.name}
                        >
                        {template.name}
                        </span>
                        {selectedTemplate?.id === template.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                        )}
                    </div>
                    </div>
                ))}
                </div>
             )}
          </ScrollArea>
        </aside>

        {/* Main Preview Area */}
        <main className="flex-1 overflow-y-auto bg-gray-100/50 p-8 flex justify-center items-start">
          <div className="relative shadow-2xl shadow-gray-300/50 transition-transform duration-300 origin-top">
            {/* Container Size A4: 210mm x 297mm */}
            <div className="w-[210mm] min-h-[297mm] bg-white relative overflow-hidden">
               
               {/* Loading State Overlay */}
               {(isHtmlGenerating || isDataLoading) && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
                            <p className="text-sm text-gray-500 font-medium">
                                {isDataLoading ? "Đang tải dữ liệu..." : "Đang tạo bản xem trước..."}
                            </p>
                        </div>
                    </div>
               )}

               {/* IFrame Safe Render */}
               {htmlContent ? (
                   <iframe
                       ref={iframeRef}
                       title="CV Preview Frame"
                       srcDoc={htmlContent}
                       className="w-full h-[297mm] overflow-hidden border-none"
                       style={{ display: 'block' }} // ensure block display
                   />
               ) : (
                   !isHtmlGenerating && !isDataLoading && (
                       <div className="flex h-[297mm] items-center justify-center text-gray-400">
                           Chọn một mẫu template để bắt đầu
                       </div>
                   )
               )}
            </div>
          </div>
        </main>
      </div>

      {/* Bottom Toolbar */}
      <div className="sticky bottom-0 z-50 border-t border-gray-200 bg-white px-6 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            {/* Color Picker - Future Feature */}
            <div className="flex items-center gap-3 opacity-50 pointer-events-none" title="Tính năng đang phát triển">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Palette className="h-4 w-4" />
                <span>Color Theme</span>
              </div>
              <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5">
                {COLORS.map((color) => (
                  <div
                    key={color.id}
                    onClick={() => setSelectedColor(color.id)}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 cursor-pointer",
                      selectedColor === color.id ? "border-gray-400" : "border-transparent",
                      color.bg
                    )}
                  />
                ))}
              </div>
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Language - Future Feature */}
            <div className="flex items-center gap-3 opacity-50 pointer-events-none">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <Languages className="h-4 w-4" />
                <span>Language</span>
              </div>
              <div className="flex rounded-lg bg-gray-100 p-1">
                  <button onClick={() => setLanguage("EN")} className={cn("rounded-md px-3 py-1 text-xs font-bold", language === "EN" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500")}>EN</button>
                  <button onClick={() => setLanguage("VI")} className={cn("rounded-md px-3 py-1 text-xs font-bold", language === "VI" ? "bg-white text-emerald-600 shadow-sm" : "text-gray-500")}>VI</button>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleDownloadPdf}
            disabled={!htmlContent || isHtmlGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 px-8 rounded-full shadow-lg shadow-emerald-100 hover:shadow-emerald-200 transition-all"
          >
            {isHtmlGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
