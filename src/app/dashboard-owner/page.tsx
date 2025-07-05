"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Dashboard</h1>
      <ul className={styles.list}>
        <li className={styles.listItem}>
          <Link href="/dashboard-owner/tee-time-config" className={styles.link}>
            Configure Tee Times
          </Link>
        </li>
        <li className={styles.listItem}>View Bookings</li>
        <li className={styles.listItem}>Manage Courses</li>
      </ul>
    </div>
  );
}
