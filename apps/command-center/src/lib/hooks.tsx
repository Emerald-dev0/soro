import { useCallback, useEffect, useRef, useState } from 'react';
import { api, connectEventStream, type ApiResult, type SseStatus } from '@soro/api-client';

export function useApi<T>(fn: () => Promise<ApiResult<T>>, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const res = await fn();
    if (res.success) setData(res.data);
    else setError(res.error.message);
    setLoading(false);
  }, deps);
  useEffect(() => { void load(); }, [load]);
  return { data, error, loading, reload: load };
}

export { api };

export function useEventStream(onEvent: (e: { type?: string; session_id?: string; created_at?: string } & Record<string, unknown>) => void) {
  const [status, setStatus] = useState<SseStatus>('connecting');
  const cb = useRef(onEvent);
  cb.current = onEvent;
  useEffect(() => {
    const stop = connectEventStream((e) => cb.current(e as never), setStatus);
    return stop;
  }, []);
  return status;
}
