import React, { useState } from 'react';
import { Scale, Ruler, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

// Referensi Standar Antropometri WHO / Kemenkes RI (Usia 0 - 36 Bulan)
// Nilai: [Bulan, -3SD, -2SD, Median, +2SD]
const WHO_BB_BOYS = [
  [0, 2.1, 2.5, 3.3, 4.4],
  [1, 2.9, 3.4, 4.5, 5.8],
  [2, 3.8, 4.3, 5.6, 7.1],
  [3, 4.4, 5.0, 6.4, 8.0],
  [4, 4.9, 5.6, 7.0, 8.7],
  [5, 5.3, 6.0, 7.5, 9.3],
  [6, 5.7, 6.4, 7.9, 9.8],
  [7, 5.9, 6.7, 8.3, 10.3],
  [8, 6.2, 6.9, 8.6, 10.7],
  [9, 6.4, 7.1, 8.9, 11.0],
  [10, 6.6, 7.4, 9.2, 11.4],
  [11, 6.8, 7.6, 9.4, 11.7],
  [12, 6.9, 7.7, 9.6, 12.0],
  [15, 7.4, 8.3, 10.3, 12.8],
  [18, 7.8, 8.8, 10.9, 13.7],
  [21, 8.2, 9.2, 11.5, 14.5],
  [24, 8.6, 9.7, 12.2, 15.3],
  [30, 9.4, 10.5, 13.3, 16.9],
  [36, 10.0, 11.3, 14.3, 18.3],
];

const WHO_BB_GIRLS = [
  [0, 2.0, 2.4, 3.2, 4.2],
  [1, 2.7, 3.2, 4.2, 5.5],
  [2, 3.4, 3.9, 5.1, 6.6],
  [3, 4.0, 4.5, 5.8, 7.5],
  [4, 4.4, 5.0, 6.4, 8.2],
  [5, 4.8, 5.4, 6.9, 8.8],
  [6, 5.1, 5.7, 7.3, 9.3],
  [7, 5.3, 6.0, 7.6, 9.8],
  [8, 5.6, 6.2, 7.9, 10.2],
  [9, 5.8, 6.5, 8.2, 10.5],
  [10, 5.9, 6.7, 8.5, 10.9],
  [11, 6.1, 6.9, 8.7, 11.2],
  [12, 6.3, 7.0, 8.9, 11.5],
  [15, 6.7, 7.6, 9.6, 12.4],
  [18, 7.2, 8.1, 10.2, 13.2],
  [21, 7.6, 8.6, 10.9, 14.0],
  [24, 8.1, 9.0, 11.5, 14.8],
  [30, 8.8, 9.9, 12.6, 16.3],
  [36, 9.5, 10.8, 13.9, 18.0],
];

const WHO_TB_BOYS = [
  [0, 44.2, 46.1, 49.9, 53.7],
  [1, 48.9, 50.8, 54.7, 58.6],
  [2, 52.4, 54.4, 58.4, 62.4],
  [3, 55.3, 57.3, 61.4, 65.5],
  [4, 57.6, 59.7, 63.9, 68.0],
  [5, 59.6, 61.7, 65.9, 70.1],
  [6, 61.2, 63.3, 67.6, 71.9],
  [7, 62.7, 64.8, 69.2, 73.5],
  [8, 64.0, 66.2, 70.6, 75.0],
  [9, 65.2, 67.5, 72.0, 76.5],
  [10, 66.4, 68.7, 73.3, 77.9],
  [11, 67.6, 69.9, 74.5, 79.2],
  [12, 68.6, 71.0, 75.7, 80.5],
  [15, 71.6, 74.1, 79.1, 84.1],
  [18, 74.2, 76.9, 82.3, 87.7],
  [21, 76.5, 79.4, 85.1, 90.9],
  [24, 78.7, 81.7, 87.8, 93.9],
  [30, 83.4, 86.7, 93.2, 99.8],
  [36, 88.7, 91.2, 96.1, 103.5],
];

const WHO_TB_GIRLS = [
  [0, 43.6, 45.4, 49.1, 52.9],
  [1, 47.8, 49.8, 53.7, 57.6],
  [2, 51.0, 53.0, 57.1, 61.1],
  [3, 53.5, 55.6, 59.8, 64.0],
  [4, 55.6, 57.8, 62.1, 66.4],
  [5, 57.4, 59.6, 64.0, 68.5],
  [6, 58.9, 61.2, 65.7, 70.3],
  [7, 60.3, 62.7, 67.3, 71.9],
  [8, 61.7, 64.0, 68.7, 73.5],
  [9, 62.9, 65.3, 70.1, 74.9],
  [10, 64.1, 66.5, 71.5, 76.4],
  [11, 65.2, 67.7, 72.8, 77.8],
  [12, 66.3, 68.9, 74.0, 79.2],
  [15, 69.5, 72.0, 77.5, 83.0],
  [18, 72.8, 75.2, 80.7, 86.5],
  [21, 75.2, 78.0, 83.7, 89.8],
  [24, 77.5, 80.3, 86.4, 92.9],
  [30, 82.5, 85.7, 92.2, 98.9],
  [36, 87.4, 89.9, 95.1, 102.7],
];

export default function KmsChart({ anak, riwayat = [] }) {
  const [activeCurve, setActiveCurve] = useState('bb'); // 'bb' atau 'tb'
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const isBoy = anak?.jenis_kelamin === 'L';
  const childName = anak?.nama || 'Balita';

  // Pilih dataset kurva acuan WHO berdasarkan jenis kelamin & tab aktif
  const whoRefData =
    activeCurve === 'bb'
      ? isBoy
        ? WHO_BB_BOYS
        : WHO_BB_GIRLS
      : isBoy
      ? WHO_TB_BOYS
      : WHO_TB_GIRLS;

  // Tentukan batas X (Usia Bulan) - minimal 24 bulan, atau lebih jika ada balita > 24 bln
  const maxChildMonth = Math.max(
    anak?.usia_sekarang_bulan || 0,
    ...riwayat.map((r) => r.usia_bulan || 0)
  );
  const maxMonth = maxChildMonth > 24 ? (maxChildMonth > 36 ? 48 : 36) : 24;

  // Filter kurva acuan sampai maxMonth
  const activeRef = whoRefData.filter((d) => d[0] <= maxMonth);

  // Batas Skala Y
  const minY = activeCurve === 'bb' ? 0 : 40;
  const maxY = activeCurve === 'bb' ? 20 : 110;
  const unitLabel = activeCurve === 'bb' ? 'kg' : 'cm';

  // Dimensi SVG
  const width = 680;
  const height = 360;
  const padding = { top: 25, right: 35, bottom: 45, left: 50 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Fungsi Konversi Koordinat
  const getX = (month) => padding.left + (month / maxMonth) * graphWidth;
  const getY = (val) => padding.top + graphHeight - ((val - minY) / (maxY - minY)) * graphHeight;

  // Helper untuk membuat SVG path area poligon
  const makeAreaPath = (topValues, bottomValues) => {
    let path = `M ${getX(topValues[0].x)} ${getY(topValues[0].y)}`;
    for (let i = 1; i < topValues.length; i++) {
      path += ` L ${getX(topValues[i].x)} ${getY(topValues[i].y)}`;
    }
    for (let i = bottomValues.length - 1; i >= 0; i--) {
      path += ` L ${getX(bottomValues[i].x)} ${getY(bottomValues[i].y)}`;
    }
    path += ' Z';
    return path;
  };

  // Helper untuk membuat SVG line path
  const makeLinePath = (points) => {
    if (!points || points.length === 0) return '';
    return points.reduce((acc, pt, idx) => {
      const x = getX(pt.x);
      const y = getY(pt.y);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  };

  // Titik kurva WHO
  const ptsP2SD = activeRef.map((d) => ({ x: d[0], y: d[4] }));
  const ptsMedian = activeRef.map((d) => ({ x: d[0], y: d[3] }));
  const ptsM2SD = activeRef.map((d) => ({ x: d[0], y: d[2] }));
  const ptsM3SD = activeRef.map((d) => ({ x: d[0], y: d[1] }));
  const ptsBottom = activeRef.map((d) => ({ x: d[0], y: minY }));

  // Jalur Area Warna KMS
  // 1. Hijau: -2 SD s/d +2 SD (Gizi Baik / Normal)
  const pathGreenArea = makeAreaPath(ptsP2SD, ptsM2SD);
  // 2. Kuning: -3 SD s/d -2 SD (Waspada / Gizi Kurang / Pendek)
  const pathYellowArea = makeAreaPath(ptsM2SD, ptsM3SD);
  // 3. Merah: Garis bawah s/d -3 SD (Bawah Garis Merah / Stunting)
  const pathRedArea = makeAreaPath(ptsM3SD, ptsBottom);

  // Urutkan riwayat penimbangan balita
  const sortedRiwayat = [...riwayat]
    .filter((r) => (activeCurve === 'bb' ? r.berat_badan > 0 : r.tinggi_badan > 0))
    .sort((a, b) => a.usia_bulan - b.usia_bulan);

  // Titik plot pengukuran anak
  const childPoints = sortedRiwayat.map((r) => ({
    x: r.usia_bulan,
    y: activeCurve === 'bb' ? parseFloat(r.berat_badan) : parseFloat(r.tinggi_badan),
    data: r,
  }));

  const childLinePath = makeLinePath(childPoints);

  // Evaluasi Tren Kenaikan (N / T: Naik atau Tidak Naik sesuai kaidah KMS)
  let trendIndicator = null;
  if (childPoints.length >= 2) {
    const last = childPoints[childPoints.length - 1];
    const prev = childPoints[childPoints.length - 2];
    const delta = parseFloat((last.y - prev.y).toFixed(1));

    if (delta > 0) {
      trendIndicator = {
        code: 'N',
        label: 'Naik (N)',
        desc: `Pertumbuhan positif (+${delta} ${unitLabel}) dibanding bulan sebelumnya.`,
        color: 'emerald',
      };
    } else if (delta === 0) {
      trendIndicator = {
        code: 'T',
        label: 'Tetap (T)',
        desc: `Pertumbuhan mendatar (+0 ${unitLabel}). Perlu ditingkatkan nafsu makannya.`,
        color: 'amber',
      };
    } else {
      trendIndicator = {
        code: 'T',
        label: 'Turun (T)',
        desc: `Terjadi penurunan (${delta} ${unitLabel}). Segera konsultasikan ke kader/bidan.`,
        color: 'rose',
      };
    }
  } else if (childPoints.length === 1) {
    trendIndicator = {
      code: 'B',
      label: 'Pertama Kali (B)',
      desc: 'Penimbangan perdana tercatat. Pantau kenaikannya di bulan berikutnya.',
      color: 'sky',
    };
  }

  // Grid sumbu Y (kelipatan)
  const yStep = activeCurve === 'bb' ? 2 : 10;
  const yTicks = [];
  for (let val = minY; val <= maxY; val += yStep) {
    yTicks.push(val);
  }

  // Grid sumbu X (bulan: 0, 2, 4, 6, ...)
  const xTicks = [];
  for (let m = 0; m <= maxMonth; m += maxMonth <= 24 ? 2 : 4) {
    xTicks.push(m);
  }

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
            Kurva Pertumbuhan KMS Digital
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Standar Antropometri WHO / Kemenkes RI • Balita{' '}
            <span className="font-medium text-slate-700">{isBoy ? 'Laki-laki' : 'Perempuan'}</span>
          </p>
        </div>

        {/* Tab Switcher: BB/U vs TB/U (Segmented Control) */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200/70 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setActiveCurve('bb');
              setHoveredPoint(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeCurve === 'bb'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 text-slate-500" />
            <span>Berat Badan (BB/U)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveCurve('tb');
              setHoveredPoint(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeCurve === 'tb'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-slate-500" />
            <span>Tinggi Badan (TB/U)</span>
          </button>
        </div>
      </div>

      {/* Indikator Status & Keterangan Pita KMS */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Pita Legenda Warna KMS */}
        <div className="flex items-center gap-4 flex-wrap text-slate-600 text-[11px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Gizi Baik / Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Garis Kuning (Waspada)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            <span>Bawah Garis Merah (BGM)</span>
          </div>
        </div>

        {/* Status Tren KMS (N / T) */}
        {trendIndicator && (
          <div
            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border ${
              trendIndicator.color === 'emerald'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : trendIndicator.color === 'rose'
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : trendIndicator.color === 'amber'
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-sky-50 text-sky-700 border-sky-200'
            }`}
          >
            {trendIndicator.color === 'emerald' ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trendIndicator.color === 'rose' ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>Status: {trendIndicator.label}</span>
          </div>
        )}
      </div>

      {/* Container SVG Grafik KMS */}
      <div className="relative w-full overflow-x-auto rounded-lg bg-slate-50/40 p-2 border border-slate-200">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto min-w-[580px] select-none"
        >
          {/* 1. Pita Area Standar WHO (Clean, Calm Semi-Transparent Fills) */}
          <path d={pathRedArea} fill="#ef4444" fillOpacity="0.08" />
          <path d={pathYellowArea} fill="#f59e0b" fillOpacity="0.08" />
          <path d={pathGreenArea} fill="#10b981" fillOpacity="0.09" />

          {/* Garis batas kurva WHO */}
          <path d={makeLinePath(ptsP2SD)} fill="none" stroke="#10b981" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
          <path d={makeLinePath(ptsMedian)} fill="none" stroke="#059669" strokeWidth="1.5" />
          <path d={makeLinePath(ptsM2SD)} fill="none" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.7" />
          <path d={makeLinePath(ptsM3SD)} fill="none" stroke="#ef4444" strokeWidth="1.5" />

          {/* 2. Grid Garis Horizontal (Sumbu Y) */}
          {yTicks.map((val) => {
            const y = getY(val);
            return (
              <g key={`y-${val}`}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
                <text
                  x={padding.left - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  fontSize="10"
                  fontWeight="500"
                  fill="#94a3b8"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Label Sumbu Y */}
          <text
            x={padding.left}
            y={padding.top - 10}
            fontSize="10"
            fontWeight="600"
            fill="#475569"
          >
            {activeCurve === 'bb' ? 'Berat Badan (kg)' : 'Tinggi Badan (cm)'}
          </text>

          {/* 3. Grid Garis Vertikal (Sumbu X) */}
          {xTicks.map((month) => {
            const x = getX(month);
            return (
              <g key={`x-${month}`}>
                <line
                  x1={x}
                  y1={padding.top}
                  x2={x}
                  y2={height - padding.bottom}
                  stroke="#e2e8f0"
                  strokeWidth="0.75"
                  strokeDasharray="2 2"
                />
                <text
                  x={x}
                  y={height - padding.bottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="500"
                  fill="#94a3b8"
                >
                  {month}
                </text>
              </g>
            );
          })}

          {/* Label Sumbu X */}
          <text
            x={width - padding.right}
            y={height - padding.bottom + 34}
            textAnchor="end"
            fontSize="10"
            fontWeight="500"
            fill="#94a3b8"
          >
            Usia (Bulan)
          </text>

          {/* 4. Garis Kurva Pertumbuhan Riil Balita (Solid, High-Contrast Line) */}
          {childPoints.length > 0 && (
            <>
              <path
                d={childLinePath}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Titik-titik Pengukuran (Dots) */}
              {childPoints.map((pt, idx) => {
                const cx = getX(pt.x);
                const cy = getY(pt.y);
                const isHovered = hoveredPoint?.data?.id === pt.data.id;

                return (
                  <g
                    key={idx}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onClick={() => setHoveredPoint(pt)}
                  >
                    {/* Ring Luar Saat Hover */}
                    {isHovered && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="9"
                        fill="#0284c7"
                        fillOpacity="0.15"
                      />
                    )}

                    {/* Titik Utama */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isHovered ? '5' : '4'}
                      fill="#ffffff"
                      stroke="#0284c7"
                      strokeWidth="2.5"
                    />

                    {/* Label Angka Nilai di Atas Titik */}
                    <text
                      x={cx}
                      y={cy - 8}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="600"
                      fill="#0f172a"
                      className="select-none"
                    >
                      {pt.y}
                    </text>
                  </g>
                );
              })}
            </>
          )}

          {/* Label Kurva Rujukan */}
          <text
            x={width - padding.right - 10}
            y={getY(ptsMedian[ptsMedian.length - 1].y) - 4}
            textAnchor="end"
            fontSize="9"
            fontWeight="600"
            fill="#059669"
            opacity="0.8"
          >
            Median
          </text>
          <text
            x={width - padding.right - 10}
            y={getY(ptsM3SD[ptsM3SD.length - 1].y) + 12}
            textAnchor="end"
            fontSize="9"
            fontWeight="600"
            fill="#dc2626"
            opacity="0.8"
          >
            Garis Merah
          </text>
        </svg>

        {/* Empty State jika belum ada pengukuran */}
        {childPoints.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg">
            <div className="text-center p-4">
              <Info className="w-5 h-5 mx-auto text-slate-400 mb-1" />
              <p className="text-xs font-semibold text-slate-700">Belum Ada Data Pengukuran</p>
              <p className="text-[11px] text-slate-400">
                Input penimbangan balita untuk melihat titik pada kurva KMS.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Detail Titik Timbang yang Dipilih / Dihover */}
      {hoveredPoint && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900">
                Usia {hoveredPoint.data.usia_bulan} Bulan
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                Tgl: {new Date(hoveredPoint.data.tgl_timbang).toLocaleDateString('id-ID')}
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Berat: <span className="font-semibold text-slate-800">{hoveredPoint.data.berat_badan} kg</span> | Tinggi:{' '}
              <span className="font-semibold text-slate-800">{hoveredPoint.data.tinggi_badan} cm</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-white rounded-md text-slate-700 border border-slate-200 text-xs font-medium shadow-xs">
              Status Gizi: {hoveredPoint.data.status_gizi || 'Normal'}
            </span>
          </div>
        </div>
      )}

      {/* Catatan Panduan KMS */}
      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 flex items-start gap-2.5 text-[11px] text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-800">Petunjuk Pembacaan KMS:</span> Titik penimbangan yang mengikuti arah pita hijau menandakan tumbuh kembang normal. Jika grafik mendatar atau menurun mendekati garis kuning/merah, segera lakukan evaluasi asupan gizi atau konsultasi ke bidan/tenaga kesehatan.
        </div>
      </div>
    </div>
  );
}
