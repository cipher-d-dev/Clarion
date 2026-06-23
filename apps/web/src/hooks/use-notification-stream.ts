"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export function useNotificationStream() {
  const token = useAuthStore((s) => s.tokens?.accessToken);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return;

    const es = new EventSource(`${API_URL}/v1/notifications/stream?token=${token}`);

    es.onmessage = () => {
      // Any event invalidates notification queries so the bell updates
      qc.invalidateQueries({ queryKey: ["notifications"] });
    };

    es.onerror = () => {
      // EventSource auto-reconnects; nothing to do here
    };

    return () => es.close();
  }, [token, qc]);
}
