/**
 * Advance keyword filter for municipal tenders.
 *
 * ACTIVE_KEYWORDS — applied to municipal-source tenders only.
 * A tender passes if any keyword matches its titulo OR description
 * (case-insensitive, partial string).
 *
 * To add a keyword, move a candidate from the comments below into
 * ACTIVE_KEYWORDS and confirm with Miguel first.
 */
export const ACTIVE_KEYWORDS = [
  'agua',
  'reactivos',
];

// candidate — confirm with Miguel before activating:
// 'alcantarillado'
// 'acueducto'
// 'laboratorio'
// 'potabilización'
// 'saneamiento'
// 'desinfección'
// 'tratamiento'          // tratamiento de agua, planta de tratamiento
// 'químicos'             // insumos químicos, productos químicos
// 'medidores'            // medidores inteligentes, medidores de agua
// 'válvulas'             // válvulas de control, válvulas de distribución
// 'tanques'              // tanques de almacenamiento
// 'tuberías'
// 'planta'               // planta potabilizadora, planta de tratamiento

/**
 * Country/source keys that are national procurement portals.
 * Everything NOT in this list is treated as source_type: "municipal"
 * and subject to the keyword filter above.
 */
export const NATIONAL_PORTAL_KEYS = new Set([
  'panama',       // PanamaCompra
  'costa_rica',   // SICOP
  'nicaragua',    // SISCAE
  'el_salvador',  // ANDA / CompraGov
]);

/**
 * Returns true if the tender text matches any active keyword.
 */
export function matchesAdvanceKeywords(tender) {
  const haystack = [tender.titulo, tender.description]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return ACTIVE_KEYWORDS.some((kw) => haystack.includes(kw.toLowerCase()));
}
