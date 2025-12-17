import io
import os
from django.conf import settings
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.units import mm

# Register Polish-compatible font
# safer path resolution
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
FONT_PATH = os.path.join(BASE_DIR, 'core', 'assets', 'fonts', 'Arial.ttf')

# Force basic checks
if not os.path.exists(FONT_PATH):
    raise RuntimeError(f"Font file missing at: {FONT_PATH}")

pdfmetrics.registerFont(TTFont('Arial', FONT_PATH))
font_regular = 'Arial'
font_bold = 'Arial' 

def generate_signature_pdf(data):
    """
    Generates a PDF buffer mimicking the "Wykaz Podpisów" form.
    Data contains: full_name, address, pesel.
    """
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    
    # Header
    c.setFont(font_bold, 14)
    c.drawCentredString(width / 2, height - 20*mm, "WYKAZ PODPISÓW")
    c.setFont(font_regular, 10)
    c.drawCentredString(width / 2, height - 30*mm, "Mieszkańców Poznania popierających inicjatywę uchwałodawczą")
    
    # Table Header logic (simplified for placeholder)
    y_start = height - 50*mm
    row_height = 10*mm
    
    # Col positions
    col_no = 20*mm
    col_name = 30*mm
    col_address = 80*mm
    col_pesel = 130*mm
    col_sig = 170*mm
    
    c.line(10*mm, y_start, 200*mm, y_start)
    c.drawString(col_no, y_start + 2*mm, "Lp.")
    c.drawString(col_name, y_start + 2*mm, "Imię i nazwisko")
    c.drawString(col_address, y_start + 2*mm, "Adres zamieszkania")
    c.drawString(col_pesel, y_start + 2*mm, "PESEL")
    c.drawString(col_sig, y_start + 2*mm, "Podpis")
    c.line(10*mm, y_start + 6*mm, 200*mm, y_start + 6*mm) # Header top line? No, simplified.
    
    # Draw Row 1 with User Data
    y_row = y_start - row_height
    c.setFont(font_regular, 10)
    c.drawString(col_no, y_row + 3*mm, "1")
    c.drawString(col_name, y_row + 3*mm, data.get('full_name', ''))
    c.drawString(col_address, y_row + 3*mm, data.get('address', ''))
    c.drawString(col_pesel, y_row + 3*mm, data.get('pesel', ''))
    
    # Grid lines
    c.line(10*mm, y_row, 200*mm, y_row) # Bottom of row
    
    # Add empty rows
    for i in range(1, 10):
        y = y_row - (i * row_height)
        c.drawString(col_no, y + 3*mm, str(i + 1))
        c.line(10*mm, y, 200*mm, y)

    # Footer instructions
    c.setFont(font_regular, 8)
    c.drawString(20*mm, 20*mm, "Wyrażam zgodę na przetwarzanie moich danych osobowych...")
    
    c.showPage()
    c.save()
    buffer.seek(0)
    return buffer
