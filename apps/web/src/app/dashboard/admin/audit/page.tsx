"use client";

import { useMemo, useState } from "react";
import { Search, RotateCcw } from "lucide-react";
import { Button, Card, CardContent, Input } from "@clarion/ui";
import { PageHeader, EmptyState } from "@/components/ui-helpers";
import { useAuditLogs } from "@/hooks/use-api";

type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: { firstName: string; lastName: string; email: string } | null;
  institution?: { name: string; slug: string } | null;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AuditLogPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    entityType: "",
    actorId: "",
    institutionId: "",
    from: "",
    to: "",
  });

  const query = useMemo(() => ({ page, pageSize: 20, ...filters }), [page, filters]);
  const { data, isLoading } = useAuditLogs(query);
  const rows = (data?.data ?? []) as AuditLog[];
  const meta = data?.meta;

  const updateFilter = (key: keyof typeof filters, value: string) => {
    setPage(1);
    setFilters((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Audit Log" description="Search system and institution activity" />

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-clarion-navy-400" />
              <Input
                className="pl-9"
                placeholder="Action"
                value={filters.action}
                onChange={(e) => updateFilter("action", e.target.value)}
              />
            </div>
            <Input
              placeholder="Entity type"
              value={filters.entityType}
              onChange={(e) => updateFilter("entityType", e.target.value)}
            />
            <Input
              placeholder="Actor ID"
              value={filters.actorId}
              onChange={(e) => updateFilter("actorId", e.target.value)}
            />
            <Input
              placeholder="Institution ID"
              value={filters.institutionId}
              onChange={(e) => updateFilter("institutionId", e.target.value)}
            />
            <Input type="date" value={filters.from} onChange={(e) => updateFilter("from", e.target.value)} />
            <Input type="date" value={filters.to} onChange={(e) => updateFilter("to", e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 rounded bg-gray-100 animate-pulse" />)}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState title="No audit entries found" description="Try a broader filter set." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b bg-clarion-navy-50 text-left text-xs uppercase text-clarion-navy-500">
                  <tr>
                    <th className="px-4 py-3 font-medium">When</th>
                    <th className="px-4 py-3 font-medium">Actor</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                    <th className="px-4 py-3 font-medium">Entity</th>
                    <th className="px-4 py-3 font-medium">Institution</th>
                    <th className="px-4 py-3 font-medium">Metadata</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {rows.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-clarion-navy-700">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-clarion-navy-800">
                          {row.actor ? `${row.actor.firstName} ${row.actor.lastName}` : "System"}
                        </div>
                        {row.actor?.email && <div className="text-xs text-muted-foreground">{row.actor.email}</div>}
                      </td>
                      <td className="px-4 py-3 font-medium text-clarion-navy-800">{row.action}</td>
                      <td className="px-4 py-3 text-clarion-navy-600">
                        {row.entityType}
                        {row.entityId && <div className="text-xs text-muted-foreground">{row.entityId}</div>}
                      </td>
                      <td className="px-4 py-3 text-clarion-navy-600">
                        {row.institution ? `${row.institution.name} (${row.institution.slug})` : "Global"}
                      </td>
                      <td className="max-w-xs truncate px-4 py-3 text-muted-foreground">
                        {row.metadata ? JSON.stringify(row.metadata) : "-"}
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
          Page {meta?.page ?? page} of {meta?.totalPages ?? 1} · {meta?.total ?? 0} entries
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setPage(1);
              setFilters({ action: "", entityType: "", actorId: "", institutionId: "", from: "", to: "" });
            }}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
