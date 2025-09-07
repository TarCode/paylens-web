import React, { useState, useCallback, useEffect } from 'react';
import Papa from 'papaparse';
import { styles, enhancedStyles, enhancedResultStyles } from './styles';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import LandingPage from './LandingPage';
import useUsage from './hooks/useUsage';
import { generatePDFReport } from './utils/generate-report';
import { analyzeData, type AnalysisResults } from './utils/analyze-data';

// PayLens Analyzer with Authentication
const PayLensAnalyzer: React.FC = () => {
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const { incrementUsage } = useUsage();
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const [error, setError] = useState<string>('');
  const [dragOver, setDragOver] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('overview'); // New state for tabs
  const [currentView, setCurrentView] = useState<'landing' | 'login' | 'main'>('landing'); // View state management

  // Set view to main when authenticated, or landing when not authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      setCurrentView('main');
    } else {
      setCurrentView('landing');
    }
  }, [isAuthenticated]);

  // Navigation functions
  const handleGetStarted = () => {
    setCurrentView('login');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
  };

  // File handling functions - must be called before any conditional returns
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);

    Papa.parse<File>(file as any, {
      header: true,
      skipEmptyLines: true,
      complete: function (parseResults: Papa.ParseResult<any>) {
        setTimeout(async () => {
          await analyzeData(parseResults.data, "generic", setResults, setLoading, setError, incrementUsage);
        }, 2000);
      },
      error: function (error: Error, file: File) {
        setLoading(false);
        setError('Error reading CSV file: ' + error.message);
      }
    });
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '40px',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '20px auto'
          }}></div>
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

  // Show landing page if not authenticated and on landing view
  if (!isAuthenticated() && currentView === 'landing') {
    return <LandingPage onGetStarted={handleGetStarted} />;
  }

  // Show login if not authenticated and on login view
  if (!isAuthenticated() && currentView === 'login') {
    return <Login onBackToLanding={handleBackToLanding} />;
  }

  const resetAnalysis = (): void => {
    setResults(null);
    setError('');
    setActiveTab('overview');
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Show main app if authenticated and current view is main
  if (isAuthenticated() && currentView === 'main') {
    return (
      <div style={styles.container}>
        {/* User header with logout */}
        <div style={enhancedStyles.userHeader}>
          <div style={enhancedStyles.userInfo}>
            <span style={enhancedStyles.userName}>
              {user?.firstName} {user?.lastName}
            </span>
            <br />
            <span style={{ fontSize: '12px', color: '#666' }}>
              {user?.isPremium ? 'Premium' : 'Free'} • {user?.usageCount || 0} / {user?.maxUsage === -1 ? '∞' : (user?.maxUsage || 100)} uses
            </span>
          </div>
          <button
            style={enhancedStyles.logoutButton}
            onClick={logout}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            Logout
          </button>
        </div>

        <style>
          {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @media (min-width: 640px) {
            .button-container {
              flex-direction: row !important;
            }
          }
        `}
        </style>

        <div style={styles.maxWidth}>
          <div style={styles.hero}>
            <img src="/logo.png" alt="PayLens" style={styles.heroLogo} />
            <h1 style={styles.heroTitle}>PayLens</h1>
            <p style={styles.heroSubtitle}>
              Discover hidden costs in your payment data
            </p>
            <p style={styles.heroDescription}>
              Upload your transaction CSV export and get instant savings insights
            </p>
          </div>

          <div style={styles.card}>
            {!results && !loading && (
              <div>
                <div
                  style={styles.uploadArea(dragOver)}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => {
                    const fileInput = document.getElementById('fileInput');
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                >
                  <div style={styles.uploadIcon}>📊</div>
                  <h3 style={styles.uploadTitle}>Drop your transaction CSV here</h3>
                  <p style={styles.uploadText}>Or click to browse files</p>
                  <p style={styles.uploadSmallText}>
                    Export your transaction data from your payment processor dashboard
                  </p>
                </div>
                <input
                  type="file"
                  id="fileInput"
                  accept=".csv"
                  onChange={handleFileInput}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {loading && (
              <div style={styles.loading}>
                <div style={styles.spinner}></div>
                <p>Analyzing your payment data...</p>
              </div>
            )}

            {error && (
              <div style={styles.error}>
                {error}
              </div>
            )}

            {results && (
              <div>
                {/* Market Position Score */}
                {results.marketPosition && (
                  <div style={enhancedResultStyles.scoreCard as any}>
                    <div style={enhancedResultStyles.scoreGrade as any}>{results.marketPosition.grade}</div>
                    <div style={enhancedResultStyles.scoreText as any}>
                      Payment Optimization Score: {results.marketPosition.overallScore}/100
                    </div>
                  </div>
                )}

                {/* Tab Navigation */}
                <div style={enhancedResultStyles.tabContainer as any}>
                  {['overview', 'breakdown', 'comparison', 'recommendations', 'next-steps'].map(tab => (
                    <button
                      key={tab}
                      style={{
                        ...enhancedResultStyles.tab,
                        ...(activeTab === tab ? enhancedResultStyles.activeTab : {})
                      }}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab.charAt(0).toUpperCase() + tab.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div>
                    <h2 style={styles.resultsTitle}>🔍 Analysis Overview</h2>

                    <div style={styles.metricsGrid}>
                      <div style={{ ...styles.metric, ...styles.metricDefault }}>
                        <h3 style={styles.metricTitle}>Total Transactions</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                          {results.totalTransactions?.toLocaleString() || 0}
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricDefault }}>
                        <h3 style={styles.metricTitle}>Total Volume</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                          R {results.totalVolume?.toLocaleString() || 0}
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricDefault }}>
                        <h3 style={styles.metricTitle}>Total Fees Paid</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                          R {results.totalFees?.toFixed(2) || 0}
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricDefault }}>
                        <h3 style={styles.metricTitle}>Effective Rate</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                          {results.effectiveRate?.toFixed(2) || 0}%
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricSuccess }}>
                        <h3 style={styles.metricTitle}>Monthly Savings</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueSuccess }}>
                          R {results.monthlySavings?.toFixed(2) || 0}
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricSuccess }}>
                        <h3 style={styles.metricTitle}>Annual Savings</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueSuccess }}>
                          R {results.annualSavings?.toFixed(2) || 0}
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricError }}>
                        <h3 style={styles.metricTitle}>Failed Transactions</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueError }}>
                          {results.failedTransactions || 0} ({results.failureRate?.toFixed(1) || 0}%)
                        </div>
                      </div>

                      <div style={{ ...styles.metric, ...styles.metricDefault }}>
                        <h3 style={styles.metricTitle}>Average Transaction</h3>
                        <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                          R {results.averageTransaction?.toFixed(0) || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Breakdown Tab */}
                {activeTab === 'breakdown' && results.transactionBreakdown && (
                  <div>
                    <h2 style={styles.resultsTitle}>📊 Transaction Breakdown</h2>

                    <div style={enhancedResultStyles.breakdownGrid as any}>
                      <div style={enhancedResultStyles.breakdownCard as any}>
                        <div style={enhancedResultStyles.breakdownTitle as any}>Small Transactions (&lt; R100)</div>
                        <div style={enhancedResultStyles.breakdownValue as any}>
                          {results.transactionBreakdown.small.count}
                        </div>
                        <div style={enhancedResultStyles.breakdownSubtext as any}>
                          R {results.transactionBreakdown.small.volume.toFixed(2)} volume
                          <br />R {results.transactionBreakdown.small.fees.toFixed(2)} fees
                          <br />{((results.transactionBreakdown.small.fees / results.transactionBreakdown.small.volume) * 100).toFixed(2)}% effective rate
                        </div>
                      </div>

                      <div style={enhancedResultStyles.breakdownCard as any}>
                        <div style={enhancedResultStyles.breakdownTitle as any}>Medium Transactions (R100-R1000)</div>
                        <div style={enhancedResultStyles.breakdownValue as any}>
                          {results.transactionBreakdown.medium.count}
                        </div>
                        <div style={enhancedResultStyles.breakdownSubtext as any}>
                          R {results.transactionBreakdown.medium.volume.toFixed(2)} volume
                          <br />R {results.transactionBreakdown.medium.fees.toFixed(2)} fees
                          <br />{((results.transactionBreakdown.medium.fees / results.transactionBreakdown.medium.volume) * 100).toFixed(2)}% effective rate
                        </div>
                      </div>

                      <div style={enhancedResultStyles.breakdownCard as any}>
                        <div style={enhancedResultStyles.breakdownTitle as any}>Large Transactions (&gt; R1000)</div>
                        <div style={enhancedResultStyles.breakdownValue as any}>
                          {results.transactionBreakdown.large.count}
                        </div>
                        <div style={enhancedResultStyles.breakdownSubtext as any}>
                          R {results.transactionBreakdown.large.volume.toFixed(2)} volume
                          <br />R {results.transactionBreakdown.large.fees.toFixed(2)} fees
                          <br />{((results.transactionBreakdown.large.fees / results.transactionBreakdown.large.volume) * 100).toFixed(2)}% effective rate
                        </div>
                      </div>
                    </div>

                    {/* Risk Factors */}
                    {results.riskFactors && results.riskFactors.length > 0 && (
                      <div>
                        <h3 style={styles.recommendationsTitle}>⚠️ Risk Factors</h3>
                        <div>
                          {results.riskFactors.map((risk, index) => (
                            <div key={index} style={{ ...styles.recommendation, background: '#fef2f2', border: '1px solid #fecaca' }}>
                              <span style={styles.recommendationIcon}>⚠️</span>
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Comparison Tab */}
                {activeTab === 'comparison' && results.benchmarkComparison && (
                  <div>
                    <h2 style={styles.resultsTitle}>🏆 Processor Comparison</h2>

                    <table style={enhancedResultStyles.comparisonTable as any}>
                      <thead>
                        <tr>
                          <th style={enhancedResultStyles.tableHeader as any}>Payment Processor</th>
                          <th style={enhancedResultStyles.tableHeader as any}>Estimated Fees</th>
                          <th style={enhancedResultStyles.tableHeader as any}>vs Current</th>
                          <th style={enhancedResultStyles.tableHeader as any}>Annual Impact</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{ background: '#e0f2fe' }}>
                          <td style={enhancedResultStyles.tableCell as any}><strong>{results.processor} (Current)</strong></td>
                          <td style={enhancedResultStyles.tableCell as any}><strong>R {results.totalFees.toFixed(2)}</strong></td>
                          <td style={enhancedResultStyles.tableCell as any}>-</td>
                          <td style={enhancedResultStyles.tableCell as any}>-</td>
                        </tr>
                        {Object.entries(results.benchmarkComparison).map(([processor, comparison]) => (
                          <tr key={processor}>
                            <td style={enhancedResultStyles.tableCell as any}>{processor}</td>
                            <td style={enhancedResultStyles.tableCell as any}>R {comparison.totalFees.toFixed(2)}</td>
                            <td style={{
                              ...enhancedResultStyles.tableCell as any,
                              ...(comparison.savings > 0 ? enhancedResultStyles.savingsPositive : enhancedResultStyles.savingsNegative)
                            }}>
                              {comparison.savings > 0 ? '+' : ''}R {comparison.savings.toFixed(2)}
                            </td>
                            <td style={{
                              ...enhancedResultStyles.tableCell,
                              ...(comparison.savings > 0 ? enhancedResultStyles.savingsPositive : enhancedResultStyles.savingsNegative)
                            }}>
                              {comparison.savings > 0 ? '+' : ''}R {(comparison.savings * 12).toFixed(0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Recommendations Tab */}
                {activeTab === 'recommendations' && (
                  <div>
                    <h2 style={styles.resultsTitle}>💡 Recommendations</h2>

                    <div>
                      {(results.recommendations || []).map((rec, index) => (
                        <div key={index} style={styles.recommendation}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                            <span style={styles.recommendationIcon}>💡</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ marginBottom: '8px' }}>
                                {typeof rec === 'object' ? rec.text : rec}
                              </div>
                              {typeof rec === 'object' && rec.priority && (
                                <span style={{
                                  ...enhancedResultStyles.priorityBadge,
                                  ...(rec.priority === 'high' ? enhancedResultStyles.priorityHigh :
                                    rec.priority === 'medium' ? enhancedResultStyles.priorityMedium :
                                      enhancedResultStyles.priorityLow)
                                }}>
                                  {rec.priority} priority
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Optimization Opportunities */}
                    {results.optimizationOpportunities && results.optimizationOpportunities.length > 0 && (
                      <div style={{ marginTop: '24px' }}>
                        <h3 style={styles.recommendationsTitle}>🚀 Optimization Opportunities</h3>
                        <div>
                          {results.optimizationOpportunities.map((opportunity, index) => (
                            <div key={index} style={{ ...styles.recommendation, background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                              <span style={styles.recommendationIcon}>🚀</span>
                              {opportunity}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Next Steps Tab */}
                {activeTab === 'next-steps' && results.nextSteps && (
                  <div>
                    <h2 style={styles.resultsTitle}>📋 Next Steps</h2>

                    {results.nextSteps.map((step, index) => (
                      <div key={index} style={enhancedResultStyles.nextStepItem as any}>
                        <div style={enhancedResultStyles.nextStepHeader as any}>
                          <div style={enhancedResultStyles.nextStepAction as any}>{step.action}</div>
                          <div style={enhancedResultStyles.nextStepTimeframe as any}>{step.timeframe}</div>
                        </div>
                        <div style={enhancedResultStyles.nextStepImpact as any}>{step.impact}</div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={styles.buttonContainer} className="button-container">
                  <button
                    onClick={() => generatePDFReport(results)}
                    style={styles.button}
                    onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLButtonElement).style.transform = 'translateY(-2px)'}
                    onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLButtonElement).style.transform = 'translateY(0)'}
                  >
                    📄 Download Report (PDF)
                  </button>

                  <button
                    onClick={resetAnalysis}
                    style={{ ...styles.button, ...styles.buttonSecondary }}
                    onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLButtonElement).style.backgroundColor = '#f9fafb'}
                    onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => (e.target as HTMLButtonElement).style.backgroundColor = 'white'}
                  >
                    Analyze Another File
                  </button>
                </div>
              </div>
            )}
          </div>

          <div style={styles.footer}>
            <p>Built for South African businesses</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback - should not reach here in normal flow
  return null;
};

// Main App component with authentication provider
const App: React.FC = () => {
  return (
    <AuthProvider>
      <PayLensAnalyzer />
    </AuthProvider>
  );
};

export default App;