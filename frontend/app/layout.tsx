import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ScheduleBlue",
  description: "A simple message scheduling app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ overscrollBehavior: "none" }}>
      <body
        className="antialiased"
      >
        {children}
      </body>
    </html>
  );
}
