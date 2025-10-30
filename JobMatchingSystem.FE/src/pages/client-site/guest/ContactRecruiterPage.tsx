import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
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
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ContactSuccessModal } from "@/components/ui/ContactSuccessModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

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

// --- validation/schema ---
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf"];
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
  websiteURL: z
    .string()
    .min(1, "Vui lòng nhập website.")
    .url("URL website không hợp lệ (ví dụ: https://company.com)."),
  taxCode: z.string().min(1, "Vui lòng nhập mã số thuế."),
  province: z.string().min(1, "Vui lòng chọn Tỉnh/Thành phố."),
  ward: z.string().min(1, "Vui lòng chọn Phường/Xã."),
  street: z.string().min(1, "Vui lòng nhập số nhà, tên đường."),
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
      "Kích thước file tối đa là 5MB."
    ),
});

type CompanyCreateForm = z.infer<typeof companyCreateSchema>;

const ContactRecruiterPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [submittedCompanyName, setSubmittedCompanyName] = useState("");
  const navigate = useNavigate();
  // address data
  const [provinces, setProvinces] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  const API_BASE_URL = "https://provinces.open-api.vn/api/v2";

  const form = useForm<CompanyCreateForm>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      fullName: "",
      workEmail: "",
      phoneNumber: "",
      companyName: "",
      websiteURL: "",
      taxCode: "",
      province: "",
      ward: "",
      street: "",
      licenseFile: undefined,
    },
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsProvincesLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/p?depth=1`);
        const data = await res.json();
        setProvinces(data || []);
      } catch (err) {
        console.error("Lỗi tải tỉnh:", err);
      } finally {
        setIsProvincesLoading(false);
      }
    };
    fetchProvinces();
  }, []);

  const handleProvinceChange = async (provinceCode: string) => {
    // set form province (we store province code as string)
    form.setValue("province", provinceCode);
    // reset ward
    form.setValue("ward", "");
    setWards([]);
    setIsWardsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/p/${provinceCode}?depth=2`);
      const data = await res.json();
      setWards(data?.wards || []);
    } catch (err) {
      console.error("Lỗi tải xã:", err);
    } finally {
      setIsWardsLoading(false);
    }
  };

  const onSubmit = async (data: CompanyCreateForm) => {
    setIsLoading(true);
    setSubmitResult(null);

    try {
      const formData = new FormData();
      const provinceName =
        provinces.find((p) => p.code.toString() === data.province)?.name || "";
      const fullAddress = `${data.street}, ${data.ward}, ${provinceName}`;

      formData.append("FullName", data.fullName);
      formData.append("WorkEmail", data.workEmail);
      formData.append("PhoneNumber", data.phoneNumber);
      formData.append("CompanyName", data.companyName);
      formData.append("WebsiteUrl", data.websiteURL);
      formData.append("TaxCode", data.taxCode);
      formData.append("Address", fullAddress);
      formData.append("LicenseFile", data.licenseFile[0]);

      const resultMessage = await CompanyServices.createCompany(
        formData as any
      );
      console.log("API Response Success:", resultMessage);

      setSubmitResult({
        success: true,
        message: "Gửi thông tin thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
      });
      setSubmittedCompanyName(data.companyName);
      setShowSuccessModal(true);
      // Reset form and also clear wards
      form.reset();
      setWards([]);
    } catch (error) {
      let errorMessage = "Có lỗi không xác định xảy ra, vui lòng thử lại.";
      const apiError = error as any;
      if (apiError?.response?.data) {
        const d = apiError.response.data;
        if (d.errors && typeof d.errors === "object") {
          const messages: string[] = [];
          Object.keys(d.errors).forEach((k) => {
            const val = d.errors[k];
            if (Array.isArray(val)) messages.push(...val.map(String));
            else if (typeof val === "string") messages.push(val);
          });
          if (messages.length) errorMessage = messages.join(" \n");
        } else if (d.title) errorMessage = d.title;
        else if (d.message) errorMessage = d.message;
        else errorMessage = JSON.stringify(d);
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("API Response Error:", error);
      setSubmitResult({ success: false, message: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ContactSuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate("/"); // ✅ Sau khi nhấn OK thì về Home
        }}
        companyName={submittedCompanyName}
      />

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Left Info */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Kết Nối Với Những Tài Năng Xuất Sắc
                </h1>
                <p className="text-lg text-gray-600">
                  Tham gia cùng chúng tôi để tìm kiếm và tuyển dụng những ứng
                  viên tài năng nhất.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Hotline tư vấn</h3>
                      <p className="text-lg font-medium text-gray-700">
                        +84 (28) 3822-6895
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Mail className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Email hỗ trợ</h3>
                      <p className="text-lg font-medium text-gray-700">
                        support@jobmatching.vn
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Giờ làm việc</h3>
                      <p className="text-lg font-medium text-gray-700">
                        T2 - T6: 8:00 - 18:00
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Văn phòng</h3>
                      <p className="text-lg font-medium text-gray-700">
                        Lô E2a-7, Đường D1, Long Thạnh Mỹ, TP.Thủ Đức, HCM
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right - Form */}
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

                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(onSubmit)}
                      className="space-y-6"
                    >
                      {/* Tên công ty */}
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
                                {...field}
                                placeholder="Tên công ty của bạn"
                                className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Email & Website */}
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
                                  {...field}
                                  placeholder="contact@company.com"
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
                                  {...field}
                                  placeholder="https://company.com"
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
                                  {...field}
                                  placeholder="Họ và tên"
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
                                  {...field}
                                  placeholder="09..."
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
                                {...field}
                                placeholder="Mã số đăng ký kinh doanh"
                                className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Địa chỉ: province + ward */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="province"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Tỉnh/Thành phố{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={(v) => handleProvinceChange(v)}
                                value={field.value}
                                disabled={isProvincesLoading}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                                    <SelectValue
                                      placeholder={
                                        isProvincesLoading
                                          ? "Đang tải..."
                                          : "Chọn tỉnh/thành"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {provinces.map((p) => (
                                    <SelectItem
                                      key={p.code}
                                      value={p.code.toString()}
                                    >
                                      {p.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="ward"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-sm font-semibold text-gray-700">
                                Phường/Xã{" "}
                                <span className="text-red-500">*</span>
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                                disabled={isWardsLoading || wards.length === 0}
                              >
                                <FormControl>
                                  <SelectTrigger className="w-full bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500">
                                    <SelectValue
                                      placeholder={
                                        isWardsLoading
                                          ? "Đang tải..."
                                          : "Chọn phường/xã"
                                      }
                                    />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {wards.map((w) => (
                                    <SelectItem key={w.code} value={w.name}>
                                      {w.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Số nhà, tên đường */}
                      <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Số nhà, tên đường{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ví dụ: 123 Nguyễn Huệ"
                                className="bg-white border-gray-200 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* File giấy phép */}
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
                                {...fieldProps}
                                type="file"
                                accept="application/pdf"
                                onChange={(e) =>
                                  onChange(e.target.files as FileList)
                                }
                                className="bg-white border-gray-200 file:text-teal-700 file:font-semibold file:bg-teal-50 file:border-0 hover:file:bg-teal-100 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
