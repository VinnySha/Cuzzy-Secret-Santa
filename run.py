#!/usr/bin/env python3
"""
Run script for Flask app
Run from project root: python run.py
"""

import sys
import os

# Add server directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "server"))

from app import app

# This is needed for gunicorn
application = app

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))  # Changed default to 5001 to avoid AirPlay conflict
    app.run(host="0.0.0.0", port=port, debug=True)

