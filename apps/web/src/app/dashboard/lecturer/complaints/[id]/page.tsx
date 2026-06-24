"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@clarion/ui";
import { PageHeader } from "@/components/ui-helpers";
import { ComplaintStatusBadge } from "@/components/badges";
import { AiClassificationCard } from "@/components/ai-classification-card";
import { useComplaint, useComplaintTimeline, useRateComplaint } from "@/hooks/use-api";
import { ComplaintStatus } from "@clarion/shared";

type TimelineEvent = {
  id: string;
  description: string;
  createdAt: string;
};

export default function LecturerComplaintDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: complaintRes, isLoading } = useComplaint(id);
  const { data: timelineRes } = useComplaintTimeline(id);
  const { mutateAsync: rate, isPending: rating } = useRateComplaint();
  const [starValue, setStarValue] = useState(0);
  const [rated, setRated] = useState(false);

  const complaint = complaintRes?.data;
  const timeline = (timelineRes?.data ?? []) as TimelineEvent[];

  if (isLoading) return <div className="h-64 rounded-lg bg-gray-100 animate-pulse" />;
  if (!complaint) return <p className="text-sm text-muted-foreground">Complaint not found.</p>;

  const canRate =
    complaint.status === ComplaintStatus.RESOLVED &&
    complaint.satisfactionRating === null &&
    !rated;

  const handleRate = async () => {
    if (!starValue) return;
    await rate({ id, data: { rating: starValue } });
    setRated(true);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader
        title={complaint.title}
        description={complaint.referenceNumber}
        action={
          <div className="flex items-center gap-3">
            <Link href="/dashboard/lecturer/complaints" className="text-sm text-muted-foreground hover:underline">← Back</Link>
            <ComplaintStatusBadge status={complaint.status} />
          </div>
        }
      />

      <Card>
        <CardContent className="p-4 space-y-3 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{complaint.category ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Department</p><p className="font-medium">{complaint.department?.name ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Submitted</p><p className="font-medium">{new Date(complaint.createdAt).toLocaleDateString()}</p></div>
            <div><p className="text-xs text-muted-foreground">Anonymous</p><p className="font-medium">{complaint.isAnonymous ? "Yes" : "No"}</p></div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Description</p>
            <p className="text-clarion-navy-700 whitespace-pre-wrap">{complaint.description}</p>
          </div>
        </CardContent>
      </Card>

      <AiClassificationCard aiMetadata={complaint.aiMetadata} sentimentScore={complaint.sentimentScore} />

      {canRate && (
        <Card className="border-clarion-amber-200 bg-clarion-amber-50">
          <CardContent className="p-5">
            <p className="text-sm font-semibold text-clarion-navy-800 mb-2">How was your experience?</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setStarValue(n)}
                  className={`text-2xl ${n <= starValue ? "text-clarion-amber-400" : "text-gray-300"}`}>★</button>
              ))}
            </div>
            <Button className="mt-3" variant="accent" size="sm" disabled={!starValue || rating} onClick={handleRate}>
              {rating ? "Submitting…" : "Submit Rating"}
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">Activity Timeline</CardTitle></CardHeader>
        <CardContent>
          {timeline.length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((e, i) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full bg-clarion-navy-400 mt-1.5" />
                    {i < timeline.length - 1 && <div className="w-px flex-1 bg-clarion-navy-100 my-1" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-medium text-clarion-navy-800">{e.description}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(e.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
