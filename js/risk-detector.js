/**
 * High Risk Pattern Detection System - Core Detection Logic
 * Created by Jeff Jackson
 * 
 * This file contains the core risk detection algorithms that run in the browser.
 */

class RiskDetector {
    /**
     * Initialize the risk detector with data and settings
     * @param {Array} data - The claims data array
     * @param {Object} settings - Detection threshold settings
     */
    constructor(data, settings = {}) {
        this.data = data;
        this.settings = {
            vinThreshold: settings.vinThreshold || 2,
            dollarThreshold: settings.dollarThreshold || 2.0,
            daysThreshold: settings.daysThreshold || 30,
            dealerCountThreshold: settings.dealerCountThreshold || 3,
            dealerAmountMultiplier: settings.dealerAmountMultiplier || 1.5
        };
        this.results = {};
        this.preprocessData();
    }

    /**
     * Preprocess the data to ensure proper formats
     */
    preprocessData() {
        // Convert date strings to Date objects
        this.data = this.data.map(row => {
            // Handle RO Date and Entry Date
            if (row['RO Date']) {
                row['RO Date'] = new Date(row['RO Date']);
            }
            if (row['Entry Date']) {
                row['Entry Date'] = new Date(row['Entry Date']);
            }
            
            // Ensure Paid Amount is a number
            if (row['Paid Amount']) {
                row['Paid Amount'] = parseFloat(row['Paid Amount']);
            } else {
                row['Paid Amount'] = 0;
            }
            
            // Fill missing values - changed from 'Unknown' to more descriptive values
            row['Selling Dealer'] = row['Selling Dealer'] || 'Not Specified';
            row['Default Servicer'] = row['Default Servicer'] || 'Not Specified';
            
            return row;
        });
    }

    /**
     * Run all risk detection algorithms
     * @returns {Object} All detection results
     */
    runAllDetections() {
        console.log("Running all risk detections...");
        
        this.results.multipleClaimsPerVin = this.detectMultipleClaimsPerVin();
        this.results.highDollarClaims = this.detectHighDollarClaims();
        this.results.multipleDealersPerVin = this.detectMultipleDealersPerVin();
        this.results.repeatedClaimsTimeframe = this.detectRepeatedClaimsTimeframe();
        this.results.highClaimsPerDealer = this.detectHighClaimsPerDealer();
        this.results.luxuryVehiclePatterns = this.detectLuxuryVehiclePatterns();
        this.results.coverageTypePatterns = this.detectCoverageTypePatterns();
        this.results.summary = this.generateSummary();
        
        return this.results;
    }

    /**
     * Detect VINs with multiple claims above threshold
     * @returns {Object} Detection results
     */
    detectMultipleClaimsPerVin() {
        console.log("Detecting multiple claims per VIN...");
        
        // Group by VIN
        const vinGroups = this.groupBy(this.data, 'VIN');
        
        // Filter VINs with claims above threshold
        const multipleClaimsVins = Object.keys(vinGroups).filter(
            vin => vinGroups[vin].length >= this.settings.vinThreshold
        );
        
        // Get all claims for these VINs
        const flaggedClaims = this.data.filter(
            row => multipleClaimsVins.includes(row.VIN)
        );
        
        // Calculate statistics for each VIN
        const vinStats = multipleClaimsVins.map(vin => {
            const claims = vinGroups[vin];
            const totalPaid = claims.reduce((sum, claim) => sum + claim['Paid Amount'], 0);
            const vehicle = claims[0].Vehicle || 'Not Available';
            
            return {
                VIN: vin,
                Vehicle: vehicle,
                ClaimCount: claims.length,
                TotalPaid: totalPaid,
                Claims: claims
            };
        }).sort((a, b) => b.ClaimCount - a.ClaimCount);
        
        return {
            flaggedVins: multipleClaimsVins,
            vinStats: vinStats,
            flaggedClaims: flaggedClaims
        };
    }

    /**
     * Detect high dollar claims based on statistical thresholds
     * @returns {Object} Detection results
     */
    detectHighDollarClaims() {
        console.log("Detecting high dollar claims...");
        
        // Calculate mean and standard deviation
        const amounts = this.data.map(row => row['Paid Amount']);
        const mean = this.calculateMean(amounts);
        const stdDev = this.calculateStdDev(amounts, mean);
        
        // Calculate threshold
        const threshold = mean + (this.settings.dollarThreshold * stdDev);
        
        // Filter claims above threshold
        const highDollarClaims = this.data.filter(
            row => row['Paid Amount'] > threshold
        ).sort((a, b) => b['Paid Amount'] - a['Paid Amount']);
        
        return {
            threshold: threshold,
            mean: mean,
            stdDev: stdDev,
            flaggedClaims: highDollarClaims
        };
    }

