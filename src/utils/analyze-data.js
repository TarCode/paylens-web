export const analyzeData = async (data, processor = "generic", setResults, setLoading, setError, incrementUsage) => {
    // Increment usage count before analysis
    const usageResult = await incrementUsage();
    if (!usageResult.success) {
        setLoading(false);
        setError('Failed to process usage. Please try again or contact support.');
        return;
    }

    // Enhanced fee structures with more accurate data
    const feeModels = {
        payfast: {
            percentage: 0.029,
            fixed: 1.50,
            name: "PayFast",
            strengths: ["Local market leader", "Good for SMEs"],
            weaknesses: ["Higher fixed fees", "Limited international"]
        },
        peach: {
            percentage: 0.029,
            fixed: 2.00,
            name: "Peach Payments",
            strengths: ["Enterprise features", "Good reporting"],
            weaknesses: ["Highest fixed fee", "Complex setup"]
        },
        ozow: {
            percentage: 0.023,
            fixed: 0.00,
            name: "Ozow",
            strengths: ["No fixed fees", "Instant EFT", "Lower percentage"],
            weaknesses: ["EFT only", "Bank dependent"]
        },
        yoco: {
            percentage: 0.0295,
            fixed: 0.00,
            name: "Yoco",
            strengths: ["No fixed fees", "Good UX", "Fast settlements"],
            weaknesses: ["Slightly higher percentage", "Limited enterprise features"]
        },
        stitch: {
            percentage: 0.019,
            fixed: 0.00,
            name: "Stitch",
            strengths: ["Lowest percentage", "Modern API", "No fixed fees"],
            weaknesses: ["Newer player", "Limited track record"]
        },
        snapscan: {
            percentage: 0.0295,
            fixed: 0.00,
            name: "SnapScan",
            strengths: ["QR code payments", "Good mobile UX"],
            weaknesses: ["Limited online integration", "Mobile focused"]
        },
        paygate: {
            percentage: 0.025,
            fixed: 2.00,
            name: "PayGate",
            strengths: ["Established player", "Multiple payment methods"],
            weaknesses: ["High fixed fee", "Older technology"]
        },
        generic: {
            percentage: 0.029,
            fixed: 1.50,
            name: "Generic Processor",
            strengths: [],
            weaknesses: []
        }
    };

    const model = feeModels[processor.toLowerCase()] || feeModels["generic"];

    // Initialize comprehensive analysis object
    const analysis = {
        processor: model.name,
        processorCode: processor,
        totalTransactions: data.length,
        totalFees: 0,
        totalVolume: 0,
        failedTransactions: 0,
        failedCosts: 0,
        savings: 0,
        recommendations: [],

        // New analytics
        transactionBreakdown: {
            small: { count: 0, volume: 0, fees: 0 }, // < R100
            medium: { count: 0, volume: 0, fees: 0 }, // R100-R1000
            large: { count: 0, volume: 0, fees: 0 }   // > R1000
        },
        monthlyTrends: {},
        averageTransaction: 0,
        effectiveRate: 0,
        benchmarkComparison: {},
        riskFactors: [],
        optimizationOpportunities: []
    };

    // Process each transaction
    data.forEach(row => {
        const amount = parseFloat(
            row.amount || row.Amount || row.gross || row.Gross || 0
        );

        if (amount > 0) {
            analysis.totalVolume += amount;
            const estimatedFee = (amount * model.percentage) + model.fixed;
            analysis.totalFees += estimatedFee;

            // Categorize by transaction size
            if (amount < 100) {
                analysis.transactionBreakdown.small.count++;
                analysis.transactionBreakdown.small.volume += amount;
                analysis.transactionBreakdown.small.fees += estimatedFee;
            } else if (amount <= 1000) {
                analysis.transactionBreakdown.medium.count++;
                analysis.transactionBreakdown.medium.volume += amount;
                analysis.transactionBreakdown.medium.fees += estimatedFee;
            } else {
                analysis.transactionBreakdown.large.count++;
                analysis.transactionBreakdown.large.volume += amount;
                analysis.transactionBreakdown.large.fees += estimatedFee;
            }

            // Monthly trends (if date available)
            const dateField = row.date || row.Date || row.created_at || row.timestamp;
            if (dateField) {
                const month = new Date(dateField).toISOString().substring(0, 7);
                if (!analysis.monthlyTrends[month]) {
                    analysis.monthlyTrends[month] = { transactions: 0, volume: 0, fees: 0 };
                }
                analysis.monthlyTrends[month].transactions++;
                analysis.monthlyTrends[month].volume += amount;
                analysis.monthlyTrends[month].fees += estimatedFee;
            }
        }

        // Analyze failed transactions
        const status = (
            row.status || row.Status || row.payment_status || ""
        ).toLowerCase();

        if (
            status.includes("failed") ||
            status.includes("cancelled") ||
            status.includes("declined") ||
            status.includes("error")
        ) {
            analysis.failedTransactions++;
            analysis.failedCosts += model.fixed;
        }
    });

    // Calculate derived metrics
    analysis.averageTransaction = analysis.totalVolume / analysis.totalTransactions;
    analysis.effectiveRate = (analysis.totalFees / analysis.totalVolume) * 100;
    analysis.failureRate = (analysis.failedTransactions / analysis.totalTransactions) * 100;

    // Benchmark against other processors
    Object.entries(feeModels).forEach(([key, altModel]) => {
        if (key === processor.toLowerCase()) return;

        let altTotalFees = 0;
        data.forEach(row => {
            const amount = parseFloat(row.amount || row.Amount || row.gross || row.Gross || 0);
            if (amount > 0) {
                altTotalFees += (amount * altModel.percentage) + altModel.fixed;
            }
        });

        analysis.benchmarkComparison[altModel.name] = {
            totalFees: altTotalFees,
            savings: analysis.totalFees - altTotalFees,
            savingsPercentage: ((analysis.totalFees - altTotalFees) / analysis.totalFees) * 100
        };
    });

    // Enhanced recommendations engine
    generateEnhancedRecommendations(analysis, model, data);

    setResults(analysis);
    setLoading(false);
};

