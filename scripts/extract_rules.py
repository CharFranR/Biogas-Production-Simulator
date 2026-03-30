import sys
import re

def search_pdf_text(filename, pdf_name, keywords):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    pages = content.split('\x0c')
    results = []
    
    for page_num, page_text in enumerate(pages, 1):
        lines = page_text.split('\n')
        for i, line in enumerate(lines):
            for kw in keywords:
                if re.search(r'\b' + kw + r'\b', line, re.IGNORECASE):
                    # Get context
                    start = max(0, i - 1)
                    end = min(len(lines), i + 2)
                    quote = " ".join([l.strip() for l in lines[start:end] if l.strip()])
                    if len(quote) > 20 and quote not in [r[3] for r in results]:
                        results.append((pdf_name, page_num, kw, quote))
                        break
    
    return results

keywords = ["temperatura", "pH", "sólidos", "HRT", "TRT", "carga", "C/N", "inhibición", "amoniaco", "acidez", "retención", "volátil"]
all_results = []
all_results.extend(search_pdf_text('biodig.txt', 'Biodigestores.pdf', keywords))
all_results.extend(search_pdf_text('coro.txt', 'Coronado2010.pdf', keywords))
all_results.extend(search_pdf_text('dialnet.txt', 'Dialnet-Biodigestores-4835857.pdf', keywords))

# Print first 50 matches to select from
for r in all_results[:50]:
    print(f"[{r[0]} | Pag {r[1]} | {r[2]}] {r[3][:150]}...")
