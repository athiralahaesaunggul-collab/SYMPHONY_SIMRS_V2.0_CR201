import pandas as pd
import os

def convert_icd_data():
    print("Memulai proses konversi file CSV ke JSON...")

    # 1. Konversi ICD-10
    file_icd10 = '-PUBLIC- ICD-10 e-klaim.xlsx.xlsx - ICD10.csv'
    if os.path.exists(file_icd10):
        print(f"\nMembaca {file_icd10}...")
        try:
            df1 = pd.read_csv(file_icd10)
            # Mengambil kolom CODE dan DISPLAY
            if 'CODE' in df1.columns and 'DISPLAY' in df1.columns:
                df1_clean = df1[['CODE', 'DISPLAY']]
                df1_clean.to_json('icd10.json', orient='records', indent=2)
                print("✅ Berhasil membuat icd10.json langsung di folder proyek!")
            else:
                print("⚠️ Gagal: Kolom 'CODE' atau 'DISPLAY' tidak ditemukan pada file ICD10.csv.")
        except Exception as e:
            print(f"⚠️ Terjadi kesalahan saat membaca {file_icd10}: {e}")
    else:
        print(f"❌ File tidak ditemukan: {file_icd10}")

    # 2. Konversi ICD-9 CM
    file_icd9 = '-PUBLIC- Mapping kode ICD 9 CM - KPTL v2.0.xlsx - Mapping Kode ICD9CM ke KPTL.csv'
    if os.path.exists(file_icd9):
        print(f"\nMembaca {file_icd9}...")
        try:
            df2 = pd.read_csv(file_icd9)
            # Mengambil kolom kesatu dan kedua
            col1 = df2.columns[0]
            col2 = df2.columns[1]
            df2_clean = df2[[col1, col2]].rename(columns={col1: 'Kode', col2: 'Display'})
            df2_clean.to_json('icd9.json', orient='records', indent=2)
            print("✅ Berhasil membuat icd9.json langsung di folder proyek!")
        except Exception as e:
            print(f"⚠️ Terjadi kesalahan saat membaca {file_icd9}: {e}")
    else:
        print(f"❌ File tidak ditemukan: {file_icd9}")

if __name__ == "__main__":
    convert_icd_data()