const generateEnhancedRecommendations = (analysis, currentModel, data) => {
    const { recommendations, optimizationOpportunities, riskFactors } = analysis;

    // 1. Failure Rate Analysis
    if (analysis.failureRate > 5) {
        riskFactors.push(`High failure rate of ${analysis.failureRate.toFixed(1)}% - industry average is 2-3%`);
        recommendations.push(
            `URGENT: Investigate payment failures. ${analysis.failedTransactions} failed transactions cost you R${analysis.failedCosts.toFixed(2)} in fees alone.`
        );
        analysis.savings += analysis.failedCosts * 0.7; // Potential recovery
    } else if (analysis.failureRate > 2) {
        recommendations.push(
            `Monitor failure rate (${analysis.failureRate.toFixed(1)}%). Consider adding retry logic or improving validation.`
        );
        analysis.savings += analysis.failedCosts * 0.3;
    }

    // 2. Transaction Size Optimization
    const { small, medium, large } = analysis.transactionBreakdown;

    if (small.count > analysis.totalTransactions * 0.5) {
        const smallTxRate = (small.fees / small.volume) * 100;
        recommendations.push(
            `${small.count} small transactions (${((small.count / analysis.totalTransactions) * 100).toFixed(1)}%) have high effective rate of ${smallTxRate.toFixed(2)}%. Consider minimum order values or bundling.`
        );
        optimizationOpportunities.push("Small transaction consolidation");
        analysis.savings += small.fees * 0.2;
    }

    if (large.count > 0) {
        const largeTxRate = (large.fees / large.volume) * 100;
        if (largeTxRate > 2.5) {
            recommendations.push(
                `Large transactions (R${(large.volume / large.count).toFixed(0)} avg) pay ${largeTxRate.toFixed(2)}% effective rate. Negotiate volume discounts.`
            );
            analysis.savings += large.fees * 0.15;
        }
    }

    // 3. Processor Comparison & Switching Analysis
    const bestAlternative = Object.entries(analysis.benchmarkComparison)
        .filter(([_, comp]) => comp.savings > 0)
        .sort((a, b) => b[1].savings - a[1].savings)[0];

    if (bestAlternative && bestAlternative[1].savings > analysis.totalFees * 0.1) {
        recommendations.push(
            `Consider switching to ${bestAlternative[0]} - potential annual savings of R${(bestAlternative[1].savings * 12).toFixed(0)} (${bestAlternative[1].savingsPercentage.toFixed(1)}% reduction)`
        );
        analysis.savings += bestAlternative[1].savings;
    }

    // 4. Volume-based Recommendations
    if (analysis.totalTransactions > 500) {
        recommendations.push(
            `High volume detected (${analysis.totalTransactions} transactions). You qualify for enterprise rates - contact your processor for custom pricing.`
        );
        analysis.savings += analysis.totalFees * 0.12;
        optimizationOpportunities.push("Enterprise pricing negotiation");
    }

    // 5. Effective Rate Analysis
    if (analysis.effectiveRate > 3.5) {
        recommendations.push(
            `Your effective rate of ${analysis.effectiveRate.toFixed(2)}% is above market average (2.5-3%). Review your pricing strategy or processor choice.`
        );
        riskFactors.push("Above-market processing costs");
    }

    // 6. Monthly Trend Analysis
    const monthlyData = Object.values(analysis.monthlyTrends);
    if (monthlyData.length >= 2) {
        const recentMonths = monthlyData.slice(-2);
        const growth = ((recentMonths[1].volume - recentMonths[0].volume) / recentMonths[0].volume) * 100;

        if (growth > 20) {
            recommendations.push(
                `Strong growth trend detected (${growth.toFixed(1)}% month-over-month). Plan for scaling fees and consider progressive rate structures.`
            );
            optimizationOpportunities.push("Growth-based rate optimization");
        } else if (growth < -20) {
            recommendations.push(
                `Declining volume trend (${growth.toFixed(1)}% month-over-month). Focus on reducing fixed costs and improving conversion rates.`
            );
            riskFactors.push("Declining transaction volume");
        }
    }

    // 7. Specific Processor Advice
    if (currentModel.fixed > 0 && analysis.averageTransaction < 200) {
        recommendations.push(
            `Your average transaction (R${analysis.averageTransaction.toFixed(0)}) with R${currentModel.fixed} fixed fee results in high effective rates. Consider processors with no fixed fees like Ozow or Stitch.`
        );
        optimizationOpportunities.push("Zero fixed fee migration");
    }

    // 8. Cost Recovery Recommendations
    if (analysis.totalFees > analysis.totalVolume * 0.02) {
        const suggestedMarkup = (analysis.totalFees / analysis.totalVolume) * 100;
        recommendations.push(
            `Consider adding a ${suggestedMarkup.toFixed(2)}% processing fee to your prices to offset payment costs while remaining competitive.`
        );
        optimizationOpportunities.push("Fee recovery pricing strategy");
    }

    // 9. Risk Assessment
    if (analysis.totalVolume > 50000 && analysis.failureRate > 3) {
        riskFactors.push("High volume with elevated failure rate increases business risk");
    }

    if (analysis.effectiveRate > 4) {
        riskFactors.push("Payment costs may be impacting profit margins significantly");
    }

    // 10. Seasonal/Pattern Analysis
    if (monthlyData.length >= 3) {
        const volumes = monthlyData.map(m => m.volume);
        const maxVolume = Math.max(...volumes);
        const minVolume = Math.min(...volumes);
        const volatility = ((maxVolume - minVolume) / minVolume) * 100;

        if (volatility > 50) {
            recommendations.push(
                `High volume volatility (${volatility.toFixed(0)}% variation) detected. Consider flexible rate structures for peak periods.`
            );
            optimizationOpportunities.push("Seasonal rate optimization");
        }
    }

    // Add priority scoring to recommendations
    analysis.recommendations = recommendations.map((rec, index) => ({
        text: rec,
        priority: index < 3 ? 'high' : index < 6 ? 'medium' : 'low',
        impact: index < 3 ? 'High' : index < 6 ? 'Medium' : 'Low'
    }));

    // Calculate realistic total savings (cap at reasonable levels)
    analysis.savings = Math.min(analysis.savings, analysis.totalFees * 0.4);
    analysis.monthlySavings = analysis.savings;
    analysis.annualSavings = analysis.savings * 12;

    // Add actionable next steps
    analysis.nextSteps = generateNextSteps(analysis, currentModel);

    // Add benchmark insights
    analysis.marketPosition = analyzeMarketPosition(analysis, currentModel);
};

