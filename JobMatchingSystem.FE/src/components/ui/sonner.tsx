import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 text-green-600" />,
        info: <InfoIcon className="size-4 text-blue-600" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-600" />,
        error: <OctagonXIcon className="size-4 text-red-600" />,
        loading: <Loader2Icon className="size-4 animate-spin text-blue-600" />,
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-white group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-white group-[.toaster]:border-green-200 group-[.toaster]:text-green-900",
          error: "group-[.toaster]:bg-white group-[.toaster]:border-red-200 group-[.toaster]:text-red-900",
          warning: "group-[.toaster]:bg-white group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-900",
          info: "group-[.toaster]:bg-white group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-900",
        },
      }}
      style={
        {
          "--normal-bg": "white",
          "--normal-text": "hsl(var(--foreground))",
          "--normal-border": "hsl(var(--border))",
          "--border-radius": "calc(var(--radius) - 2px)",
          "--success-bg": "white",
          "--success-text": "hsl(142 76% 20%)",
          "--error-bg": "white",
          "--error-text": "hsl(0 84% 40%)",
          "--warning-bg": "white",
          "--warning-text": "hsl(38 92% 30%)",
          "--info-bg": "white",
          "--info-text": "hsl(199 89% 30%)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
