"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { getDashboardRoute } from "@/lib/auth-utils";
import { UserRole } from "@clarion/shared";

export default function DashboardIndexPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      router.replace(getDashboardRoute(user.role as UserRole));
    }
  }, [user, router]);

  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-clarion-navy-200 border-t-clarion-navy-800" />
    </div>
  );
}
