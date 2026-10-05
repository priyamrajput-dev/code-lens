import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 60 * 1000, // data counts as fresh for 1 minute
                        gcTime: 5 * 60 * 1000, // unused cache is kept for 5 minutes
                        refetchOnWindowFocus: false, // no refetch on every tab switch
                        retry: 1, // fewer slow retries on failures
                    },
                },
            }),
    );

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
