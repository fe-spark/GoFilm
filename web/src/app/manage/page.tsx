"use client";

import React from "react";
import { Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function ManagePage() {
  return (
    <div>
      <Title level={3}>仪表盘</Title>
      <Card>
        <Text>欢迎使用 GoFilm 后台管理系统</Text>
      </Card>
    </div>
  );
}
