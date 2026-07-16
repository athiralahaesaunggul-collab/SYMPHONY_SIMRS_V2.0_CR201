/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import icd10Data from './icd10.json';

export interface ICD10Code {
  code: string;
  description: string;
  type: 'Kronis' | 'Akut';
  keywords: string[]; // for clinical relevance check against SOAP
}

export interface CDSSRule {
  id: number;
  invalidPrimary: string;
  invalidSecondary: string;
  correctPrimary: string;
  correctSecondary: string;
  explanation: string;
}

export const ICD10_DATABASE: ICD10Code[] = [
  // ───── KELOMPOK KRONIS ────────────────────────────────────────────────────
  { code: 'K29.5', description: 'Gastritis Kronis (Chronic Gastritis)', type: 'Kronis', keywords: ['lambung', 'perih', 'maag', 'mual', 'ulu hati', 'kronis', 'gastritis'] },
  { code: 'E78.5', description: 'Hiperkolesterolemia / Kolesterol Tinggi', type: 'Kronis', keywords: ['leher kaku', 'pusing', 'kolesterol', 'lemak', 'hiperkolesterol', 'lipid'] },
  { code: 'K64.0', description: 'Wasir / Hemoroid Derajat 1', type: 'Kronis', keywords: ['wasir', 'hemoroid', 'dubur', 'buang air besar', 'bab keras', 'benjolan'] },
  { code: 'E11.9', description: 'Diabetes Mellitus (DM) Tipe 2 Tanpa Komplikasi', type: 'Kronis', keywords: ['lemas', 'gula', 'diabetes', 'dm', 'gds', 'gdp', 'haus', 'sering kencing', 'luka'] },
  { code: 'K76.0', description: 'Fatty Liver (Perlemakan Hati)', type: 'Kronis', keywords: ['hati', 'fatty liver', 'perlemakan', 'begah', 'mual', 'sgot', 'sgpt', 'usg'] },
  { code: 'I10',   description: 'Hipertensi Esensial (Tekanan Darah Tinggi)', type: 'Kronis', keywords: ['hipertensi', 'tekanan darah tinggi', 'darah tinggi', 'pusing', 'tensi', 'sistolik', 'diastolik'] },
  { code: 'J45.9', description: 'Asma Bronkial (Unspecified)', type: 'Kronis', keywords: ['asma', 'sesak napas', 'mengi', 'wheezing', 'napas berbunyi', 'bronkial', 'inhaler'] },
  { code: 'M79.3', description: 'Panniculitis (Radang Lemak Bawah Kulit) / Myalgia Umum', type: 'Kronis', keywords: ['nyeri otot', 'pegal', 'myalgia', 'kaku otot', 'pegal-pegal'] },
  { code: 'N18.9', description: 'Penyakit Ginjal Kronis (CKD) Unspecified', type: 'Kronis', keywords: ['ginjal kronis', 'ckd', 'kreatinin', 'ureum', 'hemodialisis', 'proteinuria', 'edema ginjal'] },
  { code: 'E14.9', description: 'Diabetes Mellitus Unspecified Tanpa Komplikasi', type: 'Kronis', keywords: ['diabetes', 'dm', 'gula darah', 'hiperglikemia'] },

  // ───── KELOMPOK AKUT ─────────────────────────────────────────────────────
  { code: 'K35.8', description: 'Appendicitis Akut (Radang Usus Buntu Akut)', type: 'Akut', keywords: ['kanan bawah', 'perut kanan', 'appendix', 'appendisitis', 'mcburney', 'nyeri perut', 'demam'] },
  { code: 'K80.2', description: 'Kolesistitis Akut / Batu Empedu Akut', type: 'Akut', keywords: ['batu empedu', 'kolesistitis', 'kanan atas', 'nyeri menjalar', 'mual muntah', 'demam'] },
  { code: 'K92.1', description: 'Melena (Buang Air Besar Berdarah Hitam)', type: 'Akut', keywords: ['melena', 'hitam', 'feses hitam', 'bab hitam', 'pendarahan lambung', 'lemas'] },
  { code: 'K85.9', description: 'Pankreatitis Akut (Radang Pankreas Akut)', type: 'Akut', keywords: ['pankreas', 'pankreatitis', 'nyeri hebat', 'ulu hati menembus', 'muntah', 'amilase', 'lipase'] },
  { code: 'K21.9', description: 'GERD Akut (Gastro-Esophageal Reflux Disease)', type: 'Akut', keywords: ['gerd', 'panas dada', 'heartburn', 'asam lambung', 'sesak dada', 'mual', 'kerongkongan'] },
  { code: 'I21.9', description: 'Infark Miokard Akut (Serangan Jantung) Unspecified', type: 'Akut', keywords: ['serangan jantung', 'infark', 'ami', 'nyeri dada hebat', 'troponin', 'ekg', 'stemi', 'nstemi'] },
  { code: 'I63.9', description: 'Cerebrovascular Accident / Stroke Iskemik', type: 'Akut', keywords: ['stroke', 'cva', 'iskemik', 'lumpuh', 'bicara pelo', 'tidak sadar', 'hemiplegia', 'wajah mencong'] },
  { code: 'A09',   description: 'Gastroenteritis Akut (Diare Akut)', type: 'Akut', keywords: ['diare', 'mencret', 'bab cair', 'gastroenteritis', 'mual muntah', 'dehidrasi'] },
  { code: 'J18.9', description: 'Pneumonia Unspecified (Radang Paru-paru)', type: 'Akut', keywords: ['pneumonia', 'paru', 'demam tinggi', 'batuk berdahak', 'sesak', 'ronkhi', 'infiltrat'] },
  { code: 'N10',   description: 'Infeksi Saluran Kemih Atas Akut / Pielonefritis Akut', type: 'Akut', keywords: ['pielonefritis', 'isk', 'nyeri pinggang', 'demam', 'disuria', 'piuria', 'leukosituria'] },
  { code: 'R57.9', description: 'Syok Unspecified', type: 'Akut', keywords: ['syok', 'hipotensi', 'tekanan darah rendah', 'nadi cepat', 'tidak sadar', 'perfusi'] },
  { code: 'T39.1', description: 'Keracunan Salisilat / Obat-obatan', type: 'Akut', keywords: ['keracunan', 'overdosis', 'obat', 'tidak sadar', 'muntah-muntah', 'salisilat'] },
];

