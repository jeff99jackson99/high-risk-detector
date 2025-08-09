#!/usr/bin/env python3
"""
High Risk Pattern Detection System - Main Script
Created by Jeff Jackson

This script runs the risk detection system on claims data to identify potential fraud patterns.
"""

import os
import sys
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from risk_detector import RiskDetector
import argparse
from datetime import datetime

def create_visualizations(detector):
    """Create visualizations from the risk detection results"""
    print("Generating visualizations...")
    
    # Create visualizations directory
    viz_dir = os.path.join(detector.output_dir, "visualizations")
    if not os.path.exists(viz_dir):
        os.makedirs(viz_dir)
    
    # Set the style for all visualizations
    sns.set(style="whitegrid")
    
    # 1. Multiple Claims per VIN
    if 'multiple_claims_per_vin' in detector.results:
        plt.figure(figsize=(12, 8))
        vin_counts = detector.results['multiple_claims_per_vin'].groupby('VIN').size().sort_values(ascending=False)
        
        if len(vin_counts) > 0:
            ax = sns.barplot(x=vin_counts.index[:15], y=vin_counts.values[:15])
            plt.title('Top 15 VINs by Claim Count')
            plt.xlabel('VIN')
            plt.ylabel('Number of Claims')
            plt.xticks(rotation=90)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'multiple_claims_per_vin.png'))
            plt.close()
    
    # 2. High Dollar Claims
    if 'high_dollar_claims' in detector.results:
        plt.figure(figsize=(12, 8))
        high_claims = detector.results['high_dollar_claims'].sort_values('Paid Amount', ascending=False)
        
        if len(high_claims) > 0:
            ax = sns.barplot(x=high_claims['Claim #'][:15], y=high_claims['Paid Amount'][:15])
            plt.title('Top 15 Claims by Paid Amount')
            plt.xlabel('Claim Number')
            plt.ylabel('Paid Amount ($)')
            plt.xticks(rotation=90)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'high_dollar_claims.png'))
            plt.close()
    
    # 3. High Claims per Dealer
    if 'high_claims_per_dealer' in detector.results:
        dealer_stats = detector.results['high_claims_per_dealer']['dealer_stats']
        
        if len(dealer_stats) > 0:
            # 3.1 Dealer by Claim Count
            plt.figure(figsize=(14, 8))
            dealer_count = dealer_stats.sort_values('claim_count', ascending=False)
            ax = sns.barplot(x=dealer_count['Selling Dealer'][:15], y=dealer_count['claim_count'][:15])
            plt.title('Top 15 Dealers by Claim Count')
            plt.xlabel('Dealer')
            plt.ylabel('Number of Claims')
            plt.xticks(rotation=90)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'dealer_claim_count.png'))
            plt.close()
            
            # 3.2 Dealer by Total Paid
            plt.figure(figsize=(14, 8))
            dealer_paid = dealer_stats.sort_values('total_paid', ascending=False)
            ax = sns.barplot(x=dealer_paid['Selling Dealer'][:15], y=dealer_paid['total_paid'][:15])
            plt.title('Top 15 Dealers by Total Paid Amount')
            plt.xlabel('Dealer')
            plt.ylabel('Total Paid Amount ($)')
            plt.xticks(rotation=90)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'dealer_total_paid.png'))
            plt.close()
    
    # 4. Luxury Vehicle Patterns
    if 'luxury_vehicle_patterns' in detector.results:
        luxury_stats = detector.results['luxury_vehicle_patterns']['luxury_stats']
        
        if len(luxury_stats) > 0:
            # 4.1 Luxury Brands by Total Paid
            plt.figure(figsize=(12, 8))
            ax = sns.barplot(x=luxury_stats['Brand'], y=luxury_stats['total_paid'])
            plt.title('Luxury Brands by Total Paid Amount')
            plt.xlabel('Brand')
            plt.ylabel('Total Paid Amount ($)')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'luxury_brands_total_paid.png'))
            plt.close()
            
            # 4.2 Luxury Brands by Average Paid
            plt.figure(figsize=(12, 8))
            ax = sns.barplot(x=luxury_stats['Brand'], y=luxury_stats['avg_paid'])
            plt.title('Luxury Brands by Average Paid Amount')
            plt.xlabel('Brand')
            plt.ylabel('Average Paid Amount ($)')
            plt.xticks(rotation=45)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'luxury_brands_avg_paid.png'))
            plt.close()
    
    # 5. Coverage Type Patterns
    if 'coverage_type_patterns' in detector.results:
        coverage_stats = detector.results['coverage_type_patterns']
        
        if len(coverage_stats) > 0:
            # 5.1 Coverage Types by Total Paid
            plt.figure(figsize=(14, 8))
            ax = sns.barplot(x=coverage_stats['Coverage'], y=coverage_stats['total_paid'])
            plt.title('Coverage Types by Total Paid Amount')
            plt.xlabel('Coverage Type')
            plt.ylabel('Total Paid Amount ($)')
            plt.xticks(rotation=90)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'coverage_types_total_paid.png'))
            plt.close()
            
            # 5.2 Coverage Types by Claim Count
            plt.figure(figsize=(14, 8))
            ax = sns.barplot(x=coverage_stats['Coverage'], y=coverage_stats['claim_count'])
            plt.title('Coverage Types by Claim Count')
            plt.xlabel('Coverage Type')
            plt.ylabel('Number of Claims')
            plt.xticks(rotation=90)
            plt.tight_layout()
            plt.savefig(os.path.join(viz_dir, 'coverage_types_claim_count.png'))
            plt.close()
    
    print(f"Visualizations saved to {viz_dir}/")

