import pandas as pd
import os

# Memastikan folder src/data ada
os.makedirs('src/data', exist_ok=True)

print("Sedang mengekstrak data Excel, mohon tunggu...")

# 1. Konversi Seluruh ICD-10 (18.543 data)
df1 = pd.read_excel('-PUBLIC- ICD-10 e-klaim.xlsx.xlsx', sheet_name='ICD10')
df1_clean = df1[['CODE', 'DISPLAY']].rename(columns={'CODE': 'code', 'DISPLAY': 'description'})
df1_clean.to_json('src/data/icd10.json', orient='records', indent=2)

# 2. Konversi Seluruh ICD-9 CM (742 data)
df2 = pd.read_excel('-PUBLIC- Mapping kode ICD 9 CM - KPTL v2.0.xlsx', sheet_name='Mapping Kode ICD9CM ke KPTL', header=1)
df2_clean = df2[['Kode', 'Display']].rename(columns={'Kode': 'code', 'Display': 'description'})
df2_clean.to_json('src/data/icd9.json', orient='records', indent=2)

print("🔥 Sukses! File icd10.json dan icd9.json berhasil dibuat di dalam folder src/data/!")