export const CDSS_RULES: CDSSRule[] = [
  // ── Aturan Prioritas Akut-vs-Kronis ──────────────────────────────────────
  { id: 1,  invalidPrimary: 'K29.5', invalidSecondary: 'K35.8', correctPrimary: 'K35.8', correctSecondary: 'K29.5', explanation: 'Appendicitis Akut (K35.8) adalah kondisi gawat darurat bedah akut dan wajib menjadi Diagnosis Utama, sedangkan Gastritis Kronis (K29.5) adalah diagnosis sekunder pendamping.' },
  { id: 2,  invalidPrimary: 'E78.5', invalidSecondary: 'K80.2', correctPrimary: 'K80.2', correctSecondary: 'E78.5', explanation: 'Batu Empedu Akut / Kolesistitis (K80.2) memerlukan tindakan medis/operatif segera (akut), sedangkan Hiperkolesterolemia (E78.5) adalah penyakit metabolik kronis.' },
  { id: 3,  invalidPrimary: 'K64.0', invalidSecondary: 'K92.1', correctPrimary: 'K92.1', correctSecondary: 'K64.0', explanation: 'Melena (K92.1) merupakan manifestasi pendarahan saluran cerna atas yang akut dan mengancam nyawa, harus didahulukan dari Wasir kronis (K64.0).' },
  { id: 4,  invalidPrimary: 'E11.9', invalidSecondary: 'K85.9', correctPrimary: 'K85.9', correctSecondary: 'E11.9', explanation: 'Pankreatitis Akut (K85.9) adalah inflamasi pankreas akut yang mengancam jiwa, sedangkan DM Tipe 2 (E11.9) adalah kondisi kronis penyerta.' },
  { id: 5,  invalidPrimary: 'K76.0', invalidSecondary: 'K21.9', correctPrimary: 'K21.9', correctSecondary: 'K76.0', explanation: 'GERD Akut (K21.9) merupakan keluhan akut utama pasien saat datang ke IGD/Klinik, sedangkan Fatty Liver (K76.0) adalah temuan insidental kronis.' },
  { id: 6,  invalidPrimary: 'I10',   invalidSecondary: 'I21.9', correctPrimary: 'I21.9', correctSecondary: 'I10',   explanation: 'Infark Miokard Akut / Serangan Jantung (I21.9) adalah kondisi gawat darurat mengancam jiwa, harus menjadi Diagnosis Utama di atas Hipertensi Kronis (I10).' },
  { id: 7,  invalidPrimary: 'I10',   invalidSecondary: 'I63.9', correctPrimary: 'I63.9', correctSecondary: 'I10',   explanation: 'Stroke Iskemik (I63.9) adalah kegawatan neurologis akut dan harus menjadi Diagnosis Utama, bukan Hipertensi (I10) yang merupakan faktor risiko kronis.' },
  { id: 8,  invalidPrimary: 'E11.9', invalidSecondary: 'I21.9', correctPrimary: 'I21.9', correctSecondary: 'E11.9', explanation: 'Infark Miokard Akut (I21.9) adalah kegawatan kardiovaskular akut. Diabetes Mellitus (E11.9) merupakan faktor komorbid kronis, bukan Diagnosis Utama.' },
  { id: 9,  invalidPrimary: 'J45.9', invalidSecondary: 'J18.9', correctPrimary: 'J18.9', correctSecondary: 'J45.9', explanation: 'Pneumonia Akut (J18.9) adalah infeksi paru yang akut dan berat. Asma (J45.9) adalah komorbid kronis yang menjadi penyerta.' },
  { id: 10, invalidPrimary: 'N18.9', invalidSecondary: 'N10',   correctPrimary: 'N10',   correctSecondary: 'N18.9', explanation: 'Pielonefritis Akut (N10) adalah infeksi ginjal akut yang membutuhkan penanganan segera. CKD (N18.9) adalah kondisi kronis komorbid, bukan Diagnosis Utama kunjungan ini.' },
];

