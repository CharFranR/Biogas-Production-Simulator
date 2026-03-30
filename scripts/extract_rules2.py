import re

def detailed_search(filename, pdf_name, keywords):
    with open(filename, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
    
    pages = content.split('\x0c')
    results = []
    
    for page_num, page_text in enumerate(pages, 1):
        lines = page_text.split('\n')
        for i, line in enumerate(lines):
            # look for rules/recommendations ("debe", "recomendable", "óptimo", "requiere", "mayor a", "menor a", "entre", "rango", "inhib", "tóxic")
            if re.search(r'\b(debe|recomendable|óptimo|requiere|mayor|menor|entre|rango|inhib|tóxic)\b', line, re.IGNORECASE):
                for kw in keywords:
                    if re.search(r'\b' + kw + r'\b', line, re.IGNORECASE):
                        start = max(0, i - 2)
                        end = min(len(lines), i + 3)
                        quote = " ".join([l.strip() for l in lines[start:end] if l.strip()])
                        if len(quote) > 30 and quote not in [r[3] for r in results]:
                            results.append((pdf_name, page_num, kw, quote))
                            break
    
    return results

keywords = ["temperatura", "pH", "sólidos", "HRT", "TRT", "carga", "C/N", "C/N:", "inhibición", "amoniaco", "acidez", "retención", "volátil", "agua", "estiércol"]
all_results = []
all_results.extend(detailed_search('biodig.txt', 'Biodigestores.pdf', keywords))
all_results.extend(detailed_search('coro.txt', 'Coronado2010.pdf', keywords))
all_results.extend(detailed_search('dialnet.txt', 'Dialnet-Biodigestores-4835857.pdf', keywords))

for i, r in enumerate(all_results[:40]):
    print(f"--- Rule {i} ---")
    print(f"PDF: {r[0]}, Page: {r[1]}, Keyword: {r[2]}")
    print(f"Quote: {r[3]}\n")
