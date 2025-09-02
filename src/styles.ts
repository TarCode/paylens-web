import { CSSProperties } from 'react';

// TypeScript interfaces for styles
interface Styles {
    container: CSSProperties;
    maxWidth: CSSProperties;
    hero: CSSProperties;
    heroLogo: CSSProperties;
    heroTitle: CSSProperties;
    heroSubtitle: CSSProperties;
    heroDescription: CSSProperties;
    card: CSSProperties;
    uploadArea: (dragOver: boolean) => CSSProperties;
    uploadIcon: CSSProperties;
    uploadTitle: CSSProperties;
    uploadText: CSSProperties;
    uploadSmallText: CSSProperties;
    loading: CSSProperties;
    spinner: CSSProperties;
    error: CSSProperties;
    resultsTitle: CSSProperties;
    metricsGrid: CSSProperties;
    metric: CSSProperties;
    metricDefault: CSSProperties;
    metricSuccess: CSSProperties;
    metricError: CSSProperties;
    metricTitle: CSSProperties;
    metricValue: CSSProperties;
    metricValueDefault: CSSProperties;
    metricValueSuccess: CSSProperties;
    metricValueError: CSSProperties;
    recommendations: CSSProperties;
    recommendationsTitle: CSSProperties;
    recommendation: CSSProperties;
    recommendationIcon: CSSProperties;
    buttonContainer: CSSProperties;
    button: CSSProperties;
    buttonSecondary: CSSProperties;
    footer: CSSProperties;
    userHeader: CSSProperties;
    userInfo: CSSProperties;
    userName: CSSProperties;
    logoutButton: CSSProperties;
    [key: string]: CSSProperties | ((dragOver: boolean) => CSSProperties);
}

export const styles: Styles = {
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
    uploadArea: (dragOver: boolean): CSSProperties => ({
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
    },
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

// Enhanced styles for authenticated view
export const enhancedStyles: Styles = {
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

// Enhanced styles for new components
export const enhancedResultStyles: Styles = {
    ...styles,
    tabContainer: {
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '24px',
        gap: '8px'
    },
    tab: {
        padding: '12px 20px',
        background: 'transparent',
        border: 'none',
        borderBottom: '2px solid transparent',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        color: '#6b7280',
        transition: 'all 0.2s ease'
    },
    activeTab: {
        color: '#2563eb',
        borderBottomColor: '#2563eb'
    },
    scoreCard: {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '12px',
        padding: '24px',
        textAlign: 'center',
        marginBottom: '24px'
    },
    scoreGrade: {
        fontSize: '48px',
        fontWeight: 'bold',
        marginBottom: '8px'
    },
    scoreText: {
        fontSize: '18px',
        opacity: 0.9
    },
    breakdownGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
    },
    breakdownCard: {
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '16px'
    },
    breakdownTitle: {
        fontSize: '12px',
        fontWeight: '600',
        color: '#64748b',
        marginBottom: '8px',
        textTransform: 'uppercase'
    },
    breakdownValue: {
        fontSize: '18px',
        fontWeight: 'bold',
        color: '#1e293b',
        marginBottom: '4px'
    },
    breakdownSubtext: {
        fontSize: '12px',
        color: '#64748b'
    },
    comparisonTable: {
        width: '100%',
        borderCollapse: 'collapse',
        marginBottom: '24px'
    },
    tableHeader: {
        background: '#f1f5f9',
        fontWeight: '600',
        padding: '12px',
        textAlign: 'left',
        borderBottom: '2px solid #e2e8f0'
    },
    tableCell: {
        padding: '12px',
        borderBottom: '1px solid #e2e8f0'
    },
    savingsPositive: {
        color: '#059669',
        fontWeight: '600'
    },
    savingsNegative: {
        color: '#dc2626',
        fontWeight: '600'
    },
    priorityBadge: {
        padding: '4px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '600',
        textTransform: 'uppercase'
    },
    priorityHigh: {
        background: '#fef2f2',
        color: '#dc2626'
    },
    priorityMedium: {
        background: '#fffbeb',
        color: '#d97706'
    },
    priorityLow: {
        background: '#f0fdf4',
        color: '#059669'
    },
    nextStepItem: {
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '12px'
    },
    nextStepHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '8px'
    },
    nextStepAction: {
        fontSize: '14px',
        fontWeight: '600',
        color: '#1f2937'
    },
    nextStepTimeframe: {
        fontSize: '12px',
        color: '#6b7280',
        background: '#f3f4f6',
        padding: '2px 8px',
        borderRadius: '12px'
    },
    nextStepImpact: {
        fontSize: '13px',
        color: '#059669',
        fontWeight: '500'
    }
};