// Generates minimal, valid one-page placeholder PDFs for each mock protocol so
// the "open / download document" buttons work out of the box. These are NOT
// real clinical documents — replace them with your own PDFs in /public/protocols.
const fs = require("fs");
const path = require("path");

const files = [
  ["anoressia.pdf", "Anoressia e perdita di appetito"],
  ["ansia.pdf", "Ansia: inquadramento e gestione"],
  ["astenia.pdf", "Astenia e fatigue"],
  ["deprescrizione.pdf", "Deprescrizione e revisione terapeutica"],
  ["depressione.pdf", "Depressione: riconoscimento e percorso"],
  ["dispnea.pdf", "Dispnea: valutazione e gestione"],
  ["dolore-da-oppioidi.pdf", "Dolore: terapia con oppioidi"],
  ["dolore-cronico.pdf", "Dolore cronico non oncologico"],
  ["consigli-nutrizionali.pdf", "Consigli nutrizionali pratici"],
  ["cure-palliative.pdf", "Cure palliative: principi generali"],
];

// Escape text for the PDF content stream.
const esc = (s) => s.replace(/[\\()]/g, (c) => "\\" + c);

function buildPdf(title) {
  const lines = [
    `BT /F1 22 Tf 72 760 Td (${esc(title)}) Tj ET`,
    `BT /F1 12 Tf 72 720 Td (Clinical Protocol Hub - documento di esempio) Tj ET`,
    `BT /F1 11 Tf 72 690 Td (Sostituisci questo file con il PDF reale del protocollo.) Tj ET`,
    `BT /F1 9 Tf 72 60 Td (Reference tool for healthcare professionals. Not a clinical decision support system.) Tj ET`,
  ].join("\n");

  const objects = [
    "<</Type/Catalog/Pages 2 0 R>>",
    "<</Type/Pages/Kids[3 0 R]/Count 1>>",
    "<</Type/Page/Parent 2 0 R/MediaBox[0 0 595 842]/Resources<</Font<</F1 5 0 R>>>>/Contents 4 0 R>>",
    `<</Length ${lines.length}>>\nstream\n${lines}\nendstream`,
    "<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });

  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    pdf += String(off).padStart(10, "0") + " 00000 n \n";
  });
  pdf += `trailer\n<</Size ${objects.length + 1}/Root 1 0 R>>\nstartxref\n${xrefStart}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

const outDir = path.join(__dirname, "..", "public", "protocols");
fs.mkdirSync(outDir, { recursive: true });

for (const [name, title] of files) {
  fs.writeFileSync(path.join(outDir, name), buildPdf(title));
  console.log("wrote", name);
}
