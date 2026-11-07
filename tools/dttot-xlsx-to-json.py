"""Convert the official DTTOT export (.xlsx) into data/dttot-list.json.

Usage:  python tools/dttot-xlsx-to-json.py "Data DTTOT Terbaru.xlsx"

Expected sheet columns: Nama, Deskripsi, Terduga, Kode Densus, Tempat Lahir,
Tanggal Lahir, WN/Asal Negara, Alamat. Standard library only (no openpyxl).
pos-db.js syncs the JSON into the dttot_list table on the next server start.
"""
import datetime
import json
import os
import re
import sys
import zipfile
import xml.etree.ElementTree as ET

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
      'r': 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'}
REL = '{http://schemas.openxmlformats.org/package/2006/relationships}'
HEADER = ['Nama', 'Deskripsi', 'Terduga', 'Kode Densus', 'Tempat Lahir', 'Tanggal Lahir', 'WN/Asal Negara', 'Alamat']
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'dttot-list.json')


def col_index(ref):
    n = 0
    for ch in re.match(r'[A-Z]+', ref).group():
        n = n * 26 + ord(ch) - 64
    return n - 1


def first_sheet_rows(path):
    z = zipfile.ZipFile(path)
    shared = []
    if 'xl/sharedStrings.xml' in z.namelist():
        for si in ET.fromstring(z.read('xl/sharedStrings.xml')).findall('m:si', NS):
            shared.append(''.join(t.text or '' for t in si.iter(f"{{{NS['m']}}}t")))
    rels = {r.get('Id'): r.get('Target') for r in ET.fromstring(z.read('xl/_rels/workbook.xml.rels')).iter(f'{REL}Relationship')}
    sheet = ET.fromstring(z.read('xl/workbook.xml')).find('m:sheets', NS)[0]
    target = rels[sheet.get(f"{{{NS['r']}}}id")].lstrip('/')
    target = target if target.startswith('xl/') else 'xl/' + target
    rows = []
    for row in ET.fromstring(z.read(target)).iter(f"{{{NS['m']}}}row"):
        cells = {}
        for c in row.findall('m:c', NS):
            t, v = c.get('t'), c.find('m:v', NS)
            if t == 's' and v is not None:
                val = shared[int(v.text)]
            elif t == 'inlineStr':
                val = ''.join(x.text or '' for x in c.iter(f"{{{NS['m']}}}t"))
            else:
                val = v.text if v is not None else ''
            cells[col_index(c.get('r'))] = (val or '').strip()
        if cells:
            rows.append([cells.get(i, '') for i in range(len(HEADER))])
    return rows


def lines(text):
    """Split a cell holding '- a\\n- b' bullets into clean parts; '-' alone means empty."""
    parts = [re.sub(r'^[-\s]+', '', p).strip(' ;\t') for p in re.split(r'[\r\n]+', text or '')]
    return [p for p in parts if p and p not in ('-', 'N/A')]


def birth_date(text):
    t = (text or '').strip()
    if re.fullmatch(r'\d{4,6}(\.0+)?', t):  # Excel serial date (1900 system)
        d = datetime.date(1899, 12, 30) + datetime.timedelta(days=int(float(t)))
        return d.strftime('%d/%m/%Y')
    return '; '.join(re.sub(r'\s+', ' ', p) for p in lines(t))


def main(src):
    rows = first_sheet_rows(src)
    if rows[0] != HEADER:
        sys.exit(f'Unexpected header: {rows[0]}\nExpected: {HEADER}')
    entries, seen = [], set()
    for r in rows[1:]:
        nama, desk, terduga, kode, tempat, tgl, wn, alamat = r
        names = [n.strip() for n in re.split(r'\s+alias\s+', nama, flags=re.I) if n.strip()]
        if not names or not kode:
            sys.exit(f'Row without name or Kode Densus: {r[:4]}')
        if kode in seen:
            sys.exit(f'Duplicate Kode Densus: {kode}')
        seen.add(kode)
        notes = ['Terduga: ' + terduga] + lines(desk)
        if lines(tempat):
            notes.append('Tempat lahir: ' + ', '.join(lines(tempat)))
        if lines(alamat):
            notes.append('Alamat: ' + '; '.join(lines(alamat)))
        entries.append({
            'ref_code': kode,
            'name': names[0].upper(),
            'aliases': ', '.join(names[1:]),
            'nationality': ', '.join(lines(wn)).upper(),
            'date_of_birth': birth_date(tgl),
            'notes': '\n'.join(notes),
        })
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, 'w', encoding='utf-8', newline='\n') as f:
        json.dump({'source': os.path.basename(src), 'count': len(entries), 'entries': entries}, f, ensure_ascii=False, indent=1)
        f.write('\n')
    print(f'{len(entries)} entries -> {os.path.normpath(OUT)}')


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
