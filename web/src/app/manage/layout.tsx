"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Layout,
  Menu,
  Avatar,
  theme,
  ConfigProvider,
  Button,
  Space,
  Tooltip,
} from "antd";
import {
  HomeOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BulbOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { ApiGet } from "@/lib/api";
import { clearAuthToken } from "@/lib/auth";
import { cookieUtil } from "@/lib/cookie";
import styles from "./layout.module.less";

const { Sider, Header, Content } = Layout;

type MenuItem = Required<MenuProps>["items"][number];

const menuItems: MenuItem[] = [
  {
    key: "/manage/system",
    icon: <HomeOutlined />,
    label: "网站管理",
    children: [
      { key: "/manage/system/website", label: "站点管理" },
      { key: "/manage/system/banners", label: "海报管理" },
    ],
  },
  {
    key: "/manage/collect",
    icon: <ThunderboltOutlined />,
    label: "采集管理",
    children: [
      { key: "/manage/collect", label: "影视采集" },
      { key: "/manage/collect/record", label: "失效记录" },
    ],
  },
  {
    key: "/manage/cron",
    icon: <ClockCircleOutlined />,
    label: "定时任务",
    children: [{ key: "/manage/cron", label: "任务管理" }],
  },
  {
    key: "/manage/film",
    icon: <VideoCameraOutlined />,
    label: "影片管理",
    children: [
      { key: "/manage/film/class", label: "影视分类" },
      { key: "/manage/film", label: "影视信息" },
    ],
  },
  {
    key: "/manage/file",
    icon: <FolderOpenOutlined />,
    label: "图库管理",
  },
];

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [siteName, setSiteName] = useState("Bracket");
  const [logo, setLogo] = useState("");
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("manage-theme");
      return savedTheme !== null ? savedTheme === "dark" : true;
    }
    return true;
  });

  const router = useRouter();
  const pathname = usePathname();

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    localStorage.setItem("manage-theme", nextTheme ? "dark" : "light");
  };

  useEffect(() => {
    ApiGet("/manage/config/basic").then((resp) => {
      if (resp.code === 0) {
        setSiteName(resp.data.siteName || "Bracket");
        setLogo(resp.data.logo || "");
      }
    });
  }, []);

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
  };

  const handleLogout = async () => {
    try {
      await ApiGet("/logout");
    } catch {
    } finally {
      clearAuthToken();
      cookieUtil.clearCookie("auth-token");
      router.replace("/login");
    }
  };

  const openKeys = menuItems
    .filter((item: any) =>
      item.children?.some((child: any) => pathname.startsWith(child.key)),
    )
    .map((item: any) => item.key);

  const lightThemeToken = {
    colorPrimary: "#4f7fdf",
    colorPrimaryHover: "#648fe6",
    colorPrimaryActive: "#3d6fcf",
    colorInfo: "#4f7fdf",
  };

  const lightComponents = {
    Menu: {
      itemSelectedBg: "#eef3ff",
      itemHoverBg: "#f6f8ff",
    },
    Button: {
      primaryShadow: "0 4px 10px rgba(79, 127, 223, 0.16)",
    },
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: isDark ? undefined : lightThemeToken,
        components: {
          Pagination: {
            itemSize: 32,
          },
          ...(isDark ? {} : lightComponents),
        },
      }}
    >
      <Layout style={{ minHeight: "100vh" }}>
        <Sider
          trigger={null}
          collapsible
          collapsed={collapsed}
          className={styles.sider}
        >
          <div
            className={styles.logoWrap}
            onClick={() => window.open("/", "_blank")}
          >
            {logo && <Avatar src={logo} size={30} />}
            {!collapsed && <span className={styles.siteName}>{siteName}</span>}
          </div>
          <Menu
            mode="inline"
            selectedKeys={[pathname]}
            defaultOpenKeys={openKeys}
            items={menuItems}
            onClick={onMenuClick}
          />
        </Sider>
        <Layout>
          <Header className={styles.header}>
            <Space size="middle">
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setCollapsed(!collapsed)}
                className={styles.headerIconBtn}
              />
              <span className={styles.headerTitle}>后台管理中心</span>
            </Space>

            <Space size="small">
              <Tooltip title={isDark ? "切换至浅色模式" : "切换至深色模式"}>
                <Button
                  type="text"
                  icon={<BulbOutlined style={{ fontSize: 18 }} />}
                  onClick={toggleTheme}
                  className={`${styles.headerIconBtn} ${!isDark ? styles.themeActive : ""}`}
                />
              </Tooltip>
              <Tooltip title="退出登录">
                <Button
                  type="text"
                  icon={<LogoutOutlined style={{ fontSize: 18 }} />}
                  onClick={handleLogout}
                  className={styles.headerIconBtn}
                />
              </Tooltip>
            </Space>
          </Header>
          <Content className={styles.content}>{children}</Content>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
