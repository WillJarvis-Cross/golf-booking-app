'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from 'aws-amplify/auth';
import Link from 'next/link';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        router.push('/login'); // Redirect to login if no user is found
      }
    }

    fetchUser();
  }, [router]);

  if (!user) {
    return <p>Loading...</p>; // Show a loading state while fetching the user
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <ul className="list-disc list-inside">
        <li>
          <Link href="/dashboard/tee-time-config">
            Configure Tee Times
          </Link>
        </li>
        <li>View Bookings</li>
        <li>Manage Courses</li>
      </ul>
    </div>
  );
}