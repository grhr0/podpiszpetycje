import requests
import sys

API_URL = 'http://127.0.0.1:8000/api/generate-pdf/'
# This PESEL corresponds to the one used in the previous verification task, so it exists in DB
PESEL = '92092711319'

def test_generate():
    data = {
        'full_name': 'Jan Kowalski',
        'address': 'Warszawa',
        'pesel': PESEL
    }
    print(f"Requesting PDF for PESEL: {PESEL}")
    response = requests.post(API_URL, data=data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.text}")

if __name__ == '__main__':
    test_generate()
