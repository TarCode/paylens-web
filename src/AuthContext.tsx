import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// TypeScript interfaces
interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
    usageCount?: number;
    maxUsage?: number;
    isPremium?: boolean;
}

interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    tokens: AuthTokens | null;
    error: string | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    loginWithGoogle: (credential: string) => Promise<{ success: boolean; isNewUser?: boolean; error?: string }>;
    register: (userData: { email: string; password: string; name: string }) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    refreshToken: () => Promise<{ success: boolean }>;
    isAuthenticated: () => boolean;
    getProfile: () => Promise<{ success: boolean; user?: User }>;
    clearError: () => void;
    incrementUsage: () => Promise<{ success: boolean; usageCount?: number; monthlyLimit?: number; error?: string }>;
    getUsageData: () => Promise<{ success: boolean; data?: any; error?: string }>;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [tokens, setTokens] = useState<AuthTokens | null>(null);
    const [error, setError] = useState<string | null>(null);

    // API base URL - adjust this to match your backend
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

    // Clear error state
    const clearError = () => {
        setError(null);
    };

    // Initialize auth state from localStorage
    useEffect(() => {
        const initializeAuth = () => {
            try {
                const storedTokens = localStorage.getItem('auth_tokens');
                const storedUser = localStorage.getItem('auth_user');

                if (storedTokens && storedUser) {
                    const parsedTokens = JSON.parse(storedTokens);
                    const parsedUser = JSON.parse(storedUser);

                    // Check if tokens are still valid
                    const tokenPayload = JSON.parse(atob(parsedTokens.accessToken.split('.')[1]));
                    const currentTime = Date.now() / 1000;

                    if (tokenPayload.exp > currentTime) {
                        setTokens(parsedTokens);
                        setUser(parsedUser);

                        // Set up axios default headers
                        axios.defaults.headers.common['Authorization'] = `Bearer ${parsedTokens.accessToken}`;
                    } else {
                        // Tokens expired, clear them
                        localStorage.removeItem('auth_tokens');
                        localStorage.removeItem('auth_user');
                    }
                }
            } catch (error) {
                console.error('Error initializing auth:', error);
                localStorage.removeItem('auth_tokens');
                localStorage.removeItem('auth_user');
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    // Google OAuth login with JWT
    const loginWithGoogle = async (credential: string): Promise<{ success: boolean; isNewUser?: boolean; error?: string }> => {
        try {
            setLoading(true);
            setError(null);

            // Call backend Google OAuth endpoint with JWT credential
            const response = await axios.post(`${API_BASE_URL}/api/auth/google/jwt`, {
                credential: credential
            });

            if (response.data.success) {
                const { user: userData, tokens: tokenData } = response.data.data;

                // Store auth data
                setUser(userData);
                setTokens(tokenData);

                // Save to localStorage
                localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
                localStorage.setItem('auth_user', JSON.stringify(userData));

                // Set up axios default headers
                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;

                return { success: true, isNewUser: response.data.data.isNewUser };
            } else {
                throw new Error(response.data.error?.message || 'Login failed');
            }
        } catch (error: unknown) {
            console.error('Google login error:', error);
            let errorMessage = 'Login failed';
            if (typeof error === 'object' && error !== null) {
                if ('response' in error && typeof (error as any).response === 'object' && (error as any).response !== null) {
                    errorMessage = (error as any).response?.data?.error?.message || errorMessage;
                } else if ('message' in error && typeof (error as any).message === 'string') {
                    errorMessage = (error as any).message;
                }
            }
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // Traditional email/password login
    const login = async (email: string, password: string) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
                email,
                password
            });

            if (response.data.success) {
                const { user: userData, tokens: tokenData } = response.data.data;

                setUser(userData);
                setTokens(tokenData);

                localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
                localStorage.setItem('auth_user', JSON.stringify(userData));

                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;

                return { success: true };
            } else {
                throw new Error(response.data.error?.message || 'Login failed');
            }
        } catch (error: unknown) {
            console.error('Login error:', error);
            let errorMessage = 'Login failed';
            if (typeof error === 'object' && error !== null) {
                if ('response' in error && typeof (error as any).response === 'object' && (error as any).response !== null) {
                    errorMessage = (error as any).response?.data?.error?.message || errorMessage;
                } else if ('message' in error && typeof (error as any).message === 'string') {
                    errorMessage = (error as any).message;
                }
            }
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // Register new user
    const register = async (userData: { email: string; password: string; name: string }) => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.post(`${API_BASE_URL}/api/auth/register`, userData);

            if (response.data.success) {
                const { user: userDataResponse, tokens: tokenData } = response.data.data;

                setUser(userDataResponse);
                setTokens(tokenData);

                localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
                localStorage.setItem('auth_user', JSON.stringify(userDataResponse));

                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;

                return { success: true };
            } else {
                throw new Error(response.data.error?.message || 'Registration failed');
            }
        } catch (error: unknown) {
            console.error('Registration error:', error);
            let errorMessage = 'Registration failed';
            if (typeof error === 'object' && error !== null) {
                if ('response' in error && typeof (error as any).response === 'object' && (error as any).response !== null) {
                    errorMessage = (error as any).response?.data?.error?.message || errorMessage;
                } else if ('message' in error && typeof (error as any).message === 'string') {
                    errorMessage = (error as any).message;
                }
            }
            setError(errorMessage);
            return {
                success: false,
                error: errorMessage
            };
        } finally {
            setLoading(false);
        }
    };

    // Logout
    const logout = (): void => {
        setUser(null);
        setTokens(null);
        localStorage.removeItem('auth_tokens');
        localStorage.removeItem('auth_user');
        delete axios.defaults.headers.common['Authorization'];
    };

    // Refresh token
    const refreshToken = async () => {
        try {
            if (!tokens?.refreshToken) {
                throw new Error('No refresh token available');
            }

            const response = await axios.post(`${API_BASE_URL}/api/auth/refresh-token`, {
                refreshToken: tokens.refreshToken
            });

            if (response.data.success) {
                const { user: userData, tokens: tokenData } = response.data.data;

                setUser(userData);
                setTokens(tokenData);

                localStorage.setItem('auth_tokens', JSON.stringify(tokenData));
                localStorage.setItem('auth_user', JSON.stringify(userData));

                axios.defaults.headers.common['Authorization'] = `Bearer ${tokenData.accessToken}`;

                return { success: true };
            } else {
                throw new Error('Token refresh failed');
            }
        } catch (error) {
            console.error('Token refresh error:', error);
            logout(); // Logout if refresh fails
            return { success: false };
        }
    };

    // Check if user is authenticated
    const isAuthenticated = (): boolean => {
        return user !== null && tokens !== null;
    };

    // Get user profile
    const getProfile = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/auth/profile`);

            if (response.data.success) {
                const updatedUser = response.data.data.user;
                setUser(updatedUser);
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));
                return { success: true, user: updatedUser };
            } else {
                throw new Error('Failed to get profile');
            }
        } catch (error) {
            console.error('Get profile error:', error);
            if (typeof error === 'object' && error !== null && 'response' in error) {
                // @ts-expect-error: error is unknown, but we expect .response from axios
                if (error.response?.status === 401) {
                    logout();
                }
            }
            return { success: false };
        }
    };

    // Increment usage count
    const incrementUsage = async () => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/usage/increment`);

            if (response.data.success) {
                const { user: updatedUser, tokens: newTokens } = response.data.data;

                // Update user state
                setUser(updatedUser);
                setTokens(newTokens);

                // Update localStorage
                localStorage.setItem('auth_tokens', JSON.stringify(newTokens));
                localStorage.setItem('auth_user', JSON.stringify(updatedUser));

                // Update axios default headers with new access token
                axios.defaults.headers.common['Authorization'] = `Bearer ${newTokens.accessToken}`;

                return {
                    success: true,
                    usageCount: updatedUser.usageCount,
                    monthlyLimit: updatedUser.monthlyLimit
                };
            } else {
                throw new Error('Failed to increment usage');
            }
        } catch (error) {
            console.error('Increment usage error:', error);
            if (typeof error === 'object' && error !== null && 'response' in error) {
                // @ts-expect-error: error is unknown, but we expect .response from axios
                if (error.response?.status === 401) {
                    logout();
                }
            }
            let errorMessage = 'An unknown error occurred';
            if (typeof error === 'object' && error !== null) {
                // @ts-expect-error: error is unknown, but we expect .response from axios
                if (error.response?.data?.error?.message) {
                    // @ts-expect-error: error is unknown, but we expect .response from axios
                    errorMessage = error.response.data.error.message;
                    // @ts-expect-error: error is unknown, but we expect .message
                } else if (error.message) {
                    // @ts-expect-error: error is unknown, but we expect .message
                    errorMessage = error.message;
                }
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    };

    // Get current usage data
    const getUsageData = async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/usage`);

            if (response.data.success) {
                return {
                    success: true,
                    data: response.data.data
                };
            } else {
                throw new Error('Failed to get usage data');
            }
        } catch (error) {
            console.error('Get usage data error:', error);
            if (typeof error === 'object' && error !== null && 'response' in error) {
                // @ts-expect-error: error is unknown, but we expect .response from axios
                if (error.response?.status === 401) {
                    logout();
                }
            }
            let errorMessage = 'An unknown error occurred';
            if (typeof error === 'object' && error !== null) {
                // @ts-expect-error: error is unknown, but we expect .response from axios
                if (error.response?.data?.error?.message) {
                    // @ts-expect-error: error is unknown, but we expect .response from axios
                    errorMessage = error.response.data.error.message;
                    // @ts-expect-error: error is unknown, but we expect .message
                } else if (error.message) {
                    // @ts-expect-error: error is unknown, but we expect .message
                    errorMessage = error.message;
                }
            }
            return {
                success: false,
                error: errorMessage
            };
        }
    }

    const value = {
        user,
        tokens,
        loading,
        error,
        login,
        loginWithGoogle,
        register,
        logout,
        refreshToken,
        isAuthenticated,
        getProfile,
        clearError,
        incrementUsage,
        getUsageData
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
