import re

def search_more(filename, pdf_name):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    pages = content.split('\x0c')
    results = []
    
    for page_num, page_text in enumerate(pages, 1):
        lines = page_text.split('\n')
        for i, line in enumerate(lines):
            # focus on production, C/N, hydraulic retention time, volatile solids, etc
            if re.search(r'\b(C/N|TRH|relación|porcentaje|sólidos volátiles|sólidos totales|alcalinidad|ácidos grasos volátiles|AGV|metano)\b', line, re.IGNORECASE):
                if re.search(r'\b(debe|rango|óptimo|mayor|menor|entre|recomendable)\b', line, re.IGNORECASE):
                    start = max(0, i - 1)
                    end = min(len(lines), i + 2)
                    quote = " ".join([l.strip() for l in lines[start:end] if l.strip()])
                    if len(quote) > 30 and quote not in [r[2] for r in results]:
                        results.append((pdf_name, page_num, quote))
    
    return results

all_results = []
all_results.extend(search_more('biodig.txt', 'Biodigestores.pdf'))
all_results.extend(search_more('coro.txt', 'Coronado2010.pdf'))
all_results.extend(search_more('dialnet.txt', 'Dialnet-Biodigestores-4835857.pdf'))

for i, r in enumerate(all_results[:20]):
    print(f"--- Rule {i} ---")
    print(f"PDF: {r[0]}, Page: {r[1]}")
    print(f"Quote: {r[2]}\n")
