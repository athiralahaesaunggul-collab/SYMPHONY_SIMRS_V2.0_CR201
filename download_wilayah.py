import urllib.request
import json
import os
import concurrent.futures
import sys

# Target directory
output_dir = os.path.join(os.getcwd(), 'public')
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

log_file_path = os.path.join(os.getcwd(), 'download.log')
log_file = open(log_file_path, 'w', encoding='utf-8')

def log(msg):
    print(msg)
    log_file.write(msg + '\n')
    log_file.flush()

def fetch_json(url):
    try:
        req = urllib.request.Request(
            url, 
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
        )
        with urllib.request.urlopen(req, timeout=10) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        log(f"Error fetching {url}: {e}")
        return None

# 1. Download Provinces
log("Downloading provinces...")
provinces = fetch_json("https://emsifa.github.io/api-wilayah-indonesia/api/provinces.json")
if not provinces:
    log("Failed to download provinces. Exiting.")
    log_file.close()
    exit(1)

# Write provinces list to public/wilayah_provinsi.json just in case
with open(os.path.join(output_dir, 'wilayah_provinsi.json'), 'w', encoding='utf-8') as f:
    json.dump(provinces, f, ensure_ascii=False)

# 2. Download Regencies (Kabupaten)
log("Downloading regencies...")
regencies_by_prov = {}
all_regency_ids = []

for prov in provinces:
    prov_id = prov['id']
    url = f"https://emsifa.github.io/api-wilayah-indonesia/api/regencies/{prov_id}.json"
    data = fetch_json(url)
    if data:
        regencies_by_prov[prov_id] = [{"id": r['id'], "name": r['name']} for r in data]
        for r in data:
            all_regency_ids.append(r['id'])
    log(f"  Prov {prov_id} ({prov['name']}): {len(data) if data else 0} regencies")

with open(os.path.join(output_dir, 'wilayah_kabupaten.json'), 'w', encoding='utf-8') as f:
    json.dump(regencies_by_prov, f, ensure_ascii=False)

# 3. Download Districts (Kecamatan) using multithreading for speed
log(f"Downloading districts for {len(all_regency_ids)} regencies...")
districts_by_reg = {}
all_district_ids = []

def download_district(reg_id):
    url = f"https://emsifa.github.io/api-wilayah-indonesia/api/districts/{reg_id}.json"
    data = fetch_json(url)
    return reg_id, data

with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
    results = executor.map(download_district, all_regency_ids)
    for reg_id, data in results:
        if data:
            districts_by_reg[reg_id] = [{"id": d['id'], "name": d['name']} for d in data]
            for d in data:
                all_district_ids.append(d['id'])

with open(os.path.join(output_dir, 'wilayah_kecamatan.json'), 'w', encoding='utf-8') as f:
    json.dump(districts_by_reg, f, ensure_ascii=False)
log(f"Districts download completed. Total districts: {len(all_district_ids)}")

# 4. Download Villages (Kelurahan) using multithreading for speed
log(f"Downloading villages for {len(all_district_ids)} districts...")
villages_by_dist = {}

def download_village(dist_id):
    url = f"https://emsifa.github.io/api-wilayah-indonesia/api/villages/{dist_id}.json"
    data = fetch_json(url)
    return dist_id, data

# Chunking because there are ~7000 districts, to log progress
chunk_size = 500
for i in range(0, len(all_district_ids), chunk_size):
    chunk = all_district_ids[i:i+chunk_size]
    log(f"  Downloading villages chunk {i} to {i+len(chunk)}...")
    with concurrent.futures.ThreadPoolExecutor(max_workers=20) as executor:
        results = executor.map(download_village, chunk)
        for dist_id, data in results:
            if data:
                villages_by_dist[dist_id] = [{"id": v['id'], "name": v['name']} for v in data]

with open(os.path.join(output_dir, 'wilayah_kelurahan.json'), 'w', encoding='utf-8') as f:
    json.dump(villages_by_dist, f, ensure_ascii=False)

log("All territory data downloaded and saved successfully to public/ directory!")
log_file.close()
