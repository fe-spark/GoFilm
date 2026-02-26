"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Avatar, theme } from "antd";
import {
  HomeOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FolderOpenOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { ApiGet } from "@/lib/api";
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
      { key: "/manage/film/add", label: "影片添加" },
    ],
  },
  {
    key: "/manage/file",
    icon: <FolderOpenOutlined />,
    label: "文件管理",
    children: [
      { key: "/manage/file/upload", label: "文件上传" },
      { key: "/manage/file/gallery", label: "图库管理" },
    ],
  },
];

export default function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [siteName, setSiteName] = useState("GoFilm");
  const [logo, setLogo] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    ApiGet("/manage/config/basic").then((resp) => {
      if (resp.code === 0) {
        setSiteName(resp.data.siteName || "GoFilm");
        setLogo(resp.data.logo || "");
      }
    });
  }, []);

  const onMenuClick: MenuProps["onClick"] = ({ key }) => {
    router.push(key);
  };

  const openKeys = menuItems
    .filter((item: any) =>
      item.children?.some((child: any) => pathname.startsWith(child.key)),
    )
    .map((item: any) => item.key);

  return (
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
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={onMenuClick}
        />
      </Sider>
      <Layout>
        <Header className={styles.header}>
          {React.createElement(
            collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
            {
              className: styles.trigger,
              onClick: () => setCollapsed(!collapsed),
            },
          )}
          <span className={styles.headerTitle}>后台管理中心</span>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  );
}
