"use client";

import React, { useEffect, useRef, useState } from "react";
import Artplayer from "artplayer";
import Hls from "hls.js";
import { Button, Result } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import styles from "./index.module.less";

interface VideoPlayerProps {
  src: string;
  poster?: string;
  autoplay?: boolean;
  initialTime?: number;
  onEnded?: () => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onError?: (error: any) => void;
}

/**
 * 极简播放器组件：
 * 采用 "src as key" 策略。
 * 核心原则：加载失败即展示 UI 报错与重试按钮，不进行静默处理。
 */
const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  autoplay = true,
  initialTime = 0,
  onEnded,
  onTimeUpdate,
  onError,
}) => {
  const artRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Artplayer | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // 回调保护
  const callbacks = useRef({ onEnded, onTimeUpdate, onError });
  useEffect(() => {
    callbacks.current = { onEnded, onTimeUpdate, onError };
  }, [onEnded, onTimeUpdate, onError]);

  // 核心初始化 Effect
  useEffect(() => {
    if (!artRef.current) return;

    const art = new Artplayer({
      container: artRef.current,
      url: src,
      poster: poster || "",
      autoplay,
      theme: "#fa8c16",
      volume: 0.7,
      pip: true,
      autoMini: false,
      setting: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      customType: {
        m3u8: function (video: HTMLMediaElement, url: string) {
          if (Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();
            const hls = new Hls({ enableWorker: true });
            hlsRef.current = hls;
            hls.loadSource(url);
            hls.attachMedia(video);

            // 监听 HLS 致命错误，只要报错立刻展示 UI
            hls.on(Hls.Events.ERROR, (_, data) => {
              if (data.fatal) {
                console.error("HLS Fatal Error:", data);
                setHasError(true);
                callbacks.current.onError?.(data);
              }
            });
          } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = url;
          }
        },
      },
    });

    playerRef.current = art;

    if (initialTime > 0) {
      art.on("ready", () => {
        art.currentTime = initialTime;
      });
    }

    art.on("video:ended", () => callbacks.current.onEnded?.());
    art.on("video:timeupdate", () =>
      callbacks.current.onTimeUpdate?.(art.currentTime, art.duration),
    );

    // 监听播放器通用错误
    art.on("error", (err) => {
      console.error("Artplayer Error:", err);
      setHasError(true);
      callbacks.current.onError?.(err);
    });

    art.on("video:playing", () => setHasError(false));

    // 小窗回正逻辑
    const observer = new IntersectionObserver(
      ([entry]) => {
        const ratio = entry.intersectionRatio;
        if (ratio < 0.1) {
          if (art.playing && !art.mini) art.mini = true;
        } else if (ratio > 0.3) {
          if (art.mini) art.mini = false;
        }
      },
      { threshold: [0, 0.1, 0.3, 1.0] },
    );
    observer.observe(artRef.current);

    const handleScroll = () => {
      if (window.scrollY <= 10 && art.mini) art.mini = false;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      art.destroy(true);
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retryCount]);

  useEffect(() => {
    if (playerRef.current && poster) playerRef.current.poster = poster;
  }, [poster]);

  return (
    <div className={styles.playerWrapper}>
      <div
        ref={artRef}
        style={{
          width: "100%",
          height: "100%",
          display: hasError ? "none" : "block",
        }}
      />
      {hasError && (
        <div className={styles.errorOverlay}>
          <Result
            status="error"
            title="视频加载失败"
            subTitle="该视频源可能已失效或受到环境策略限制，请尝试切换播放源或重新加载。"
            extra={[
              <Button
                type="primary"
                key="retry"
                icon={<ReloadOutlined />}
                onClick={() => {
                  setHasError(false);
                  setRetryCount((p) => p + 1);
                }}
                style={{ backgroundColor: "#fa8c16", borderColor: "#fa8c16" }}
              >
                立即重试
              </Button>,
              <Button
                key="back"
                ghost
                onClick={() => window.location.reload()}
                style={{
                  color: "rgba(255,255,255,0.6)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                刷新页面
              </Button>,
            ]}
          />
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
