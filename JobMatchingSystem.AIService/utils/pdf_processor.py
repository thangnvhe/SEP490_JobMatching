import tempfile
import os
from typing import Optional, Tuple
import PyPDF2
from config.config import Config


class PDFProcessor:
    """Utility class for PDF processing"""
    
    @staticmethod
    def extract_text_from_bytes(pdf_bytes: bytes) -> str:
        """Extract text from PDF bytes"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(pdf_bytes)
                tmp_path = tmp.name

            reader = PyPDF2.PdfReader(tmp_path)
            text = ""
            
            for page in reader.pages:
                try:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
                except Exception as e:
                    print(f"Error extracting text from page: {e}")
                    continue
            
            # Clean up temp file
            os.unlink(tmp_path)
            
            return text.strip()
            
        except Exception as e:
            print(f"Error processing PDF: {e}")
            return ""
    
    @staticmethod
    def validate_pdf_file(file_content: bytes, filename: str) -> Tuple[bool, Optional[str]]:
        """Validate PDF file size, type, and content"""
        
        # Check file extension
        if not filename.lower().endswith('.pdf'):
            return False, "File must be a PDF (.pdf extension required)"
        
        # Check file size (in MB)
        file_size_mb = len(file_content) / (1024 * 1024)
        if file_size_mb > Config.PDF_MAX_SIZE_MB:
            return False, f"File size ({file_size_mb:.1f}MB) exceeds limit ({Config.PDF_MAX_SIZE_MB}MB)"
        
        # Check if file is empty
        if len(file_content) == 0:
            return False, "File is empty"
        
        # Try to extract text to verify it's a valid PDF
        try:
            text = PDFProcessor.extract_text_from_bytes(file_content)
            if len(text) < Config.PDF_MIN_TEXT_LENGTH:
                return False, f"PDF contains insufficient text content (minimum {Config.PDF_MIN_TEXT_LENGTH} characters required)"
        except Exception as e:
            return False, f"Invalid PDF file or corrupted: {str(e)}"
        
        return True, None
    
    @staticmethod
    def get_pdf_info(file_content: bytes, filename: str) -> dict:
        """Get basic information about the PDF file"""
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                tmp.write(file_content)
                tmp_path = tmp.name

            reader = PyPDF2.PdfReader(tmp_path)
            
            info = {
                "filename": filename,
                "file_size_mb": len(file_content) / (1024 * 1024),
                "num_pages": len(reader.pages),
                "text_length": 0,
                "has_metadata": False
            }
            
            # Extract text length
            text = PDFProcessor.extract_text_from_bytes(file_content)
            info["text_length"] = len(text)
            
            # Check for metadata
            if reader.metadata:
                info["has_metadata"] = True
                info["metadata"] = {
                    "title": reader.metadata.get('/Title', ''),
                    "author": reader.metadata.get('/Author', ''),
                    "creator": reader.metadata.get('/Creator', '')
                }
            
            # Clean up
            os.unlink(tmp_path)
            
            return info
            
        except Exception as e:
            return {
                "filename": filename,
                "file_size_mb": len(file_content) / (1024 * 1024),
                "error": f"Could not analyze PDF: {str(e)}"
            }