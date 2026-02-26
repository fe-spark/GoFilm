"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Empty } from "antd";
import { PlaySquareOutlined } from "@ant-design/icons";
import styles from "./index.module.less";

interface FilmItem {
  id: string;
  mid?: string; // Some internal APIs use mid
  name: string;
  picture: string;
  year: string;
  cName: string;
  area: string;
  remarks: string;
  blurb?: string;
}

interface FilmListProps {
  list: FilmItem[];
  col?: number; // Kept for compatibility but we mostly use CSS Grid
  className?: string;
}

import { FALLBACK_IMG } from "@/lib/fallbackImg";

export default function FilmList({ list, className }: FilmListProps) {
  const router = useRouter();

  if (!list || list.length === 0) {
    return (
      <div style={{ padding: "40px 0", width: "100%" }}>
        <Empty description="暂无相关数据" />
      </div>
    );
  }

  const handleToDetail = (id: string) => {
    // 强制先归零滚动条，再触发 Next.js 软路由
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    router.push(`/filmDetail?link=${id}`);
  };

  return (
    <div className={`${styles.content} ${className || ""}`}>
      {list.map((item) => {
        const id = item.mid || item.id;
        if (id === "-99") return null;

        return (
          <div
            key={id}
            className={styles.item}
            onClick={() => handleToDetail(id)}
          >
            <div className={styles.posterWrapper}>
              <img
                src={item.picture || FALLBACK_IMG}
                className={styles.poster}
                alt={item.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = FALLBACK_IMG;
                }}
                loading="lazy"
              />

              {/* Top Right Badge */}
              <span className={styles.remark}>{item.remarks}</span>

              {/* Bottom Tags (Always visible) */}
              <div className={styles.tagGroup}>
                <span className={styles.tag}>{item.year?.slice(0, 4)}</span>
                <span className={styles.tag}>{item.cName}</span>
              </div>

              {/* Hover Overlay - Premium Design */}
              <div className={styles.overlay}>
                <div className={styles.overlayContent}>
                  <h3 className={styles.overlayTitle}>{item.name}</h3>
                  <div className={styles.overlayMeta}>
                    <span>{item.year}</span>
                    <span className={styles.dot}>•</span>
                    <span>{item.area?.split(",")[0]}</span>
                  </div>
                  <p className={styles.overlayBlurb}>
                    {item.blurb || "暂无简介，点击查看更多精彩内容..."}
                  </p>
                  <Button
                    type="primary"
                    block
                    icon={<PlaySquareOutlined />}
                    className={styles.playBtn}
                  >
                    立即播放
                  </Button>
                </div>
              </div>
            </div>

            <div className={styles.infoLine}>
              <span className={styles.name}>{item.name?.split("[")[0]}</span>
              <span className={styles.subText}>{item.remarks}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
