export interface OptionsStatus { pending: boolean; error: unknown; retry: () => void }
export const combineOptionsStatus = (...queries: { isPending: boolean; error: unknown; refetch: () => unknown }[]): OptionsStatus => ({
    pending: queries.some(query => query.isPending),
    error: queries.find(query => query.error)?.error,
    retry: () => { queries.forEach(query => { void query.refetch(); }); },
});
