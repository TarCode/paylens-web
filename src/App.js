import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { styles } from './styles';
import { AuthProvider, useAuth } from './AuthContext';
import Login from './Login';
import useUsage from './hooks/useUsage';

// PayLens Analyzer with Authentication
const PayLensAnalyzer = () => {
  const { isAuthenticated, loading: authLoading, user, logout } = useAuth();
  const { incrementUsage } = useUsage();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  // File handling functions - must be called before any conditional returns
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleFileInput = (e) => {
    if (e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setError('');
    setLoading(true);
    setResults(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (parseResults) {
        setTimeout(async () => {
          await analyzeData(parseResults.data);
        }, 2000);
      },
      error: function (parseError) {
        setLoading(false);
        setError('Error reading CSV file: ' + parseError.message);
      }
    });
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
    // eslint-disable-next-line
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

  // Show login if not authenticated
  if (!isAuthenticated()) {
    return <Login />;
  }

  const analyzeData = async (data, processor = "generic") => {
    // Increment usage count before analysis
    const usageResult = await incrementUsage();
    if (!usageResult.success) {
      setLoading(false);
      setError('Failed to process usage. Please try again or contact support.');
      return;
    }

    // Define fee structures per processor (approx, update with actual values)
    const feeModels = {
      payfast: { percentage: 0.029, fixed: 1.50 },
      peach: { percentage: 0.029, fixed: 2.00 },
      ozow: { percentage: 0.023, fixed: 0.00 },
      yoco: { percentage: 0.0295, fixed: 0.00 },
      stitch: { percentage: 0.019, fixed: 0.00 },
      snapscan: { percentage: 0.0295, fixed: 0.00 },
      paygate: { percentage: 0.025, fixed: 2.00 },
      generic: { percentage: 0.029, fixed: 1.50 }
    };

    const model = feeModels[processor.toLowerCase()] || feeModels["generic"];

    const analysis = {
      processor,
      totalTransactions: data.length,
      totalFees: 0,
      failedTransactions: 0,
      failedCosts: 0,
      savings: 0,
      recommendations: []
    };

    data.forEach(row => {
      const amount = parseFloat(
        row.amount || row.Amount || row.gross || row.Gross || 0
      );

      if (amount > 0) {
        const estimatedFee = (amount * model.percentage) + model.fixed;
        analysis.totalFees += estimatedFee;
      }

      const status = (
        row.status || row.Status || row.payment_status || ""
      ).toLowerCase();

      if (
        status.includes("failed") ||
        status.includes("cancelled") ||
        status.includes("declined")
      ) {
        analysis.failedTransactions++;
        analysis.failedCosts += model.fixed; // assume only fixed cost lost
      }
    });

    // Recommendations
    if (analysis.failedTransactions > analysis.totalTransactions * 0.05) {
      analysis.recommendations.push(
        "High failure rate detected. Consider improving validation and retries to reduce failed costs."
      );
      analysis.savings += analysis.failedCosts * 0.5;
    }

    if (analysis.totalTransactions > 100) {
      analysis.recommendations.push(
        `You may qualify for volume discounts. Contact ${processor.charAt(0).toUpperCase() + processor.slice(1)} to negotiate lower rates.`
      );
      analysis.savings += analysis.totalFees * 0.1;
    }

    if (analysis.totalFees > 1000) {
      analysis.recommendations.push(
        "Consider diversifying payment methods. Comparing Ozow, Stitch, Yoco, and SnapScan could reduce costs at scale."
      );
      analysis.savings += analysis.totalFees * 0.15;
    } else {
      analysis.recommendations.push(
        "Monitor your payment patterns monthly. Small optimizations can lead to significant savings over time."
      );
      analysis.savings += Math.min(50, analysis.totalFees * 0.05);
    }

    if (analysis.totalTransactions > 0) {
      analysis.recommendations.push(
        "Enable automatic retry logic for failed payments to recover potential lost revenue."
      );
    }

    setResults(analysis);
    setLoading(false);
  };

  const generateReport = () => {
    if (!results) return;

    const reportContent = `
PAYLENS ANALYSIS REPORT
Generated: ${new Date().toLocaleDateString()}

KEY METRICS:
- Total Transactions: ${results.totalTransactions}
- Total Fees Paid: R ${results.totalFees.toFixed(2)}
- Potential Monthly Savings: R ${results.savings.toFixed(2)}
- Failed Transaction Costs: R ${results.failedCosts.toFixed(2)}

RECOMMENDATIONS:
${results.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

Generated by PayLens - Online Payment Analysis
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'paylens-analysis-report.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetAnalysis = () => {
    setResults(null);
    setError('');
    const fileInput = document.getElementById('fileInput');
    if (fileInput) fileInput.value = '';
  };

  // Enhanced styles for authenticated view
  const enhancedStyles = {
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
            {user?.subscriptionTier} • {user?.usageCount || 0} / {user?.monthlyLimit === -1 ? '∞' : (user?.monthlyLimit || 5)} uses
          </span>
        </div>
        <button
          style={enhancedStyles.logoutButton}
          onClick={logout}
          onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
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
                onClick={() => document.getElementById('fileInput').click()}
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
              <h2 style={styles.resultsTitle}>
                🔍 Analysis Results
              </h2>

              <div style={styles.metricsGrid}>
                <div style={{ ...styles.metric, ...styles.metricDefault }}>
                  <h3 style={styles.metricTitle}>Total Transactions Analyzed</h3>
                  <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                    {results.totalTransactions}
                  </div>
                </div>

                <div style={{ ...styles.metric, ...styles.metricDefault }}>
                  <h3 style={styles.metricTitle}>Total Fees Paid</h3>
                  <div style={{ ...styles.metricValue, ...styles.metricValueDefault }}>
                    R {results.totalFees.toFixed(2)}
                  </div>
                </div>

                <div style={{ ...styles.metric, ...styles.metricSuccess }}>
                  <h3 style={styles.metricTitle}>Potential Monthly Savings</h3>
                  <div style={{ ...styles.metricValue, ...styles.metricValueSuccess }}>
                    R {results.savings.toFixed(2)}
                  </div>
                </div>

                <div style={{ ...styles.metric, ...styles.metricError }}>
                  <h3 style={styles.metricTitle}>Failed Transaction Costs</h3>
                  <div style={{ ...styles.metricValue, ...styles.metricValueError }}>
                    R {results.failedCosts.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={styles.recommendations}>
                <h3 style={styles.recommendationsTitle}>
                  💡 Recommendations
                </h3>
                <div>
                  {results.recommendations.map((rec, index) => (
                    <div key={index} style={styles.recommendation}>
                      <span style={styles.recommendationIcon}>💡</span>
                      {rec}
                    </div>
                  ))}
                </div>
              </div>

              <div style={styles.buttonContainer} className="button-container">
                <button
                  onClick={generateReport}
                  style={styles.button}
                  onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
                  onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  📄 Download Report
                </button>

                <button
                  onClick={resetAnalysis}
                  style={{ ...styles.button, ...styles.buttonSecondary }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f9fafb'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'white'}
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
};

// Main App component with authentication provider
const App = () => {
  return (
    <AuthProvider>
      <PayLensAnalyzer />
    </AuthProvider>
  );
};

export default App;