    /**
     * Detect VINs with claims from multiple selling dealers
     * @returns {Object} Detection results
     */
    detectMultipleDealersPerVin() {
        console.log("Detecting multiple dealers per VIN...");
        
        // Group by VIN
        const vinGroups = this.groupBy(this.data, 'VIN');
        
        // Find VINs with multiple dealers
        const multipleDealerVins = Object.keys(vinGroups).filter(vin => {
            const dealers = new Set(vinGroups[vin].map(claim => claim['Selling Dealer']));
            return dealers.size > 1;
        });
        
        // Get all claims for these VINs
        const flaggedClaims = this.data.filter(
            row => multipleDealerVins.includes(row.VIN)
        );
        
        // Calculate statistics for each VIN
        const vinStats = multipleDealerVins.map(vin => {
            const claims = vinGroups[vin];
            const dealers = [...new Set(claims.map(claim => claim['Selling Dealer']))];
            const totalPaid = claims.reduce((sum, claim) => sum + claim['Paid Amount'], 0);
            const vehicle = claims[0].Vehicle || 'Not Available';
            
            return {
                VIN: vin,
                Vehicle: vehicle,
                Dealers: dealers,
                DealerCount: dealers.length,
                ClaimCount: claims.length,
                TotalPaid: totalPaid,
                Claims: claims
            };
        }).sort((a, b) => b.DealerCount - a.DealerCount);
        
        return {
            flaggedVins: multipleDealerVins,
            vinStats: vinStats,
            flaggedClaims: flaggedClaims
        };
    }

    /**
     * Detect VINs with multiple claims within a short timeframe
     * @returns {Object} Detection results
     */
    detectRepeatedClaimsTimeframe() {
        console.log("Detecting repeated claims within timeframe...");
        
        // Group by VIN
        const vinGroups = this.groupBy(this.data, 'VIN');
        
        // Find VINs with multiple claims
        const multiClaimVins = Object.keys(vinGroups).filter(
            vin => vinGroups[vin].length > 1
        );
        
        // Check timeframe for each VIN with multiple claims
        const rapidClaimVins = [];
        const vinStats = [];
        
        multiClaimVins.forEach(vin => {
            const claims = vinGroups[vin];
            
            // Sort claims by date
            claims.sort((a, b) => a['RO Date'] - b['RO Date']);
            
            let minDaysBetween = Infinity;
            let hasRapidClaims = false;
            
            // Check time between consecutive claims
            for (let i = 0; i < claims.length - 1; i++) {
                const currentDate = claims[i]['RO Date'];
                const nextDate = claims[i + 1]['RO Date'];
                
                if (currentDate instanceof Date && nextDate instanceof Date) {
                    const daysDiff = this.daysBetween(currentDate, nextDate);
                    minDaysBetween = Math.min(minDaysBetween, daysDiff);
                    
                    if (daysDiff <= this.settings.daysThreshold) {
                        hasRapidClaims = true;
                    }
                }
            }
            
            if (hasRapidClaims) {
                rapidClaimVins.push(vin);
                
                const totalPaid = claims.reduce((sum, claim) => sum + claim['Paid Amount'], 0);
                const vehicle = claims[0].Vehicle || 'Not Available';
                
                vinStats.push({
                    VIN: vin,
                    Vehicle: vehicle,
                    ClaimCount: claims.length,
                    MinDaysBetween: minDaysBetween,
                    TotalPaid: totalPaid,
                    Claims: claims
                });
            }
        });
        
        // Sort by minimum days between claims
        vinStats.sort((a, b) => a.MinDaysBetween - b.MinDaysBetween);
        
        // Get all claims for these VINs
        const flaggedClaims = this.data.filter(
            row => rapidClaimVins.includes(row.VIN)
        );
        
        return {
            flaggedVins: rapidClaimVins,
            vinStats: vinStats,
            flaggedClaims: flaggedClaims
        };
    }

