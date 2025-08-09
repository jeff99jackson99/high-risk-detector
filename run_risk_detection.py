#!/usr/bin/env python3
"""
High Risk Pattern Detection System - Command Line Interface
Created by Jeff Jackson

This script provides a simple command-line interface for running the risk detection system.
"""

import argparse
import os
import sys
import webbrowser
from detect_high_risk import main as detect_main

def main():
    """Main function for the command-line interface"""
    parser = argparse.ArgumentParser(
        description='High Risk Pattern Detection System for Claims Data',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run with default settings
  python run_risk_detection.py
  
  # Specify a different input file
  python run_risk_detection.py --file other_claims_data.xlsx
  
  # Specify a different output directory
  python run_risk_detection.py --output my_results
  
  # Skip visualization generation
  python run_risk_detection.py --no-viz
  
  # Skip HTML report generation
  python run_risk_detection.py --no-html
  
  # Open the HTML report in a browser after generation
  python run_risk_detection.py --open-report
  
  # Run with custom thresholds
  python run_risk_detection.py --vin-threshold 3 --dollar-threshold 3.0 --days-threshold 15
        """
    )
    
    # Input/output options
    parser.add_argument('--file', '-f', default="Ascension Claims Inception 8.7.25.xlsx",
                        help='Path to the claims data Excel file')
    parser.add_argument('--output', '-o', default="risk_detection_results",
                        help='Directory to save results')
    
    # Report generation options
    parser.add_argument('--no-viz', action='store_true',
                        help='Skip visualization generation')
    parser.add_argument('--no-html', action='store_true',
                        help='Skip HTML report generation')
    parser.add_argument('--open-report', action='store_true',
                        help='Open the HTML report in a browser after generation')
    
    # Detection threshold options
    parser.add_argument('--vin-threshold', type=int, default=2,
                        help='Minimum number of claims to flag a VIN (default: 2)')
    parser.add_argument('--dollar-threshold', type=float, default=2.0,
                        help='Standard deviation threshold for high dollar claims (default: 2.0)')
    parser.add_argument('--days-threshold', type=int, default=30,
                        help='Maximum days between claims to flag as repeated (default: 30)')
    parser.add_argument('--dealer-count-threshold', type=int, default=3,
                        help='Minimum number of claims to consider a dealer high-risk (default: 3)')
    parser.add_argument('--dealer-amount-multiplier', type=float, default=1.5,
                        help='Multiplier of average claim amount to flag a dealer (default: 1.5)')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Set environment variables for thresholds
    os.environ['VIN_THRESHOLD'] = str(args.vin_threshold)
    os.environ['DOLLAR_THRESHOLD'] = str(args.dollar_threshold)
    os.environ['DAYS_THRESHOLD'] = str(args.days_threshold)
    os.environ['DEALER_COUNT_THRESHOLD'] = str(args.dealer_count_threshold)
    os.environ['DEALER_AMOUNT_MULTIPLIER'] = str(args.dealer_amount_multiplier)
    
    # Build command-line arguments for detect_high_risk.py
    detect_args = [
        '--file', args.file,
        '--output', args.output
    ]
    
    if args.no_viz:
        detect_args.append('--no-viz')
    
    if args.no_html:
        detect_args.append('--no-html')
    
    # Replace sys.argv with our custom args
    sys.argv = ['detect_high_risk.py'] + detect_args
    
    # Run the detection script
    detect_main()
    
    # Open the HTML report if requested
    if args.open_report and not args.no_html:
        html_path = os.path.join(args.output, 'risk_report.html')
        if os.path.exists(html_path):
            print(f"Opening HTML report: {html_path}")
            try:
                webbrowser.open(f"file://{os.path.abspath(html_path)}")
            except Exception as e:
                print(f"Could not open browser: {e}")
                print(f"Please open the report manually: {html_path}")

if __name__ == "__main__":
    main()