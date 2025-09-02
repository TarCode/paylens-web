import jsPDF from 'jspdf';
import type { AnalysisResults } from './analyze-data';

// TypeScript interfaces
interface StyledTextOptions {
    fontSize?: number;
    fontStyle?: 'normal' | 'bold' | 'italic';
    color?: [number, number, number];
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
}

export const generatePDFReport = (results: AnalysisResults): void => {
    if (!results) return;

    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 50;
    const maxWidth = pageWidth - margin * 2;
    let cursorY = margin;

    // Color scheme
    const colors = {
        primary: [41, 128, 185] as [number, number, number],     // Blue
        secondary: [52, 73, 94] as [number, number, number],     // Dark gray
        accent: [230, 126, 34] as [number, number, number],      // Orange
        success: [39, 174, 96] as [number, number, number],      // Green
        error: [231, 76, 60] as [number, number, number],        // Red
        text: [44, 62, 80] as [number, number, number],          // Dark blue-gray
        light: [236, 240, 241] as [number, number, number],      // Light gray
        white: [255, 255, 255] as [number, number, number]       // White
    };

    // Helper function to check for new page
    const checkNewPage = (requiredSpace: number = 50): boolean => {
        if (cursorY + requiredSpace > pageHeight - margin) {
            doc.addPage();
            cursorY = margin;
            return true;
        }
        return false;
    };

    // Helper function to add styled text
    const addStyledText = (text: string, x: number, y: number, options: StyledTextOptions = {}): number => {
        const {
            fontSize = 12,
            fontStyle = 'normal',
            color = colors.text,
            align = 'left',
            maxWidth: textMaxWidth = maxWidth
        } = options;

        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(color[0], color[1], color[2]);

        if (align === 'center') {
            doc.text(text, pageWidth / 2, y, { align: 'center', maxWidth: textMaxWidth });
            return fontSize * 1.2;
        } else {
            const lines = doc.splitTextToSize(text, textMaxWidth);
            lines.forEach((line: string, index: number) => {
                doc.text(line, x, y + (index * fontSize * 1.2));
            });
            return lines.length * fontSize * 1.2;
        }
    };

    // Helper function to add section separator
    const addSectionSeparator = (y: number): number => {
        doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.setLineWidth(1);
        doc.line(margin, y, pageWidth - margin, y);
        return 20;
    };

    // Helper function to add a metric box
    const addMetricBox = (label: string, value: string | number, x: number, y: number, width: number, color: [number, number, number] = colors.primary): number => {
        // Box background
        doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.rect(x, y - 20, width, 50, 'F');

        // Box border
        doc.setDrawColor(color[0], color[1], color[2]);
        doc.setLineWidth(1);
        doc.rect(x, y - 20, width, 50, 'S');

        // Label
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text(label, x + 10, y - 5);

        // Value
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(value.toString(), x + 10, y + 15);

        return 60; // height + spacing
    };

    // Header with background
    doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
    doc.rect(0, 0, pageWidth, 80, 'F');

    // Company logo/title
    addStyledText('PAYLENS', margin, 35, {
        fontSize: 24,
        fontStyle: 'bold',
        color: colors.white
    });

    addStyledText('Payment Analysis Report', margin, 60, {
        fontSize: 14,
        color: colors.white
    });

    cursorY = 120;

    // Report header section
    const reportDate = new Date().toLocaleDateString('en-ZA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    addStyledText('COMPREHENSIVE ANALYSIS REPORT', margin, cursorY, {
        fontSize: 20,
        fontStyle: 'bold',
        color: colors.primary
    });
    cursorY += 35;

    addStyledText(`Generated: ${reportDate} | Processor: ${results.processor || 'Generic'}`, margin, cursorY, {
        fontSize: 11,
        color: colors.secondary
    });
    cursorY += 40;

    // Market Position Score (if available)
    if (results.marketPosition) {
        checkNewPage(80);
        cursorY += addSectionSeparator(cursorY);

        addStyledText('OPTIMIZATION SCORE', margin, cursorY, {
            fontSize: 16,
            fontStyle: 'bold',
            color: colors.primary
        });
        cursorY += 30;

        // Score box
        const scoreColor = results.marketPosition.grade === 'A' ? colors.success :
            results.marketPosition.grade === 'B' ? colors.primary :
                results.marketPosition.grade === 'C' ? colors.accent : colors.error;

        doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
        doc.rect(margin, cursorY - 15, 80, 60, 'F');

        doc.setFontSize(36);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
        if (results.marketPosition?.grade) {
            doc.text(results.marketPosition.grade, margin + 40, cursorY + 25, { align: 'center' });
        }

        addStyledText(`Overall Score: ${results.marketPosition.overallScore}/100`, margin + 100, cursorY + 10, {
            fontSize: 14,
            fontStyle: 'bold'
        });

        addStyledText(`Your payment setup is performing ${results.marketPosition.grade === 'A' ? 'excellently' :
            results.marketPosition.grade === 'B' ? 'well' :
                results.marketPosition.grade === 'C' ? 'adequately' : 'poorly'} compared to industry standards.`,
            margin + 100, cursorY + 30, {
            fontSize: 11,
            color: colors.secondary
        });

        cursorY += 80;
    }

    // Enhanced Key Metrics Section
    checkNewPage(200);
    cursorY += addSectionSeparator(cursorY);

    addStyledText('KEY METRICS', margin, cursorY, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
    });
    cursorY += 40;

    // Metrics in a grid layout
    const enhancedMetrics = [
        { label: 'Total Transactions', value: results.totalTransactions?.toLocaleString() || '0', color: colors.text },
        { label: 'Total Volume', value: `R ${results.totalVolume?.toLocaleString() || '0'}`, color: colors.text },
        { label: 'Total Fees Paid', value: `R ${results.totalFees?.toFixed(2) || '0'}`, color: colors.accent },
        { label: 'Effective Rate', value: `${results.effectiveRate?.toFixed(2) || '0'}%`, color: colors.accent },
        { label: 'Monthly Savings', value: `R ${results.monthlySavings?.toFixed(2) || '0'}`, color: colors.success },
        { label: 'Annual Savings', value: `R ${results.annualSavings?.toFixed(2) || '0'}`, color: colors.success },
        { label: 'Failed Transactions', value: `${results.failedTransactions || 0} (${results.failureRate?.toFixed(1) || 0}%)`, color: colors.error },
        { label: 'Average Transaction', value: `R ${results.averageTransaction?.toFixed(0) || '0'}`, color: colors.text }
    ];

    const boxWidth = (maxWidth - 20) / 2; // Two columns
    enhancedMetrics.forEach((metric, index) => {
        const col = index % 2;
        const row = Math.floor(index / 2);
        const x = margin + (col * (boxWidth + 20));
        const y = cursorY + (row * 60);

        addMetricBox(metric.label, metric.value, x, y, boxWidth, metric.color);
    });

    cursorY += Math.ceil(enhancedMetrics.length / 2) * 60 + 20;

    // Transaction Breakdown Section
    if (results.transactionBreakdown) {
        checkNewPage(150);
        cursorY += addSectionSeparator(cursorY);

        addStyledText('TRANSACTION BREAKDOWN', margin, cursorY, {
            fontSize: 16,
            fontStyle: 'bold',
            color: colors.primary
        });
        cursorY += 40;

        const breakdown = results.transactionBreakdown;
        const breakdownData = [
            { category: 'Small (< R100)', data: breakdown.small },
            { category: 'Medium (R100-R1000)', data: breakdown.medium },
            { category: 'Large (> R1000)', data: breakdown.large }
        ];

        breakdownData.forEach((item) => {
            if (item.data.count > 0) {
                const effectiveRate = ((item.data.fees / item.data.volume) * 100).toFixed(2);

                addStyledText(item.category, margin, cursorY, {
                    fontSize: 12,
                    fontStyle: 'bold',
                    color: colors.text
                });
                cursorY += 18;

                addStyledText(`${item.data.count} transactions • R ${item.data.volume.toFixed(2)} volume • R ${item.data.fees.toFixed(2)} fees • ${effectiveRate}% rate`,
                    margin + 15, cursorY, {
                    fontSize: 10,
                    color: colors.secondary
                });
                cursorY += 25;
            }
        });
    }

    // Processor Comparison Section
    if (results.benchmarkComparison) {
        checkNewPage(200);
        cursorY += addSectionSeparator(cursorY);

        addStyledText('PROCESSOR COMPARISON', margin, cursorY, {
            fontSize: 16,
            fontStyle: 'bold',
            color: colors.primary
        });
        cursorY += 40;

        // Table header
        const colWidths = [150, 100, 100, 120];
        const headers = ['Processor', 'Est. Fees', 'Difference', 'Annual Impact'];

        doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.rect(margin, cursorY - 15, maxWidth, 25, 'F');

        headers.forEach((header, index) => {
            const x = margin + colWidths.slice(0, index).reduce((sum, w) => sum + w, 0);
            addStyledText(header, x + 5, cursorY, {
                fontSize: 10,
                fontStyle: 'bold',
                color: colors.secondary
            });
        });
        cursorY += 30;

        // Current processor row
        doc.setFillColor(240, 248, 255);
        doc.rect(margin, cursorY - 15, maxWidth, 25, 'F');

        let x = margin + 5;
        addStyledText(`${results.processor} (Current)`, x, cursorY, { fontSize: 10, fontStyle: 'bold' });
        x += colWidths[0];
        addStyledText(`R ${results.totalFees.toFixed(2)}`, x, cursorY, { fontSize: 10 });
        x += colWidths[1];
        addStyledText('-', x, cursorY, { fontSize: 10 });
        x += colWidths[2];
        addStyledText('-', x, cursorY, { fontSize: 10 });

        cursorY += 30;

        // Other processors
        Object.entries(results.benchmarkComparison).forEach(([processor, comparison]) => {
            checkNewPage(30);

            x = margin + 5;
            addStyledText(processor, x, cursorY, { fontSize: 10 });
            x += colWidths[0];
            addStyledText(`R ${comparison.totalFees.toFixed(2)}`, x, cursorY, { fontSize: 10 });
            x += colWidths[1];

            const savingsColor = comparison.savings > 0 ? colors.success : colors.error;
            addStyledText(`${comparison.savings > 0 ? '+' : ''}R ${comparison.savings.toFixed(2)}`, x, cursorY, {
                fontSize: 10,
                color: savingsColor
            });
            x += colWidths[2];
            addStyledText(`${comparison.savings > 0 ? '+' : ''}R ${(comparison.savings * 12).toFixed(0)}`, x, cursorY, {
                fontSize: 10,
                color: savingsColor
            });

            cursorY += 25;
        });

        cursorY += 20;
    }

    // Risk Factors Section
    if (results.riskFactors && results.riskFactors.length > 0) {
        checkNewPage(100);
        cursorY += addSectionSeparator(cursorY);

        addStyledText('RISK FACTORS', margin, cursorY, {
            fontSize: 16,
            fontStyle: 'bold',
            color: colors.error
        });
        cursorY += 30;

        results.riskFactors.forEach((risk, index) => {
            checkNewPage(40);

            // Risk warning icon
            doc.setFillColor(colors.error[0], colors.error[1], colors.error[2]);
            doc.rect(margin, cursorY - 8, 16, 16, 'F');

            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
            doc.text('!', margin + 8, cursorY + 3, { align: 'center' });

            // Risk text
            const riskHeight = addStyledText(risk, margin + 25, cursorY, {
                fontSize: 11,
                color: colors.text,
                maxWidth: maxWidth - 25
            });

            cursorY += Math.max(riskHeight, 20) + 10;
        });
    }

    // Enhanced Recommendations Section
    checkNewPage(100);
    cursorY += addSectionSeparator(cursorY);

    addStyledText('RECOMMENDATIONS', margin, cursorY, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
    });
    cursorY += 30;

    // Group recommendations by priority if available
    const recommendationsList = Array.isArray(results.recommendations) ? results.recommendations : [];
    const groupedRecs = recommendationsList.reduce((groups: Record<string, any[]>, rec) => {
        const priority = (typeof rec === 'object' && rec.priority) ? rec.priority : 'medium';
        if (!groups[priority]) groups[priority] = [];
        groups[priority].push(rec);
        return groups;
    }, {});

    ['high', 'medium', 'low'].forEach(priority => {
        if (groupedRecs[priority]) {
            // Priority header
            const priorityColor = priority === 'high' ? colors.error :
                priority === 'medium' ? colors.accent : colors.success;

            addStyledText(`${priority.toUpperCase()} PRIORITY`, margin, cursorY, {
                fontSize: 12,
                fontStyle: 'bold',
                color: priorityColor
            });
            cursorY += 25;

            groupedRecs[priority].forEach((rec, index) => {
                checkNewPage(60);

                const recText = typeof rec === 'object' ? rec.text : rec;

                // Priority badge
                doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
                doc.circle(margin + 8, cursorY - 3, 8, 'F');

                doc.setFontSize(9);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
                doc.text((index + 1).toString(), margin + 8, cursorY + 2, { align: 'center' });

                // Recommendation text
                const recHeight = addStyledText(recText, margin + 25, cursorY, {
                    fontSize: 11,
                    color: colors.text,
                    maxWidth: maxWidth - 25
                });

                cursorY += Math.max(recHeight, 20) + 15;
            });

            cursorY += 10;
        }
    });

    // Next Steps Section
    if (results.nextSteps && results.nextSteps.length > 0) {
        checkNewPage(100);
        cursorY += addSectionSeparator(cursorY);

        addStyledText('ACTION PLAN', margin, cursorY, {
            fontSize: 16,
            fontStyle: 'bold',
            color: colors.primary
        });
        cursorY += 30;

        results.nextSteps.forEach((step, index) => {
            checkNewPage(60);

            // Step number
            doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
            doc.circle(margin + 8, cursorY - 3, 8, 'F');

            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
            doc.text((index + 1).toString(), margin + 8, cursorY + 2, { align: 'center' });

            // Action
            addStyledText(step.action, margin + 25, cursorY, {
                fontSize: 11,
                fontStyle: 'bold',
                color: colors.text
            });
            cursorY += 18;

            // Timeframe and impact
            addStyledText(`Timeline: ${step.timeframe} | Expected Impact: ${step.impact}`, margin + 25, cursorY, {
                fontSize: 9,
                color: colors.secondary
            });
            cursorY += 25;
        });
    }

    // Optimization Opportunities Section
    if (results.optimizationOpportunities && results.optimizationOpportunities.length > 0) {
        checkNewPage(100);
        cursorY += addSectionSeparator(cursorY);

        addStyledText('OPTIMIZATION OPPORTUNITIES', margin, cursorY, {
            fontSize: 16,
            fontStyle: 'bold',
            color: colors.success
        });
        cursorY += 30;

        results.optimizationOpportunities.forEach((opportunity, index) => {
            checkNewPage(40);

            // Opportunity icon
            doc.setFillColor(colors.success[0], colors.success[1], colors.success[2]);
            doc.rect(margin, cursorY - 8, 16, 16, 'F');

            doc.setFontSize(8);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(colors.white[0], colors.white[1], colors.white[2]);
            doc.text('$', margin + 8, cursorY + 3, { align: 'center' });

            // Opportunity text
            const oppHeight = addStyledText(opportunity, margin + 25, cursorY, {
                fontSize: 11,
                color: colors.text,
                maxWidth: maxWidth - 25
            });

            cursorY += Math.max(oppHeight, 20) + 10;
        });
    }

    // Summary Section
    checkNewPage(120);
    cursorY += addSectionSeparator(cursorY);

    addStyledText('EXECUTIVE SUMMARY', margin, cursorY, {
        fontSize: 16,
        fontStyle: 'bold',
        color: colors.primary
    });
    cursorY += 30;

    const summaryText = `This analysis of ${results.totalTransactions} transactions reveals ${results.annualSavings && results.annualSavings > 0 ? 'significant optimization opportunities' : 'your current setup is well-optimized'}. ` +
        `Your effective rate of ${results.effectiveRate?.toFixed(2)}% ${results.effectiveRate && results.effectiveRate > 3 ? 'exceeds' : 'aligns with'} industry benchmarks. ` +
        `${results.failureRate && results.failureRate > 3 ? `High failure rate of ${results.failureRate.toFixed(1)}% requires immediate attention. ` : ''}` +
        `Priority actions include ${results.nextSteps?.[0]?.action.toLowerCase() || 'monitoring payment performance'} to maximize savings potential.`;

    addStyledText(summaryText, margin, cursorY, {
        fontSize: 11,
        color: colors.text
    });

    // Footer on every page
    const pageCount = doc.internal.pages.length;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);

        const footerY = pageHeight - 40;
        doc.setDrawColor(colors.light[0], colors.light[1], colors.light[2]);
        doc.setLineWidth(1);
        doc.line(margin, footerY - 20, pageWidth - margin, footerY - 20);

        addStyledText('Generated by PayLens - Online Payment Analysis', pageWidth / 2, footerY, {
            fontSize: 10,
            color: colors.secondary,
            align: 'center'
        });

        // Page numbers
        doc.setFontSize(9);
        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
        doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, footerY, { align: 'right' });
    }

    // Save the PDF with enhanced filename
    const grade = results.marketPosition?.grade || 'X';
    const savings = results.annualSavings ? Math.round(results.annualSavings) : 0;
    doc.save(`paylens-report-grade${grade}-savings${savings}-${new Date().toISOString().split('T')[0]}.pdf`);
};

// Also export a simplified report function for backward compatibility
export const generateReport = (results: AnalysisResults): void => {
    return generatePDFReport(results);
};