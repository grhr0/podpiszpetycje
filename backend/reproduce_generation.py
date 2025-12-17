import sys
import os

# Add backend to path
sys.path.append(os.getcwd())

print(f"CWD: {os.getcwd()}")

try:
    from core.services import pdf_generator
    print("Successfully imported pdf_generator")
    print(f"pdf_generator.FONT_PATH: {pdf_generator.FONT_PATH}")
    
    # Try generating
    data = {'full_name': 'Test', 'address': 'Test', 'pesel': '12345678901'}
    buffer = pdf_generator.generate_signature_pdf(data)
    print(f"Generated PDF size: {len(buffer.getvalue())}")
    
except ImportError as e:
    print(f"ImportError: {e}")
except RuntimeError as e:
    print(f"RuntimeError: {e}")
except Exception as e:
    print(f"Exception: {e}")
