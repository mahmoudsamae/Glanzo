"use client";

import {
  useMutation,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; code: string };

type OptimisticMutationOptions<TInput, TData, TCache> = {
  mutationFn: (input: TInput) => Promise<ActionResult<TData>>;
  queryKeys: QueryKey[];
  onOptimisticUpdate: (cache: TCache, input: TInput) => TCache;
  getCache: (key: QueryKey) => TCache | undefined;
  setCache: (key: QueryKey, value: TCache) => void;
  onSuccess?: (data: TData, input: TInput) => void;
  onErrorCode?: (code: string) => void;
};

/**
 * Typed optimistic mutation helper — onMutate write, rollback on error, invalidate on settle.
 */
export function useOptimisticAppointmentMutation<TInput, TData, TCache>(
  options: OptimisticMutationOptions<TInput, TData, TCache>,
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TInput, { snapshots: Array<{ key: QueryKey; data: TCache | undefined }> }>({
    mutationFn: async (input: TInput) => {
      const result = await options.mutationFn(input);
      if (!result.ok) {
        throw new Error(result.code);
      }
      return result.data;
    },
    onMutate: async (input) => {
      await Promise.all(
        options.queryKeys.map((key) => queryClient.cancelQueries({ queryKey: key })),
      );

      const snapshots = options.queryKeys.map((key) => ({
        key,
        data: options.getCache(key),
      }));

      for (const { key, data } of snapshots) {
        if (data !== undefined) {
          options.setCache(key, options.onOptimisticUpdate(data, input));
        }
      }

      return { snapshots };
    },
    onError: (error, _input, context) => {
      context?.snapshots.forEach(({ key, data }) => {
        if (data !== undefined) {
          options.setCache(key, data);
        }
      });
      options.onErrorCode?.(error instanceof Error ? error.message : "UNKNOWN");
    },
    onSuccess: (data, input) => {
      options.onSuccess?.(data, input);
    },
    onSettled: () => {
      options.queryKeys.forEach((key) => {
        void queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });
}
