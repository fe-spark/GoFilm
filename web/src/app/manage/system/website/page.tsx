"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Switch, Button, Card, Typography } from "antd";
import { ApiGet, ApiPost } from "@/lib/api";
import styles from "./page.module.less";
import { useAppMessage } from "@/lib/useAppMessage";

const { Title } = Typography;

export default function SiteConfigPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { message } = useAppMessage();

  const getBasicInfo = useCallback(async () => {
    const resp = await ApiGet("/manage/config/basic");
    if (resp.code === 0) form.setFieldsValue(resp.data);
    else message.error(resp.msg);
  }, [form, message]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const values = await form.validateFields();
      const resp = await ApiPost("/manage/config/basic/update", values);
      if (resp.code === 0) {
        message.success(resp.msg);
        getBasicInfo();
      } else message.error(resp.msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBasicInfo();
  }, [getBasicInfo]);

  return (
    <div className={styles.container}>
      <Title level={4} className={styles.title}>
        网站基础参数配置
      </Title>
      <div className={styles.formWrap}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item name="siteName" label="网站名称">
            <Input />
          </Form.Item>
          <Form.Item name="domain" label="网站域名">
            <Input />
          </Form.Item>
          <Form.Item name="logo" label="网站Logo">
            <Input />
          </Form.Item>
          <Form.Item name="keyword" label="搜索关键字">
            <Input />
          </Form.Item>
          <Form.Item name="describe" label="网站描述">
            <Input />
          </Form.Item>
          <Form.Item name="state" label="网站状态" valuePropName="checked">
            <Switch checkedChildren="开启" unCheckedChildren="关闭" />
          </Form.Item>
          <Form.Item name="hint" label="维护提示">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              loading={loading}
              onClick={handleUpdate}
              style={{ marginRight: 12 }}
            >
              更新
            </Button>
            <Button onClick={getBasicInfo}>重置</Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
