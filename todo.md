# High Risk Pattern Detection System

## 1. Data Analysis
- [x] Examine the uploaded Excel spreadsheet
- [x] Identify key columns and data structure
- [x] Understand data types and relationships
- [x] Document potential risk patterns to detect

### Key Columns Identified:
- Contract Number: Unique identifier for each contract
- Status: Current status of the claim (all are "Paid" in this dataset)
- Claim #: Unique identifier for each claim
- VIN: Vehicle Identification Number - critical for identifying multiple claims on same vehicle
- Vehicle: Make and model information
- RO Date: Repair Order date
- Entry Date: Date the claim was entered
- Default Servicer: Service provider that performed the work
- Paid Amount: Dollar amount paid for the claim - critical for high dollar detection
- Selling Dealer: Dealer that sold the contract - critical for dealer pattern detection

### Risk Patterns to Detect:
1. Multiple claims on the same VIN (potential fraud or vehicle issues)
2. High dollar claims (outliers in payment amounts)
3. Same VIN with claims paid by multiple selling dealers (potential dealer fraud)
4. Repeated claims by the same VIN within a short timeframe (potential abuse)
5. Selling dealers with high claim frequency or amounts (potential dealer issues)
6. Luxury vehicles with excessive claim amounts (potential luxury vehicle abuse)
7. Patterns of specific coverage types with high claim rates

## 2. System Design
- [x] Define risk pattern detection algorithms
- [x] Design data processing workflow
- [x] Plan output format and structure
- [x] Determine necessary functions and modules

### Risk Pattern Detection Algorithms:
1. **VIN Multiple Claims Detection**:
   - Group data by VIN
   - Count claims per VIN
   - Flag VINs with claim count above threshold
   - Output all claim details for flagged VINs

2. **High Dollar Claim Detection**:
   - Calculate statistical thresholds (e.g., mean + 2*std_dev)
   - Identify claims above threshold
   - Cross-reference with selling dealers
   - Output high dollar claims with all details

3. **Multiple Dealer Same VIN Detection**:
   - Group by VIN
   - Count unique selling dealers per VIN
   - Flag VINs with multiple dealers
   - Output all claim details for flagged VINs

4. **Repeated Claims Timeframe Analysis**:
   - Group by VIN
   - Sort by date
   - Calculate time between claims
   - Flag VINs with claims within short timeframe (e.g., 30 days)
   - Output all claim details for flagged VINs

5. **High Claims per Dealer Detection**:
   - Group by selling dealer
   - Count claims and sum paid amounts
   - Calculate average claim amount per dealer
   - Flag dealers above thresholds
   - Output dealer statistics and all related claims

### Data Processing Workflow:
1. Load Excel data into pandas DataFrame
2. Clean and preprocess data (handle missing values, date conversions)
3. Run each risk detection algorithm
4. Compile results into structured output
5. Generate summary statistics and detailed reports

### Output Format:
1. Summary report with key statistics and flags
2. Detailed reports for each risk category
3. CSV exports for further analysis
4. Optional visualization of key patterns

## 3. Implementation
- [x] Create core data loading and processing functions
- [x] Implement VIN pattern detection for multiple claims
- [x] Implement high dollar claim detection across dealers
- [x] Implement repeated claims by same VIN detection
- [x] Implement high claims per dealer detection
- [x] Add additional risk pattern detection as identified
- [x] Create output formatting functions

## 4. Testing
- [x] Test with sample data
- [x] Verify detection accuracy
- [x] Validate output format
- [x] Fix any issues

## 5. Documentation
- [x] Document code functionality
- [x] Create usage instructions
- [x] Explain risk pattern detection logic
- [x] Provide sample outputs

## 6. Web Interface Development
- [x] Create a web-based GUI for the risk detection system
- [x] Implement file upload functionality
- [x] Design responsive dashboard for results display
- [x] Add interactive visualizations
- [x] Implement download functionality for reports
- [x] Ensure cross-browser compatibility

## 7. GitHub Deployment
- [x] Set up GitHub repository structure
- [x] Configure GitHub Pages for web deployment
- [x] Create deployment workflow
- [x] Test deployed application
- [x] Document deployment process