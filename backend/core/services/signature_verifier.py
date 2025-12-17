from pyhanko.sign import validation
from pyhanko.pdf_utils.reader import PdfFileReader
from pyhanko.sign.general import load_certs_from_pemder
import io

def verify_signature(pdf_file_obj):
    """
    Verifies the signature of the uploaded PDF.
    Returns (is_valid, validation_status, signer_info).
    
    NOTE: In a real production environment, you must configure a trusted
    ROOT CA store (NCCert for Poland) to validate the chain.
    For this prototype, we'll implement the structure.
    """
    try:
        # Create a validation context.
        # For a strict check, we would need to load trusted roots (e.g., from NCCert).
        # For this prototype, we use a basic context which might fail chain validation 
        # if roots aren't provided, but we catch that or interpret the result leniently 
        # if we only care about integrity for now.
        root = validation.ValidationContext(allow_fetching=True)
        
        pdf = PdfFileReader(pdf_file_obj)
        if len(pdf.embedded_signatures) == 0:
            return False, "No signature found", {}
            
        sig_result = pdf.embedded_signatures[0]
        status = validation.validate_pdf_signature(sig_result, root)
        
        # Check integrity - this is the most critical part: has the document been modified?
        if not status.intact:
            return False, "Signature not intact (document modified)", {}
            
        # For this prototype/demo, we might accept self-signed or untrusted roots 
        # if the integrity is fine. Ideally, status.valid should be True.
        # If status.valid is False, it often means the certificate chain isn't trusted.
        # We'll return the specific error message but for now, if it's intact, 
        # we might want to be lenient OR just report the trust issue.
        # Let's return the actual status validity but be descriptive.
        
        if not status.valid:
             # Just saying "Signature invalid" is vague. 
             # status.summary() or similar might give info on why (e.g. untrusted).
             # We'll allow it if it's just 'trusted' status failing in DEV mode, 
             # but here we stick to the return value.
             return False, f"Signature invalid: {status.summary()}", {}
            
        # Extract signer info
        # Extract signer info
        cert = sig_result.signer_cert
        
        # Get dictionary of Subject attributes (asn1crypto)
        subj_dict = cert.subject.native
        
        signer_info = {
            "subject": cert.subject.human_friendly,
            "common_name": subj_dict.get('common_name'),
            "serial_number": subj_dict.get('serial_number'),
            "organization": subj_dict.get('organization_name'),
            "country": subj_dict.get('country_name')
        }
        
        # Extra extraction of PESEL from Serial Number (Polish Standard: PNOPL-PESEL)
        pesel = None
        sn = signer_info.get('serial_number')
        if sn and isinstance(sn, str) and 'PNOPL-' in sn:
            try:
                # Example: PNOPL-90010100000
                parts = sn.split('PNOPL-')
                if len(parts) > 1:
                    raw_pesel = parts[1]
                    # Simple validation - just digits and length, though regex would be safer
                    if raw_pesel.isdigit() and len(raw_pesel) == 11:
                        pesel = raw_pesel
            except Exception:
                pass 
        
        signer_info['pesel'] = pesel
        
        return True, "Valid", signer_info
        
    except Exception as e:
        return False, str(e), {}
