import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Import các component của shadcn/ui
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CompanyServices } from "@/services/company.service";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Component Form của shadcn
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContactSuccessModal } from "@/components/ui/ContactSuccessModal";
// Icons
import {
  Phone,
  Mail,
  Clock,
  MapPin,
  Building2,
  Send,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// --- DTO và Schema ---
// Định nghĩa các hằng số cho validation file
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_MIME_TYPES = ["application/pdf"];

// Tạo Zod schema dựa trên DTO và yêu cầu
const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;

const companyCreateSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên người liên hệ."),
  workEmail: z
    .string()
    .min(1, "Vui lòng nhập email công ty.")
    .email("Email không hợp lệ."),
  phoneNumber: z
    .string()
    .regex(
      phoneRegex,
      "Số điện thoại không hợp lệ (ví dụ: 09... hoặc +849...)."
    ),
  companyName: z.string().min(1, "Vui lòng nhập tên công ty."),
  companyLocation: z.string().min(1, "Vui lòng nhập vị trí (Tỉnh/Thành phố)."),
  websiteURL: z
    .string()
    .min(1, "Vui lòng nhập website.")
    .url("URL website không hợp lệ (ví dụ: https://company.com)."),
  taxCode: z.string().min(1, "Vui lòng nhập mã số thuế."),
  address: z.string().min(1, "Vui lòng nhập địa chỉ công ty."),
  licenseFile: z
    .custom<FileList>(
      (val) => val instanceof FileList,
      "Vui lòng tải lên file."
    )
    .refine((files) => files.length > 0, "Vui lòng tải lên file.")
    .refine((files) => files.length <= 1, "Chỉ được tải lên 1 file.")
    .refine(
      (files) => ACCEPTED_MIME_TYPES.includes(files[0]?.type),
      "Chỉ chấp nhận file định dạng .pdf."
    )
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      `Kích thước file tối đa là 5MB.`
    ),
});

// Tạo type cho form từ schema
type CompanyCreateForm = z.infer<typeof companyCreateSchema>;

const ContactRecruiterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCompanyName, setSubmittedCompanyName] = useState("");

  const form = useForm<CompanyCreateForm>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      phoneNumber: "",
      companyName: "",
      companyLocation: "",
      websiteURL: "",
      taxCode: "",
      address: "",
      licenseFile: undefined,
    },
  });

 const onSubmit = async (data: CompanyCreateForm) => {
   setIsLoading(true);
   setSubmitResult(null);

   // 1. Tạo đối tượng FormData
   const formData = new FormData();

   // 2. Thêm TẤT CẢ các trường vào FormData
   // Quan trọng: Tên key ("FullName", "WorkEmail") phải khớp
   // chính xác với tên thuộc tính trong DTO của backend (là PascalCase, theo như log lỗi của bạn).

   formData.append("FullName", data.fullName);
   formData.append("WorkEmail", data.workEmail);
   formData.append("PhoneNumber", data.phoneNumber);
   formData.append("CompanyName", data.companyName);
   formData.append("CompanyLocation", data.companyLocation);
   formData.append("WebsiteUrl", data.websiteURL); // Log lỗi của bạn là "WebsiteUrl", hãy kiểm tra kỹ DTO
   formData.append("TaxCode", data.taxCode);
   formData.append("Address", data.address);
   formData.append("LicenseFile", data.licenseFile[0]); // Thêm file

   try {
     // 3. Gửi FormData đi
     // Service của bạn (CompanyServices.createCompany) giờ đây sẽ nhận FormData
     // Bạn có thể cần tạm thời ép kiểu `as any` nếu TypeScript báo lỗi
     const resultMessage = await CompanyServices.createCompany(formData as any);

     console.log("API Response Success:", resultMessage);

     // (Giữ nguyên phần còn lại của try...)
     setSubmitResult({
       success: true,
       message: "Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
     });

     setSubmittedCompanyName(data.companyName);
     setShowSuccessModal(true);
     form.reset();
   } catch (error) {
     // Improve error parsing for ASP.NET validation responses
     let errorMessage = "Có lỗi không xác định xảy ra, vui lòng thử lại.";

     const apiError = error as any;
     if (apiError?.response?.data) {
       const data = apiError.response.data;
       // If ModelState errors exist, they are in data.errors as an object
       if (data.errors && typeof data.errors === "object") {
         const messages: string[] = [];
         Object.keys(data.errors).forEach((key) => {
           const val = data.errors[key];
           if (Array.isArray(val)) {
             messages.push(...val.map((m) => String(m)));
           } else if (typeof val === "string") {
             messages.push(val);
           }
         });
         if (messages.length > 0) errorMessage = messages.join(" \n");
       } else if (data.title) {
         // e.g. "One or more validation errors occurred."
         errorMessage = data.title;
       } else if (data.message) {
         errorMessage = data.message;
       } else {
         errorMessage = JSON.stringify(data);
       }
     } else if (error instanceof Error) {
       errorMessage = error.message;
     }

     console.error("API Response Error:", error);
     setSubmitResult({
       success: false,
       message: errorMessage,
     });
   } finally {
     setIsLoading(false);
   }
 };

  return (
    <>
      <ContactSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        companyName={submittedCompanyName} // Truyền tên công ty đã submit
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Section - Information (Không đổi) */}
            <div className="space-y-8">
              {/* Header Text */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                    Kết Nối Với Những Tài Năng Xuất Sắc
                  </h1>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    Tham gia cùng chúng tôi để tìm kiếm và tuyển dụng những ứng
                    viên tài năng nhất. Hệ thống matching thông minh giúp bạn
                    tiết kiệm thời gian và chi phí tuyển dụng.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Hotline tư vấn
                      </h3>
                      <p className="text-lg font-medium text-gray-700">
                        +84 (28) 3822-6895
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Email hỗ trợ
                      </h3>
                      <p className="text-lg font-medium text-gray-700">
                        support@jobmatching.vn
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Giờ làm việc
                      </h3>
                      <p className="text-lg font-medium text-gray-700">
                        T2 - T6: 8:00 - 18:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        Văn phòng
                      </h3>
                      <p className="text-lg font-medium text-gray-700">
                        Lô E2a-7, Đường D1, Đ. D1, Long Thạnh Mỹ, Thành Phố Thủ
                        Đức, Hồ Chí Minh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Form (Đã cập nhật) */}
            <div>
              <Card className="bg-teal-50 border-0 shadow-lg">
                <CardHeader className="text-center pb-6">
                  <div className="mx-auto w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center mb-4">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Thông Tin Công Ty
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Vui lòng cung cấp thông tin về công ty của bạn
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {submitResult && (
                    <Alert
                      className={
                        submitResult.success
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }
                    >
                      {submitResult.success ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600" />
                      )}
                      <AlertDescription
                        className={
                          submitResult.success
                            ? "text-green-800"
                            : "text-red-800"
                        }
                      >
                        {submitResult.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* 3. Bọc form bằng <Form> của shadcn */}
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Tên công ty & Vị trí */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="companyName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Tên công ty{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Tên công ty của bạn"
                                  {...field}
                                  className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="companyLocation"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Vị trí (Tỉnh/Thành phố){" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Ví dụ: Hồ Chí Minh"
                                  {...field}
                                  className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Email công ty & Website */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="workEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Email công ty{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="contact@company.com"
                                  {...field}
                                  className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="websiteURL"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Website <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://company.com"
                                  {...field}
                                  className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Tên người liên hệ & SĐT */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Tên người liên hệ{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Họ và tên"
                                  {...field}
                                  className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="phoneNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Số điện thoại{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="09..."
                                  {...field}
                                  className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Mã số thuế */}
                      <FormField
                        control={form.control}
                        name="taxCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Mã số thuế <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Mã số đăng ký kinh doanh"
                                {...field}
                                className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Địa chỉ công ty */}
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Địa chỉ công ty{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Địa chỉ chi tiết của công ty"
                                rows={3}
                                {...field}
                                className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Giấy phép kinh doanh (File) */}
                      {/* File input hơi khác một chút */}
                      <FormField
                        control={form.control}
                        name="licenseFile"
                        render={({
                          field: { value, onChange, ...fieldProps },
                        }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Giấy phép kinh doanh (PDF){" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps} // Bỏ `value` và `onChange` mặc định
                                type="file"
                                accept="application/pdf"
                                onChange={(event) => {
                                  // Gán FileList cho react-hook-form
                                  onChange(event.target.files);
                                }}
                                className="bg-white border-gray-200 file:text-teal-700 file:font-semibold file:bg-teal-50 file:border-0 hover:file:bg-teal-100 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                      >
                        {isLoading ? (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            <span>Đang gửi...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <Send className="w-4 h-4" />
                            <span>Gửi Thông Tin</span>
                          </div>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactRecruiterPage;