const generateNextSteps = (analysis, currentModel) => {
    const steps = [];

    if (analysis.failureRate > 3) {
        steps.push({
            action: "Audit failed transactions",
            timeframe: "This week",
            impact: "Immediate cost reduction"
        });
    }

    if (analysis.totalTransactions > 200) {
        steps.push({
            action: "Request volume discount pricing",
            timeframe: "Next 30 days",
            impact: "5-15% fee reduction"
        });
    }

    const bestAlternative = Object.entries(analysis.benchmarkComparison)
        .filter(([_, comp]) => comp.savings > 0)
        .sort((a, b) => b[1].savings - a[1].savings)[0];

    if (bestAlternative && bestAlternative[1].savings > analysis.totalFees * 0.15) {
        steps.push({
            action: `Get quote from ${bestAlternative[0]}`,
            timeframe: "Next 2 weeks",
            impact: `R${(bestAlternative[1].savings * 12).toFixed(0)} annual savings`
        });
    }

    if (analysis.averageTransaction < 150 && currentModel.fixed > 0) {
        steps.push({
            action: "Evaluate zero-fixed-fee processors",
            timeframe: "Next month",
            impact: "Reduce small transaction costs"
        });
    }

    steps.push({
        action: "Set up monthly payment analytics review",
        timeframe: "Ongoing",
        impact: "Continuous optimization"
    });

    return steps;
};