export interface CDSSResult {
  isValid: boolean;
  isRuleViolation: boolean;
  isRelevanceViolation: boolean;
  message: string | null;
  suggestions: string[];
}

const COMMON_STOPWORDS = new Set([
  'unspecified', 'other', 'with', 'without', 'due', 'to', 'and', 'or', 'of', 'in', 'by', 
  'for', 'the', 'acute', 'chronic', 'disease', 'fever', 'disorder', 'disorders', 'syndrome',
  'history', 'personal', 'family', 'non', 'specified', 'part', 'parts', 'site', 'sites',
  'type', 'class', 'classification', 'some', 'any', 'not', 'elsewhere', 'classified', 'un'
]);

const ENGLISH_TO_INDONESIAN_KEYWORDS: Record<string, string[]> = {
  cholera: ['kolera', 'diare', 'mencret', 'muntaber'],
  typhoid: ['tifoid', 'tipes', 'demam'],
  paratyphoid: ['paratifoid', 'demam'],
  salmonella: ['salmonela', 'diare', 'mencret', 'keracunan'],
  shigellosis: ['disentri', 'diare', 'mencret', 'lendir', 'darah'],
  tuberculosis: ['tb', 'tbc', 'paru', 'flek', 'batuk', 'baksil', 'kuman'],
  tetanus: ['tetanus', 'kejang', 'kaku', 'luka kotor'],
  diphtheria: ['difteri', 'tenggorokan', 'selaput'],
  pertussis: ['rejan', 'batuk 100 hari'],
  meningitis: ['meningitis', 'selaput otak', 'kaku kuduk'],
  dengue: ['dbd', 'demam berdarah', 'trombosit', 'bintik merah'],
  malaria: ['malaria', 'demam menggigil', 'plasmodium'],
  measles: ['campak', 'rubeola', 'bintik merah', 'ruam'],
  chickenpox: ['cacar air', 'varisela'],
  herpes: ['herpes', 'dompo', 'gelembung air'],
  malignant: ['kanker', 'ganas', 'tumor', 'benjolan'],
  benign: ['jinak', 'tumor', 'benjolan'],
  neoplasm: ['kanker', 'tumor', 'benjolan'],
  anemia: ['anemia', 'kurang darah', 'lemas', 'pucat', 'hb rendah'],
  thalassaemia: ['talasemia', 'transfusi'],
  hemophilia: ['hemofilia', 'darah sukar membeku'],
  diabetes: ['diabetes', 'dm', 'gula', 'kencing manis', 'gds', 'gdp', 'hba1c'],
  goitre: ['gondok', 'tiroid', 'leher'],
  thyrotoxicosis: ['hipertiroid', 'tiroid'],
  malnutrition: ['gizi buruk', 'kurang gizi'],
  hypercholesterolaemia: ['kolesterol', 'hiperkolesterol', 'lemak', 'lipid'],
  hyperlipidaemia: ['kolesterol', 'lemak', 'lipid'],
  epilepsy: ['ayan', 'kejang', 'epilepsi', 'kelojotan'],
  migraine: ['migrain', 'sakit kepala sebelah'],
  hemiplegia: ['lumpuh', 'lemah separuh'],
  cataract: ['katarak', 'lensa keruh', 'kabur'],
  glaucoma: ['glaukoma', 'tekanan bola mata'],
  conjunctivitis: ['mata merah', 'konjungtivitis', 'belekan'],
  otitis: ['otitis', 'telinga bernanah', 'congek', 'sakit telinga'],
  hypertension: ['hipertensi', 'tensi tinggi', 'darah tinggi', 'pusing', 'tengkuk'],
  angina: ['angina', 'nyeri dada', 'sesak dada', 'jantung'],
  infarction: ['infark', 'serangan jantung', 'troponin', 'ekg', 'stemi', 'nstemi'],
  ischaemic: ['iskemik', 'jantung', 'ekg'],
  myocardial: ['miokard', 'jantung', 'nyeri dada'],
  fibrillation: ['fibrilasi', 'aritmia', 'debar', 'jantung'],
  stroke: ['stroke', 'lumpuh', 'pelo', 'mencong', 'lemah'],
  hemorrhage: ['pendarahan', 'pecah pembuluh'],
  nasopharyngitis: ['pilek', 'common cold', 'flu', 'batuk'],
  pharyngitis: ['radang tenggorokan', 'sakit menelan'],
  tonsillitis: ['amandel', 'tonsilitis', 'tenggorokan'],
  laryngitis: ['serak', 'suara hilang', 'laringitis'],
  influenza: ['flu', 'pilek', 'batuk', 'demam'],
  pneumonia: ['pneumonia', 'paru-paru basah', 'ronkhi', 'napas cepat'],
  bronchitis: ['bronkitis', 'batuk berdahak', 'sesak'],
  asthma: ['asma', 'sesak napas', 'mengi', 'wheezing', 'inhaler'],
  gastritis: ['gastritis', 'lambung', 'maag', 'perih', 'ulu hati', 'mual'],
  dyspepsia: ['dispepsia', 'kembung', 'sebah', 'ulu hati', 'begah'],
  appendicitis: ['usus buntu', 'appendisitis', 'perut kanan bawah', 'mcburney'],
  hernia: ['hernia', 'turun berok', 'benjolan'],
  hemorrhoids: ['wasir', 'hemoroid', 'ambeyen', 'bab berdarah'],
  melena: ['melena', 'bab hitam', 'darah hitam'],
  cholecystitis: ['kolesistitis', 'batu empedu', 'mual', 'demam'],
  cholelithiasis: ['batu empedu', 'kolesistitis'],
  pancreatitis: ['pankreatitis', 'pankreas', 'nyeri perut hebat'],
  dermatitis: ['gatal', 'alergi', 'eksim', 'ruam', 'dermatitis'],
  urticaria: ['biduran', 'kaligata', 'gatal', 'bentol'],
  cellulitis: ['selulitis', 'bengkak merah', 'infeksi kulit'],
  myalgia: ['nyeri otot', 'pegal', 'myalgia', 'kaku otot'],
  osteoarthritis: ['nyeri sendi', 'oa', 'pengapuran', 'lutut'],
  gout: ['asam urat', 'gout', 'sendi bengkak'],
  nephritis: ['ginjal', 'nefritis'],
  cystitis: ['isk', 'infeksi kemih', 'anyang-anyangan', 'kencing perih'],
  urethritis: ['kencing nanah', 'isk'],
  abortion: ['keguguran', 'aborsi', 'flek', 'pendarahan'],
  pregnancy: ['hamil', 'mengandung', 'anc'],
  delivery: ['bersalin', 'melahirkan', 'partus', 'kontraksi'],
  postpartum: ['nifas', 'setelah melahirkan'],
  newborn: ['bayi lahir', 'neonatus', 'bblr'],
  perinatal: ['perinatal', 'bayi baru lahir', 'asfiksia'],
  fever: ['demam', 'panas', 'suhu tinggi'],
  cough: ['batuk', 'dahak'],
  dyspnoea: ['sesak napas', 'dyspnea', 'napas cepat'],
  pain: ['nyeri', 'sakit', 'linu'],
  abdominal: ['perut', 'lambung', 'abdomen'],
  headache: ['sakit kepala', 'pusing', 'sefalgia'],
  convulsions: ['kejang', 'step'],
  shock: ['syok', 'lemah', 'kesadaran menurun'],
  fracture: ['patah tulang', 'fraktur', 'retak'],
  dislocation: ['terkilir', 'dislokasi', 'keseleo'],
  wound: ['luka', 'robek', 'lecet', 'jahitan'],
  poisoning: ['keracunan', 'intoksikasi', 'overdosis'],
  burn: ['luka bakar', 'tersiram air panas'],
};

