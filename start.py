#!/usr/bin/env python3
"""
Simple start script for Railway deployment
"""

import subprocess
import sys

def main():
    """Start the webhook bot"""
    try:
        print("🚀 Starting webhook bot...")
        subprocess.run([sys.executable, "bot_webhook.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error starting bot: {e}")
        sys.exit(1)
    except FileNotFoundError:
        print("❌ bot_webhook.py not found!")
        sys.exit(1)

if __name__ == '__main__':
    main()
