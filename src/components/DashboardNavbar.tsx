'use client';

import { Bell } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type DashboardNavbarProps = {
  onAddCandidateClick?: () => void;
  notificationCount?: number;
};

export default function DashboardNavbar({
  onAddCandidateClick,
  notificationCount = 0,
}: DashboardNavbarProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6 sticky top-0 z-50 bg-white dark:bg-gray-900 p-4 shadow">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex items-center gap-4">
        {/* Notifications Icon with badge */}
        <div
          className="relative cursor-pointer"
          onClick={() => router.push('/dashboard#notifications')}
        >
          <Bell className="w-6 h-6 text-yellow-500" />
          {notificationCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
              {notificationCount}
            </span>
          )}
        </div>

        {/* LogOut Button */}
        <Button
          size="sm"
          className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
        >
          <a href="/auth/login">LogOut</a>
        </Button>
      </div>
    </div>
  );
}
