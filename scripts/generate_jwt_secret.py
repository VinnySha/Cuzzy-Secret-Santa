#!/usr/bin/env python3
"""
Generate a secure random JWT secret key for production use.
Run this script to generate a secure secret key for your JWT_SECRET environment variable.
"""

import secrets
import string

def generate_secret(length=64):
    """Generate a secure random secret key."""
    # Use alphanumeric + safe special characters only
    # Excludes: ; & | < > ` $ " ' \ ( ) [ ] { } * ? ~ ! # @
    # Includes: letters, numbers, and safe punctuation
    safe_chars = string.ascii_letters + string.digits + "-_+=%"
    secret = ''.join(secrets.choice(safe_chars) for _ in range(length))
    return secret

if __name__ == "__main__":
    secret = generate_secret()
    print("\n" + "="*70)
    print("🔐 Generated JWT Secret Key")
    print("="*70)
    print(f"\n{secret}\n")
    print("="*70)
    print("⚠️  IMPORTANT: Copy this secret and add it to your environment variables!")
    print("   Use this as your JWT_SECRET in Render (or your deployment platform)")
    print("="*70 + "\n")