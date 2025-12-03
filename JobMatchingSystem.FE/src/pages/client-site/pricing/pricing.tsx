import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ServicePlanServices } from "@/services/service-plan.service";
import type { ServicePlan } from "@/models/service-plan";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRight, CheckCircle2 } from "lucide-react";

export default function PricingPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const response = await ServicePlanServices.getAll();
      setPlans(response.result);
    } catch (error) {
      console.error("Failed to fetch service plans", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const getFeatures = (plan: ServicePlan): string[] => {
    const features: string[] = [];

    if (plan.jobPostAdditional && plan.jobPostAdditional > 0) {
      features.push(
        `Thêm ${plan.jobPostAdditional} bài đăng tuyển dụng`
      );
    }

    if (plan.highlightJobDays && plan.highlightJobDays > 0) {
      features.push(`Làm nổi bật bài đăng trong ${plan.highlightJobDays} ngày`);
    }

    if (plan.extensionJobDays && plan.extensionJobDays > 0) {
      features.push(`Gia hạn bài đăng trong ${plan.extensionJobDays} ngày`);
    }

    if (plan.cvSaveAdditional && plan.cvSaveAdditional > 0) {
      features.push(`Lưu thêm ${plan.cvSaveAdditional} hồ sơ ứng viên`);
    }

    if (features.length === 0 && plan.description) {
      features.push(plan.description);
    } else if (features.length === 0) {
       features.push("Truy cập cơ bản");
    }

    return features;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        Loading plans...
      </div>
    );
  }

  return (
    <div className="not-prose flex flex-col gap-16 px-8 py-24 text-center container mx-auto">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="mb-0 text-balance font-medium text-5xl tracking-tighter">
          Bảng giá đơn giản, minh bạch
        </h1>
        <p className="mx-auto mt-0 mb-0 max-w-2xl text-balance text-lg text-muted-foreground">
          Chọn gói dịch vụ phù hợp nhất với nhu cầu tuyển dụng của bạn.
        </p>
        
        <div className="mt-8 grid w-full gap-4 lg:grid-cols-4 items-start">
          {plans.map((plan) => {
            return (
              <Card
                className="relative w-full text-left flex flex-col h-full"
                key={plan.id}
              >
                <CardHeader>
                  <CardTitle className="font-medium text-xl">
                    {plan.name}
                  </CardTitle>
                  <CardDescription>
                    <p className="mb-4 min-h-[40px]">{plan.description}</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "USD",
                          maximumFractionDigits: 0,
                        }).format(plan.price)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-sm font-normal text-muted-foreground">
                           / lượt
                        </span>
                      )}
                    </div>
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-2 flex-1">
                  <div className="text-sm font-medium mb-2 text-foreground/80">
                    Bao gồm:
                  </div>
                  {getFeatures(plan).map((feature, index) => (
                    <div
                      className="flex items-start gap-2 text-muted-foreground text-sm"
                      key={index}
                    >
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-left">{feature}</span>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="mt-auto pt-4">
                  <Button 
                    className="w-full" 
                    variant="secondary"
                    onClick={() => navigate(`/order/${plan.id}`)}
                  >
                    {plan.price === 0 ? "Bắt đầu ngay" : "Mua ngay"}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
