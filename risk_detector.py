"""
High Risk Pattern Detection System for Claims Data
Created by Jeff Jackson

This system analyzes claims data to identify potential high-risk patterns including:
- Multiple claims on the same VIN
- High dollar claims
- Same VIN with claims paid by multiple selling dealers
- Repeated claims by the same VIN within a short timeframe
- Selling dealers with high claim frequency or amounts
- Luxury vehicles with excessive claim amounts
- Patterns of specific coverage types with high claim rates
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import os
import sys
from typing import Dict, List, Tuple, Set, Any

class RiskDetector:
    """Main class for detecting high-risk patterns in claims data"""
    
    def __init__(self, file_path: str):
        """Initialize the RiskDetector with the path to the claims data file"""
        self.file_path = file_path
        self.data = None
        self.results = {}
        self.output_dir = "risk_detection_results"
        
        # Create output directory if it doesn't exist
        if not os.path.exists(self.output_dir):
            os.makedirs(self.output_dir)
    
    def load_data(self) -> None:
        """Load and preprocess the claims data"""
        try:
            # Load the Excel file
            self.data = pd.read_excel(self.file_path)
            
            # Clean the data
            self._clean_data()
            
            print(f"Successfully loaded data with {len(self.data)} records")
        except Exception as e:
            print(f"Error loading data: {e}")
            sys.exit(1)
    
    def _clean_data(self) -> None:
        """Clean and preprocess the data"""
        # Remove any empty rows
        self.data = self.data.dropna(how='all')
        
        # Convert date columns to datetime
        date_columns = ['RO Date', 'Entry Date']
        for col in date_columns:
            if col in self.data.columns:
                self.data[col] = pd.to_datetime(self.data[col], errors='coerce')
        
        # Convert Paid Amount to numeric
        if 'Paid Amount' in self.data.columns:
            self.data['Paid Amount'] = pd.to_numeric(self.data['Paid Amount'], errors='coerce')
        
        # Fill missing values appropriately
        self.data = self.data.fillna({
            'Paid Amount': 0,
            'Selling Dealer': 'Unknown',
            'Default Servicer': 'Unknown'
        })
    
    def detect_multiple_claims_per_vin(self, threshold: int = 2) -> pd.DataFrame:
        """
        Detect VINs with multiple claims above the threshold
        
        Args:
            threshold: Minimum number of claims to flag a VIN
            
        Returns:
            DataFrame with flagged VINs and their claims
        """
        # Group by VIN and count claims
        vin_counts = self.data.groupby('VIN').size().reset_index(name='claim_count')
        
        # Filter VINs with claims above threshold
        high_claim_vins = vin_counts[vin_counts['claim_count'] >= threshold]
        
        # Get all claims for these VINs
        if len(high_claim_vins) > 0:
            result = self.data[self.data['VIN'].isin(high_claim_vins['VIN'])]
            self.results['multiple_claims_per_vin'] = result
            
            # Save to CSV
            result.to_csv(f"{self.output_dir}/multiple_claims_per_vin.csv", index=False)
            
            print(f"Found {len(high_claim_vins)} VINs with multiple claims")
            return result
        else:
            print("No VINs with multiple claims found")
            return pd.DataFrame()
    
    def detect_high_dollar_claims(self, std_dev_threshold: float = 2.0) -> pd.DataFrame:
        """
        Detect high dollar claims based on statistical thresholds
        
        Args:
            std_dev_threshold: Number of standard deviations above mean to flag
            
        Returns:
            DataFrame with high dollar claims
        """
        # Calculate threshold
        mean_amount = self.data['Paid Amount'].mean()
        std_dev = self.data['Paid Amount'].std()
        threshold = mean_amount + (std_dev_threshold * std_dev)
        
        # Filter claims above threshold
        high_dollar_claims = self.data[self.data['Paid Amount'] > threshold]
        
        if len(high_dollar_claims) > 0:
            self.results['high_dollar_claims'] = high_dollar_claims
            
            # Save to CSV
            high_dollar_claims.to_csv(f"{self.output_dir}/high_dollar_claims.csv", index=False)
            
            print(f"Found {len(high_dollar_claims)} high dollar claims above ${threshold:.2f}")
            return high_dollar_claims
        else:
            print("No high dollar claims found")
            return pd.DataFrame()
    
    def detect_multiple_dealers_per_vin(self) -> pd.DataFrame:
        """
        Detect VINs with claims from multiple selling dealers
        
        Returns:
            DataFrame with VINs having multiple dealers
        """
        # Group by VIN and count unique dealers
        vin_dealer_counts = self.data.groupby('VIN')['Selling Dealer'].nunique().reset_index(name='dealer_count')
        
        # Filter VINs with multiple dealers
        multi_dealer_vins = vin_dealer_counts[vin_dealer_counts['dealer_count'] > 1]
        
        if len(multi_dealer_vins) > 0:
            # Get all claims for these VINs
            result = self.data[self.data['VIN'].isin(multi_dealer_vins['VIN'])]
            self.results['multiple_dealers_per_vin'] = result
            
            # Save to CSV
            result.to_csv(f"{self.output_dir}/multiple_dealers_per_vin.csv", index=False)
            
            print(f"Found {len(multi_dealer_vins)} VINs with claims from multiple dealers")
            return result
        else:
            print("No VINs with multiple dealers found")
            return pd.DataFrame()
    
    def detect_repeated_claims_timeframe(self, days_threshold: int = 30) -> pd.DataFrame:
        """
        Detect VINs with multiple claims within a short timeframe
        
        Args:
            days_threshold: Maximum days between claims to flag
            
        Returns:
            DataFrame with VINs having repeated claims within timeframe
        """
        # First get VINs with multiple claims
        vin_counts = self.data.groupby('VIN').size().reset_index(name='claim_count')
        multi_claim_vins = vin_counts[vin_counts['claim_count'] > 1]['VIN'].tolist()
        
        if not multi_claim_vins:
            print("No VINs with multiple claims found")
            return pd.DataFrame()
        
        # Initialize results container
        rapid_claim_vins = set()
        
        # For each VIN with multiple claims, check timeframe
        for vin in multi_claim_vins:
            # Get claims for this VIN and sort by date
            vin_claims = self.data[self.data['VIN'] == vin].sort_values('RO Date')
            
            # Check time between consecutive claims
            for i in range(len(vin_claims) - 1):
                current_date = vin_claims.iloc[i]['RO Date']
                next_date = vin_claims.iloc[i+1]['RO Date']
                
                if isinstance(current_date, pd.Timestamp) and isinstance(next_date, pd.Timestamp):
                    days_diff = (next_date - current_date).days
                    
                    if days_diff <= days_threshold:
                        rapid_claim_vins.add(vin)
                        break
        
        if rapid_claim_vins:
            # Get all claims for these VINs
            result = self.data[self.data['VIN'].isin(rapid_claim_vins)]
            self.results['repeated_claims_timeframe'] = result
            
            # Save to CSV
            result.to_csv(f"{self.output_dir}/repeated_claims_timeframe.csv", index=False)
            
            print(f"Found {len(rapid_claim_vins)} VINs with repeated claims within {days_threshold} days")
            return result
        else:
            print(f"No VINs with repeated claims within {days_threshold} days found")
            return pd.DataFrame()
    
    def detect_high_claims_per_dealer(self, count_threshold: int = 3, amount_threshold_multiplier: float = 1.5) -> pd.DataFrame:
        """
        Detect selling dealers with high claim frequency or amounts
        
        Args:
            count_threshold: Minimum number of claims to consider a dealer
            amount_threshold_multiplier: Multiplier of average claim amount to flag
            
        Returns:
            DataFrame with high-risk dealers and their statistics
        """
        # Group by dealer and calculate statistics
        dealer_stats = self.data.groupby('Selling Dealer').agg(
            claim_count=('Claim #', 'count'),
            total_paid=('Paid Amount', 'sum'),
            avg_paid=('Paid Amount', 'mean')
        ).reset_index()
        
        # Calculate overall average claim amount
        overall_avg = self.data['Paid Amount'].mean()
        
        # Flag dealers with high claim count or high average payment
        high_risk_dealers = dealer_stats[
            (dealer_stats['claim_count'] >= count_threshold) | 
            (dealer_stats['avg_paid'] >= overall_avg * amount_threshold_multiplier)
        ]
        
        if len(high_risk_dealers) > 0:
            # Get all claims for these dealers
            result = self.data[self.data['Selling Dealer'].isin(high_risk_dealers['Selling Dealer'])]
            
            # Add dealer statistics to results
            self.results['high_claims_per_dealer'] = {
                'dealer_stats': high_risk_dealers,
                'claims': result
            }
            
            # Save to CSV
            high_risk_dealers.to_csv(f"{self.output_dir}/high_risk_dealers_stats.csv", index=False)
            result.to_csv(f"{self.output_dir}/high_risk_dealers_claims.csv", index=False)
            
            print(f"Found {len(high_risk_dealers)} high-risk dealers")
            return high_risk_dealers
        else:
            print("No high-risk dealers found")
            return pd.DataFrame()
    
    def detect_luxury_vehicle_patterns(self) -> pd.DataFrame:
        """
        Detect luxury vehicles with excessive claim amounts
        
        Returns:
            DataFrame with luxury vehicles and their claim statistics
        """
        # Define luxury brands (can be expanded)
        luxury_brands = [
            'BENTLEY', 'FERRARI', 'LAMBORGHINI', 'MCLAREN', 'ROLLS-ROYCE', 'ASTON MARTIN',
            'PORSCHE', 'MERCEDES-BENZ', 'BMW', 'AUDI', 'MASERATI', 'LAND ROVER', 'TESLA'
        ]
        
        # Extract brand from Vehicle column
        self.data['Brand'] = self.data['Vehicle'].str.split(' ').str[1]
        
        # Filter luxury vehicles
        luxury_claims = self.data[self.data['Brand'].isin(luxury_brands)]
        
        if len(luxury_claims) > 0:
            # Group by brand and calculate statistics
            luxury_stats = luxury_claims.groupby('Brand').agg(
                claim_count=('Claim #', 'count'),
                total_paid=('Paid Amount', 'sum'),
                avg_paid=('Paid Amount', 'mean'),
                max_paid=('Paid Amount', 'max')
            ).reset_index().sort_values('total_paid', ascending=False)
            
            self.results['luxury_vehicle_patterns'] = {
                'luxury_stats': luxury_stats,
                'claims': luxury_claims
            }
            
            # Save to CSV
            luxury_stats.to_csv(f"{self.output_dir}/luxury_vehicle_stats.csv", index=False)
            luxury_claims.to_csv(f"{self.output_dir}/luxury_vehicle_claims.csv", index=False)
            
            print(f"Found {len(luxury_claims)} claims for luxury vehicles")
            return luxury_stats
        else:
            print("No luxury vehicle claims found")
            return pd.DataFrame()
    
    def detect_coverage_type_patterns(self) -> pd.DataFrame:
        """
        Detect patterns of specific coverage types with high claim rates
        
        Returns:
            DataFrame with coverage types and their claim statistics
        """
        # Group by coverage type and calculate statistics
        coverage_stats = self.data.groupby('Coverage').agg(
            claim_count=('Claim #', 'count'),
            total_paid=('Paid Amount', 'sum'),
            avg_paid=('Paid Amount', 'mean'),
            max_paid=('Paid Amount', 'max')
        ).reset_index().sort_values('total_paid', ascending=False)
        
        self.results['coverage_type_patterns'] = coverage_stats
        
        # Save to CSV
        coverage_stats.to_csv(f"{self.output_dir}/coverage_type_stats.csv", index=False)
        
        print(f"Analyzed {len(coverage_stats)} different coverage types")
        return coverage_stats
    
    def generate_summary_report(self) -> Dict:
        """
        Generate a summary report of all risk detection results
        
        Returns:
            Dictionary with summary statistics
        """
        summary = {
            'total_claims': len(self.data),
            'total_paid': self.data['Paid Amount'].sum(),
            'avg_claim_amount': self.data['Paid Amount'].mean(),
            'max_claim_amount': self.data['Paid Amount'].max(),
            'unique_vins': self.data['VIN'].nunique(),
            'unique_dealers': self.data['Selling Dealer'].nunique(),
            'risk_patterns': {}
        }
        
        # Add risk pattern counts
        if 'multiple_claims_per_vin' in self.results:
            summary['risk_patterns']['multiple_claims_per_vin'] = {
                'vins_flagged': self.results['multiple_claims_per_vin']['VIN'].nunique(),
                'claims_flagged': len(self.results['multiple_claims_per_vin'])
            }
        
        if 'high_dollar_claims' in self.results:
            summary['risk_patterns']['high_dollar_claims'] = {
                'claims_flagged': len(self.results['high_dollar_claims']),
                'total_amount': self.results['high_dollar_claims']['Paid Amount'].sum()
            }
        
        if 'multiple_dealers_per_vin' in self.results:
            summary['risk_patterns']['multiple_dealers_per_vin'] = {
                'vins_flagged': self.results['multiple_dealers_per_vin']['VIN'].nunique(),
                'claims_flagged': len(self.results['multiple_dealers_per_vin'])
            }
        
        if 'repeated_claims_timeframe' in self.results:
            summary['risk_patterns']['repeated_claims_timeframe'] = {
                'vins_flagged': self.results['repeated_claims_timeframe']['VIN'].nunique(),
                'claims_flagged': len(self.results['repeated_claims_timeframe'])
            }
        
        if 'high_claims_per_dealer' in self.results:
            summary['risk_patterns']['high_claims_per_dealer'] = {
                'dealers_flagged': len(self.results['high_claims_per_dealer']['dealer_stats']),
                'claims_flagged': len(self.results['high_claims_per_dealer']['claims'])
            }
        
        if 'luxury_vehicle_patterns' in self.results:
            summary['risk_patterns']['luxury_vehicle_patterns'] = {
                'brands_flagged': len(self.results['luxury_vehicle_patterns']['luxury_stats']),
                'claims_flagged': len(self.results['luxury_vehicle_patterns']['claims'])
            }
        
        if 'coverage_type_patterns' in self.results:
            summary['risk_patterns']['coverage_type_patterns'] = {
                'coverage_types': len(self.results['coverage_type_patterns'])
            }
        
        # Save summary to file
        with open(f"{self.output_dir}/summary_report.txt", 'w') as f:
            f.write("HIGH RISK PATTERN DETECTION SUMMARY\n")
            f.write("===================================\n\n")
            f.write(f"Total Claims Analyzed: {summary['total_claims']}\n")
            f.write(f"Total Amount Paid: ${summary['total_paid']:.2f}\n")
            f.write(f"Average Claim Amount: ${summary['avg_claim_amount']:.2f}\n")
            f.write(f"Maximum Claim Amount: ${summary['max_claim_amount']:.2f}\n")
            f.write(f"Unique VINs: {summary['unique_vins']}\n")
            f.write(f"Unique Dealers: {summary['unique_dealers']}\n\n")
            
            f.write("RISK PATTERNS DETECTED\n")
            f.write("=====================\n\n")
            
            for pattern, stats in summary['risk_patterns'].items():
                f.write(f"{pattern.replace('_', ' ').title()}:\n")
                for key, value in stats.items():
                    f.write(f"  - {key.replace('_', ' ').title()}: {value}\n")
                f.write("\n")
        
        return summary
    
    def run_all_detections(self) -> Dict:
        """
        Run all risk detection algorithms and generate summary
        
        Returns:
            Dictionary with summary statistics
        """
        print("Starting risk pattern detection...")
        
        # Load data if not already loaded
        if self.data is None:
            self.load_data()
        
        # Run all detection algorithms
        self.detect_multiple_claims_per_vin()
        self.detect_high_dollar_claims()
        self.detect_multiple_dealers_per_vin()
        self.detect_repeated_claims_timeframe()
        self.detect_high_claims_per_dealer()
        self.detect_luxury_vehicle_patterns()
        self.detect_coverage_type_patterns()
        
        # Generate summary report
        summary = self.generate_summary_report()
        
        print(f"Risk detection complete. Results saved to {self.output_dir}/")
        return summary

def main():
    """Main function to run the risk detection system"""
    if len(sys.argv) > 1:
        file_path = sys.argv[1]
    else:
        file_path = "Ascension Claims Inception 8.7.25.xlsx"  # Default file name
    
    detector = RiskDetector(file_path)
    detector.run_all_detections()

if __name__ == "__main__":
    main()