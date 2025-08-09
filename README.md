# High Risk Pattern Detection System

A comprehensive system for detecting high-risk patterns in claims data, developed by Jeff Jackson.

## Overview

This system analyzes claims data to identify potential fraud patterns, high-risk behaviors, and unusual claim activities. It helps insurance companies and warranty providers identify suspicious patterns that may require further investigation.

The system is available in two versions:
1. **Python Backend**: Command-line tool for batch processing and detailed analysis
2. **Web Interface**: Browser-based tool for interactive analysis with visualizations

## Features

The system detects the following high-risk patterns:

1. **Multiple Claims per VIN**: Identifies vehicles with multiple claims above a threshold, which could indicate potential fraud or problematic vehicles.

2. **High Dollar Claims**: Detects claims with unusually high payment amounts based on statistical thresholds.

3. **Multiple Dealers per VIN**: Flags vehicles with claims from multiple selling dealers, which could indicate dealer fraud or data entry issues.

4. **Repeated Claims Timeframe**: Identifies vehicles with multiple claims within a short timeframe, which could indicate abuse of the claims system.

5. **High Claims per Dealer**: Detects selling dealers with high claim frequency or amounts, which could indicate dealer-level issues.

6. **Luxury Vehicle Patterns**: Analyzes luxury vehicles for excessive claim amounts, which could indicate premium vehicle abuse.

7. **Coverage Type Patterns**: Identifies patterns of specific coverage types with high claim rates, which could indicate product design issues.

## Web Interface

The web interface provides an easy-to-use, interactive way to analyze claims data directly in your browser:

### Key Features
- **File Upload**: Drag and drop or select Excel files containing claims data
- **Customizable Detection Settings**: Adjust thresholds for different risk patterns
- **Interactive Visualizations**: Charts and graphs for each risk pattern
- **Detailed Tables**: Sortable and searchable tables with claim details
- **Export Functionality**: Download results as CSV or HTML reports
- **Responsive Design**: Works on desktop and mobile devices

### Usage
1. Visit the [High Risk Detector Web App](https://jeff99jackson99.github.io/high-risk-detector/)
2. Upload your claims data Excel file
3. Adjust detection settings if needed
4. Click "Analyze Data" to process the file
5. Explore the results using the tabs and interactive elements

### Privacy & Security
- All data processing happens in your browser
- No data is sent to any server
- Your claims data never leaves your computer

## Python Backend

The Python backend provides more advanced analysis capabilities and is suitable for batch processing and integration with other systems.

### Requirements

- Python 3.6+
- pandas
- numpy
- matplotlib
- seaborn
- openpyxl

### Installation

1. Clone this repository or download the files
2. Install required packages:

```bash
pip install -r requirements.txt
```

### Usage

Run the detection system on your claims data:

```bash
python run_risk_detection.py --file "your_claims_data.xlsx"
```

### Command Line Options

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

Example with custom thresholds:

```bash
python run_risk_detection.py --file "claims_data.xlsx" --vin-threshold 3 --dollar-threshold 2.5 --days-threshold 15
```

## Output

The system generates the following outputs:

1. **CSV Files**: Detailed data for each risk pattern detected
2. **Summary Report**: Text file with key statistics and findings
3. **Visualizations**: Charts and graphs illustrating the detected patterns
4. **HTML Report**: Interactive web report with all findings and visualizations

## Development

### Web Interface

To run the web interface locally:

1. Clone this repository
2. Install dependencies: `npm install`
3. Start the development server: `npm start`
4. Open your browser to the URL shown in the terminal

### Python Backend

To modify the Python backend:

1. Edit the relevant Python files (`risk_detector.py`, `detect_high_risk.py`, etc.)
2. Run tests: `python test_risk_detector.py`
3. Try your changes: `python run_risk_detection.py --file "your_test_data.xlsx"`

## License

This software is proprietary and confidential. Unauthorized copying, transferring or reproduction of the contents, in any medium, is strictly prohibited.

© 2025 Jeff Jackson. All rights reserved.