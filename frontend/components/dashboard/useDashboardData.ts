"use client";

import { useEffect, useState } from "react";
import { ApiError, fetchScoped, type Session } from "@/lib/api";
import type { DataSource } from "@/lib/types";

export interface RadioRow { 
  id: string; 
  time_str: string; 
  train_no: string; 
  station: string; 
  channel: string; 
  speaker: string; 
  transcript_en: string; 
  transcript_hi: string; 
  safety_keywords: string[]; 
  clarity_score: number; 
  fail_open_bypassed: boolean;
  audio_url?: string;
  audio_file?: string;
  sha256_hash?: string;
  raw_snr_db?: number;
  denoised_snr_db?: number;
  snr_improvement_db?: number;
}
export interface CabinAlert { alert_id: string; time_str: string; train_no: string; loco_id: string; section: string; violation_type: string; severity: string; is_compliant_activity: boolean; verification_status: string; description: string; crew_id?: string }
export interface WagonScan { id: string; wagon_no: string; position_in_rake: number; exit_damage_status: string; delta_transit_damage: boolean; exit_defects: Array<{ class: string; severity: string }> }

export interface DashboardData {
  railcomm?: RadioRow[];
  locate?: CabinAlert[];
  wdd?: WagonScan[];
  loading: boolean;
  /** Backend unreachable — dashboard shows what's bundled offline. */
  offline: boolean;
  denied: DataSource[];
}

/** Loads only the sources in the role's scope. Re-runs when role or purpose changes. */
export function useDashboardData(session: Session, scopes: DataSource[]): DashboardData {
  const [state, setState] = useState<DashboardData>({ loading: true, offline: false, denied: [] });
  const key = `${session.role}|${session.purpose}|${scopes.join(",")}`;

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true }));
    const want: Array<[DataSource, keyof DashboardData, string]> = [
      ["RAILCOMM", "railcomm", "/api/skills/railcomm"],
      ["LOCATE", "locate", "/api/skills/locate"],
      ["WDD", "wdd", "/api/skills/wdd"],
    ];
    Promise.all(
      want.map(async ([src, field, path]) => {
        if (!scopes.includes(src)) return { field, value: undefined, offline: false, denied: false };
        try {
          return { field, value: await fetchScoped<unknown[]>(path, {}, session), offline: false, denied: false };
        } catch (e) {
          return { field, value: undefined, offline: !(e instanceof ApiError), denied: e instanceof ApiError && e.status === 403, src };
        }
      })
    ).then((results) => {
      if (!alive) return;
      const next: DashboardData = { loading: false, offline: results.some((r) => r.offline), denied: [] };
      for (const r of results) {
        if (r.value) (next as unknown as Record<string, unknown>)[r.field] = r.value;
        if (r.denied && "src" in r) next.denied.push(r.src as DataSource);
      }
      setState(next);
    });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
