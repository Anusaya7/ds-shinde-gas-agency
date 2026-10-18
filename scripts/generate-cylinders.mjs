/**
 * Generates red "Gaspoint" branded LPG cylinder SVGs for all sizes.
 * Sizes: 12, 15, 17, 19, 21, 33, 50, 425 kg
 * Output: frontend/public/assets/cylinders/<size>kg.svg
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', 'frontend', 'public', 'assets', 'cylinders');
mkdirSync(outDir, { recursive: true });

// Palette — deep red body like classic domestic LPG cylinders
const RED = {
  dark: '#8E1B1B',
  base: '#C0392B',
  mid: '#D64545',
  light: '#E8705F',
  highlight: '#F1948A',
  stroke: '#7B241C',
};

function cylinderSvg({ sizeLabel, typeLabel, width, height, bodyTop, bodyBottom, bodyX, bodyWidth, corner }) {
  const cx = bodyX + bodyWidth / 2;
  const ringW = bodyWidth * 0.72;
  const ringX = cx - ringW / 2;
  const valveW = bodyWidth * 0.22;
  const valveX = cx - valveW / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="body" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${RED.dark}"/>
      <stop offset="18%" stop-color="${RED.base}"/>
      <stop offset="45%" stop-color="${RED.mid}"/>
      <stop offset="68%" stop-color="${RED.light}"/>
      <stop offset="86%" stop-color="${RED.highlight}"/>
      <stop offset="100%" stop-color="${RED.dark}"/>
    </linearGradient>
    <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#641E16"/>
      <stop offset="50%" stop-color="${RED.base}"/>
      <stop offset="100%" stop-color="#641E16"/>
    </linearGradient>
    <linearGradient id="valve" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#5D6D7E"/>
      <stop offset="50%" stop-color="#AEB6BF"/>
      <stop offset="100%" stop-color="#5D6D7E"/>
    </linearGradient>
    <radialGradient id="cap" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FDFEFE"/>
      <stop offset="100%" stop-color="#BFC9CA"/>
    </radialGradient>
  </defs>

  <!-- Valve assembly -->
  <rect x="${valveX}" y="6" width="${valveW}" height="${Math.round(bodyTop * 0.28)}" rx="4" fill="url(#valve)"/>
  <ellipse cx="${cx}" cy="${Math.round(bodyTop * 0.34)}" rx="${Math.round(valveW * 0.62)}" ry="${Math.round(bodyTop * 0.14)}" fill="url(#cap)" stroke="#444" stroke-width="1.4"/>
  <rect x="${cx - 2.5}" y="${Math.round(bodyTop * 0.2)}" width="5" height="${Math.round(bodyTop * 0.14)}" fill="#7F8C8D"/>

  <!-- Top ring -->
  <rect x="${ringX}" y="${bodyTop}" width="${ringW}" height="${Math.round(bodyWidth * 0.09)}" rx="6" fill="url(#ring)"/>

  <!-- Main cylinder body -->
  <rect x="${bodyX}" y="${bodyTop + Math.round(bodyWidth * 0.06)}" width="${bodyWidth}" height="${bodyBottom - bodyTop - Math.round(bodyWidth * 0.12)}" rx="${corner}" fill="url(#body)" stroke="${RED.stroke}" stroke-width="2.4"/>

  <!-- Side highlights -->
  <rect x="${bodyX + Math.round(bodyWidth * 0.07)}" y="${bodyTop + Math.round(bodyWidth * 0.2)}" width="${Math.round(bodyWidth * 0.07)}" height="${bodyBottom - bodyTop - Math.round(bodyWidth * 0.45)}" rx="4" fill="#FFFFFF" opacity="0.28"/>
  <rect x="${bodyX + bodyWidth - Math.round(bodyWidth * 0.16)}" y="${bodyTop + Math.round(bodyWidth * 0.2)}" width="${Math.round(bodyWidth * 0.08)}" height="${bodyBottom - bodyTop - Math.round(bodyWidth * 0.45)}" rx="4" fill="${RED.dark}" opacity="0.28"/>

  <!-- Gaspoint brand label -->
  <rect x="${cx - Math.round(bodyWidth * 0.33)}" y="${Math.round((bodyTop + bodyBottom) / 2 - bodyWidth * 0.19)}" width="${Math.round(bodyWidth * 0.66)}" height="${Math.round(bodyWidth * 0.38)}" rx="8" fill="#FFFFFF" opacity="0.94" stroke="${RED.stroke}" stroke-width="1.2"/>
  <text x="${cx}" y="${Math.round((bodyTop + bodyBottom) / 2 - bodyWidth * 0.02)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(bodyWidth * 0.15)}" font-weight="bold" fill="${RED.dark}" text-anchor="middle">GASPOINT</text>
  <text x="${cx}" y="${Math.round((bodyTop + bodyBottom) / 2 + bodyWidth * 0.12)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(bodyWidth * 0.12)}" font-weight="bold" fill="#1C2833" text-anchor="middle">${sizeLabel}</text>
  <text x="${cx}" y="${Math.round((bodyTop + bodyBottom) / 2 + bodyWidth * 0.22)}" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(bodyWidth * 0.062)}" fill="#566573" text-anchor="middle">${typeLabel}</text>

  <!-- Bottom ring -->
  <rect x="${ringX}" y="${bodyBottom - Math.round(bodyWidth * 0.12)}" width="${ringW}" height="${Math.round(bodyWidth * 0.09)}" rx="6" fill="url(#ring)"/>

  <!-- Base -->
  <rect x="${bodyX - Math.round(bodyWidth * 0.04)}" y="${bodyBottom - Math.round(bodyWidth * 0.03)}" width="${bodyWidth + Math.round(bodyWidth * 0.08)}" height="${Math.round(bodyWidth * 0.11)}" rx="7" fill="#5D4037"/>
</svg>
`;
}

const specs = [
  { size: '12', label: '12 KG', type: 'DOMESTIC LPG CYLINDER', w: 200, h: 340, bodyTop: 46, bodyBottom: 320, bodyX: 55, bodyW: 90, corner: 13 },
  { size: '15', label: '15 KG', type: 'DOMESTIC LPG CYLINDER', w: 200, h: 370, bodyTop: 50, bodyBottom: 350, bodyX: 52, bodyW: 96, corner: 14 },
  { size: '17', label: '17 KG', type: 'DOMESTIC LPG CYLINDER', w: 200, h: 390, bodyTop: 52, bodyBottom: 370, bodyX: 50, bodyW: 100, corner: 15 },
  { size: '19', label: '19.2 KG', type: 'COMMERCIAL CYLINDER', w: 200, h: 420, bodyTop: 56, bodyBottom: 400, bodyX: 46, bodyW: 108, corner: 16 },
  { size: '21', label: '21 KG', type: 'COMMERCIAL CYLINDER', w: 210, h: 440, bodyTop: 58, bodyBottom: 420, bodyX: 46, bodyW: 118, corner: 17 },
  { size: '33', label: '33 KG', type: 'COMMERCIAL CYLINDER', w: 240, h: 500, bodyTop: 66, bodyBottom: 480, bodyX: 55, bodyW: 130, corner: 19 },
  { size: '50', label: '50 KG', type: 'INDUSTRIAL CYLINDER', w: 260, h: 560, bodyTop: 74, bodyBottom: 540, bodyX: 58, bodyW: 144, corner: 21 },
  { size: '425', label: '425 KG', type: 'BULK LOT INSTALLATION', w: 320, h: 780, bodyTop: 90, bodyBottom: 750, bodyX: 70, bodyW: 180, corner: 26 },
];

for (const spec of specs) {
  const svg = cylinderSvg({
    sizeLabel: spec.label,
    typeLabel: spec.type,
    width: spec.w,
    height: spec.h,
    bodyTop: spec.bodyTop,
    bodyBottom: spec.bodyBottom,
    bodyX: spec.bodyX,
    bodyWidth: spec.bodyW,
    corner: spec.corner,
  });
  const outPath = join(outDir, `${spec.size}kg.svg`);
  writeFileSync(outPath, svg, 'utf8');
  console.log(`Wrote ${outPath}`);
}

console.log('All Gaspoint cylinder SVGs generated.');
