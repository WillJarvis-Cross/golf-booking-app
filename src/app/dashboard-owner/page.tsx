"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <ul className="list-disc list-inside">
        <li>
          <Link href="/dashboard-owner/tee-time-config">
            Configure Tee Times
          </Link>
        </li>
        <li>View Bookings</li>
        <li>Manage Courses</li>
      </ul>
    </div>
  );
}
