# Installation Guide for High Risk Pattern Detection System

## Prerequisites

- Python 3.6 or higher
- pip (Python package manager)

## Installation Methods

### Method 1: Direct Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/ninjatech-ai/high-risk-detector.git
   cd high-risk-detector
   ```

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Make the scripts executable:
   ```bash
   chmod +x run_risk_detection.py
   ```

### Method 2: Install as a Package

1. Clone or download this repository:
   ```bash
   git clone https://github.com/ninjatech-ai/high-risk-detector.git
   cd high-risk-detector
   ```

2. Install the package:
   ```bash
   pip install .
   ```

3. This will install the `risk-detector` command-line tool that you can use from anywhere.

## Verification

To verify that the installation was successful:

1. Run the test script:
   ```bash
   python test_risk_detector.py
   ```

2. If all tests pass, the system is installed correctly.

## Running the System

### Using the Command-Line Interface

```bash
python run_risk_detection.py --file "your_claims_data.xlsx"
```

Or if installed as a package:

```bash
risk-detector --file "your_claims_data.xlsx"
```

### Command-Line Options

- `--file`, `-f`: Path to the claims data Excel file
- `--output`, `-o`: Directory to save results
- `--no-viz`: Skip visualization generation
- `--no-html`: Skip HTML report generation
- `--open-report`: Open the HTML report in a browser after generation
- `--vin-threshold`: Minimum number of claims to flag a VIN
- `--dollar-threshold`: Standard deviation threshold for high dollar claims
- `--days-threshold`: Maximum days between claims to flag as repeated
- `--dealer-count-threshold`: Minimum number of claims to consider a dealer high-risk
- `--dealer-amount-multiplier`: Multiplier of average claim amount to flag a dealer

## Troubleshooting

### Missing Dependencies

If you encounter errors about missing packages, try installing them manually:

```bash
pip install pandas numpy matplotlib seaborn openpyxl
```

### Excel File Loading Issues

If you encounter issues loading Excel files, ensure you have openpyxl installed:

```bash
pip install openpyxl
```

### Visualization Errors

If you encounter errors related to visualizations, ensure you have matplotlib and seaborn installed:

```bash
pip install matplotlib seaborn
```

### Permission Issues

If you encounter permission issues when running the scripts, make them executable:

```bash
chmod +x run_risk_detection.py
chmod +x detect_high_risk.py
chmod +x test_risk_detector.py
```

## Support

For support, please contact Jeff Jackson at jeff.jackson@example.com.