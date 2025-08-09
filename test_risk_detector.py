#!/usr/bin/env python3
"""
Test script for the High Risk Pattern Detection System
Created by Jeff Jackson

This script tests the functionality of the risk detection system using the sample data.
"""

import os
import sys
import pandas as pd
from risk_detector import RiskDetector

def test_risk_detector():
    """Test the RiskDetector class with sample data"""
    print("Testing Risk Detector with sample data...")
    
    # Initialize detector with sample data
    detector = RiskDetector("Ascension Claims Inception 8.7.25.xlsx")
    
    # Test data loading
    print("\n1. Testing data loading...")
    detector.load_data()
    if detector.data is not None and len(detector.data) > 0:
        print(f"✓ Successfully loaded {len(detector.data)} records")
    else:
        print("✗ Failed to load data")
        return False
    
    # Test multiple claims per VIN detection
    print("\n2. Testing multiple claims per VIN detection...")
    result = detector.detect_multiple_claims_per_vin()
    if result is not None and len(result) > 0:
        print(f"✓ Found {result['VIN'].nunique()} VINs with multiple claims")
        print(f"  Top VINs: {', '.join(result['VIN'].value_counts().head(3).index.tolist())}")
    else:
        print("✗ No VINs with multiple claims found or detection failed")
    
    # Test high dollar claim detection
    print("\n3. Testing high dollar claim detection...")
    result = detector.detect_high_dollar_claims()
    if result is not None and len(result) > 0:
        print(f"✓ Found {len(result)} high dollar claims")
        print(f"  Highest claim amount: ${result['Paid Amount'].max():.2f}")
    else:
        print("✗ No high dollar claims found or detection failed")
    
    # Test multiple dealers per VIN detection
    print("\n4. Testing multiple dealers per VIN detection...")
    result = detector.detect_multiple_dealers_per_vin()
    if result is not None and len(result) > 0:
        print(f"✓ Found {result['VIN'].nunique()} VINs with multiple dealers")
    else:
        print("✗ No VINs with multiple dealers found or detection failed")
    
    # Test repeated claims timeframe detection
    print("\n5. Testing repeated claims timeframe detection...")
    result = detector.detect_repeated_claims_timeframe()
    if result is not None and len(result) > 0:
        print(f"✓ Found {result['VIN'].nunique()} VINs with repeated claims within timeframe")
    else:
        print("✗ No VINs with repeated claims within timeframe found or detection failed")
    
    # Test high claims per dealer detection
    print("\n6. Testing high claims per dealer detection...")
    result = detector.detect_high_claims_per_dealer()
    if result is not None and len(result) > 0:
        print(f"✓ Found {len(result)} high-risk dealers")
        print(f"  Top dealer by claim count: {result.sort_values('claim_count', ascending=False)['Selling Dealer'].iloc[0]}")
    else:
        print("✗ No high-risk dealers found or detection failed")
    
    # Test luxury vehicle pattern detection
    print("\n7. Testing luxury vehicle pattern detection...")
    result = detector.detect_luxury_vehicle_patterns()
    if result is not None and len(result) > 0:
        print(f"✓ Found {len(result)} luxury brands with claims")
        print(f"  Top luxury brand by total paid: {result.sort_values('total_paid', ascending=False)['Brand'].iloc[0]}")
    else:
        print("✗ No luxury vehicle patterns found or detection failed")
    
    # Test coverage type pattern detection
    print("\n8. Testing coverage type pattern detection...")
    result = detector.detect_coverage_type_patterns()
    if result is not None and len(result) > 0:
        print(f"✓ Found {len(result)} coverage types")
        print(f"  Top coverage type by total paid: {result.sort_values('total_paid', ascending=False)['Coverage'].iloc[0]}")
    else:
        print("✗ No coverage type patterns found or detection failed")
    
    # Test summary report generation
    print("\n9. Testing summary report generation...")
    summary = detector.generate_summary_report()
    if summary is not None:
        print(f"✓ Successfully generated summary report")
        print(f"  Total claims analyzed: {summary['total_claims']}")
        print(f"  Total amount paid: ${summary['total_paid']:.2f}")
    else:
        print("✗ Failed to generate summary report")
    
    print("\nAll tests completed!")
    return True

def main():
    """Main function to run the tests"""
    test_risk_detector()

if __name__ == "__main__":
    main()