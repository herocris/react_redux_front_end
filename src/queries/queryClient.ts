import { QueryClient } from '@tanstack/react-query';

export const createAppQueryClient = () => new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: false,
            refetchOnMount: true,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
        },
        mutations: { retry: false, gcTime: 5 * 60_000 },
    },
});

// Created once at bootstrap, never during a component render.
export const queryClient = createAppQueryClient();
