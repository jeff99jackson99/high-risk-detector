# High Risk Pattern Detection System - Usage Guide

This guide provides detailed instructions for using both the web interface and Python backend versions of the High Risk Pattern Detection System.

## Table of Contents

1. [Web Interface](#web-interface)
   - [Accessing the Web Interface](#accessing-the-web-interface)
   - [Uploading Data](#uploading-data)
   - [Configuring Detection Settings](#configuring-detection-settings)
   - [Analyzing Results](#analyzing-results)
   - [Exporting Results](#exporting-results)

2. [Python Backend](#python-backend)
   - [Installation](#installation)
   - [Basic Usage](#basic-usage)
   - [Advanced Options](#advanced-options)
   - [Interpreting Results](#interpreting-results)
   - [Customizing the System](#customizing-the-system)

3. [Data Format Requirements](#data-format-requirements)
   - [Required Columns](#required-columns)
   - [Data Types](#data-types)
   - [Sample Data](#sample-data)

4. [Troubleshooting](#troubleshooting)
   - [Web Interface Issues](#web-interface-issues)
   - [Python Backend Issues](#python-backend-issues)

---

## Web Interface

### Accessing the Web Interface

The web interface is accessible at: [https://jeff99jackson99.github.io/high-risk-detector/](https://jeff99jackson99.github.io/high-risk-detector/)

You can also run it locally:
1. Clone the repository: `git clone https://github.com/jeff99jackson99/high-risk-detector.git`
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Open your browser to the URL shown in the terminal (typically http://localhost:5000)

### Uploading Data

1. **Prepare your Excel file**:
   - Ensure it contains the [required columns](#required-columns)
   - Save it as .xlsx or .xls format

2. **Upload the file**:
   - Drag and drop the file onto the upload area
   - OR click the upload area and select your file
   - The file name will appear when successfully uploaded

3. **Click "Analyze Data"**:
   - The system will process your data
   - A loading indicator will appear during processing

### Configuring Detection Settings

Before analyzing, you can adjust the detection thresholds by clicking the "Detection Settings" button:

1. **VIN Claims Threshold**: Minimum number of claims to flag a VIN (default: 2)
2. **High Dollar Threshold**: Standard deviations above mean to flag high dollar claims (default: 2.0)
3. **Days Threshold**: Maximum days between claims to flag as repeated (default: 30)
4. **Dealer Count Threshold**: Minimum number of claims to consider a dealer high-risk (default: 3)
5. **Dealer Amount Multiplier**: Multiplier of average claim amount to flag a dealer (default: 1.5)

### Analyzing Results

After processing, the results are displayed in several tabs:

1. **Summary**: Overview of all detected risk patterns with key statistics
2. **Multiple Claims per VIN**: VINs with multiple claims above the threshold
3. **High Dollar Claims**: Claims with unusually high payment amounts
4. **Repeated Claims**: VINs with multiple claims within the days threshold
5. **Dealer Analysis**: Dealers with high claim frequency or amounts
6. **Luxury Vehicles**: Analysis of luxury vehicle claims
7. **Coverage Types**: Analysis of different coverage types

Each tab contains:
- Interactive charts visualizing the data
- Searchable tables with detailed information
- Export options for the specific data

### Exporting Results

You can export results in several ways:

1. **Full Report**: Click "Download Full Report" on the Summary tab to get a complete HTML report
2. **Specific Data**: Each tab has a "Download CSV" button to export that specific dataset
3. **Claim Details**: Click "View Details" on any row to see all claims for that VIN or dealer

---

## Python Backend

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/jeff99jackson99/high-risk-detector.git
   cd high-risk-detector
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

### Basic Usage

Run the system with default settings:

```bash
python run_risk_detection.py --file "your_claims_data.xlsx"
```

This will:
1. Process the specified Excel file
2. Generate visualizations and reports
3. Save all results to the "risk_detection_results" directory

### Advanced Options

The system supports several command-line options:

```bash
python run_risk_detection.py --file "your_claims_data.xlsx" \
                            --output "custom_output_dir" \
                            --vin-threshold 3 \
                            --dollar-threshold 2.5 \
                            --days-threshold 15 \
                            --dealer-count-threshold 4 \
                            --dealer-amount-multiplier 2.0 \
                            --open-report
```

Options explained:
- `--file`, `-f`: Path to the claims data Excel file
- `--output`, `-o`: Directory to save results (default: "risk_detection_results")
- `--no-viz`: Skip visualization generation
- `--no-html`: Skip HTML report generation
- `--open-report`: Open the HTML report in a browser after generation
- `--vin-threshold`: Minimum number of claims to flag a VIN
- `--dollar-threshold`: Standard deviation threshold for high dollar claims
- `--days-threshold`: Maximum days between claims to flag as repeated
- `--dealer-count-threshold`: Minimum number of claims to consider a dealer high-risk
- `--dealer-amount-multiplier`: Multiplier of average claim amount to flag a dealer

### Interpreting Results

After running the system, check the output directory for:

1. **summary_report.txt**: Overview of all detected risk patterns
2. **CSV files**: Detailed data for each risk pattern
   - multiple_claims_per_vin.csv
   - high_dollar_claims.csv
   - repeated_claims_timeframe.csv
   - high_risk_dealers_stats.csv
   - high_risk_dealers_claims.csv
   - luxury_vehicle_stats.csv
   - luxury_vehicle_claims.csv
   - coverage_type_stats.csv
3. **Visualizations**: PNG charts in the "visualizations" subdirectory
4. **HTML Report**: Interactive report (risk_report.html)

### Customizing the System

To modify the detection algorithms or add new ones:

1. Edit `risk_detector.py` to modify existing algorithms or add new ones
2. Update `detect_high_risk.py` to include new visualizations or reports
3. Run tests with `python test_risk_detector.py` to verify your changes

---

## Data Format Requirements

### Required Columns

The system expects an Excel file with the following columns:

| Column Name | Description | Required |
|-------------|-------------|----------|
| Contract Number | Unique identifier for each contract | Yes |
| Status | Current status of the claim | No |
| Claim # | Unique identifier for each claim | Yes |
| VIN | Vehicle Identification Number | Yes |
| Vehicle | Make and model information | No |
| RO Date | Repair Order date | Yes |
| Entry Date | Date the claim was entered | No |
| Default Servicer | Service provider that performed the work | No |
| Paid Amount | Dollar amount paid for the claim | Yes |
| Selling Dealer | Dealer that sold the contract | Yes |

### Data Types

- **Dates**: Should be in a format Excel recognizes as dates
- **Paid Amount**: Should be numeric values
- **VIN**: Should be consistent format (the system is case-sensitive)

### Sample Data

A sample Excel file is included in the repository: `Ascension Claims Inception 8.7.25.xlsx`

You can use this as a template for formatting your own data.

---

## Troubleshooting

### Web Interface Issues

1. **File won't upload**:
   - Ensure the file is in .xlsx or .xls format
   - Check that the file size is under 10MB
   - Try a different browser

2. **Analysis takes too long**:
   - Large files (>5000 rows) may take longer to process
   - Try reducing the file size by filtering to a specific date range
   - Close other browser tabs to free up memory

3. **Charts don't display**:
   - Ensure JavaScript is enabled in your browser
   - Try a different browser
   - Check if any browser extensions might be blocking Chart.js

### Python Backend Issues

1. **Missing dependencies**:
   - Run `pip install -r requirements.txt` to install all required packages
   - For specific errors, install the mentioned package (e.g., `pip install openpyxl`)

2. **Excel file loading errors**:
   - Ensure the file path is correct
   - Check that the file is not open in another program
   - Verify the file is a valid Excel file (.xlsx or .xls)

3. **No results generated**:
   - Check if the output directory exists and is writable
   - Verify that your data contains the required columns
   - Try with the sample data file to confirm the system works

For additional help, please open an issue on the GitHub repository.