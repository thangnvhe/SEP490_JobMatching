import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { toast } from "sonner";
import { ProvincesService, type Province, type Ward } from "@/services/provinces.service";

// --- validation/schema ---
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const phoneRegex = /^(0|\+84)[0-9]{8,11}$/;

const companyCreateSchema = z.object({
  fullName: z.string().min(1, "Vui lòng nhập họ và tên").max(100, "Họ và tên không được vượt quá 100 ký tự"),
  email: z
    .string()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  phoneContact: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(
      phoneRegex,
      "Số điện thoại không hợp lệ"
    )
    .min(8, "Số điện thoại phải có từ 8-15 chữ số")
    .max(15, "Số điện thoại phải có từ 8-15 chữ số"),
  name: z.string().min(1, "Vui lòng nhập tên công ty").max(150, "Tên công ty không được vượt quá 150 ký tự"),
  website: z
    .string()
    .min(1, "Vui lòng nhập website")
    .url("Địa chỉ website không hợp lệ"),
  taxCode: z.string().min(1, "Vui lòng nhập mã số thuế"),
  province: z.string().min(1, "Vui lòng chọn tỉnh/thành phố"),
  ward: z.string().min(1, "Vui lòng chọn phường/xã"),
  street: z.string().min(1, "Vui lòng nhập số nhà, tên đường"),
  description: z.string().min(1, "Vui lòng nhập mô tả").max(255, "Mô tả không được vượt quá 255 ký tự"),
  licenseFile: z
    .custom<FileList>(
      (val) => val instanceof FileList,
      "Vui lòng tải lên giấy phép kinh doanh"
    )
    .refine((files) => files.length > 0, "Vui lòng tải lên giấy phép kinh doanh")
    .refine((files) => files.length <= 1, "Chỉ được chọn một file")
    .refine(
      (files) => ACCEPTED_MIME_TYPES.includes(files[0]?.type),
      "Định dạng file không hợp lệ. Chỉ chấp nhận PDF, JPG, JPEG, PNG"
    )
    .refine(
      (files) => files[0]?.size <= MAX_FILE_SIZE,
      "Kích thước file không được vượt quá 5MB"
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
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isProvincesLoading, setIsProvincesLoading] = useState(false);
  const [isWardsLoading, setIsWardsLoading] = useState(false);

  const form = useForm<CompanyCreateForm>({
    resolver: zodResolver(companyCreateSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneContact: "",
      name: "",
      website: "",
      taxCode: "",
      province: "",
      ward: "",
      street: "",
      description: "",
      licenseFile: undefined,
    },
  });

  useEffect(() => {
    const fetchProvinces = async () => {
      setIsProvincesLoading(true);
      try {
        const data = await ProvincesService.getAllProvinces(1);
        setProvinces(data || []);
      } catch (err) {
        console.error("Lỗi tải tỉnh:", err);
        toast.error("Không thể tải danh sách tỉnh/thành phố");
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
      // Lấy thông tin tỉnh với depth=2 để có districts
      const provinceData = await ProvincesService.getProvinceByCode(provinceCode, 2);
      
      // Thu thập tất cả wards từ các districts bằng cách gọi API riêng cho mỗi district
      const allWards: Ward[] = [];
      if (provinceData.districts && provinceData.districts.length > 0) {
        // Gọi API song song để lấy wards cho tất cả districts
        const wardsPromises = provinceData.districts.map((district) =>
          ProvincesService.getWardsByDistrictCode(district.code)
        );
        const wardsResults = await Promise.all(wardsPromises);
        // Gộp tất cả wards lại
        wardsResults.forEach((wards) => {
          allWards.push(...wards);
        });
      }
      setWards(allWards);
    } catch (err) {
      console.error("Lỗi tải phường/xã:", err);
      toast.error("Không thể tải danh sách phường/xã");
      setWards([]);
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

      // Đúng theo CreateCompanyRequest.cs
      formData.append("FullName", data.fullName);
      formData.append("Email", data.email);
      formData.append("PhoneContact", data.phoneContact);
      formData.append("Name", data.name);
      formData.append("Website", data.website);
      formData.append("TaxCode", data.taxCode);
      formData.append("Address", fullAddress);
      formData.append("Description", data.description);
      formData.append("LicenseFile", data.licenseFile[0]);

      const response = await CompanyServices.createCompany(formData);
      console.log("API Response Success:", response);

      toast.success("Đăng ký công ty thành công!", {
        description: "Chúng tôi sẽ xem xét và liên hệ với bạn sớm.",
      });
      
      setSubmittedCompanyName(data.name);
      setShowSuccessModal(true);
      // Reset form and also clear wards
      form.reset();
      setWards([]);
      setSubmitResult(null); // Clear any previous error
    } catch (error: any) {
      const errorMessage = error.response.data.errorMessages[0];
      toast.error(errorMessage);
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
                  {submitResult && submitResult.success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
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
                        name="name"
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
                          name="email"
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
                          name="website"
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
                          name="phoneContact"
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

                      {/* Mô tả công ty */}
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-semibold text-gray-700">
                              Mô tả công ty <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <textarea
                                {...field}
                                rows={4}
                                placeholder="Mô tả ngắn gọn về công ty của bạn"
                                className="w-full px-3 py-2 border border-gray-200 rounded-md focus:border-teal-500 focus:ring-teal-500 bg-white resize-none"
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
                              Giấy phép kinh doanh{" "}
                              <span className="text-red-500">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...fieldProps}
                                type="file"
                                accept="application/pdf,image/jpeg,image/jpg,image/png"
                                onChange={(e) =>
                                  onChange(e.target.files as FileList)
                                }
                                className="bg-white border-gray-200 file:text-teal-700 file:font-semibold file:bg-teal-50 file:border-0 hover:file:bg-teal-100 focus:border-teal-500 focus:ring-teal-500"
                              />
                            </FormControl>
                            <div className="text-xs text-gray-500 mt-1">
                              Chấp nhận file PDF, JPG, JPEG, PNG (tối đa 5MB)
                            </div>
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
