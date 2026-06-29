"use client";

import { FormEvent, useState } from "react";
import { Building2, Plus, Search } from "lucide-react";
import { Button, Card, CardContent, Input } from "@clarion/ui";
import { EmptyState, PageHeader, StatCard } from "@/components/ui-helpers";
import {
  useAdminInstitutions,
  useCreateAdminInstitution,
  useUpdateAdminInstitution,
} from "@/hooks/use-api";

type Institution = {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  isActive: boolean;
  createdAt: string;
  _count?: { users: number; complaints: number };
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export default function AdminInstitutionsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", slug: "", domain: "" });
  const { data, isLoading } = useAdminInstitutions({ page, pageSize: 20, search });
  const createInstitution = useCreateAdminInstitution();
  const updateInstitution = useUpdateAdminInstitution();

  const rows = (data?.data ?? []) as Institution[];
  const meta = data?.meta;
  const activeCount = rows.filter((row) => row.isActive).length;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    createInstitution.mutate(
      { name: form.name, slug: form.slug || slugify(form.name), domain: form.domain || undefined },
      { onSuccess: () => setForm({ name: "", slug: "", domain: "" }) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Institutions" description="Create and manage tenant institutions" />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Visible Institutions" value={meta?.total ?? 0} />
        <StatCard label="Active On Page" value={activeCount} />
        <StatCard label="Inactive On Page" value={rows.length - activeCount} />
      </div>

      <Card>
        <CardContent className="p-4">
          <form className="grid gap-3 lg:grid-cols-[1.2fr_1fr_1fr_auto]" onSubmit={submit}>
            <Input
              placeholder="Institution name"
              value={form.name}
              onChange={(e) => setForm((current) => ({
                ...current,
                name: e.target.value,
                slug: current.slug || slugify(e.target.value),
              }))}
              required
            />
            <Input
              placeholder="Slug"
              value={form.slug}
              onChange={(e) => setForm((current) => ({ ...current, slug: slugify(e.target.value) }))}
              required
            />
            <Input
              placeholder="Domain"
              value={form.domain}
              onChange={(e) => setForm((current) => ({ ...current, domain: e.target.value }))}
            />
            <Button type="submit" disabled={createInstitution.isPending}>
              <Plus className="h-4 w-4" />
              {createInstitution.isPending ? "Creating" : "Create"}
            </Button>
          </form>
          {createInstitution.error && (
            <p className="mt-3 text-sm text-red-600">{createInstitution.error.message}</p>
          )}
        </CardContent>
      </Card>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-700" />
        <Input
          className="pl-9"
          placeholder="Search institutions"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded bg-gray-100 animate-pulse" />)}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No institutions found" description="Create the first tenant above." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-sm">
                <thead className="border-b bg-indigo-50 text-left text-xs uppercase text-indigo-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">Institution</th>
                    <th className="px-4 py-3 font-medium">Domain</th>
                    <th className="px-4 py-3 font-medium">Users</th>
                    <th className="px-4 py-3 font-medium">Complaints</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((institution) => (
                    <tr key={institution.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-700 text-white">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-700">{institution.name}</div>
                            <div className="text-xs text-muted-foreground">{institution.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-indigo-600 dark:text-indigo-400">{institution.domain ?? "-"}</td>
                      <td className="px-4 py-3 text-slate-700">{institution._count?.users ?? 0}</td>
                      <td className="px-4 py-3 text-slate-700">{institution._count?.complaints ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={institution.isActive ? "text-green-700" : "text-red-700"}>
                          {institution.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={updateInstitution.isPending}
                          onClick={() => updateInstitution.mutate({ id: institution.id, isActive: !institution.isActive })}
                        >
                          {institution.isActive ? "Deactivate" : "Activate"}
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
          Page {meta?.page ?? page} of {meta?.totalPages ?? 1}
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
