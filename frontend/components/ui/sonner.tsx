"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

// Toaster component from shadcn/ui integrated with sonner
// Modified to use Windows XP theme
const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster"
      icons={{
        success: <CircleCheckIcon className="toaster-icon" />,
        info: <InfoIcon className="toaster-icon" />,
        warning: <TriangleAlertIcon className="toaster-icon" />,
        error: <OctagonXIcon className="toaster-icon" />,
        loading: <Loader2Icon className="toaster-icon-spin" />,
      }}
      {...props}
    />
  )
}

export { Toaster }