export function getDynamicKeywords(code: string): string[] {
  const hardcoded = ICD10_DATABASE.find(item => item.code === code);
  if (hardcoded) return hardcoded.keywords;

  const desc = getDescriptionByCode(code);
  if (!desc || desc === 'Kode tidak dikenal') return [];

  const cleanDesc = desc.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const words = cleanDesc.split(/\s+/).filter(w => w.length > 2 && !COMMON_STOPWORDS.has(w));

  const keywords: string[] = [];
  keywords.push(...words);

  for (const word of words) {
    if (ENGLISH_TO_INDONESIAN_KEYWORDS[word]) {
      keywords.push(...ENGLISH_TO_INDONESIAN_KEYWORDS[word]);
    }
  }

  return Array.from(new Set(keywords));
}

/**
 * Validates selected ICD-10 codes using CDSS rules and checks relevance to SOAP notes
 */
export function validateCDSS(
  primaryCode: string,
  secondaryCode: string,
  soapText: string,
  asesmenText?: string,
  gender?: string,
  age?: number
): CDSSResult {
  const result: CDSSResult = {
    isValid: true,
    isRuleViolation: false,
    isRelevanceViolation: false,
    message: null,
    suggestions: []
  };

  if (!primaryCode) return result;

  // 1. Check strict Asesmen (A) mapping
  if (asesmenText) {
    const textLower = asesmenText.toLowerCase();
    const keywords = getDynamicKeywords(primaryCode);

    if (keywords.length > 0) {
      const parts = textLower.split(/\bdd\b|differential|diagnosa banding|diagnosis banding/i);
      const primaryPart = parts[0];
      const hasKeyword = keywords.some(kw => primaryPart.includes(kw) || textLower.includes(kw));

      if (!hasKeyword) {
        let expectedCode: string | null = null;
        for (const item of ICD10_DATABASE) {
          if (item.keywords.some(kw => primaryPart.includes(kw) || textLower.includes(kw))) {
            expectedCode = item.code;
            break;
          }
        }

        result.isValid = false;
        result.isRuleViolation = true; // Use isRuleViolation to block submission and show bright red
        result.message = `ALERT: Ketidaksesuaian Asesmen! Diagnosis Utama '${primaryCode}' (${getDescriptionByCode(primaryCode)}) tidak sesuai dengan Asesmen (A) SOAP Dokter yang tertulis: "${asesmenText}".`;
        if (expectedCode) {
          result.suggestions.push(`Sesuai rekam medis pasien, Anda wajib memilih ICD-10 terkait: ${expectedCode} (${getDescriptionByCode(expectedCode)}).`);
          result.suggestions.push(`Ubah Diagnosis Utama menjadi: ${expectedCode} agar selaras dengan kesimpulan klinis.`);
        } else {
          result.suggestions.push(`Harap pastikan kode ICD-10 yang dipilih selaras dengan diagnosa Asesmen (A) dokter.`);
        }
        return result;
      }
    }
  }

  // 2. Check Hardcoded CDSS Miscoding Rules (Visceral Rules)
  for (const rule of CDSS_RULES) {
    if (primaryCode === rule.invalidPrimary && secondaryCode === rule.invalidSecondary) {
      result.isValid = false;
      result.isRuleViolation = true;
      result.message = `ALERT: Prioritas Koding Salah! Diagnosis Kronis (${primaryCode}) tidak boleh diletakkan sebagai diagnosis utama mengalahkan kondisi Akut (${secondaryCode}).`;
      result.suggestions.push(`Ubah Diagnosis Utama menjadi: ${rule.correctPrimary} (${getDescriptionByCode(rule.correctPrimary)})`);
      result.suggestions.push(`Ubah Diagnosis Sekunder menjadi: ${rule.correctSecondary} (${getDescriptionByCode(rule.correctSecondary)})`);
      result.suggestions.push(rule.explanation);
      return result; // Rule violation takes top priority
    }
  }

  // 3. Check Clinical SOAP Relevance
  if (soapText) {
    const keywords = getDynamicKeywords(primaryCode);
    if (keywords.length > 0) {
      const textLower = soapText.toLowerCase();
      const hasKeywords = keywords.some(keyword => textLower.includes(keyword));

      if (!hasKeywords) {
        result.isValid = false;
        result.isRelevanceViolation = true;
        result.message = `ALERT: Ketidaksesuaian SOAP! Diagnosis Utama '${primaryCode}' (${getDescriptionByCode(primaryCode)}) tidak didukung oleh bukti klinis pada narasi SOAP Pasien.`;
        result.suggestions.push(`Pastikan narasi SOAP mencakup gejala/keyword relevan: ${keywords.join(', ')}.`);
        result.suggestions.push(`Atau pertimbangkan untuk meninjau kembali kecocokan kode ICD-10 dengan kondisi pasien.`);
      }
    }
  }

  // 4. Check Gender Specific Rules (O codes for Female, N40-N51 for Male)
  if (gender) {
    const checkGender = (code: string) => {
      if (gender === 'Laki-laki' && code.startsWith('O')) {
        result.isValid = false;
        result.isRuleViolation = true;
        result.message = `ALERT: Ketidaksesuaian Gender! Kode ${code} terkait Kehamilan/Persalinan tidak valid untuk pasien Laki-laki.`;
        result.suggestions.push('Harap periksa kembali diagnosis dan identitas pasien.');
      }
      if (gender === 'Perempuan' && (code.startsWith('N4') || code.startsWith('N50') || code.startsWith('N51'))) {
        result.isValid = false;
        result.isRuleViolation = true;
        result.message = `ALERT: Ketidaksesuaian Gender! Kode ${code} terkait organ reproduksi pria tidak valid untuk pasien Perempuan.`;
        result.suggestions.push('Harap periksa kembali diagnosis dan identitas pasien.');
      }
    };
    if (primaryCode) checkGender(primaryCode);
    if (secondaryCode) checkGender(secondaryCode);
    if (!result.isValid) return result;
  }

  // 5. Check Age Specific Rules (P codes for infants < 1 year)
  if (age !== undefined) {
    const checkAge = (code: string) => {
      if (age >= 1 && code.startsWith('P')) {
        result.isValid = false;
        result.isRuleViolation = true;
        result.message = `ALERT: Ketidaksesuaian Usia! Kode ${code} (Kondisi Perinatal) hanya untuk bayi usia < 1 tahun, sedangkan pasien berumur ${age} tahun.`;
        result.suggestions.push('Harap gunakan kode ICD-10 lain yang sesuai dengan kelompok usia pasien dewasa/anak.');
      }
    };
    if (primaryCode) checkAge(primaryCode);
    if (secondaryCode) checkAge(secondaryCode);
    if (!result.isValid) return result;
  }

  return result;
}

export function getDescriptionByCode(code: string): string {
  const foundJson = (icd10Data as { code: string; description: string }[]).find(item => item.code === code);
  if (foundJson) return foundJson.description;

  const found = ICD10_DATABASE.find(item => item.code === code);
  return found ? found.description : 'Kode tidak dikenal';
}