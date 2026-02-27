"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Form, Input, Switch, Button, Typography, Spin, Space, Card } from "antd";
import { SettingOutlined, ReloadOutlined, SaveOutlined } from "@ant-design/icons";
import { ApiGet, ApiPost } from "@/lib/api";
import styles from "./page.module.less";
import { useAppMessage } from "@/lib/useAppMessage";

const { Title } = Typography;

export default function SiteConfigPage() {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [fetching, setFetching] = useState(false);
  const { message } = useAppMessage();

  const getBasicInfo = useCallback(async () => {
    setFetching(true);
    try {
      const resp = await ApiGet("/manage/config/basic");
      if (resp.code === 0) form.setFieldsValue(resp.data);
      else message.error(resp.msg);
    } finally {
      setFetching(false);
    }
  }, [form, message]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const values = await form.validateFields();
      const resp = await ApiPost("/manage/config/basic/update", values);
      if (resp.code === 0) {
        message.success(resp.msg);
        await getBasicInfo();
      } else message.error(resp.msg);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    getBasicInfo();
  }, [getBasicInfo]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <Title level={4} className={styles.title}>
            网站基础参数配置
          </Title>
        </div>
        <Space size="middle">
          <Button icon={<ReloadOutlined />} loading={fetching} onClick={getBasicInfo}>
            重置
          </Button>
          <Button type="primary" icon={<SaveOutlined />} loading={submitting} onClick={handleUpdate}>
            更新配置
          </Button>
        </Space>
      </div>

      <Spin spinning={fetching} tip="正在加载网站配置...">
        <Form form={form} layout="vertical" className={`${styles.form} ${styles.formCompact}`}>
          <Card
            title={
              <Space>
                <SettingOutlined style={{ color: "var(--ant-color-primary)" }} />
                基础配置
              </Space>
            }
            className={styles.sectionCard}
            styles={{
              header: {
                background: "rgba(255, 255, 255, 0.02)",
                borderBottom: "1px solid var(--ant-color-border-secondary)",
              },
            }}
          >
            <div className={styles.grid}>
              <Form.Item name="siteName" label="网站名称">
                <Input />
              </Form.Item>
              <Form.Item name="domain" label="网站域名">
                <Input />
              </Form.Item>
              <Form.Item name="keyword" label="搜索关键字">
                <Input />
              </Form.Item>
              <Form.Item name="state" label="网站状态" valuePropName="checked">
                <Switch checkedChildren="开启" unCheckedChildren="关闭" />
              </Form.Item>
              <Form.Item name="logo" label="网站Logo" className={styles.fullWidth}>
                <Input />
              </Form.Item>
              <Form.Item name="describe" label="网站描述" className={styles.fullWidth}>
                <Input />
              </Form.Item>
              <Form.Item name="hint" label="维护提示" className={styles.fullWidth}>
                <Input />
              </Form.Item>
            </div>
          </Card>
        </Form>
      </Spin>
    </div>
  );
}
