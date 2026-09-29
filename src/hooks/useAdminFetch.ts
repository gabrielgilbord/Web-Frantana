"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

export function useAdminFetch<T>(url: string, map: (data: unknown) => T, initial: T) {
  const router = useRouter();
  const [data, setData] = useState<T>(initial);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const reload = useCallback(() => {
    startTransition(() => {
      void (async () => {
        const res = await fetch(url);
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        if (!res.ok) {
          setError("No se pudieron cargar los datos");
          return;
        }
        const json = await res.json();
        setData(map(json));
        setError(null);
      })();
    });
  }, [url, map, router]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, setData, error, reload };
}
