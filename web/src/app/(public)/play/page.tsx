"use client";

import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
  useCallback,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "antd";
import {
  RocketOutlined,
  StepForwardOutlined,
  PlayCircleOutlined,
} from "@ant-design/icons";
import { ApiGet } from "@/lib/api";
import { cookieUtil, COOKIE_KEY_MAP } from "@/lib/cookie";
import FilmList from "@/components/public/FilmList";
import VideoPlayer from "@/components/public/VideoPlayer";
import AppLoading from "@/components/public/Loading";
import styles from "./page.module.less";
import { useAppMessage } from "@/lib/useAppMessage";

function PlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const sourceId = searchParams.get("source");
  const episodeIdx = searchParams.get("episode");
  const initialTime = searchParams.get("currentTime");
  const { message } = useAppMessage();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentTabId, setCurrentTabId] = useState("");
  const [current, setCurrent] = useState<any>(null);
  const [autoplay, setAutoplay] = useState(true);

  const activeEpRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLDivElement>(null);
  const sourceTabsRef = useRef<HTMLDivElement>(null);
  const episodeListRef = useRef<HTMLDivElement>(null);
  const leftColumnRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // 1. 初始化数据
  useEffect(() => {
    if (!id) return;

    const load = async () => {
      setLoading(true);
      const resp = await ApiGet("/filmPlayInfo", {
        id,
        playFrom: sourceId,
        episode: episodeIdx || 0,
      });
      if (resp.code === 0) {
        setData(resp.data);
        setCurrent({ index: resp.data.currentEpisode, ...resp.data.current });
        setCurrentTabId(resp.data.currentPlayFrom);
        setLoading(false);
      } else {
        message.error(resp.msg);
        setLoading(false);
      }
    };

    void load();
  }, [id, sourceId, episodeIdx, message]);

  // 让 sidebar 高度严格跟随左列
  useEffect(() => {
    const leftEl = leftColumnRef.current;
    const sideEl = sidebarRef.current;
    if (!leftEl || !sideEl) return;
    const sync = () => {
      sideEl.style.height = `${leftEl.offsetHeight}px`;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(leftEl);
    return () => ro.disconnect();
  }, [data]);

  // 自动滚动：使当前选中集数纵向居中（局部滚动，不干扰窗口）
  useEffect(() => {
    if (activeEpRef.current && episodeListRef.current) {
      const container = episodeListRef.current;
      const target = activeEpRef.current;
      const offsetTop = target.offsetTop;
      const targetHeight = target.offsetHeight;
      const containerHeight = container.offsetHeight;

      container.scrollTo({
        top: offsetTop - containerHeight / 2 + targetHeight / 2,
        behavior: "smooth",
      });
    }
  }, [current?.link]);

  // 自动滚动：使当前选中的播放源标签横向居中（局部滚动，不干扰窗口）
  useEffect(() => {
    if (activeTabRef.current && sourceTabsRef.current) {
      const container = sourceTabsRef.current;
      const target = activeTabRef.current;
      const offsetLeft = target.offsetLeft;
      const targetWidth = target.offsetWidth;
      const containerWidth = container.offsetWidth;

      container.scrollTo({
        left: offsetLeft - containerWidth / 2 + targetWidth / 2,
        behavior: "smooth",
      });
    }
  }, [currentTabId]);

  const handlePlayNext = useCallback(() => {
    const currentSource = data?.detail.list.find(
      (s: any) => s.id === currentTabId,
    );
    if (currentSource && current.index < currentSource.linkList.length - 1) {
      const nextIdx = current.index + 1;
      router.push(`/play?id=${id}&source=${currentTabId}&episode=${nextIdx}`);
    } else {
      message.info("已经是最后一集了");
    }
  }, [data, current, currentTabId, id, router, message]);

  // 2. 核心逻辑：播放进度保存与同步
  const handleTimeUpdate = useCallback(
    (currentTime: number, duration: number) => {
      if (!data || !current) return;
      const historyRaw = cookieUtil.getCookie(COOKIE_KEY_MAP.FILM_HISTORY);
      let historyMap: any = {};
      if (historyRaw) {
        try {
          historyMap = JSON.parse(historyRaw);
        } catch (e) { }
      }

      historyMap[data.detail.id] = {
        id: data.detail.id,
        name: data.detail.name,
        picture: data.detail.picture,
        episode: current?.episode || "正在观看",
        timeStamp: Date.now(),
        link: `/play?id=${data.detail.id}&source=${currentTabId}&episode=${current?.index}&currentTime=${currentTime}`,
        currentTime,
        duration,
      };

      cookieUtil.setCookie(
        COOKIE_KEY_MAP.FILM_HISTORY,
        JSON.stringify(historyMap),
      );
    },
    [data, current, currentTabId],
  );

  const handleEnded = useCallback(() => {
    if (autoplay) handlePlayNext();
  }, [autoplay, handlePlayNext]);

  const handleError = useCallback(() => {
    message.error(
      "该视频源加载失败，可能存在跨域或资源失效，请尝试切换播放源。",
    );
  }, [message]);

  const handlePlayChange = (sId: string, idx: number) => {
    router.push(`/play?id=${id}&source=${sId}&episode=${idx}`);
  };

  if (loading) {
    return <AppLoading text="正在加载播放资源..." />;
  }

  const { detail, relate } = data;
  const currentSource = detail.list.find((s: any) => s.id === currentTabId);
  const hasNext =
    currentSource && current.index < currentSource.linkList.length - 1;

  return (
    <div className={styles.container}>
      {/* Immersive Background */}
      <div className={styles.bgWrapper}>
        <img
          src={detail.picture}
          className={styles.bgPoster}
          alt="background"
        />
        <div className={styles.mask} />
      </div>

      <div className={styles.mainContent}>
        {/* Left Column: Info Card + Player Area */}
        <div className={styles.leftColumn} ref={leftColumnRef}>
          {/* Top Info Card */}
          <div className={styles.topInfoCard}>
            <div className={styles.leftSection}>
              <h1 className={styles.filmTitle}>
                <a
                  onClick={() => router.push(`/filmDetail?link=${detail.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  {detail.name}
                </a>
              </h1>
              <div className={styles.meta}>
                <span className={styles.active}>
                  {detail.descriptor.remarks}
                </span>
                <span>|</span>
                <span>{detail.descriptor.cName}</span>
                <span>|</span>
                <span>{detail.descriptor.year}</span>
                <span>|</span>
                <span>{detail.descriptor.area}</span>
              </div>
            </div>
            <div className={styles.rightSection}>
              <div className={styles.extraInfo}>
                <div className={styles.scoreLabel}>综合评分</div>
                <div className={styles.scoreValue}>
                  {detail.descriptor.score || "9.0"}
                  <span>分</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.playerWrapper}>
            {current?.link && (
              <VideoPlayer
                key={current.link}
                src={current.link}
                initialTime={initialTime ? parseFloat(initialTime) : 0}
                autoplay={autoplay}
                onEnded={handleEnded}
                onTimeUpdate={handleTimeUpdate}
                onError={handleError}
              />
            )}
          </div>
        </div>

        {/* Right: Sidebar Episode List */}
        <div className={styles.sidebar} ref={sidebarRef}>
          <div className={styles.sideHeader}>
            <div className={styles.title}>正在播放</div>
            <div className={styles.subtitle}>
              {detail.name} - {current?.episode}
            </div>
          </div>

          <div className={styles.sourceTabs} ref={sourceTabsRef}>
            {detail.list.map((item: any) => {
              const isActive = currentTabId === item.id;
              return (
                <div
                  key={item.id}
                  ref={isActive ? activeTabRef : null}
                  className={`${styles.tab} ${isActive ? styles.active : ""}`}
                  onClick={() => setCurrentTabId(item.id)}
                >
                  {item.name}
                </div>
              );
            })}
          </div>

          <div className={styles.episodeList} ref={episodeListRef}>
            {currentSource?.linkList.map((v: any, i: number) => {
              const isActive = current.link === v.link;
              return (
                <div
                  key={i}
                  ref={isActive ? activeEpRef : undefined}
                  className={`${styles.epItem} ${isActive ? styles.active : ""}`}
                  title={v.episode}
                  onClick={() => handlePlayChange(currentTabId, i)}
                  onMouseEnter={(e) => {
                    const span = e.currentTarget.querySelector<HTMLSpanElement>(
                      `.${styles.epText}`,
                    );
                    if (span && span.scrollWidth > span.clientWidth) {
                      const overflow = span.scrollWidth - span.clientWidth;
                      // 速度 50px/s，滚动占 60% 的动画时长（20% 起始停留 + 60% 滚动 + 20% 末尾停留）
                      const duration = overflow / 50 / 0.6;
                      span.style.setProperty(
                        "--scroll-distance",
                        `-${overflow}px`,
                      );
                      span.style.setProperty(
                        "--scroll-duration",
                        `${duration.toFixed(2)}s`,
                      );
                      span.classList.add(styles.marquee);
                    }
                  }}
                  onMouseLeave={(e) => {
                    const span = e.currentTarget.querySelector<HTMLSpanElement>(
                      `.${styles.epText}`,
                    );
                    if (span) {
                      span.classList.remove(styles.marquee);
                      span.style.removeProperty("--scroll-distance");
                      span.style.removeProperty("--scroll-duration");
                    }
                  }}
                >
                  <span className={styles.epText}>{v.episode}</span>
                </div>
              );
            })}
          </div>

          {/* Sidebar Footer: always-visible controls */}
          <div className={styles.sideFooter}>
            <div
              className={`${styles.footerBtn} ${autoplay ? styles.active : ""}`}
              onClick={() => setAutoplay(!autoplay)}
            >
              <PlayCircleOutlined />
              <span>{autoplay ? "自动播放 开" : "自动播放 关"}</span>
            </div>
            {hasNext && (
              <div className={styles.footerBtn} onClick={handlePlayNext}>
                <StepForwardOutlined />
                <span>下一集</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: Info Area (Intro Only) */}
      <div className={styles.infoArea}>
        <div className={styles.introHeading}>剧情简介</div>
        <div
          className={styles.intro}
          dangerouslySetInnerHTML={{
            __html: detail.descriptor.content
              ? detail.descriptor.content
                .replace(/<\/?p>/g, "")
                .replace(/<br\s*\/?>/gi, "")
                .replace(/&nbsp;/g, " ")
                .replace(/^[\s\u3000]+|[\s\u3000]+$/g, "")
              : "暂无简介",
          }}
        />
      </div>

      {/* Recommendations */}
      <div className={styles.recommendation}>
        <h2 className={styles.sectionTitle}>相关推荐</h2>
        <FilmList list={relate} className={styles.classifyGrid} />
      </div>
    </div>
  );
}

export default function PlayPage() {
  return (
    <Suspense fallback={<AppLoading />}>
      <PlayerContent />
    </Suspense>
  );
}
