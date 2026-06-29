"use client";

import { useAuthStore } from "@/stores/auth-store";
import { formatRole } from "@/lib/auth-utils";
import { UserRole } from "@clarion/shared";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@clarion/ui";

interface DashboardPageProps {
  title: string;
  description: string;
}

export function DashboardPage({ title, description }: DashboardPageProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-700">{title}</h1>
        <p className="mt-1 text-slate-700">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Welcome</CardTitle>
            <CardDescription>Your account overview</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Name</dt>
                <dd className="font-medium">
                  {user?.firstName} {user?.lastName}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">
                  {user ? formatRole(user.role as UserRole) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="font-medium">{user?.email}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Complaints</CardTitle>
            <CardDescription>Phase 1 feature</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">—</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Complaint management coming soon
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open Tickets</CardTitle>
            <CardDescription>Phase 1 feature</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-slate-700">—</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Ticket tracking coming soon
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
