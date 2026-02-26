"use client";

import React, { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import styles from "./layout.module.less";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const fullKey = `${pathname}?${searchParams.toString()}`;

  return (
    <div className={styles.layoutWrapper}>
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <main key={fullKey} className={`${styles.publicMain} page-entry`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
