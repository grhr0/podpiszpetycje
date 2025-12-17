import sys
import os

# Add the current directory to sys.path so we can import from core
sys.path.append(os.getcwd())

from core.services.signature_verifier import verify_signature

# The new file path provided by the user
file_path = "/Users/jakubnowak/.gemini/antigravity/brain/244016a1-d42f-4817-8500-de99aac2a01e/wykaz-poparcia-92092711319 (21) (1).pdf"

try:
    with open(file_path, 'rb') as f:
        print(f"Testing file: {file_path}")
        is_valid, message, info = verify_signature(f)
        print(f"Valid: {is_valid}")
        print(f"Message: {message}")
        print(f"Info: {info}")
except FileNotFoundError:
    print(f"File not found: {file_path}")
except Exception as e:
    print(f"An error occurred: {e}")
