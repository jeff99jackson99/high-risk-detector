#!/usr/bin/env python3
"""
Setup script for the High Risk Pattern Detection System
Created by Jeff Jackson
"""

from setuptools import setup, find_packages

setup(
    name="high_risk_detector",
    version="1.0.0",
    description="A system for detecting high-risk patterns in claims data",
    author="Jeff Jackson",
    author_email="jeff.jackson@example.com",
    packages=find_packages(),
    install_requires=[
        "pandas",
        "numpy",
        "matplotlib",
        "seaborn",
        "openpyxl",
    ],
    entry_points={
        "console_scripts": [
            "risk-detector=run_risk_detection:main",
        ],
    },
    classifiers=[
        "Development Status :: 5 - Production/Stable",
        "Intended Audience :: Financial and Insurance Industry",
        "Topic :: Office/Business :: Financial",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.6",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
    ],
    python_requires=">=3.6",
)