    /**
     * Detect selling dealers with high claim frequency or amounts
     * @returns {Object} Detection results
     */
    detectHighClaimsPerDealer() {
        console.log("Detecting high claims per dealer...");
        
        // Group by dealer
        const dealerGroups = this.groupBy(this.data, 'Selling Dealer');
        
        // Calculate overall average claim amount
        const allAmounts = this.data.map(row => row['Paid Amount']);
        const overallAvg = this.calculateMean(allAmounts);
        
        // Calculate statistics for each dealer
        const dealerStats = Object.keys(dealerGroups).map(dealer => {
            const claims = dealerGroups[dealer];
            const claimCount = claims.length;
            const totalPaid = claims.reduce((sum, claim) => sum + claim['Paid Amount'], 0);
            const avgPaid = totalPaid / claimCount;
            
            return {
                SellingDealer: dealer,
                ClaimCount: claimCount,
                TotalPaid: totalPaid,
                AvgPaid: avgPaid,
                Claims: claims
            };
        });
        
        // Flag dealers with high claim count or high average payment
        const highRiskDealers = dealerStats.filter(dealer => 
            dealer.ClaimCount >= this.settings.dealerCountThreshold || 
            dealer.AvgPaid >= overallAvg * this.settings.dealerAmountMultiplier
        ).sort((a, b) => b.TotalPaid - a.TotalPaid);
        
        // Get all claims for these dealers
        const flaggedDealers = highRiskDealers.map(dealer => dealer.SellingDealer);
        const flaggedClaims = this.data.filter(
            row => flaggedDealers.includes(row['Selling Dealer'])
        );
        
        return {
            flaggedDealers: flaggedDealers,
            dealerStats: highRiskDealers,
            flaggedClaims: flaggedClaims,
            overallAvg: overallAvg
        };
    }

    /**
     * Detect luxury vehicles with excessive claim amounts
     * @returns {Object} Detection results
     */
    detectLuxuryVehiclePatterns() {
        console.log("Detecting luxury vehicle patterns...");
        
        // Define luxury brands
        const luxuryBrands = [
            'BENTLEY', 'FERRARI', 'LAMBORGHINI', 'MCLAREN', 'ROLLS-ROYCE', 'ASTON MARTIN',
            'PORSCHE', 'MERCEDES-BENZ', 'BMW', 'AUDI', 'MASERATI', 'LAND ROVER', 'TESLA'
        ];
        
        // Extract brand from Vehicle column
        const dataWithBrands = this.data.map(row => {
            const vehicleParts = (row.Vehicle || '').split(' ');
            const brand = vehicleParts.length > 1 ? vehicleParts[1] : 'Not Identified';
            return { ...row, Brand: brand };
        });
        
        // Filter luxury vehicles
        const luxuryClaims = dataWithBrands.filter(
            row => luxuryBrands.includes(row.Brand)
        );
        
        // Group by brand
        const brandGroups = this.groupBy(luxuryClaims, 'Brand');
        
        // Calculate statistics for each brand
        const brandStats = Object.keys(brandGroups).map(brand => {
            const claims = brandGroups[brand];
            const claimCount = claims.length;
            const totalPaid = claims.reduce((sum, claim) => sum + claim['Paid Amount'], 0);
            const avgPaid = totalPaid / claimCount;
            const maxPaid = Math.max(...claims.map(claim => claim['Paid Amount']));
            
            return {
                Brand: brand,
                ClaimCount: claimCount,
                TotalPaid: totalPaid,
                AvgPaid: avgPaid,
                MaxPaid: maxPaid,
                Claims: claims
            };
        }).sort((a, b) => b.TotalPaid - a.TotalPaid);
        
        return {
            luxuryBrands: luxuryBrands,
            brandStats: brandStats,
            flaggedClaims: luxuryClaims
        };
    }

    /**
     * Detect patterns of specific coverage types with high claim rates
     * @returns {Object} Detection results
     */
    detectCoverageTypePatterns() {
        console.log("Detecting coverage type patterns...");
        
        // Group by coverage type
        const coverageGroups = this.groupBy(this.data, 'Coverage');
        
        // Calculate statistics for each coverage type
        const coverageStats = Object.keys(coverageGroups).map(coverage => {
            const claims = coverageGroups[coverage];
            const claimCount = claims.length;
            const totalPaid = claims.reduce((sum, claim) => sum + claim['Paid Amount'], 0);
            const avgPaid = totalPaid / claimCount;
            const maxPaid = Math.max(...claims.map(claim => claim['Paid Amount']));
            
            return {
                Coverage: coverage,
                ClaimCount: claimCount,
                TotalPaid: totalPaid,
                AvgPaid: avgPaid,
                MaxPaid: maxPaid,
                Claims: claims
            };
        }).sort((a, b) => b.TotalPaid - a.TotalPaid);
        
        return {
            coverageStats: coverageStats
        };
    }

