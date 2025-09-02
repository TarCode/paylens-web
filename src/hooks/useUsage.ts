import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../AuthContext';

interface UsageResult {
    success: boolean;
    error?: string;
    usageCount?: number;
    monthlyLimit?: number;
    data?: any;
}

export const useUsage = () => {
    const { incrementUsage: incrementAuthUsage, getUsageData: getAuthUsageData, user } = useAuth();
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Request deduplication - prevent multiple simultaneous requests
    const lastRequestRef = useRef<number>(0);
    const REQUEST_DEBOUNCE_MS = 2000; // 2 seconds minimum between requests

    // Increment usage count with client-side protections
    const incrementUsage = useCallback(async (): Promise<UsageResult> => {
        const now = Date.now();

        // Client-side rate limiting
        if (now - lastRequestRef.current < REQUEST_DEBOUNCE_MS) {
            const errorMessage = 'Requests too frequent. Please wait before trying again.';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        }

        setLoading(true);
        setError(null);
        lastRequestRef.current = now;

        try {
            const result = await incrementAuthUsage();

            if (!result.success) {
                setError(result.error ?? null);
                return { success: false, error: result.error };
            }

            return result;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to increment usage';
            setError(errorMessage ?? null);
            return { success: false, error: errorMessage ?? null };
        } finally {
            setLoading(false);
        }
    }, [incrementAuthUsage]);

    // Get usage data
    const getUsageData = useCallback(async (): Promise<UsageResult> => {
        setLoading(true);
        setError(null);

        try {
            const result = await getAuthUsageData();

            if (!result.success) {
                setError(result.error ?? null);
                return { success: false, error: result.error }  ;
            }

            return result;
        } catch (err: any) {
            const errorMessage = err.message || 'Failed to get usage data';
            setError(errorMessage ?? null);
            return { success: false, error: errorMessage ?? null };
        } finally {
            setLoading(false);
        }
    }, [getAuthUsageData]);

    // Check if user has reached usage limit
    const hasReachedLimit = (): boolean => {
        if (!user) return false;
        if ((user as any).subscriptionTier === 'enterprise') return false;
        return (user as any).usageCount >= (user as any).monthlyLimit;
    };

    // Get usage percentage
    const getUsagePercentage = (): number => {
        if (!user || (user as any).monthlyLimit <= 0) return 0;
        return Math.round(((user as any).usageCount / (user as any).monthlyLimit) * 100);
    };

    // Get remaining usage
    const getRemainingUsage = (): number => {
        if (!user) return 0;
        if ((user as any).subscriptionTier === 'enterprise') return -1; // unlimited
        return Math.max(0, (user as any).monthlyLimit - (user as any).usageCount);
    };

    return {
        // State
        loading,
        error,

        // Actions
        incrementUsage,
        getUsageData,

        // Computed values
        hasReachedLimit: hasReachedLimit(),
        usagePercentage: getUsagePercentage(),
        remainingUsage: getRemainingUsage(),
        currentUsage: (user as any)?.usageCount || 0,
        monthlyLimit: (user as any)?.monthlyLimit || 0,
        subscriptionTier: (user as any)?.subscriptionTier || 'free'
    };
};

export default useUsage;
