import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { OrderServices } from "@/services/order.service";
import type { ServicePlan } from "@/models/service-plan";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  ShoppingCart,
  CreditCard,
  QrCode,
  Package,
  Sparkles,
  Clock,
  FileText,
  Users,
} from "lucide-react";
import { Order } from "@/models/order";
import { ServicePlanServices } from "@/services/service-plan.service";
import { cn } from "@/lib/utils";

type OrderStep = "review" | "payment";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [plan, setPlan] = useState<ServicePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string>("");
  const [orders, setOrders] = useState<Order>();
  const [paymentStatus, setPaymentStatus] = useState<
    "Pending" | "Success" | "Failed"
  >("Pending");
  const [currentStep, setCurrentStep] = useState<OrderStep>("review");

  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null
  );
  const POLLING_INTERVAL = 5000;

  // Function check trạng thái order
  const checkOrderStatus = useCallback(async (orderId: number) => {
    try {
      const response = await OrderServices.getAllWithPagination({
        page: 1,
        size: 10,
        search: "",
        sortBy: "",
        isDecending: false,
        id: orderId,
      });
      const order = response.result.items[0] as unknown as Order;

      if (!order) return;

      if (order.status === "Success") {
        setPaymentStatus("Success");
        setOrders(order);
        stopPolling();
      } else if (order.status === "Failed") {
        setPaymentStatus("Failed");
        stopPolling();
      }
    } catch (err) {
      console.error("Failed to check order status", err);
    }
  }, []);

  // Dừng polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  // Bắt đầu polling khi orders đã được tạo
  useEffect(() => {
    if (orders?.id && paymentStatus === "Pending" && currentStep === "payment") {
      checkOrderStatus(orders.id);

      pollingIntervalRef.current = setInterval(() => {
        checkOrderStatus(orders.id);
      }, POLLING_INTERVAL);
    }

    return () => {
      stopPolling();
    };
  }, [orders?.id, paymentStatus, currentStep, checkOrderStatus, stopPolling]);

  // Fetch service plan (chỉ load thông tin gói, không tạo order)
  useEffect(() => {
    const fetchPlan = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const response = await ServicePlanServices.getById(id);
        setPlan(response.result);
      } catch (err) {
        console.error("Failed to fetch plan", err);
        setError("Không thể tải thông tin gói dịch vụ");
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  // Xác nhận đơn hàng và tạo order
  const handleConfirmOrder = async () => {
    if (!plan) return;
    setCreatingOrder(true);
    try {
      const responseOrder = await OrderServices.createOrder(plan.id);
      setOrders(responseOrder.result);
      setCurrentStep("payment");
    } catch (err) {
      console.error("Failed to create order", err);
      setError("Không thể tạo đơn hàng. Vui lòng thử lại.");
    } finally {
      setCreatingOrder(false);
    }
  };

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  // Get feature icon
  const getFeatureIcon = (index: number) => {
    const icons = [FileText, Users, Sparkles, Clock];
    const Icon = icons[index % icons.length];
    return <Icon className="h-4 w-4 text-primary" />;
  };

  // Get features for display
  const getFeatures = (plan: ServicePlan): string[] => {
    const features: string[] = [];

    if (plan.jobPostAdditional && plan.jobPostAdditional > 0) {
      features.push(`${plan.jobPostAdditional} Tin đăng tuyển dụng`);
    }

    if (plan.cvSaveAdditional && plan.cvSaveAdditional > 0) {
      features.push(`${plan.cvSaveAdditional} lượt xem CV ứng viên`);
    }

    if (plan.highlightJobDays && plan.highlightJobDays > 0) {
      features.push(`Làm nổi bật tin ${plan.highlightJobDays} ngày`);
    }

    if (plan.extensionJobDays && plan.extensionJobDays > 0) {
      features.push(`Gia hạn tin đăng ${plan.extensionJobDays} ngày`);
    }

    if (features.length === 0 && plan.description) {
      features.push(plan.description);
    }

    return features;
  };

  // Generate QR URL
  const generateQRUrl = () => {
    if (!orders || !orders.amount || !orders.transferContent) return "";

    const amount = orders.amount;
    const transferContent = orders.transferContent;
    const encodedContent = encodeURIComponent(transferContent);
    return `https://img.vietqr.io/image/BIDV-96247H2AM1-print.png?amount=${amount}&addInfo=${encodedContent}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <span className="text-muted-foreground">
            Đang tải thông tin gói dịch vụ...
          </span>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <Package className="h-8 w-8 text-destructive" />
        </div>
        <p className="text-destructive font-medium">
          {error || "Không tìm thấy gói dịch vụ"}
        </p>
        <Button variant="outline" onClick={() => navigate("/pricing")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại chọn gói
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          size="sm"
          className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
          onClick={() => navigate("/pricing")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại chọn gói
        </Button>
        <h1 className="text-3xl font-semibold text-foreground">
          {currentStep === "review" ? "Xác nhận đơn hàng" : "Thanh toán"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {currentStep === "review"
            ? "Kiểm tra thông tin và xác nhận đơn hàng của bạn"
            : "Quét mã QR để hoàn tất thanh toán"}
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                currentStep === "review"
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/20 text-primary"
              )}
            >
              {currentStep === "payment" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                "1"
              )}
            </div>
            <span
              className={cn(
                "font-medium text-sm",
                currentStep === "review"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Xác nhận đơn hàng
            </span>
          </div>

          <div className="w-16 h-0.5 bg-border" />

          <div className="flex items-center gap-2">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                currentStep === "payment"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              2
            </div>
            <span
              className={cn(
                "font-medium text-sm",
                currentStep === "payment"
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              Thanh toán
            </span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Order Summary - Left Side (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="border border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg font-medium">
                    Chi tiết đơn hàng
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Gói dịch vụ bạn đã chọn
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* Plan Info */}
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center shrink-0">
                    <Package className="h-7 w-7 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {plan.description}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  Gói dịch vụ
                </Badge>
              </div>

              <Separator />

              {/* Features */}
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-4">
                  Quyền lợi bao gồm
                </h4>
                <div className="grid sm:grid-cols-2 gap-3">
                  {getFeatures(plan).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50"
                    >
                      {getFeatureIcon(index)}
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Price Summary */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Đơn giá</span>
                  <span>{formatPrice(plan.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Số lượng</span>
                  <span>1</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center pt-2">
                  <span className="font-semibold text-lg">Tổng thanh toán</span>
                  <span className="text-2xl font-bold text-primary">
                    {formatPrice(orders?.amount ?? plan.price)}
                  </span>
                </div>
              </div>

              {/* Confirm Button - Only show in review step */}
              {currentStep === "review" && (
                <Button
                  className="w-full h-12 text-base font-medium"
                  size="lg"
                  onClick={handleConfirmOrder}
                  disabled={creatingOrder}
                >
                  {creatingOrder ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-5 w-5" />
                      Xác nhận đơn hàng
                    </>
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Payment - Right Side (2 cols) */}
        <div className="lg:col-span-2">
          <Card
            className={cn(
              "border border-border/50 shadow-sm h-full transition-all duration-300",
              currentStep === "review" && "opacity-60"
            )}
          >
            <CardHeader className="bg-muted/30 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    currentStep === "payment" ? "bg-primary/10" : "bg-muted"
                  )}
                >
                  <QrCode
                    className={cn(
                      "h-5 w-5",
                      currentStep === "payment"
                        ? "text-primary"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div>
                  <CardTitle className="text-lg font-medium">
                    Thanh toán QR
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Quét mã để thanh toán
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {currentStep === "review" ? (
                // Placeholder when not confirmed
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-48 h-48 rounded-2xl bg-muted/50 border-2 border-dashed border-border flex items-center justify-center mb-6">
                    <QrCode className="h-16 w-16 text-muted-foreground/50" />
                  </div>
                  <h4 className="font-medium text-muted-foreground mb-2">
                    Mã QR thanh toán
                  </h4>
                  <p className="text-sm text-muted-foreground/70 max-w-[200px]">
                    Xác nhận đơn hàng để hiển thị mã QR thanh toán
                  </p>
                </div>
              ) : orders?.amount && orders?.transferContent ? (
                // QR Code when order is created
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="relative">
                      <img
                        src={generateQRUrl()}
                        alt="QR Code thanh toán"
                        className="w-full max-w-[300px] h-auto rounded-lg border shadow-sm"
                      />
                      {paymentStatus === "Success" && (
                        <div className="absolute inset-0 bg-green-500/90 rounded-lg flex flex-col items-center justify-center text-white">
                          <CheckCircle2 className="h-16 w-16 mb-3" />
                          <span className="font-semibold text-lg">
                            Thanh toán thành công!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Status */}
                  {paymentStatus === "Pending" && (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <RefreshCw className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" />
                      <span className="text-sm text-amber-700 dark:text-amber-300">
                        Đang chờ thanh toán...
                      </span>
                    </div>
                  )}

                  {paymentStatus === "Success" && (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                      <span className="text-sm text-green-700 dark:text-green-300 font-medium">
                        Thanh toán thành công!
                      </span>
                    </div>
                  )}

                  {paymentStatus === "Failed" && (
                    <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-destructive/10 border border-destructive/20">
                      <span className="text-sm text-destructive font-medium">
                        Thanh toán thất bại
                      </span>
                    </div>
                  )}

                  {/* Instructions */}
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                    <h5 className="font-medium text-sm mb-3">
                      Hướng dẫn thanh toán
                    </h5>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                          1
                        </span>
                        Mở ứng dụng ngân hàng/ví điện tử
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                          2
                        </span>
                        Chọn tính năng Quét mã QR
                      </p>
                      <p className="flex items-start gap-2">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center shrink-0 mt-0.5">
                          3
                        </span>
                        Quét mã trên và xác nhận thanh toán
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // Loading state when creating order
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <span className="text-sm text-muted-foreground">
                    Đang tạo đơn hàng...
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Actions */}
      {currentStep === "payment" && (
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          {paymentStatus === "Success" ? (
            <Button className="min-w-[200px]" onClick={() => navigate("/")}>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Về trang chủ
            </Button>
          ) : (
            <>
              {paymentStatus === "Failed" && (
                <Button
                  className="min-w-[200px]"
                  onClick={() => {
                    setPaymentStatus("Pending");
                    handleConfirmOrder();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tạo đơn hàng mới
                </Button>
              )}
              <Button
                variant="outline"
                className="min-w-[200px]"
                onClick={() => navigate("/pricing")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Chọn gói khác
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
