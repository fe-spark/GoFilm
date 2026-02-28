"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Button, Empty, Row, Col } from "antd";
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
  col?: number;
  className?: string;
}

import { FALLBACK_IMG } from "@/lib/fallbackImg";

export default function FilmList({ list, col, className }: FilmListProps) {
  const router = useRouter();

  const { props: colProps, className: colClassName } = React.useMemo(() => {
    if (col === 6) {
      return {
        props: { xs: 12, sm: 8, md: 6, lg: 6, xl: 4, xxl: 4 },
        className: styles.col5,
      };
    }
    return {
      props: { xs: 12, sm: 8, md: 6, lg: 4, xl: 4 },
      className: styles.col7,
    };
  }, [col]);

  if (!list || list.length === 0) {
    return (
      <div style={{ padding: "40px 0", width: "100%" }}>
        <Empty description="暂无相关数据" />
      </div>
    );
  }

  const handleToDetail = (id: string) => {
    router.push(`/filmDetail?link=${id}`);
  };

  return (
    <div className={className || ""}>
      <Row gutter={[24, 24]}>
        {list.map((item) => {
          const id = item.mid || item.id;
          if (id === "-99") return null;

          return (
            <Col key={id} {...colProps} className={colClassName}>
              <div className={styles.item} onClick={() => handleToDetail(id)}>
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
                  <span className={styles.name}>
                    {item.name?.split("[")[0]}
                  </span>
                  <span className={styles.subText}>{item.remarks}</span>
                </div>
              </div>
            </Col>
          );
        })}
      </Row>
    </div>
  );
}
