"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Table,
  Tag,
  Switch,
  Select,
  Button,
  Space,
  Modal,
  Input,
  Form,
  Popconfirm,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  SendOutlined,
  ReloadOutlined,
  DeleteOutlined,
  EditOutlined,
  PoweroffOutlined,
  PauseOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { ApiGet, ApiPost } from "@/lib/api";
import styles from "./page.module.less";
import { useAppMessage } from "@/lib/useAppMessage";

interface FilmSource {
  id: string;
  name: string;
  uri: string;
  resultModel: number;
  collectType: number;
  collectTypeText: string;
  syncPictures: boolean;
  state: boolean;
  grade: number;
  interval: number;
  cd: number;
}

const collectDuration = [
  { label: "采集今日", time: 24 },
  { label: "采集三天", time: 72 },
  { label: "采集一周", time: 168 },
  { label: "采集半月", time: 360 },
  { label: "采集一月", time: 720 },
  { label: "采集三月", time: 2160 },
  { label: "采集半年", time: 4320 },
  { label: "全量采集", time: -1 },
];

export default function CollectManagePage() {
  const [siteList, setSiteList] = useState<FilmSource[]>([]);
  const [activeCollectIds, setActiveCollectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { message } = useAppMessage();

  // 批量采集弹窗
  const [batchOpen, setBatchOpen] = useState(false);
  const [batchIds, setBatchIds] = useState<string[]>([]);
  const [batchTime, setBatchTime] = useState(24);
  const [batchOptions, setBatchOptions] = useState<any[]>([]);

  // 清空/重采弹窗
  const [clearOpen, setClearOpen] = useState(false);
  const [reCollectOpen, setReCollectOpen] = useState(false);
  const [password, setPassword] = useState("");

  // 获取采集站列表
  const getCollectList = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await ApiGet("/manage/collect/list");
      if (resp.code === 0) {
        const list = (resp.data || []).map((item: any) => ({
          ...item,
          cd: item.cd || 24,
        }));
        setSiteList(list);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取采集状态
  const getCollectingState = useCallback(async () => {
    const resp = await ApiGet("/manage/collect/collecting/state", undefined);
    if (resp.code === 0 && resp.data) {
      setActiveCollectIds(resp.data);
    }
  }, []);

  useEffect(() => {
    getCollectList();
    getCollectingState();
    timerRef.current = setInterval(getCollectingState, 3000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [getCollectList, getCollectingState]);

  // 更新采集源状态
  const changeSourceState = async (record: FilmSource) => {
    await ApiPost("/manage/collect/update", record);
  };

  // 单站采集
  const startTask = async (record: FilmSource) => {
    const resp = await ApiPost("/manage/spider/start", {
      id: record.id,
      time: record.cd || 24,
      batch: false,
    });
    if (resp.code === 0) {
      message.success(resp.msg);
      setTimeout(getCollectingState, 500);
    } else {
      message.error(resp.msg);
    }
  };

  // 停止采集
  const stopTask = async (id: string) => {
    const resp = await ApiGet("/manage/collect/stop", { id });
    if (resp.code === 0) {
      message.success("已停止");
      setTimeout(getCollectingState, 500);
    }
  };

  // 删除采集源
  const delSource = async (id: string) => {
    const resp = await ApiGet("/manage/collect/del", { id });
    if (resp.code === 0) {
      message.success(resp.msg);
      getCollectList();
    } else {
      message.error(resp.msg);
    }
  };

  // 批量采集
  const openBatchCollect = async () => {
    setBatchOpen(true);
    const resp = await ApiGet("/manage/collect/options");
    if (resp.code === 0) setBatchOptions(resp.data || []);
  };

  const startBatchCollect = async () => {
    const resp = await ApiPost("/manage/spider/start", {
      ids: batchIds,
      time: batchTime,
      batch: true,
    });
    if (resp.code === 0) {
      message.success(resp.msg);
      setBatchOpen(false);
      setTimeout(getCollectingState, 500);
    } else {
      message.error(resp.msg);
    }
  };

  // 清空数据
  const clearFilms = async () => {
    if (!password) {
      message.error("请输入密钥");
      return;
    }
    const resp = await ApiGet("/manage/spider/clear", { password });
    if (resp.code === 0) message.success(resp.msg);
    else message.error(resp.msg);
    setClearOpen(false);
    setPassword("");
  };

  // 重新采集
  const reCollect = async () => {
    if (!password) {
      message.error("请输入密钥");
      return;
    }
    const resp = await ApiGet("/manage/spider/zero", { password });
    if (resp.code === 0) message.success(resp.msg);
    else message.error(resp.msg);
    setReCollectOpen(false);
    setPassword("");
  };

  const columns: ColumnsType<FilmSource> = [
    {
      title: "资源名称",
      dataIndex: "name",
      key: "name",
      render: (name: string, record) => (
        <Space>
          <span>{name}</span>
          {activeCollectIds.includes(record.id) && (
            <LoadingOutlined style={{ color: "#1677ff" }} />
          )}
        </Space>
      ),
    },
    {
      title: "数据类型",
      dataIndex: "resultModel",
      key: "resultModel",
      align: "center",
      render: (v: number) => <Tag>{v === 0 ? "JSON" : "XML"}</Tag>,
    },
    {
      title: "资源类型",
      dataIndex: "collectTypeText",
      key: "collectTypeText",
      align: "center",
      render: (v: string) => <Tag color="purple">{v}</Tag>,
    },
    {
      title: "资源站",
      dataIndex: "uri",
      key: "uri",
      render: (uri: string) => (
        <a href={uri} target="_blank" rel="noopener noreferrer">
          {uri}
        </a>
      ),
    },
    {
      title: "同步图片",
      dataIndex: "syncPictures",
      key: "syncPictures",
      align: "center",
      render: (v: boolean, record) => (
        <Switch
          checked={v}
          disabled={record.grade === 1}
          onChange={(checked) => {
            record.syncPictures = checked;
            changeSourceState(record);
          }}
          checkedChildren="开启"
          unCheckedChildren="关闭"
          size="small"
        />
      ),
    },
    {
      title: "是否启用",
      dataIndex: "state",
      key: "state",
      align: "center",
      render: (v: boolean, record) => (
        <Switch
          checked={v}
          onChange={(checked) => {
            record.state = checked;
            changeSourceState(record);
          }}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          size="small"
        />
      ),
    },
    {
      title: "站点权重",
      dataIndex: "grade",
      key: "grade",
      align: "center",
      render: (v: number) => (
        <Tag color={v === 0 ? "green" : "default"}>
          {v === 0 ? "采集主站" : "附属站点"}
        </Tag>
      ),
    },
    {
      title: "采集间隔",
      dataIndex: "interval",
      key: "interval",
      align: "center",
      render: (v: number) => (
        <Tag color="green">{v > 0 ? `${v} ms` : "无限制"}</Tag>
      ),
    },
    {
      title: "采集方式",
      key: "cd",
      width: 120,
      render: (_: any, record) => (
        <Select
          size="small"
          value={record.cd || 24}
          onChange={(v) => {
            record.cd = v;
            setSiteList([...siteList]);
          }}
          style={{ width: "100%" }}
          options={collectDuration.map((d) => ({
            value: d.time,
            label: d.label,
          }))}
        />
      ),
    },
    {
      title: "操作",
      key: "action",
      align: "center",
      fixed: "right" as const,
      render: (_: any, record) => (
        <Space style={{ whiteSpace: "nowrap" }}>
          {activeCollectIds.includes(record.id) ? (
            <Button
              type="primary"
              danger
              icon={<PauseOutlined />}
              shape="circle"
              size="small"
              onClick={() => stopTask(record.id)}
            />
          ) : (
            <Button
              type="primary"
              icon={<PoweroffOutlined />}
              shape="circle"
              size="small"
              style={{ background: "#52c41a", borderColor: "#52c41a" }}
              onClick={() => startTask(record)}
            />
          )}
          <Button
            type="primary"
            icon={<EditOutlined />}
            shape="circle"
            size="small"
          />
          <Popconfirm
            title="确认删除此采集站？"
            onConfirm={() => delSource(record.id)}
          >
            <Button
              danger
              icon={<DeleteOutlined />}
              shape="circle"
              size="small"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Table
        columns={columns}
        dataSource={siteList}
        rowKey="id"
        loading={loading}
        bordered
        size="middle"
        scroll={{ x: "max-content" }}
        pagination={false}
      />
      <div className={styles.toolbar}>
        <Button type="primary" icon={<PlusOutlined />}>
          添加采集站
        </Button>
        <Button
          type="primary"
          icon={<SendOutlined />}
          style={{ background: "#52c41a", borderColor: "#52c41a" }}
          onClick={openBatchCollect}
        >
          一键采集
        </Button>
        <Button
          icon={<ReloadOutlined />}
          style={{ color: "#fa8c16", borderColor: "#fa8c16" }}
          onClick={() => setReCollectOpen(true)}
        >
          重新采集
        </Button>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={() => setClearOpen(true)}
        >
          清空数据
        </Button>
      </div>

      {/* 批量采集弹窗 */}
      <Modal
        title="一键采集"
        open={batchOpen}
        onCancel={() => setBatchOpen(false)}
        onOk={startBatchCollect}
        okText="开始采集"
      >
        <Form layout="vertical">
          <Form.Item label="采集时长">
            <Select
              value={batchTime}
              onChange={setBatchTime}
              options={collectDuration.map((d) => ({
                value: d.time,
                label: d.label,
              }))}
            />
          </Form.Item>
          <Form.Item label="选择站点">
            <Checkbox.Group
              value={batchIds}
              onChange={(v) => setBatchIds(v as string[])}
              options={batchOptions.map((o: any) => ({
                label: o.name,
                value: o.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 清空数据弹窗 */}
      <Modal
        title="清空数据"
        open={clearOpen}
        onCancel={() => {
          setClearOpen(false);
          setPassword("");
        }}
        onOk={clearFilms}
        okText="确认清空"
        okButtonProps={{ danger: true }}
      >
        <Input.Password
          placeholder="请输入管理密钥"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal>

      {/* 重新采集弹窗 */}
      <Modal
        title="重新采集"
        open={reCollectOpen}
        onCancel={() => {
          setReCollectOpen(false);
          setPassword("");
        }}
        onOk={reCollect}
        okText="确认重采"
      >
        <p style={{ marginBottom: 12, color: "#fa8c16" }}>
          此操作将清空所有影视数据并从零开始重新采集！
        </p>
        <Input.Password
          placeholder="请输入管理密钥"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal>
    </div>
  );
}
