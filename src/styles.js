export const styles = {
    container: {
        minHeight: '100vh',
        background: '#fafafa',
        padding: '0'
    },
    maxWidth: {
        maxWidth: '800px',
        margin: '0 auto'
    },
    hero: {
        textAlign: 'center',
        color: '#333',
        marginBottom: '40px',
        paddingTop: '40px',
        paddingBottom: '40px'
    },
    heroLogo: {
        width: '100px',
        height: '100px',
        marginBottom: '16px'
    },
    heroTitle: {
        fontSize: '3rem',
        fontWeight: '700',
        marginBottom: '16px',
        margin: '0 0 16px 0'
    },
    heroSubtitle: {
        fontSize: '1.2rem',
        opacity: '0.9',
        marginBottom: '16px',
        margin: '0 0 16px 0'
    },
    heroDescription: {
        fontSize: '1rem',
        opacity: '0.8',
        margin: '0'
    },
    card: {
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        marginBottom: '30px'
    },
    uploadArea: (dragOver) => ({
        border: `3px dashed ${dragOver ? '#22c55e' : '#667eea'}`,
        borderRadius: '12px',
        padding: '40px 20px',
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        background: dragOver ? '#f0fff4' : '#f8f9ff'
    }),
    uploadIcon: {
        fontSize: '3rem',
        marginBottom: '20px'
    },
    uploadTitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#333'
    },
    uploadText: {
        color: '#666',
        marginBottom: '8px'
    },
    uploadSmallText: {
        fontSize: '0.9rem',
        color: '#666',
        marginTop: '10px'
    },
    loading: {
        textAlign: 'center',
        padding: '40px'
    },
    spinner: {
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #667eea',
        borderRadius: '50%',
        width: '40px',
        height: '40px',
        animation: 'spin 1s linear infinite',
        margin: '0 auto 20px'
    },
    error: {
        background: '#fee2e2',
        color: '#dc2626',
        padding: '12px 16px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #fecaca'
    },
    resultsTitle: {
        fontSize: '1.5rem',
        fontWeight: '700',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    metricsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    metric: {
        padding: '20px',
        borderRadius: '8px',
        borderLeft: '4px solid'
    },
    metricDefault: {
        background: '#f8f9ff',
        borderLeftColor: '#667eea'
    },
    metricSuccess: {
        background: '#f0fdf4',
        borderLeftColor: '#22c55e'
    },
    metricError: {
        background: '#fef2f2',
        borderLeftColor: '#ef4444'
    },
    metricTitle: {
        fontWeight: '600',
        marginBottom: '8px',
        color: '#374151'
    },
    metricValue: {
        fontSize: '1.5rem',
        fontWeight: '700'
    },
    metricValueDefault: {
        color: '#333'
    },
    metricValueSuccess: {
        color: '#16a34a'
    },
    metricValueError: {
        color: '#dc2626'
    },
    recommendations: {
        background: '#fffbeb',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '24px'
    },
    recommendationsTitle: {
        color: '#d97706',
        fontWeight: '600',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
    },
    recommendation: {
        marginBottom: '12px',
        paddingLeft: '24px',
        position: 'relative',
        color: '#92400e'
    },
    recommendationIcon: {
        position: 'absolute',
        left: '0',
        top: '0'
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    button: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '12px 24px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
    },
    buttonSecondary: {
        background: 'white',
        color: '#374151',
        border: '1px solid #d1d5db'
    },
    footer: {
        textAlign: 'center',
        color: '#333',
        opacity: '0.75',
        marginTop: '20px'
    }
};

// Enhanced styles for authenticated view
export const enhancedStyles = {
    ...styles,
    userHeader: {
        position: 'absolute',
        top: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '10px 20px',
        borderRadius: '25px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        zIndex: 1000
    },
    userInfo: {
        fontSize: '14px',
        color: '#333'
    },
    userName: {
        fontWeight: '600',
        color: '#333'
    },
    logoutButton: {
        padding: '8px 16px',
        background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
        color: 'white',
        border: 'none',
        borderRadius: '20px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'transform 0.2s ease'
    }
};