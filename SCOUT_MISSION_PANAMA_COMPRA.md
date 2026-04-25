# 🔍 SCOUT MISSION: PANAMA COMPRA LICITACIONES RESEARCH

**TO:** Scout Agent
**FROM:** Max (Chief of Staff) + Miguel
**PRIORITY:** HIGH
**DEADLINE:** ASAP

---

## MISSION

Research panamacompra.gob.pa and extract REAL licitaciones data structure.

**WHAT WE NEED:**

1. **Find REAL licitaciones** (water/IDAN related if possible)
2. **Extract exact data structure:**
   - Full Número (format: 2026-1-06-01-99-LP-000012)
   - Convocatoria number
   - Estado (Vigente, Cerrada, etc.)
   - Título
   - Deadline/Fecha de cierre
   - Monto (value)
   - URL to access the tender directly

3. **Get 5-10 real examples** with all fields

4. **Map URL structure:**
   - How to link to a specific tender?
   - What's the exact URL pattern?
   - Example: https://www.panamacompra.gob.pa/licitacion/[WHAT_GOES_HERE]?

---

## DELIVERABLE

File: **~/Projects/advance-research/PANAMA_COMPRA_REAL_DATA.json**

Format:
```json
{
  "source": "panamacompra.gob.pa",
  "date": "2026-04-24",
  "licitaciones": [
    {
      "numero": "2026-1-06-01-99-LP-000012",
      "convocatoria": "1",
      "estado": "Vigente",
      "titulo": "Servicios de Consultoría para realizar Análisis de Laboratorio...",
      "monto": "28500.00",
      "moneda": "B/.",
      "fecha_cierre": "2026-05-10",
      "url": "https://www.panamacompra.gob.pa/licitacion/2026-1-06-01-99-LP-000012",
      "tipo": "IDAN",
      "notas": "any other relevant info"
    }
  ],
  "url_pattern": "https://www.panamacompra.gob.pa/licitacion/{numero}",
  "data_source_notes": "Where you got this data from"
}
```

---

## INSTRUCTIONS

1. Visit panamacompra.gob.pa
2. Search for IDAN licitaciones (water/government)
3. Extract the EXACT data for 5-10 real tenders
4. Figure out the URL pattern to link to each tender
5. Save JSON file with real data

**BE SPECIFIC:** Use exact data, real URLs, real numbers. No made-up data.

---

**Why:** We're building a dashboard. Need REAL data format + URL structure to link correctly.

**Timeline:** ASAP - waiting on this to deploy correct version.