const analyzeMarketPosition = (analysis, currentModel) => {
    const industryBenchmarks = {
        averageEffectiveRate: 2.8,
        averageFailureRate: 2.5,
        averageTransactionSize: 350
    };

    const position = {
        effectiveRateRanking: analysis.effectiveRate < industryBenchmarks.averageEffectiveRate ? 'Good' :
            analysis.effectiveRate < 3.5 ? 'Average' : 'Poor',
        failureRateRanking: analysis.failureRate < industryBenchmarks.averageFailureRate ? 'Good' :
            analysis.failureRate < 4 ? 'Average' : 'Poor',
        transactionSizeRanking: analysis.averageTransaction > industryBenchmarks.averageTransactionSize ? 'Good' :
            analysis.averageTransaction > 200 ? 'Average' : 'Poor',
        overallScore: 0
    };

    // Calculate overall score (1-100)
    let score = 50; // baseline

    if (position.effectiveRateRanking === 'Good') score += 20;
    else if (position.effectiveRateRanking === 'Poor') score -= 20;

    if (position.failureRateRanking === 'Good') score += 15;
    else if (position.failureRateRanking === 'Poor') score -= 15;

    if (position.transactionSizeRanking === 'Good') score += 15;
    else if (position.transactionSizeRanking === 'Poor') score -= 10;

    position.overallScore = Math.max(0, Math.min(100, score));
    position.grade = position.overallScore >= 80 ? 'A' :
        position.overallScore >= 60 ? 'B' :
            position.overallScore >= 40 ? 'C' : 'D';

    return position;
};
