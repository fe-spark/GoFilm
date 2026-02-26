"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeOutlined,
  SyncOutlined,
  HistoryOutlined,
  HeartOutlined,
  UserOutlined,
} from "@ant-design/icons";
import styles from "./index.module.less";

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = [
    { label: "首页", icon: <HomeOutlined />, path: "/" },
    { label: "更新", icon: <SyncOutlined />, path: "/update" },
    { label: "历史", icon: <HistoryOutlined />, path: "/history" },
    { label: "收藏", icon: <HeartOutlined />, path: "/favorite" },
    { label: "我的", icon: <UserOutlined />, path: "/profile" },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.bottomNav}>
        {navItems.map((item, idx) => (
          <div
            key={idx}
            className={`${styles.navItem} ${pathname === item.path ? styles.active : ""}`}
            onClick={() => router.push(item.path)}
            style={{ cursor: "pointer" }}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
      <p>
        本站所有内容均来自互联网分享站点所提供的公开引用资源，未提供资源上传、存储服务。
      </p>
    </footer>
  );
}
