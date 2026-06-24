"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { UserRole } from "@clarion/shared";
import { Button, Card, CardContent, Input } from "@clarion/ui";
import { EmptyState, PageHeader } from "@/components/ui-helpers";
import { formatRole } from "@/lib/auth-utils";
import { useAdminInstitutions, useAdminUsers, useUpdateAdminUser } from "@/hooks/use-api";

type AdminUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string | null;
  institution?: { id: string; name: string; slug: string } | null;
};

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [institutionId, setInstitutionId] = useState("");
  const [role, setRole] = useState("");
  const { data, isLoading } = useAdminUsers({ page, pageSize: 20, search, institutionId, role });
  const { data: institutionsData } = useAdminInstitutions({ page: 1, pageSize: 100 });
  const updateUser = useUpdateAdminUser();

  const rows = (data?.data ?? []) as AdminUser[];
  const meta = data?.meta;
  const institutions = (institutionsData?.data ?? []) as Array<{ id: string; name: string }>;

  return (
    <div className="space-y-6">
      <PageHeader title="Users" description="Manage users across institutions" />

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-clarion-navy-400" />
            <Input
              className="pl-9"
              placeholder="Search users"
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={institutionId}
            onChange={(e) => {
              setPage(1);
              setInstitutionId(e.target.value);
            }}
          >
            <option value="">All institutions</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>{institution.name}</option>
            ))}
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
            value={role}
            onChange={(e) => {
              setPage(1);
              setRole(e.target.value);
            }}
          >
            <option value="">All roles</option>
            {Object.values(UserRole).map((item) => (
              <option key={item} value={item}>{formatRole(item)}</option>
            ))}
          </select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded bg-gray-100 animate-pulse" />)}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No users found" description="Try a broader search or filter." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-sm">
                <thead className="border-b bg-clarion-navy-50 text-left text-xs uppercase text-clarion-navy-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">User</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                    <th className="px-4 py-3 font-medium">Institution</th>
                    <th className="px-4 py-3 font-medium">Last Login</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-clarion-navy-900">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                      </td>
                      <td className="px-4 py-3 text-clarion-navy-700">{formatRole(user.role)}</td>
                      <td className="px-4 py-3 text-clarion-navy-600">{user.institution?.name ?? "Global"}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={user.isActive ? "text-green-700" : "text-red-700"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateUser.isPending}
                          onClick={() => updateUser.mutate({ id: user.id, data: { isActive: !user.isActive } })}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {meta?.page ?? page} of {meta?.totalPages ?? 1} · {meta?.total ?? 0} users
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta || page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