    /**
     * Generate a summary of all risk detection results
     * @returns {Object} Summary statistics
     */
    generateSummary() {
        console.log("Generating summary...");
        
        const totalClaims = this.data.length;
        const totalPaid = this.data.reduce((sum, row) => sum + row['Paid Amount'], 0);
        const avgClaimAmount = totalPaid / totalClaims;
        const maxClaimAmount = Math.max(...this.data.map(row => row['Paid Amount']));
        const uniqueVins = new Set(this.data.map(row => row.VIN)).size;
        const uniqueDealers = new Set(this.data.map(row => row['Selling Dealer'])).size;
        
        // Count risk patterns
        const riskPatterns = {
            multipleClaimsPerVin: this.results.multipleClaimsPerVin ? 
                this.results.multipleClaimsPerVin.flaggedVins.length : 0,
            highDollarClaims: this.results.highDollarClaims ? 
                this.results.highDollarClaims.flaggedClaims.length : 0,
            multipleDealersPerVin: this.results.multipleDealersPerVin ? 
                this.results.multipleDealersPerVin.flaggedVins.length : 0,
            repeatedClaimsTimeframe: this.results.repeatedClaimsTimeframe ? 
                this.results.repeatedClaimsTimeframe.flaggedVins.length : 0,
            highClaimsPerDealer: this.results.highClaimsPerDealer ? 
                this.results.highClaimsPerDealer.flaggedDealers.length : 0,
            luxuryVehiclePatterns: this.results.luxuryVehiclePatterns ? 
                this.results.luxuryVehiclePatterns.brandStats.length : 0,
            coverageTypePatterns: this.results.coverageTypePatterns ? 
                this.results.coverageTypePatterns.coverageStats.length : 0
        };
        
        // Calculate total risk patterns
        const totalRiskPatterns = Object.values(riskPatterns).reduce((sum, count) => sum + count, 0);
        
        return {
            totalClaims,
            totalPaid,
            avgClaimAmount,
            maxClaimAmount,
            uniqueVins,
            uniqueDealers,
            riskPatterns,
            totalRiskPatterns
        };
    }

    /**
     * Helper function to group data by a specific key
     * @param {Array} array - The array to group
     * @param {string} key - The key to group by
     * @returns {Object} Grouped data
     */
    groupBy(array, key) {
        return array.reduce((result, item) => {
            const groupKey = item[key] || 'Not Specified';
            if (!result[groupKey]) {
                result[groupKey] = [];
            }
            result[groupKey].push(item);
            return result;
        }, {});
    }

    /**
     * Calculate the mean of an array of numbers
     * @param {Array} array - Array of numbers
     * @returns {number} Mean value
     */
    calculateMean(array) {
        if (array.length === 0) return 0;
        const sum = array.reduce((a, b) => a + b, 0);
        return sum / array.length;
    }

    /**
     * Calculate the standard deviation of an array of numbers
     * @param {Array} array - Array of numbers
     * @param {number} mean - Mean value (optional)
     * @returns {number} Standard deviation
     */
    calculateStdDev(array, mean = null) {
        if (array.length === 0) return 0;
        
        const avg = mean !== null ? mean : this.calculateMean(array);
        const squareDiffs = array.map(value => {
            const diff = value - avg;
            return diff * diff;
        });
        
        const avgSquareDiff = this.calculateMean(squareDiffs);
        return Math.sqrt(avgSquareDiff);
    }

    /**
     * Calculate days between two dates
     * @param {Date} date1 - First date
     * @param {Date} date2 - Second date
     * @returns {number} Number of days
     */
    daysBetween(date1, date2) {
        const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
        const diffDays = Math.round(Math.abs((date1 - date2) / oneDay));
        return diffDays;
    }

    /**
     * Export results to CSV format
     * @param {Array} data - Data to export
     * @returns {string} CSV string
     */
    exportToCsv(data) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvRows = [];
        
        // Add header row
        csvRows.push(headers.join(','));
        
        // Add data rows
        for (const row of data) {
            const values = headers.map(header => {
                const value = row[header];
                // Handle strings with commas
                if (typeof value === 'string' && value.includes(',')) {
                    return `"${value}"`;
                }
                return value;
            });
            csvRows.push(values.join(','));
        }
        
        return csvRows.join('\n');
    }
}
