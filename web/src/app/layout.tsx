import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { App, ConfigProvider, theme } from "antd";
import { Outfit } from "next/font/google";
import "./globals.css";
const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GoFilm - 影院级沉浸式影视站",
  description: "优质影视资源，极速在线观看",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={outfit.className}>
        <AntdRegistry>
          <ConfigProvider
            theme={{
              algorithm: theme.darkAlgorithm,
              token: {
                colorPrimary: "#fa8c16",
                borderRadius: 12,
                fontFamily: outfit.style.fontFamily,
                colorBgBase: "#0a0b10",
                colorBgContainer: "#14151b",
                colorBgElevated: "#1c1d26",
                colorBorder: "rgba(255, 255, 255, 0.1)",
                colorText: "rgba(255, 255, 255, 0.88)",
              },
              components: {
                Button: {
                  controlHeightLG: 52,
                  fontWeight: 600,
                  borderRadiusLG: 14,
                  boxShadow: "none",
                  boxShadowSecondary: "none",
                  boxShadowTertiary: "none",
                },
                Input: {
                  controlHeight: 40,
                  borderRadius: 10,
                },
              },
            }}
          >
            <App>{children}</App>
          </ConfigProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
