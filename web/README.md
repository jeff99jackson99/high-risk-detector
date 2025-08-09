# High Risk Pattern Detection System - Web Interface

A web-based interface for detecting high-risk patterns in claims data, developed by Jeff Jackson.

## Overview

This web application allows users to upload claims data in Excel format and analyze it for potential fraud patterns, high-risk behaviors, and unusual claim activities. The system provides interactive visualizations and detailed reports to help identify suspicious patterns that may require further investigation.

## Features

- **File Upload**: Drag and drop or select Excel files containing claims data
- **Customizable Detection Settings**: Adjust thresholds for different risk patterns
- **Interactive Visualizations**: Charts and graphs for each risk pattern
- **Detailed Tables**: Sortable and searchable tables with claim details
- **Export Functionality**: Download results as CSV or HTML reports
- **Responsive Design**: Works on desktop and mobile devices

## Risk Detection Capabilities

The system detects the following high-risk patterns:

1. **Multiple Claims per VIN**: Identifies vehicles with multiple claims above a threshold
2. **High Dollar Claims**: Detects claims with unusually high payment amounts
3. **Multiple Dealers per VIN**: Flags vehicles with claims from multiple selling dealers
4. **Repeated Claims Timeframe**: Identifies vehicles with multiple claims within a short timeframe
5. **High Claims per Dealer**: Detects selling dealers with high claim frequency or amounts
6. **Luxury Vehicle Patterns**: Analyzes luxury vehicles for excessive claim amounts
7. **Coverage Type Patterns**: Identifies patterns of specific coverage types with high claim rates

## Usage

1. Open the web application in your browser
2. Upload your claims data Excel file using the upload area
3. Adjust detection settings if needed
4. Click "Analyze Data" to process the file
5. Explore the results using the tabs and interactive elements
6. Download reports or specific data as needed

## Technical Details

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Processing**: Client-side JavaScript
- **Visualization**: Chart.js
- **Excel Parsing**: SheetJS (xlsx)
- **Deployment**: GitHub Pages

## Privacy & Security

- All data processing happens in your browser
- No data is sent to any server
- Your claims data never leaves your computer

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Development

### Local Development

To run the application locally:

1. Clone this repository
2. Open the `index.html` file in your browser

### Building & Deployment

The application is automatically deployed to GitHub Pages when changes are pushed to the main branch.

## License

This software is proprietary and confidential. Unauthorized copying, transferring or reproduction of the contents, in any medium, is strictly prohibited.

© 2025 Jeff Jackson. All rights reserved.