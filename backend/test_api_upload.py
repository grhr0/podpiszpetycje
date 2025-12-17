import requests
import sys

API_URL = 'http://127.0.0.1:8000/api/verify-pdf/'
FILE_PATH = "/Users/jakubnowak/.gemini/antigravity/brain/244016a1-d42f-4817-8500-de99aac2a01e/wykaz-poparcia-92092711319 (21) (1).pdf"

def test_upload():
    try:
        with open(FILE_PATH, 'rb') as f:
            files = {'file': f}
            data = {
                'full_name': 'Jan Kowalski',
                'address': 'Warszawa, Zielona 1',
                'pesel': '92092711319' # Matches certificate
            }
            print(f"Sending request to {API_URL}...")
            response = requests.post(API_URL, files=files, data=data)
            
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    test_upload()
