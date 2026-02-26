"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ScrollToTop from "@/components/public/ScrollToTop";
import styles from "./layout.module.less";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className={styles.layoutWrapper}>
      <ScrollToTop />
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main key={pathname} className={`${styles.publicMain} page-entry`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
