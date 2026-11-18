import { buildSeed, DATA_VERSION, DEFAULT_CITIZEN_ID } from "./seed";
import type { AppData, Session } from "./types";

/**
 * Camada de acesso a dados.
 * O protótipo usa localStorage; a futura integração com Supabase deve implementar
 * esta mesma interface (ver supabase/schema.sql e ARQUITETURA.md).
 * Todos os registros possuem tenantId, base para o isolamento entre gabinetes (RLS).
 */
export interface DataRepository {
  load(): AppData | null;
  save(data: AppData): { ok: boolean; error?: string };
  reset(): AppData;
  loadSession(): Session | null;
  saveSession(s: Session): void;
}

export const DATA_KEY = "gabinete-digital:v1:data";
export const SESSION_KEY = "gabinete-digital:v1:session";

export const DEFAULT_SESSION: Session = { role: "cidadao", citizenId: DEFAULT_CITIZEN_ID, staffId: "ass-2" };

export const localRepository: DataRepository = {
  load() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as AppData;
      return parsed.version === DATA_VERSION ? parsed : null;
    } catch {
      return null;
    }
  },
  save(data) {
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(data));
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "erro" };
    }
  },
  reset() {
    const seed = buildSeed();
    try {
      localStorage.setItem(DATA_KEY, JSON.stringify(seed));
    } catch {
      /* ignora */
    }
    return seed;
  },
  loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? ({ ...DEFAULT_SESSION, ...JSON.parse(raw) } as Session) : null;
    } catch {
      return null;
    }
  },
  saveSession(s) {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {
      /* ignora */
    }
  },
};
