"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "antd";
import {
  UserOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { ApiPost } from "@/lib/api";
import styles from "./page.module.less";
import { useAppMessage } from "@/lib/useAppMessage";

export default function LoginPage() {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { message } = useAppMessage();

  const handleLogin = async () => {
    if (!userName || !password) {
      message.warning("请输入用户名和密码");
      return;
    }
    setLoading(true);
    try {
      const resp = await ApiPost("/login", { userName, password });
      if (resp.code === 0) {
        document.cookie = `auth-token=1; path=/; max-age=${60 * 60 * 24 * 7}`;
        message.success("登录成功");
        router.push("/manage");
      } else {
        message.error(resp.msg || "登录失败");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h2 className={styles.title}>GoFilm Manage</h2>
        <div className={styles.form}>
          <Input
            size="large"
            placeholder="用户名 / 邮箱"
            prefix={<UserOutlined style={{ color: "#764ba2" }} />}
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            onPressEnter={handleLogin}
            className={styles.input}
          />
          <Input.Password
            size="large"
            placeholder="密码"
            prefix={<LockOutlined style={{ color: "#764ba2" }} />}
            iconRender={(visible) =>
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onPressEnter={handleLogin}
            className={styles.input}
          />
          <Button
            type="primary"
            size="large"
            loading={loading}
            onClick={handleLogin}
            className={styles.btn}
            block
          >
            登 录
          </Button>
        </div>
      </div>
    </div>
  );
}
