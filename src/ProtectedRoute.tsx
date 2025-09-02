import React, { useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading, user, logout } = useAuth();

    const styles = {
        container: {
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        },
        card: {
            background: 'white',
            borderRadius: '12px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            width: '100%',
            maxWidth: '400px',
            textAlign: 'center'
        },
        spinner: {
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
        },
        userInfo: {
            marginBottom: '30px'
        },
        userName: {
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '5px'
        },
        userEmail: {
            color: '#666',
            fontSize: '14px',
            marginBottom: '15px'
        },
        button: {
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
            margin: '0 10px'
        },
        continueButton: {
            background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)'
        },
        logoutButton: {
            background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'
        },
        welcome: {
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '10px'
        },
        subtitle: {
            color: '#666',
            fontSize: '16px',
            marginBottom: '30px'
        }
    };

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={styles.container}>
                <div style={styles.card as any}>
                    <div style={styles.spinner}></div>
                    <p>Loading...</p>
                    <style>
                        {`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
                    </style>
                </div>
            </div>
        );
    }

    // If not authenticated, return null (will be handled by parent component)
    if (!isAuthenticated()) {
        return null;
    }


    // User is authenticated, show a welcome screen with option to continue
    return (
        <div style={styles.container}>
            <div style={styles.card as any}>
                <div style={styles.userInfo}>
                    <div style={styles.welcome}>Welcome to PayLens!</div>
                    <div style={styles.subtitle}>You're successfully authenticated</div>

                    {user && (
                        <>
                            <div style={styles.userName as any}>
                                {user.firstName} {user.lastName}
                            </div>
                            <div style={styles.userEmail}>{user.email}</div>
                            <div style={{ fontSize: '12px', color: '#999', marginBottom: '20px' } as any}>
                                Tier: {user.isPremium ? 'Premium' : 'Free'}
                            </div>
                        </>
                    )}
                </div>

                <div>
                    <button
                        style={{ ...styles.button, ...styles.continueButton } as any}
                        onMouseOver={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)')}
                        onMouseOut={(e) => ((e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)')}
                        onClick={() => {
                            // This will be handled by the parent component to show the main app
                            window.location.reload();
                        }}
                    >
                        Continue to PayLens
                    </button>

                    <button
                        style={{ ...styles.button, ...styles.logoutButton } as any}
                        onMouseOver={(e) => (e.target as HTMLElement).style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => (e.target as HTMLElement).style.transform = 'translateY(0)'}
                        onClick={logout}
                    >
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProtectedRoute;
