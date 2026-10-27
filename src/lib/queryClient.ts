import { QueryClient } from '@tanstack/react-query'

// Catalog reads are cheap and change rarely; keep them warm for five minutes.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
