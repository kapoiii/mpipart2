import zipfile
import xml.etree.ElementTree as ET
import sys

def extract_text_from_docx(docx_path):
    try:
        # A docx is a zip file
        with zipfile.ZipFile(docx_path) as docx:
            # The main text is in word/document.xml
            xml_content = docx.read('word/document.xml')
            
            tree = ET.fromstring(xml_content)
            
            # The namespace for Word XML
            namespaces = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            # Find all text nodes
            texts = tree.findall('.//w:t', namespaces)
            
            # Extract and join the text
            result = [t.text for t in texts if t.text]
            with open('extracted_template.txt', 'w', encoding='utf-8') as f:
                f.write('\n'.join(result))
            print("Extracted to extracted_template.txt")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        extract_text_from_docx(sys.argv[1])
    else:
        print("Please provide a path to a docx file.")
