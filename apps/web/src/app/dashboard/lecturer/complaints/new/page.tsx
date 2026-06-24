"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createComplaintSchema, type CreateComplaintInput } from "@clarion/shared";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, FormField, FormLabel, FormControl, FormMessage } from "@clarion/ui";
import { PageHeader } from "@/components/ui-helpers";
import { useCreateComplaint } from "@/hooks/use-api";
import { ApiClientError } from "@/lib/api-client";
import { useState } from "react";

const CATEGORIES = ["Academic", "Facilities", "Harassment", "Financial", "Administrative", "Other"];

export default function LecturerNewComplaintPage() {
  const router = useRouter();
  const { mutateAsync, isPending } = useCreateComplaint();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CreateComplaintInput>({
    resolver: zodResolver(createComplaintSchema),
    defaultValues: { title: "", description: "", isAnonymous: false },
  });

  const onSubmit = async (data: CreateComplaintInput) => {
    setError(null);
    try {
      const result = await mutateAsync(data);
      router.push(`/dashboard/lecturer/complaints/${result.data.id}`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to submit complaint");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <PageHeader title="Submit a Complaint" description="Describe your issue clearly and we'll route it to the right team." />
      <Card>
        <CardHeader><CardTitle className="text-base">Complaint Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}

            <FormField>
              <FormLabel>Title</FormLabel>
              <FormControl><Input placeholder="Brief summary of your complaint" {...form.register("title")} /></FormControl>
              <FormMessage>{form.formState.errors.title?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <textarea
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring min-h-[120px] resize-y"
                  placeholder="Provide full details about the issue..."
                  {...form.register("description")}
                />
              </FormControl>
              <FormMessage>{form.formState.errors.description?.message}</FormMessage>
            </FormField>

            <FormField>
              <FormLabel>Category (optional)</FormLabel>
              <FormControl>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm" {...form.register("category")}>
                  <option value="">Select a category</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </FormControl>
            </FormField>

            <FormField>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" {...form.register("isAnonymous")} className="rounded" />
                <span className="text-sm font-medium">Submit anonymously</span>
              </label>
              <p className="text-xs text-muted-foreground mt-1">Your identity will be hidden from staff (not from administrators)</p>
            </FormField>

            <div className="flex gap-3 pt-2">
              <Button type="submit" variant="accent" disabled={isPending}>{isPending ? "Submitting…" : "Submit Complaint"}</Button>
              <Button type="button" variant="ghost" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
