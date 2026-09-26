"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Papa from "papaparse";
import { Button } from "@/components/ui/Button";
import { Upload } from "lucide-react";

export function CsvSyncForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [syncing, setSyncing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setSyncing(true);
    setError(null);
    setMessage(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await fetch("/api/admin/services/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rows: results.data }),
          });
          const data = await res.json();
          if (!res.ok) {
            setError(data.error ?? "Sync failed.");
          } else {
            setMessage(
              `Synced ${data.servicesSynced} service(s) and ${data.hoursSynced} day(s) of hours.`
            );
            router.refresh();
          }
        } catch {
          setError("Couldn't reach the server. Try again.");
        } finally {
          setSyncing(false);
        }
      },
      error: () => {
        setError("Couldn't parse that CSV file.");
        setSyncing(false);
      },
    });
  };

  return (
    <div className="rounded-xl border border-border-slate bg-surface-charcoal p-5">
      <p className="mb-1 font-medium text-neon-silver">Re-sync from CSV</p>
      <p className="mb-4 text-sm text-muted-gray">
        Columns: service_id, service_name, duration_mins, price, day_of_week,
        open_time, close_time
      </p>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={syncing}
      >
        <Upload size={16} />
        {syncing ? "Syncing…" : "Upload CSV"}
      </Button>
      {message && <p className="mt-3 text-sm text-success-green">{message}</p>}
      {error && <p className="mt-3 text-sm text-error-red">{error}</p>}
    </div>
  );
}
