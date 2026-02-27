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

export async function generateMetadata(): Promise<Metadata> {
  let siteName = "";
  let describe = "";
  let keyword = "";
  let icon = "";

  try {
    const apiUrl = process.env.API_URL || "http://127.0.0.1:3601";
    const res = await fetch(`${apiUrl}/config/basic`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const json = await res.json();
      if (json.code === 0 && json.data) {
        siteName = json.data.siteName || "";
        describe = json.data.describe || "";
        keyword = json.data.keyword || "";
        icon = json.data.logo || "";
      }
    }
  } catch (err) {
    console.error("fetch metadata error:", err);
  }

  const generated: Metadata = {};
  if (siteName) generated.title = siteName;
  if (describe) generated.description = describe;
  if (keyword) generated.keywords = keyword;
  if (icon) generated.icons = { icon };

  return generated;
}

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
                Popover: {
                  colorBgElevated: "#14151b",
                  colorText: "rgba(255, 255, 255, 0.85)",
                  colorTextHeading: "#ffffff",
                },
                Pagination: {
                  itemSize: 50,
                  itemBg: "rgba(255, 255, 255, 0.08)",
                  colorPrimary: "#fa8c16",
                  colorText: "rgba(255, 255, 255, 0.95)",
                  colorBgContainer: "rgba(255, 255, 255, 0.1)",
                  colorTextLightSolid: "#ffffff",
                  colorTextDescription: "rgba(255, 255, 255, 0.85)",
                  colorTextDisabled: "rgba(255, 255, 255, 0.7)",
                  colorTextPlaceholder: "rgba(255, 255, 255, 0.7)",
                  colorTextTertiary: "rgba(255, 255, 255, 0.7)",
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
