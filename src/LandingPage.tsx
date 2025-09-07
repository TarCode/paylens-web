import React from 'react';

interface LandingPageProps {
    onGetStarted: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
    const styles = {
        container: {
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            flexDirection: 'column' as const,
        },
        header: {
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(10px)',
        },
        logo: {
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold',
        },
        logoImage: {
            width: '40px',
            height: '40px',
        },
        navButton: {
            background: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
        },
        hero: {
            flex: 1,
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center' as const,
            padding: '40px 20px',
            color: 'white',
        },
        heroTitle: {
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 'bold',
            marginBottom: '20px',
            lineHeight: 1.2,
        },
        heroSubtitle: {
            fontSize: 'clamp(1.2rem, 2.5vw, 1.8rem)',
            marginBottom: '16px',
            opacity: 0.9,
        },
        heroDescription: {
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            marginBottom: '40px',
            opacity: 0.8,
            maxWidth: '600px',
            lineHeight: 1.6,
        },
        ctaButton: {
            background: 'white',
            color: '#667eea',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
        },
        features: {
            background: 'white',
            padding: '80px 20px',
        },
        featuresContainer: {
            maxWidth: '1200px',
            margin: '0 auto',
        },
        featuresTitle: {
            textAlign: 'center' as const,
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '60px',
        },
        featuresGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '40px',
            marginBottom: '60px',
        },
        featureCard: {
            textAlign: 'center' as const,
            padding: '40px 20px',
            borderRadius: '12px',
            background: '#f8f9ff',
            border: '1px solid #e1e5e9',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        },
        featureIcon: {
            fontSize: '3rem',
            marginBottom: '20px',
        },
        featureTitle: {
            fontSize: '1.5rem',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '16px',
        },
        featureDescription: {
            color: '#666',
            lineHeight: 1.6,
        },
        ctaSection: {
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '80px 20px',
            textAlign: 'center' as const,
            color: 'white',
        },
        ctaTitle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            marginBottom: '20px',
        },
        ctaDescription: {
            fontSize: '1.2rem',
            marginBottom: '40px',
            opacity: 0.9,
        },
        footer: {
            background: '#333',
            color: 'white',
            padding: '40px 20px',
            textAlign: 'center' as const,
        },
        footerLink: {
            color: 'white',
            textDecoration: 'none',
        },
    };

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <div style={styles.logo}>
                    <img src="/logo.png" alt="PayLens" style={styles.logoImage} />
                    PayLens
                </div>
                <button
                    style={styles.navButton}
                    onClick={onGetStarted}
                    onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.3)';
                        (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.2)';
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                    }}
                >
                    Get Started
                </button>
            </div>

            {/* Hero Section */}
            <div style={styles.hero}>
                <h1 style={styles.heroTitle}>
                    Discover Hidden Costs in Your Payment Data
                </h1>
                <p style={styles.heroSubtitle}>
                    Upload your transaction CSV and get instant savings insights
                </p>
                <p style={styles.heroDescription}>
                    PayLens analyzes your payment processor data to identify optimization opportunities,
                    compare rates, and show you exactly how much you could save with different providers.
                </p>
                <button
                    style={styles.ctaButton}
                    onClick={onGetStarted}
                    onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(-3px)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                    }}
                >
                    Start Analyzing Now
                </button>
            </div>

            {/* Features Section */}
            <div style={styles.features}>
                <div style={styles.featuresContainer}>
                    <h2 style={styles.featuresTitle}>Why Choose PayLens?</h2>
                    <div style={styles.featuresGrid}>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>📊</div>
                            <h3 style={styles.featureTitle}>Comprehensive Analysis</h3>
                            <p style={styles.featureDescription}>
                                Get detailed insights into your transaction patterns, fee structures,
                                and optimization opportunities with our advanced analytics engine.
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>💰</div>
                            <h3 style={styles.featureTitle}>Save Money</h3>
                            <p style={styles.featureDescription}>
                                Discover exactly how much you could save by switching payment processors
                                or optimizing your current setup. See real savings potential.
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>⚡</div>
                            <h3 style={styles.featureTitle}>Instant Results</h3>
                            <p style={styles.featureDescription}>
                                Upload your CSV file and get comprehensive analysis in seconds.
                                No waiting, no complex setup - just actionable insights.
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🏆</div>
                            <h3 style={styles.featureTitle}>Processor Comparison</h3>
                            <p style={styles.featureDescription}>
                                Compare your current processor against industry benchmarks and
                                see how different providers would impact your bottom line.
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>📈</div>
                            <h3 style={styles.featureTitle}>Growth Insights</h3>
                            <p style={styles.featureDescription}>
                                Understand your transaction patterns and get recommendations
                                for scaling your business more cost-effectively.
                            </p>
                        </div>
                        <div style={styles.featureCard}>
                            <div style={styles.featureIcon}>🔒</div>
                            <h3 style={styles.featureTitle}>Secure & Private</h3>
                            <p style={styles.featureDescription}>
                                Your data is processed securely and never stored permanently.
                                We prioritize your privacy and data protection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div style={styles.ctaSection}>
                <h2 style={styles.ctaTitle}>Ready to Optimize Your Payments?</h2>
                <p style={styles.ctaDescription}>
                    Join thousands of South African businesses saving money with PayLens
                </p>
                <button
                    style={styles.ctaButton}
                    onClick={onGetStarted}
                    onMouseOver={(e) => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(-3px)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.3)';
                    }}
                    onMouseOut={(e) => {
                        (e.target as HTMLButtonElement).style.transform = 'translateY(0)';
                        (e.target as HTMLButtonElement).style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.2)';
                    }}
                >
                    Get Started Free
                </button>
            </div>

            {/* Footer */}
            <div style={styles.footer}>
                <p>Built for South African businesses by <a href="https://tarcode.github.io" target="_blank" rel="noopener noreferrer" style={styles.footerLink}><b>TarCode</b></a> • © 2025 PayLens</p>
            </div>
        </div>
    );
};

export default LandingPage;
