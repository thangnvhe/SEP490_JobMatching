import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { ServicePlanServices } from "@/services/service-plan.service";
import { OrderServices } from "@/services/order.service";
import type { ServicePlan } from "@/models/service-plan";
import type { RootState } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CheckCircle2, Loader2, RefreshCw } from "lucide-react";
import { Order } from "@/models/order";

export default function OrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { name: userName } = useSelector((state: RootState) => state.authState);

  const [plan, setPlan] = useState<ServicePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [orders, setOrders] = useState<Order>();
  const [paymentStatus, setPaymentStatus] = useState<"Pending" | "Success" | "Failed">("Pending");
  const isInitialized = useRef(false);
  const pollingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const POLLING_INTERVAL = 5000; // 5 giây

  // Function check trạng thái order
  const checkOrderStatus = useCallback(
    async (orderId: number) => {
      try {
        const response = await OrderServices.getAllWithPagination({
          page: 1,
          size: 10,
          search: "",
          sortBy: "",
          isDecending: false,
          id: orderId,
        });
        // Lấy bản ghi đầu tiên (chỉ có 1 bản ghi)
        const order = response.result.items[0] as unknown as Order;
        
        if (!order) return;
        
        // Check status của order
        if (order.status === "Success") {
          setPaymentStatus("Success");
          setOrders(order);
          console.log("Thanh toán thành công!", order);
          // Dừng polling khi thành công
          stopPolling();
        } else if (order.status === "Failed") {
          setPaymentStatus("Failed");
          console.log("Thanh toán thất bại!", order);
          // Dừng polling khi thất bại
          stopPolling();
        }
        // Nếu status = "Pending" thì tiếp tục polling
      } catch (err) {
        console.error("Failed to check order status", err);
      }
    },
    []
  );

  // Dừng polling
  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
      console.log("Đã dừng polling");
    }
  }, []);

  // Bắt đầu polling khi orders đã được tạo
  useEffect(() => {
    if (orders?.id && paymentStatus === "Pending") {
      // Gọi ngay lần đầu
      checkOrderStatus(orders.id);
      
      // Bắt đầu polling định kỳ
      pollingIntervalRef.current = setInterval(() => {
        console.log("Polling check order status...");
        checkOrderStatus(orders.id);
      }, POLLING_INTERVAL);
    }

    // Cleanup khi component unmount hoặc orders thay đổi
    return () => {
      stopPolling();
    };
  }, [orders?.id, paymentStatus, checkOrderStatus, stopPolling]);

  // Initialize order
  const initOrder = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const response = await ServicePlanServices.getById(id);
      setPlan(response.result);
      const responseOrder = await OrderServices.createOrder(response.result.id);
      setOrders(responseOrder.result);
    } catch (err) {
      console.error("Failed to init order", err);
      setError("Không thể tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch service plan và tạo order (chỉ chạy 1 lần)
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    initOrder();
  }, [id]);

  // Format price to VND
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + "đ";
  };

  // Get features for display
  const getFeatures = (plan: ServicePlan): string[] => {
    const features: string[] = [];

    if (plan.jobPostAdditional && plan.jobPostAdditional > 0) {
      features.push(`${plan.jobPostAdditional} Tin đăng`);
    }

    if (plan.cvSaveAdditional && plan.cvSaveAdditional > 0) {
      features.push(`${plan.cvSaveAdditional} lượt xem CV`);
    }

    if (plan.highlightJobDays && plan.highlightJobDays > 0) {
      features.push(`Làm nổi bật ${plan.highlightJobDays} ngày`);
    }

    if (plan.extensionJobDays && plan.extensionJobDays > 0) {
      features.push(`Gia hạn ${plan.extensionJobDays} ngày`);
    }

    if (features.length === 0 && plan.description) {
      features.push(plan.description);
    }

    return features;
  };

  // Generate QR URL
  const generateQRUrl = () => {
    if (!plan) return "";
    const amount = plan.price;
    const transferContent = `${userName || "KhachHang"} ${plan.name}`
      .replace(/\s+/g, " ")
      .trim();
    const encodedContent = encodeURIComponent(transferContent);
    return `https://img.vietqr.io/image/BIDV-96247H2AM1-print.png?amount=${amount}&addInfo=${encodedContent}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Đang tải thông tin đơn hàng...</span>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-destructive">
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
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-semibold text-foreground mb-6">
        Thanh toán Đơn hàng
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Order Summary - Left Side */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium">
              Tóm tắt Đơn hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Plan Info */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Gói dịch vụ</span>
                <span className="font-medium">{plan.name}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quyền lợi</span>
                <span className="text-right max-w-[200px]">
                  {getFeatures(plan).join(", ")}
                </span>
              </div>
            </div>

            <Separator />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-medium">Tổng cộng:</span>
              <span className="text-2xl font-bold text-primary">
                {formatPrice(plan.price)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* QR Payment - Right Side */}
        <Card className="border border-border/50 shadow-sm">
          <CardHeader className="">
            <CardTitle className="text-lg font-medium">
              Quét mã QR để thanh toán
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={generateQRUrl()}
                  alt="QR Code thanh toán"
                  className="w-[420px] h-[480px] rounded-lg border"
                />
                <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>1. Mở ứng dụng ngân hàng/ví điện tử.</p>
              <p>2. Chọn tính năng Quét mã QR.</p>
              <p>3. Quét mã trên và xác nhận thanh toán.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status and Actions */}
      <div className="mt-6 space-y-4">
        {paymentStatus === "Pending" && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>
              Trạng thái:{" "}
              <span className="text-foreground">Đang chờ thanh toán...</span> (Tự
              động cập nhật mỗi 5 giây)
            </span>
          </div>
        )}

        {paymentStatus === "Success" && (
          <div className="flex items-center justify-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">
              Thanh toán thành công! Cảm ơn bạn đã sử dụng dịch vụ.
            </span>
          </div>
        )}

        {paymentStatus === "Failed" && (
          <div className="flex items-center justify-center gap-2 text-sm text-destructive">
            <span className="font-medium">
              Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {paymentStatus === "Success" ? (
            <Button
              className="min-w-[200px]"
              onClick={() => navigate("/")}
            >
              Về trang chủ
            </Button>
          ) : (
            <>
              <Button
                className="min-w-[200px]"
                disabled={paymentStatus === "Pending"}
                onClick={() => {
                  // Retry payment nếu failed
                  if (paymentStatus === "Failed") {
                    setPaymentStatus("Pending");
                  }
                }}
              >
                {paymentStatus === "Pending" ? "Đang kiểm tra..." : "Thử lại"}
              </Button>
              <Button
                variant="outline"
                className="min-w-[200px]"
                onClick={() => navigate("/pricing")}
              >
                Quay lại chọn gói
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
