import { useState, useCallback, useRef } from 'react';
import { useAuth } from '../AuthContext';

export const useUsage = () => {
    const { incrementUsage: incrementAuthUsage, getUsageData: getAuthUsageData, user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Request deduplication - prevent multiple simultaneous requests
    const lastRequestRef = useRef(0);
    const REQUEST_DEBOUNCE_MS = 2000; // 2 seconds minimum between requests

    // Increment usage count with client-side protections
    const incrementUsage = useCallback(async () => {
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
                setError(result.error);
                return result;
            }

            return result;
        } catch (err) {
            const errorMessage = err.message || 'Failed to increment usage';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [incrementAuthUsage]);

    // Get usage data
    const getUsageData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await getAuthUsageData();

            if (!result.success) {
                setError(result.error);
                return result;
            }

            return result;
        } catch (err) {
            const errorMessage = err.message || 'Failed to get usage data';
            setError(errorMessage);
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [getAuthUsageData]);

    // Check if user has reached usage limit
    const hasReachedLimit = () => {
        if (!user) return false;
        if (user.subscriptionTier === 'enterprise') return false;
        return user.usageCount >= user.monthlyLimit;
    };

    // Get usage percentage
    const getUsagePercentage = () => {
        if (!user || user.monthlyLimit <= 0) return 0;
        return Math.round((user.usageCount / user.monthlyLimit) * 100);
    };

    // Get remaining usage
    const getRemainingUsage = () => {
        if (!user) return 0;
        if (user.subscriptionTier === 'enterprise') return -1; // unlimited
        return Math.max(0, user.monthlyLimit - user.usageCount);
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
        currentUsage: user?.usageCount || 0,
        monthlyLimit: user?.monthlyLimit || 0,
        subscriptionTier: user?.subscriptionTier || 'free'
    };
};

export default useUsage;
