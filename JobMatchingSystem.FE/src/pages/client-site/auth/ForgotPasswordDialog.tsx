import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSelector } from "react-redux";
import { useAppDispatch } from "@/store";
import type { RootState } from "@/store";
import { clearError } from "@/store/slices/authSlice";
import { toast } from "sonner";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLogin?: () => void;
}

export function ForgotPasswordDialog({ isOpen, onOpenChange, onOpenLogin }: ForgotPasswordDialogProps) {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useSelector((state: RootState) => state.auth);
  
  const [email, setEmail] = React.useState("");
  const [localError, setLocalError] = React.useState("");
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setLocalError("");
      setIsSuccess(false);
      dispatch(clearError());
    }
  }, [isOpen, dispatch]);

  // Show error toast when there's an error
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setLocalError("Email is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setLocalError("Please enter a valid email address");
      return;
    }

    setLocalError("");

    try {
      // await dispatch(forgotPassword({ email })).unwrap();
      setIsSuccess(true);
      toast.success("Email đặt lại mật khẩu đã được gửi!");
    } catch (error) {
      // Error is handled by the slice and shown via toast
      console.error("Forgot password error:", error);
    }
  };


  const handleClose = () => {
    onOpenChange(false);
    setEmail("");
    setLocalError("");
    setIsSuccess(false);
    dispatch(clearError());
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[400px] p-0 gap-0">
          <div className="p-6 text-center">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-semibold text-green-600">
                Check Your Email
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">
                  We've sent a password reset link to:
                </p>
                <p className="font-medium text-gray-900">{email}</p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleClose}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                >
                  Done
                </Button>

                <p className="text-sm text-gray-600">
                  Didn't receive the email?{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => setIsSuccess(false)}
                  >
                    Try again
                  </Button>
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 gap-0">
        <div className="p-6 pb-0">
          <DialogHeader className="text-center pb-2">
            <DialogTitle className="text-xl font-semibold">
              Forgot Password
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-600 text-center">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLocalError("");
                  }}
                  className={`h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 ${
                    localError ? "border-red-500" : ""
                  }`}
                />
                {localError && (
                  <p className="text-sm text-red-500">{localError}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </div>
        </div>

        <div className="px-6 pb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Remember your password?{" "}
              <Button
                variant="link"
                className="p-0 h-auto text-blue-600 hover:text-blue-800 font-medium"
                onClick={() => {
                  onOpenChange(false);
                  onOpenLogin?.();
                }}
              >
                Back to Login
              </Button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
