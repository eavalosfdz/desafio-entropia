import "./global.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Windowgram",
  description: "Red social de ventanas",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-gray-50 text-gray-900 antialiased">{children}</body>
    </html>
  );
}