def generate_html_report(detector):
    """Generate an HTML report from the risk detection results"""
    print("Generating HTML report...")
    
    html_file = os.path.join(detector.output_dir, "risk_report.html")
    
    # Get current date and time
    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    
    # Start building HTML content
    html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>High Risk Pattern Detection Report</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 20px;
                color: #333;
            }}
            .container {{
                max-width: 1200px;
                margin: 0 auto;
            }}
            h1, h2, h3 {{
                color: #2c3e50;
            }}
            h1 {{
                border-bottom: 2px solid #3498db;
                padding-bottom: 10px;
            }}
            h2 {{
                border-bottom: 1px solid #bdc3c7;
                padding-bottom: 5px;
                margin-top: 30px;
            }}
            table {{
                border-collapse: collapse;
                width: 100%;
                margin: 20px 0;
            }}
            th, td {{
                text-align: left;
                padding: 12px;
                border-bottom: 1px solid #ddd;
            }}
            th {{
                background-color: #f2f2f2;
            }}
            tr:hover {{
                background-color: #f5f5f5;
            }}
            .summary-box {{
                background-color: #f8f9fa;
                border-left: 4px solid #3498db;
                padding: 15px;
                margin: 20px 0;
            }}
            .risk-section {{
                margin: 30px 0;
                padding: 15px;
                border: 1px solid #ddd;
                border-radius: 5px;
            }}
            .risk-high {{
                border-left: 5px solid #e74c3c;
            }}
            .risk-medium {{
                border-left: 5px solid #f39c12;
            }}
            .risk-low {{
                border-left: 5px solid #2ecc71;
            }}
            .visualization {{
                max-width: 100%;
                height: auto;
                margin: 20px 0;
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>High Risk Pattern Detection Report</h1>
            <p>Generated on: {now}</p>
            
            <div class="summary-box">
                <h2>Summary Statistics</h2>
                <p>Total Claims Analyzed: {len(detector.data)}</p>
                <p>Total Amount Paid: ${detector.data['Paid Amount'].sum():.2f}</p>
                <p>Average Claim Amount: ${detector.data['Paid Amount'].mean():.2f}</p>
                <p>Maximum Claim Amount: ${detector.data['Paid Amount'].max():.2f}</p>
                <p>Unique VINs: {detector.data['VIN'].nunique()}</p>
                <p>Unique Dealers: {detector.data['Selling Dealer'].nunique()}</p>
            </div>
    """
    
    # Add Multiple Claims per VIN section
    if 'multiple_claims_per_vin' in detector.results:
        multiple_claims = detector.results['multiple_claims_per_vin']
        vin_counts = multiple_claims.groupby('VIN').size().sort_values(ascending=False)
        
        html_content += f"""
            <div class="risk-section risk-high">
                <h2>Multiple Claims per VIN</h2>
                <p>Found {multiple_claims['VIN'].nunique()} VINs with multiple claims</p>
                
                <h3>Top VINs by Claim Count</h3>
                <table>
                    <tr>
                        <th>VIN</th>
                        <th>Claim Count</th>
                        <th>Total Paid</th>
                        <th>Vehicle</th>
                    </tr>
        """
        
        # Add top 10 VINs by claim count
        for vin, count in vin_counts.head(10).items():
            vin_data = multiple_claims[multiple_claims['VIN'] == vin]
            total_paid = vin_data['Paid Amount'].sum()
            vehicle = vin_data['Vehicle'].iloc[0]
            
            html_content += f"""
                    <tr>
                        <td>{vin}</td>
                        <td>{count}</td>
                        <td>${total_paid:.2f}</td>
                        <td>{vehicle}</td>
                    </tr>
            """
        
        html_content += """
                </table>
                
                <h3>Visualization</h3>
                <img src="visualizations/multiple_claims_per_vin.png" alt="Multiple Claims per VIN" class="visualization">
            </div>
        """
    
    # Add High Dollar Claims section
    if 'high_dollar_claims' in detector.results:
        high_claims = detector.results['high_dollar_claims'].sort_values('Paid Amount', ascending=False)
        
        html_content += f"""
            <div class="risk-section risk-high">
                <h2>High Dollar Claims</h2>
                <p>Found {len(high_claims)} high dollar claims</p>
                
                <h3>Top High Dollar Claims</h3>
                <table>
                    <tr>
                        <th>Claim #</th>
                        <th>Paid Amount</th>
                        <th>VIN</th>
                        <th>Vehicle</th>
                        <th>Selling Dealer</th>
                    </tr>
        """
        
        # Add top high dollar claims
        for _, row in high_claims.head(10).iterrows():
            html_content += f"""
                    <tr>
                        <td>{row['Claim #']}</td>
                        <td>${row['Paid Amount']:.2f}</td>
                        <td>{row['VIN']}</td>
                        <td>{row['Vehicle']}</td>
                        <td>{row['Selling Dealer']}</td>
                    </tr>
            """
        
        html_content += """
                </table>
                
                <h3>Visualization</h3>
                <img src="visualizations/high_dollar_claims.png" alt="High Dollar Claims" class="visualization">
            </div>
        """
    
    # Add Multiple Dealers per VIN section
    if 'multiple_dealers_per_vin' in detector.results:
        multi_dealer = detector.results['multiple_dealers_per_vin']
        
        html_content += f"""
            <div class="risk-section risk-high">
                <h2>Multiple Dealers per VIN</h2>
                <p>Found {multi_dealer['VIN'].nunique()} VINs with claims from multiple dealers</p>
                
                <h3>VINs with Multiple Dealers</h3>
                <table>
                    <tr>
                        <th>VIN</th>
                        <th>Vehicle</th>
                        <th>Dealers</th>
                        <th>Claim Count</th>
                        <th>Total Paid</th>
                    </tr>
        """
        
        # Group by VIN
        for vin, group in multi_dealer.groupby('VIN'):
            dealers = ", ".join(group['Selling Dealer'].unique())
            vehicle = group['Vehicle'].iloc[0]
            claim_count = len(group)
            total_paid = group['Paid Amount'].sum()
            
            html_content += f"""
                    <tr>
                        <td>{vin}</td>
                        <td>{vehicle}</td>
                        <td>{dealers}</td>
                        <td>{claim_count}</td>
                        <td>${total_paid:.2f}</td>
                    </tr>
            """
        
        html_content += """
                </table>
            </div>
        """
    
    # Add High Claims per Dealer section
    if 'high_claims_per_dealer' in detector.results:
        dealer_stats = detector.results['high_claims_per_dealer']['dealer_stats'].sort_values('total_paid', ascending=False)
        
        html_content += f"""
            <div class="risk-section risk-medium">
                <h2>High Claims per Dealer</h2>
                <p>Found {len(dealer_stats)} dealers with high claim frequency or amounts</p>
                
                <h3>Top Dealers by Total Paid Amount</h3>
                <table>
                    <tr>
                        <th>Selling Dealer</th>
                        <th>Claim Count</th>
                        <th>Total Paid</th>
                        <th>Average Paid</th>
                    </tr>
        """
        
        # Add top dealers
        for _, row in dealer_stats.head(10).iterrows():
            html_content += f"""
                    <tr>
                        <td>{row['Selling Dealer']}</td>
                        <td>{row['claim_count']}</td>
                        <td>${row['total_paid']:.2f}</td>
                        <td>${row['avg_paid']:.2f}</td>
                    </tr>
            """
        
        html_content += """
                </table>
                
                <h3>Visualizations</h3>
                <img src="visualizations/dealer_total_paid.png" alt="Dealers by Total Paid" class="visualization">
                <img src="visualizations/dealer_claim_count.png" alt="Dealers by Claim Count" class="visualization">
            </div>
        """
    
    # Add Luxury Vehicle Patterns section
    if 'luxury_vehicle_patterns' in detector.results:
        luxury_stats = detector.results['luxury_vehicle_patterns']['luxury_stats']
        
        html_content += f"""
            <div class="risk-section risk-medium">
                <h2>Luxury Vehicle Patterns</h2>
                <p>Found {len(luxury_stats)} luxury brands with claims</p>
                
                <h3>Luxury Brands by Total Paid Amount</h3>
                <table>
                    <tr>
                        <th>Brand</th>
                        <th>Claim Count</th>
                        <th>Total Paid</th>
                        <th>Average Paid</th>
                        <th>Maximum Paid</th>
                    </tr>
        """
        
        # Add luxury brands
        for _, row in luxury_stats.iterrows():
            html_content += f"""
                    <tr>
                        <td>{row['Brand']}</td>
                        <td>{row['claim_count']}</td>
                        <td>${row['total_paid']:.2f}</td>
                        <td>${row['avg_paid']:.2f}</td>
                        <td>${row['max_paid']:.2f}</td>
                    </tr>
            """
        
        html_content += """
                </table>
                
                <h3>Visualizations</h3>
                <img src="visualizations/luxury_brands_total_paid.png" alt="Luxury Brands by Total Paid" class="visualization">
                <img src="visualizations/luxury_brands_avg_paid.png" alt="Luxury Brands by Average Paid" class="visualization">
            </div>
        """
    
    # Add Coverage Type Patterns section
    if 'coverage_type_patterns' in detector.results:
        coverage_stats = detector.results['coverage_type_patterns']
        
        html_content += f"""
            <div class="risk-section risk-low">
                <h2>Coverage Type Patterns</h2>
                <p>Analyzed {len(coverage_stats)} different coverage types</p>
                
                <h3>Coverage Types by Total Paid Amount</h3>
                <table>
                    <tr>
                        <th>Coverage Type</th>
                        <th>Claim Count</th>
                        <th>Total Paid</th>
                        <th>Average Paid</th>
                        <th>Maximum Paid</th>
                    </tr>
        """
        
        # Add coverage types
        for _, row in coverage_stats.iterrows():
            html_content += f"""
                    <tr>
                        <td>{row['Coverage']}</td>
                        <td>{row['claim_count']}</td>
                        <td>${row['total_paid']:.2f}</td>
                        <td>${row['avg_paid']:.2f}</td>
                        <td>${row['max_paid']:.2f}</td>
                    </tr>
            """
        
        html_content += """
                </table>
                
                <h3>Visualizations</h3>
                <img src="visualizations/coverage_types_total_paid.png" alt="Coverage Types by Total Paid" class="visualization">
                <img src="visualizations/coverage_types_claim_count.png" alt="Coverage Types by Claim Count" class="visualization">
            </div>
        """
    
    # Close HTML
    html_content += """
        </div>
    </body>
    </html>
    """
    
    # Write HTML to file
    with open(html_file, 'w') as f:
        f.write(html_content)
    
    print(f"HTML report saved to {html_file}")
    return html_file

def main():
    """Main function to run the risk detection system"""
    parser = argparse.ArgumentParser(description='High Risk Pattern Detection System for Claims Data')
    parser.add_argument('--file', '-f', default="Ascension Claims Inception 8.7.25.xlsx",
                        help='Path to the claims data Excel file')
    parser.add_argument('--output', '-o', default="risk_detection_results",
                        help='Directory to save results')
    parser.add_argument('--no-viz', action='store_true',
                        help='Skip visualization generation')
    parser.add_argument('--no-html', action='store_true',
                        help='Skip HTML report generation')
    
    args = parser.parse_args()
    
    print(f"Starting High Risk Pattern Detection on file: {args.file}")
    
    # Initialize detector
    detector = RiskDetector(args.file)
    detector.output_dir = args.output
    
    # Run all detections
    summary = detector.run_all_detections()
    
    # Generate visualizations
    if not args.no_viz:
        create_visualizations(detector)
    
    # Generate HTML report
    if not args.no_html:
        html_file = generate_html_report(detector)
        print(f"To view the HTML report, open: {html_file}")
    
    print("Risk detection process complete!")

if __name__ == "__main__":
    main()