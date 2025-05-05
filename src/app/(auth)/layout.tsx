import "@/app/globals.css";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
      <html lang="he" dir="rtl">
        <body>{children}</body>
      </html>
    );
  }
  