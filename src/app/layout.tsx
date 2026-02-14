import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "乗り換え運賃比較",
  description: "野洲から大阪まで、京都途中下車のほうが安いかを比較するアプリ"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}

