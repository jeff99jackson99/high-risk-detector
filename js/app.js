/**
 * High Risk Pattern Detection System - Main Application
 * Created by Jeff Jackson
 * 
 * This file handles the user interface and integrates with the risk detection logic.
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const fileInput = document.getElementById('fileInput');
    const dropArea = document.getElementById('drop-area');
    const fileName = document.getElementById('file-name');
    const analyzeBtn = document.getElementById('analyze-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsPanel = document.getElementById('settings-panel');
    const loadingSection = document.getElementById('loading');
    const uploadSection = document.getElementById('upload-section');
    const resultsSection = document.getElementById('results-section');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const detailsModal = document.getElementById('details-modal');
    const closeModal = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    const detailsTable = document.getElementById('details-table');
    
    // Settings inputs
    const vinThresholdInput = document.getElementById('vin-threshold');
    const dollarThresholdInput = document.getElementById('dollar-threshold');
    const daysThresholdInput = document.getElementById('days-threshold');
    const dealerCountInput = document.getElementById('dealer-count');
    const dealerMultiplierInput = document.getElementById('dealer-multiplier');
    
    // Download buttons
    const downloadReportBtn = document.getElementById('download-report');
    const downloadVinCsvBtn = document.getElementById('download-vin-csv');
    const downloadHighDollarCsvBtn = document.getElementById('download-high-dollar-csv');
    const downloadRepeatedCsvBtn = document.getElementById('download-repeated-csv');
    const downloadDealerCsvBtn = document.getElementById('download-dealer-csv');
    const downloadLuxuryCsvBtn = document.getElementById('download-luxury-csv');
    const downloadCoverageCsvBtn = document.getElementById('download-coverage-csv');
    
    // Search inputs
    const vinSearchInput = document.getElementById('vin-search');
    const highDollarSearchInput = document.getElementById('high-dollar-search');
    const repeatedClaimsSearchInput = document.getElementById('repeated-claims-search');
    const dealerSearchInput = document.getElementById('dealer-search');
    const luxurySearchInput = document.getElementById('luxury-search');
    const coverageSearchInput = document.getElementById('coverage-search');
    
    // State variables
    let claimsData = [];
    let detectionResults = null;
    let charts = {};
    
    // Event Listeners
    fileInput.addEventListener('change', handleFileSelect);
    analyzeBtn.addEventListener('click', analyzeData);
    settingsBtn.addEventListener('click', toggleSettings);
    
    // Tab navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    // Modal close button
    closeModal.addEventListener('click', () => {
        detailsModal.style.display = 'none';
    });
    
    // Click outside modal to close
    window.addEventListener('click', (event) => {
        if (event.target === detailsModal) {
            detailsModal.style.display = 'none';
        }
    });
    
    // Download buttons
    downloadReportBtn.addEventListener('click', downloadFullReport);
    downloadVinCsvBtn.addEventListener('click', () => downloadCsv('vin'));
    downloadHighDollarCsvBtn.addEventListener('click', () => downloadCsv('highDollar'));
    downloadRepeatedCsvBtn.addEventListener('click', () => downloadCsv('repeated'));
    downloadDealerCsvBtn.addEventListener('click', () => downloadCsv('dealer'));
    downloadLuxuryCsvBtn.addEventListener('click', () => downloadCsv('luxury'));
    downloadCoverageCsvBtn.addEventListener('click', () => downloadCsv('coverage'));
    
    // Search inputs
    vinSearchInput.addEventListener('input', () => filterTable('vin-claims-table', vinSearchInput.value));
    highDollarSearchInput.addEventListener('input', () => filterTable('high-dollar-table', highDollarSearchInput.value));
    repeatedClaimsSearchInput.addEventListener('input', () => filterTable('repeated-claims-table', repeatedClaimsSearchInput.value));
    dealerSearchInput.addEventListener('input', () => filterTable('dealer-table', dealerSearchInput.value));
    luxurySearchInput.addEventListener('input', () => filterTable('luxury-table', luxurySearchInput.value));
    coverageSearchInput.addEventListener('input', () => filterTable('coverage-table', coverageSearchInput.value));
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
    
    /**
     * Prevent default drag and drop behavior
     * @param {Event} e - The event object
     */
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    /**
     * Highlight drop area when dragging over
     */
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    /**
     * Remove highlight from drop area
     */
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    /**
     * Handle file drop event
     * @param {Event} e - The drop event
     */
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    /**
     * Handle file selection from input
     * @param {Event} e - The change event
     */
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    /**
     * Process the selected files
     * @param {FileList} files - The selected files
     */
    function handleFiles(files) {
        const file = files[0];
        
        if (file) {
            // Check if file is Excel
            if (!file.name.match(/\.(xlsx|xls)$/i)) {
                alert('Please select an Excel file (.xlsx or .xls)');
                return;
            }
            
            fileName.textContent = file.name;
            analyzeBtn.disabled = false;
            
            // Read the file
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    // Get first sheet
                    const firstSheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[firstSheetName];
                    
                    // Convert to JSON
                    claimsData = XLSX.utils.sheet_to_json(worksheet);
                    console.log(`Loaded ${claimsData.length} records from Excel file`);
                } catch (error) {
                    console.error('Error reading Excel file:', error);
                    alert('Error reading Excel file. Please make sure it is a valid Excel file.');
                }
            };
            
            reader.readAsArrayBuffer(file);
        }
    }
    
    /**
     * Toggle settings panel visibility
     */
    function toggleSettings() {
        settingsPanel.classList.toggle('hidden');
    }
    
    /**
     * Analyze the claims data
     */
    function analyzeData() {
        if (!claimsData || claimsData.length === 0) {
            alert('Please upload a valid Excel file first.');
            return;
        }
        
        // Show loading indicator
        uploadSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        // Get settings values
        const settings = {
            vinThreshold: parseInt(vinThresholdInput.value) || 2,
            dollarThreshold: parseFloat(dollarThresholdInput.value) || 2.0,
            daysThreshold: parseInt(daysThresholdInput.value) || 30,
            dealerCountThreshold: parseInt(dealerCountInput.value) || 3,
            dealerAmountMultiplier: parseFloat(dealerMultiplierInput.value) || 1.5
        };
        
        // Use setTimeout to allow the UI to update before starting analysis
        setTimeout(() => {
            try {
                // Create risk detector and run analysis
                const detector = new RiskDetector(claimsData, settings);
                detectionResults = detector.runAllDetections();
                
                // Update UI with results
                displayResults();
                
                // Hide loading, show results
                loadingSection.classList.add('hidden');
                resultsSection.classList.remove('hidden');
            } catch (error) {
                console.error('Error analyzing data:', error);
                alert('Error analyzing data. Please check the console for details.');
                
                // Go back to upload screen
                loadingSection.classList.add('hidden');
                uploadSection.classList.remove('hidden');
            }
        }, 100);
    }
    
    /**
     * Display the analysis results
     */
    function displayResults() {
        if (!detectionResults) return;
        
        // Update summary statistics
        const summary = detectionResults.summary;
        document.getElementById('total-claims').textContent = summary.totalClaims;
        document.getElementById('total-paid').textContent = formatCurrency(summary.totalPaid);
        document.getElementById('unique-vins').textContent = summary.uniqueVins;
        document.getElementById('risk-patterns').textContent = summary.totalRiskPatterns;
        
        // Update summary text
        updateSummaryText(summary);
        
        // Create charts and tables
        createSummaryChart();
        createVinClaimsTable();
        createHighDollarTable();
        createRepeatedClaimsTable();
        createDealerTable();
        createLuxuryTable();
        createCoverageTable();
        
        // Create charts for each tab
        createVinClaimsChart();
        createHighDollarChart();
        createRepeatedClaimsChart();
        createDealerChart();
        createLuxuryChart();
        createCoverageChart();
    }
    
    /**
     * Update the summary text with risk detection results
     * @param {Object} summary - The summary data
     */
    function updateSummaryText(summary) {
        const summaryStats = document.getElementById('summary-stats');
        const riskPatterns = summary.riskPatterns;
        
        let html = '';
        
        if (riskPatterns.multipleClaimsPerVin > 0) {
            html += createRiskStatHtml('Multiple Claims per VIN', 
                `Found ${riskPatterns.multipleClaimsPerVin} VINs with multiple claims.`);
        }
        
        if (riskPatterns.highDollarClaims > 0) {
            html += createRiskStatHtml('High Dollar Claims', 
                `Found ${riskPatterns.highDollarClaims} claims with unusually high payment amounts.`);
        }
        
        if (riskPatterns.multipleDealersPerVin > 0) {
            html += createRiskStatHtml('Multiple Dealers per VIN', 
                `Found ${riskPatterns.multipleDealersPerVin} VINs with claims from multiple dealers.`);
        }
        
        if (riskPatterns.repeatedClaimsTimeframe > 0) {
            html += createRiskStatHtml('Repeated Claims Within Timeframe', 
                `Found ${riskPatterns.repeatedClaimsTimeframe} VINs with repeated claims within ${daysThresholdInput.value} days.`);
        }
        
        if (riskPatterns.highClaimsPerDealer > 0) {
            html += createRiskStatHtml('High Claims per Dealer', 
                `Found ${riskPatterns.highClaimsPerDealer} dealers with high claim frequency or amounts.`);
        }
        
        if (riskPatterns.luxuryVehiclePatterns > 0) {
            html += createRiskStatHtml('Luxury Vehicle Patterns', 
                `Found ${riskPatterns.luxuryVehiclePatterns} luxury brands with claims.`);
        }
        
        if (riskPatterns.coverageTypePatterns > 0) {
            html += createRiskStatHtml('Coverage Type Patterns', 
                `Analyzed ${riskPatterns.coverageTypePatterns} different coverage types.`);
        }
        
        summaryStats.innerHTML = html;
    }
    
    /**
     * Create HTML for a risk statistic
     * @param {string} title - The risk title
     * @param {string} description - The risk description
     * @returns {string} HTML string
     */
    function createRiskStatHtml(title, description) {
        return `
            <div class="risk-stat">
                <div class="risk-stat-title">${title}</div>
                <div class="risk-stat-desc">${description}</div>
            </div>
        `;
    }
    
    /**
     * Create the summary chart
     */
    function createSummaryChart() {
        const ctx = document.getElementById('summary-chart').getContext('2d');
        
        if (charts.summary) {
            charts.summary.destroy();
        }
        
        const riskPatterns = detectionResults.summary.riskPatterns;
        const labels = [
            'Multiple Claims per VIN',
            'High Dollar Claims',
            'Multiple Dealers per VIN',
            'Repeated Claims',
            'High Risk Dealers',
            'Luxury Vehicles',
            'Coverage Types'
        ];
        
        const data = [
            riskPatterns.multipleClaimsPerVin,
            riskPatterns.highDollarClaims,
            riskPatterns.multipleDealersPerVin,
            riskPatterns.repeatedClaimsTimeframe,
            riskPatterns.highClaimsPerDealer,
            riskPatterns.luxuryVehiclePatterns,
            riskPatterns.coverageTypePatterns
        ];
        
        charts.summary = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Risk Patterns Detected',
                    data: data,
                    backgroundColor: [
                        'rgba(52, 152, 219, 0.7)',
                        'rgba(231, 76, 60, 0.7)',
                        'rgba(241, 196, 15, 0.7)',
                        'rgba(46, 204, 113, 0.7)',
                        'rgba(155, 89, 182, 0.7)',
                        'rgba(52, 73, 94, 0.7)',
                        'rgba(230, 126, 34, 0.7)'
                    ],
                    borderColor: [
                        'rgba(52, 152, 219, 1)',
                        'rgba(231, 76, 60, 1)',
                        'rgba(241, 196, 15, 1)',
                        'rgba(46, 204, 113, 1)',
                        'rgba(155, 89, 182, 1)',
                        'rgba(52, 73, 94, 1)',
                        'rgba(230, 126, 34, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Create the VIN claims chart
     */
    function createVinClaimsChart() {
        if (!detectionResults.multipleClaimsPerVin || 
            !detectionResults.multipleClaimsPerVin.vinStats || 
            detectionResults.multipleClaimsPerVin.vinStats.length === 0) {
            return;
        }
        
        const ctx = document.getElementById('vin-claims-chart').getContext('2d');
        
        if (charts.vinClaims) {
            charts.vinClaims.destroy();
        }
        
        // Get top 10 VINs by claim count
        const topVins = detectionResults.multipleClaimsPerVin.vinStats
            .slice(0, 10)
            .sort((a, b) => b.ClaimCount - a.ClaimCount);
        
        const labels = topVins.map(vin => vin.VIN);
        const data = topVins.map(vin => vin.ClaimCount);
        
        charts.vinClaims = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Number of Claims',
                    data: data,
                    backgroundColor: 'rgba(52, 152, 219, 0.7)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 VINs by Claim Count'
                    }
                }
            }
        });
    }
    
    /**
     * Create the high dollar claims chart
     */
    function createHighDollarChart() {
        if (!detectionResults.highDollarClaims || 
            !detectionResults.highDollarClaims.flaggedClaims || 
            detectionResults.highDollarClaims.flaggedClaims.length === 0) {
            return;
        }
        
        const ctx = document.getElementById('high-dollar-chart').getContext('2d');
        
        if (charts.highDollar) {
            charts.highDollar.destroy();
        }
        
        // Get all high dollar claims
        const highDollarClaims = detectionResults.highDollarClaims.flaggedClaims
            .sort((a, b) => b['Paid Amount'] - a['Paid Amount']);
        
        const labels = highDollarClaims.map(claim => claim['Claim #'] || 'Unknown');
        const data = highDollarClaims.map(claim => claim['Paid Amount']);
        
        charts.highDollar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Paid Amount ($)',
                    data: data,
                    backgroundColor: 'rgba(231, 76, 60, 0.7)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'High Dollar Claims'
                    }
                }
            }
        });
    }
    
    /**
     * Create the repeated claims chart
     */
    function createRepeatedClaimsChart() {
        if (!detectionResults.repeatedClaimsTimeframe || 
            !detectionResults.repeatedClaimsTimeframe.vinStats || 
            detectionResults.repeatedClaimsTimeframe.vinStats.length === 0) {
            return;
        }
        
        const ctx = document.getElementById('repeated-claims-chart').getContext('2d');
        
        if (charts.repeatedClaims) {
            charts.repeatedClaims.destroy();
        }
        
        // Get all VINs with repeated claims
        const repeatedClaims = detectionResults.repeatedClaimsTimeframe.vinStats
            .sort((a, b) => a.MinDaysBetween - b.MinDaysBetween);
        
        const labels = repeatedClaims.map(vin => vin.VIN);
        const data = repeatedClaims.map(vin => vin.MinDaysBetween);
        
        charts.repeatedClaims = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Minimum Days Between Claims',
                    data: data,
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'VINs with Repeated Claims (Sorted by Days Between Claims)'
                    }
                }
            }
        });
    }
    
    /**
     * Create the dealer chart
     */
    function createDealerChart() {
        if (!detectionResults.highClaimsPerDealer || 
            !detectionResults.highClaimsPerDealer.dealerStats || 
            detectionResults.highClaimsPerDealer.dealerStats.length === 0) {
            return;
        }
        
        const ctx = document.getElementById('dealer-chart').getContext('2d');
        
        if (charts.dealer) {
            charts.dealer.destroy();
        }
        
        // Get top 10 dealers by total paid
        const topDealers = detectionResults.highClaimsPerDealer.dealerStats
            .slice(0, 10)
            .sort((a, b) => b.TotalPaid - a.TotalPaid);
        
        const labels = topDealers.map(dealer => dealer.SellingDealer);
        const totalPaidData = topDealers.map(dealer => dealer.TotalPaid);
        const claimCountData = topDealers.map(dealer => dealer.ClaimCount);
        
        charts.dealer = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Paid ($)',
                        data: totalPaidData,
                        backgroundColor: 'rgba(155, 89, 182, 0.7)',
                        borderColor: 'rgba(155, 89, 182, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Claim Count',
                        data: claimCountData,
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Total Paid ($)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Claim Count'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Top 10 Dealers by Total Paid'
                    }
                }
            }
        });
    }
    
    /**
     * Create the luxury vehicles chart
     */
    function createLuxuryChart() {
        if (!detectionResults.luxuryVehiclePatterns || 
            !detectionResults.luxuryVehiclePatterns.brandStats || 
            detectionResults.luxuryVehiclePatterns.brandStats.length === 0) {
            return;
        }
        
        const ctx = document.getElementById('luxury-chart').getContext('2d');
        
        if (charts.luxury) {
            charts.luxury.destroy();
        }
        
        // Get all luxury brands
        const luxuryBrands = detectionResults.luxuryVehiclePatterns.brandStats
            .sort((a, b) => b.TotalPaid - a.TotalPaid);
        
        const labels = luxuryBrands.map(brand => brand.Brand);
        const totalPaidData = luxuryBrands.map(brand => brand.TotalPaid);
        const avgPaidData = luxuryBrands.map(brand => brand.AvgPaid);
        
        charts.luxury = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Paid ($)',
                        data: totalPaidData,
                        backgroundColor: 'rgba(52, 73, 94, 0.7)',
                        borderColor: 'rgba(52, 73, 94, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Average Paid ($)',
                        data: avgPaidData,
                        backgroundColor: 'rgba(241, 196, 15, 0.7)',
                        borderColor: 'rgba(241, 196, 15, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Total Paid ($)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Average Paid ($)'
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Luxury Brands by Total and Average Paid'
                    }
                }
            }
        });
    }
    
    /**
     * Create the coverage types chart
     */
    function createCoverageChart() {
        if (!detectionResults.coverageTypePatterns || 
            !detectionResults.coverageTypePatterns.coverageStats || 
            detectionResults.coverageTypePatterns.coverageStats.length === 0) {
            return;
        }
        
        const ctx = document.getElementById('coverage-chart').getContext('2d');
        
        if (charts.coverage) {
            charts.coverage.destroy();
        }
        
        // Get all coverage types
        const coverageTypes = detectionResults.coverageTypePatterns.coverageStats
            .sort((a, b) => b.TotalPaid - a.TotalPaid);
        
        const labels = coverageTypes.map(coverage => coverage.Coverage);
        const totalPaidData = coverageTypes.map(coverage => coverage.TotalPaid);
        const claimCountData = coverageTypes.map(coverage => coverage.ClaimCount);
        
        charts.coverage = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Total Paid ($)',
                        data: totalPaidData,
                        backgroundColor: 'rgba(230, 126, 34, 0.7)',
                        borderColor: 'rgba(230, 126, 34, 1)',
                        borderWidth: 1,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Claim Count',
                        data: claimCountData,
                        backgroundColor: 'rgba(52, 152, 219, 0.7)',
                        borderColor: 'rgba(52, 152, 219, 1)',
                        borderWidth: 1,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Total Paid ($)'
                        }
                    },
                    y1: {
                        beginAtZero: true,
                        position: 'right',
                        grid: {
                            drawOnChartArea: false
                        },
                        title: {
                            display: true,
                            text: 'Claim Count'
                        },
                        ticks: {
                            precision: 0
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Coverage Types by Total Paid and Claim Count'
                    }
                }
            }
        });
    }
    
    /**
     * Create the VIN claims table
     */
    function createVinClaimsTable() {
        if (!detectionResults.multipleClaimsPerVin || 
            !detectionResults.multipleClaimsPerVin.vinStats || 
            detectionResults.multipleClaimsPerVin.vinStats.length === 0) {
            return;
        }
        
        const tableBody = document.querySelector('#vin-claims-table tbody');
        tableBody.innerHTML = '';
        
        detectionResults.multipleClaimsPerVin.vinStats.forEach(vin => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${vin.VIN}</td>
                <td>${vin.Vehicle}</td>
                <td>${vin.ClaimCount}</td>
                <td>${formatCurrency(vin.TotalPaid)}</td>
                <td><button class="details-btn" data-type="vin" data-id="${vin.VIN}">View Details</button></td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to detail buttons
        document.querySelectorAll('#vin-claims-table .details-btn').forEach(btn => {
            btn.addEventListener('click', showDetailsModal);
        });
    }
    
    /**
     * Create the high dollar claims table
     */
    function createHighDollarTable() {
        if (!detectionResults.highDollarClaims || 
            !detectionResults.highDollarClaims.flaggedClaims || 
            detectionResults.highDollarClaims.flaggedClaims.length === 0) {
            return;
        }
        
        const tableBody = document.querySelector('#high-dollar-table tbody');
        tableBody.innerHTML = '';
        
        detectionResults.highDollarClaims.flaggedClaims.forEach(claim => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${claim['Claim #'] || 'Unknown'}</td>
                <td>${claim.VIN || 'Unknown'}</td>
                <td>${claim.Vehicle || 'Unknown'}</td>
                <td>${formatCurrency(claim['Paid Amount'])}</td>
                <td>${claim['Selling Dealer'] || 'Unknown'}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Create the repeated claims table
     */
    function createRepeatedClaimsTable() {
        if (!detectionResults.repeatedClaimsTimeframe || 
            !detectionResults.repeatedClaimsTimeframe.vinStats || 
            detectionResults.repeatedClaimsTimeframe.vinStats.length === 0) {
            return;
        }
        
        const tableBody = document.querySelector('#repeated-claims-table tbody');
        tableBody.innerHTML = '';
        
        detectionResults.repeatedClaimsTimeframe.vinStats.forEach(vin => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${vin.VIN}</td>
                <td>${vin.Vehicle}</td>
                <td>${vin.ClaimCount}</td>
                <td>${vin.MinDaysBetween}</td>
                <td>${formatCurrency(vin.TotalPaid)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Create the dealer table
     */
    function createDealerTable() {
        if (!detectionResults.highClaimsPerDealer || 
            !detectionResults.highClaimsPerDealer.dealerStats || 
            detectionResults.highClaimsPerDealer.dealerStats.length === 0) {
            return;
        }
        
        const tableBody = document.querySelector('#dealer-table tbody');
        tableBody.innerHTML = '';
        
        detectionResults.highClaimsPerDealer.dealerStats.forEach(dealer => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${dealer.SellingDealer}</td>
                <td>${dealer.ClaimCount}</td>
                <td>${formatCurrency(dealer.TotalPaid)}</td>
                <td>${formatCurrency(dealer.AvgPaid)}</td>
                <td><button class="details-btn" data-type="dealer" data-id="${dealer.SellingDealer}">View Details</button></td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Add event listeners to detail buttons
        document.querySelectorAll('#dealer-table .details-btn').forEach(btn => {
            btn.addEventListener('click', showDetailsModal);
        });
    }
    
    /**
     * Create the luxury vehicles table
     */
    function createLuxuryTable() {
        if (!detectionResults.luxuryVehiclePatterns || 
            !detectionResults.luxuryVehiclePatterns.brandStats || 
            detectionResults.luxuryVehiclePatterns.brandStats.length === 0) {
            return;
        }
        
        const tableBody = document.querySelector('#luxury-table tbody');
        tableBody.innerHTML = '';
        
        detectionResults.luxuryVehiclePatterns.brandStats.forEach(brand => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${brand.Brand}</td>
                <td>${brand.ClaimCount}</td>
                <td>${formatCurrency(brand.TotalPaid)}</td>
                <td>${formatCurrency(brand.AvgPaid)}</td>
                <td>${formatCurrency(brand.MaxPaid)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Create the coverage types table
     */
    function createCoverageTable() {
        if (!detectionResults.coverageTypePatterns || 
            !detectionResults.coverageTypePatterns.coverageStats || 
            detectionResults.coverageTypePatterns.coverageStats.length === 0) {
            return;
        }
        
        const tableBody = document.querySelector('#coverage-table tbody');
        tableBody.innerHTML = '';
        
        detectionResults.coverageTypePatterns.coverageStats.forEach(coverage => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${coverage.Coverage}</td>
                <td>${coverage.ClaimCount}</td>
                <td>${formatCurrency(coverage.TotalPaid)}</td>
                <td>${formatCurrency(coverage.AvgPaid)}</td>
                <td>${formatCurrency(coverage.MaxPaid)}</td>
            `;
            
            tableBody.appendChild(row);
        });
    }
    
    /**
     * Show the details modal with claim information
     * @param {Event} e - The click event
     */
    function showDetailsModal(e) {
        const type = e.target.getAttribute('data-type');
        const id = e.target.getAttribute('data-id');
        
        let claims = [];
        let title = '';
        
        if (type === 'vin') {
            const vinStat = detectionResults.multipleClaimsPerVin.vinStats.find(v => v.VIN === id);
            if (vinStat) {
                claims = vinStat.Claims;
                title = `Claims for VIN: ${id}`;
            }
        } else if (type === 'dealer') {
            const dealerStat = detectionResults.highClaimsPerDealer.dealerStats.find(d => d.SellingDealer === id);
            if (dealerStat) {
                claims = dealerStat.Claims;
                title = `Claims for Dealer: ${id}`;
            }
        }
        
        if (claims.length > 0) {
            modalTitle.textContent = title;
            
            const tableBody = document.querySelector('#details-table tbody');
            tableBody.innerHTML = '';
            
            claims.forEach(claim => {
                const row = document.createElement('tr');
                
                const roDate = claim['RO Date'] instanceof Date ? 
                    claim['RO Date'].toLocaleDateString() : 'Unknown';
                
                row.innerHTML = `
                    <td>${claim['Claim #'] || 'Unknown'}</td>
                    <td>${roDate}</td>
                    <td>${claim.Coverage || 'Unknown'}</td>
                    <td>${formatCurrency(claim['Paid Amount'])}</td>
                    <td>${claim['Default Servicer'] || 'Unknown'}</td>
                    <td>${claim['Selling Dealer'] || 'Unknown'}</td>
                `;
                
                tableBody.appendChild(row);
            });
            
            detailsModal.style.display = 'block';
        }
    }
    
    /**
     * Switch between tabs
     * @param {string} tabId - The ID of the tab to switch to
     */
    function switchTab(tabId) {
        // Update active tab button
        tabButtons.forEach(button => {
            if (button.getAttribute('data-tab') === tabId) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        // Update active tab pane
        tabPanes.forEach(pane => {
            if (pane.id === tabId) {
                pane.classList.add('active');
            } else {
                pane.classList.remove('active');
            }
        });
    }
    
    /**
     * Filter table rows based on search input
     * @param {string} tableId - The ID of the table to filter
     * @param {string} query - The search query
     */
    function filterTable(tableId, query) {
        const table = document.getElementById(tableId);
        const rows = table.querySelectorAll('tbody tr');
        
        const lowercaseQuery = query.toLowerCase();
        
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            if (text.includes(lowercaseQuery)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    /**
     * Download the full report as HTML
     */
    function downloadFullReport() {
        if (!detectionResults) return;
        
        // Create a full HTML report
        const reportHtml = generateFullReportHtml();
        
        // Create a blob and download link
        const blob = new Blob([reportHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'risk_detection_report.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Generate the full HTML report
     * @returns {string} HTML report
     */
    function generateFullReportHtml() {
        const summary = detectionResults.summary;
        const date = new Date().toLocaleString();
        
        let html = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>High Risk Pattern Detection Report</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 20px;
                        color: #333;
                    }
                    .container {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    h1, h2, h3 {
                        color: #2c3e50;
                    }
                    h1 {
                        border-bottom: 2px solid #3498db;
                        padding-bottom: 10px;
                    }
                    h2 {
                        border-bottom: 1px solid #bdc3c7;
                        padding-bottom: 5px;
                        margin-top: 30px;
                    }
                    table {
                        border-collapse: collapse;
                        width: 100%;
                        margin: 20px 0;
                    }
                    th, td {
                        text-align: left;
                        padding: 12px;
                        border-bottom: 1px solid #ddd;
                    }
                    th {
                        background-color: #f2f2f2;
                    }
                    tr:hover {
                        background-color: #f5f5f5;
                    }
                    .summary-box {
                        background-color: #f8f9fa;
                        border-left: 4px solid #3498db;
                        padding: 15px;
                        margin: 20px 0;
                    }
                    .risk-section {
                        margin: 30px 0;
                        padding: 15px;
                        border: 1px solid #ddd;
                        border-radius: 5px;
                    }
                    .risk-high {
                        border-left: 5px solid #e74c3c;
                    }
                    .risk-medium {
                        border-left: 5px solid #f39c12;
                    }
                    .risk-low {
                        border-left: 5px solid #2ecc71;
                    }
                    .footer {
                        margin-top: 50px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        text-align: center;
                        font-size: 0.9em;
                        color: #7f8c8d;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>High Risk Pattern Detection Report</h1>
                    <p>Generated on: ${date}</p>
                    
                    <div class="summary-box">
                        <h2>Summary Statistics</h2>
                        <p>Total Claims Analyzed: ${summary.totalClaims}</p>
                        <p>Total Amount Paid: ${formatCurrency(summary.totalPaid)}</p>
                        <p>Average Claim Amount: ${formatCurrency(summary.avgClaimAmount)}</p>
                        <p>Maximum Claim Amount: ${formatCurrency(summary.maxClaimAmount)}</p>
                        <p>Unique VINs: ${summary.uniqueVins}</p>
                        <p>Unique Dealers: ${summary.uniqueDealers}</p>
                    </div>
        `;
        
        // Add Multiple Claims per VIN section
        if (detectionResults.multipleClaimsPerVin && 
            detectionResults.multipleClaimsPerVin.vinStats && 
            detectionResults.multipleClaimsPerVin.vinStats.length > 0) {
            
            html += `
                <div class="risk-section risk-high">
                    <h2>Multiple Claims per VIN</h2>
                    <p>Found ${detectionResults.multipleClaimsPerVin.vinStats.length} VINs with multiple claims</p>
                    
                    <h3>VINs by Claim Count</h3>
                    <table>
                        <tr>
                            <th>VIN</th>
                            <th>Vehicle</th>
                            <th>Claim Count</th>
                            <th>Total Paid</th>
                        </tr>
            `;
            
            detectionResults.multipleClaimsPerVin.vinStats.forEach(vin => {
                html += `
                    <tr>
                        <td>${vin.VIN}</td>
                        <td>${vin.Vehicle}</td>
                        <td>${vin.ClaimCount}</td>
                        <td>${formatCurrency(vin.TotalPaid)}</td>
                    </tr>
                `;
            });
            
            html += `
                    </table>
                </div>
            `;
        }
        
        // Add High Dollar Claims section
        if (detectionResults.highDollarClaims && 
            detectionResults.highDollarClaims.flaggedClaims && 
            detectionResults.highDollarClaims.flaggedClaims.length > 0) {
            
            html += `
                <div class="risk-section risk-high">
                    <h2>High Dollar Claims</h2>
                    <p>Found ${detectionResults.highDollarClaims.flaggedClaims.length} high dollar claims above ${formatCurrency(detectionResults.highDollarClaims.threshold)}</p>
                    
                    <h3>High Dollar Claims</h3>
                    <table>
                        <tr>
                            <th>Claim #</th>
                            <th>VIN</th>
                            <th>Vehicle</th>
                            <th>Paid Amount</th>
                            <th>Selling Dealer</th>
                        </tr>
            `;
            
            detectionResults.highDollarClaims.flaggedClaims.forEach(claim => {
                html += `
                    <tr>
                        <td>${claim['Claim #'] || 'Unknown'}</td>
                        <td>${claim.VIN || 'Unknown'}</td>
                        <td>${claim.Vehicle || 'Unknown'}</td>
                        <td>${formatCurrency(claim['Paid Amount'])}</td>
                        <td>${claim['Selling Dealer'] || 'Unknown'}</td>
                    </tr>
                `;
            });
            
            html += `
                    </table>
                </div>
            `;
        }
        
        // Add other sections similarly...
        
        // Add footer
        html += `
                    <div class="footer">
                        <p>Generated by High Risk Pattern Detection System</p>
                        <p>&copy; 2025 Jeff Jackson. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
        `;
        
        return html;
    }
    
    /**
     * Download data as CSV
     * @param {string} type - The type of data to download
     */
    function downloadCsv(type) {
        if (!detectionResults) return;
        
        let data = [];
        let filename = '';
        
        switch (type) {
            case 'vin':
                if (detectionResults.multipleClaimsPerVin && detectionResults.multipleClaimsPerVin.flaggedClaims) {
                    data = detectionResults.multipleClaimsPerVin.flaggedClaims;
                    filename = 'multiple_claims_per_vin.csv';
                }
                break;
            case 'highDollar':
                if (detectionResults.highDollarClaims && detectionResults.highDollarClaims.flaggedClaims) {
                    data = detectionResults.highDollarClaims.flaggedClaims;
                    filename = 'high_dollar_claims.csv';
                }
                break;
            case 'repeated':
                if (detectionResults.repeatedClaimsTimeframe && detectionResults.repeatedClaimsTimeframe.flaggedClaims) {
                    data = detectionResults.repeatedClaimsTimeframe.flaggedClaims;
                    filename = 'repeated_claims_timeframe.csv';
                }
                break;
            case 'dealer':
                if (detectionResults.highClaimsPerDealer && detectionResults.highClaimsPerDealer.flaggedClaims) {
                    data = detectionResults.highClaimsPerDealer.flaggedClaims;
                    filename = 'high_claims_per_dealer.csv';
                }
                break;
            case 'luxury':
                if (detectionResults.luxuryVehiclePatterns && detectionResults.luxuryVehiclePatterns.flaggedClaims) {
                    data = detectionResults.luxuryVehiclePatterns.flaggedClaims;
                    filename = 'luxury_vehicle_claims.csv';
                }
                break;
            case 'coverage':
                if (detectionResults.coverageTypePatterns && detectionResults.coverageTypePatterns.coverageStats) {
                    data = detectionResults.coverageTypePatterns.coverageStats.map(stat => {
                        return {
                            'Coverage Type': stat.Coverage,
                            'Claim Count': stat.ClaimCount,
                            'Total Paid': stat.TotalPaid,
                            'Average Paid': stat.AvgPaid,
                            'Maximum Paid': stat.MaxPaid
                        };
                    });
                    filename = 'coverage_type_stats.csv';
                }
                break;
        }
        
        if (data.length > 0) {
            // Create a detector instance to use its exportToCsv method
            const detector = new RiskDetector([]);
            const csvContent = detector.exportToCsv(data);
            
            // Create a blob and download link
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }
    
    /**
     * Format a number as currency
     * @param {number} value - The value to format
     * @returns {string} Formatted currency string
     */
    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }
});