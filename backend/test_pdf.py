import requests

data = {
    "full_name": "Jan Kowalski",
    "address": "ul. Testowa 1, 60-101 Poznań",
    "pesel": "90010100000" # Invalid checksum? 900101 00000. 
    # Checksum: 1*9 + 3*0 + 7*0 + 9*1 + 1*0 + 3*1 + 7*0 + 9*0 + 1*0 + 3*0
    # = 9 + 0 + 0 + 9 + 0 + 3 + 0 + 0 + 0 + 0 = 21. 
    # Control = (10 - 21%10)%10 = (10-1)%10 = 9.
    # So valid PESEL ending in 9: 90010100009
}
# Using a known valid pesel generator logic or simple valid one:
# 44051401359 (Test PESEL)
data = {
    "full_name": "Jan Kowalski",
    "address": "ul. Testowa 1, 60-101 Poznań",
    "pesel": "44051401359" 
}

try:
    response = requests.post("http://127.0.0.1:8000/api/generate-pdf/", json=data)
    if response.status_code == 200:
        with open("test_output.pdf", "wb") as f:
            f.write(response.content)
        print("Success: PDF saved to test_output.pdf")
    else:
        print(f"Error: {response.status_code} - {response.text}")
except Exception as e:
    print(f"Failed to connect: {e}")
