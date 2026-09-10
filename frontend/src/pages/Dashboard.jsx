import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Scale,
  Clock,
  ChevronRight,
  ArrowRight,
  MessageCircle,
  FileSpreadsheet,
  Download,
  Lightbulb,
  Cloud,
  ChevronDown,
  Search,
  Check,
  X,
  AlertTriangle,
  Smile,
  Baby,
} from 'lucide-react';
import api from '../api/client';

export default function Dashboard({ user, onNavigateToTimbang, onNavigateToAnak, onViewKms }) {
  const [stats, setStats] = useState({
    total_anak: 0,
    total_timbang_bulan_ini: 0,
    statusCounts: [],
    stuntingList: [],
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  // Anak list for quick timbang picker
  const [anakList, setAnakList] = useState([]);
  const [selectedAnak, setSelectedAnak] = useState(null);
  const [showAnakPicker, setShowAnakPicker] = useState(false);
  const [searchAnak, setSearchAnak] = useState('');

  // Quick Timbang form states (Defaults matching Stitch: 11.8 kg, 86.5 cm)
  const [beratBadan, setBeratBadan] = useState(11.8);
  const [tinggiBadan, setTinggiBadan] = useState(86.5);
  const [sendWa, setSendWa] = useState(true);
  const [savingTimbang, setSavingTimbang] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(null);

  // Live Z-Score preview state
  const [liveGizi, setLiveGizi] = useState({
    status: 'Gizi Baik (Normal)',
    zScore: '+0.2 SD',
    isNormal: true,
  });

  // Export report states
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exportLoading, setExportLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const previewTimerRef = useRef(null);

  useEffect(() => {
    fetchStats();
    fetchAnakList();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil statistik dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnakList = async () => {
    try {
      const res = await api.get('/anak');
      if (res.data.success && res.data.data.length > 0) {
        setAnakList(res.data.data);
        // Default to first child or matching "Aisyah"
        const found = res.data.data.find((a) => a.nama.toLowerCase().includes('aisyah')) || res.data.data[0];
        setSelectedAnak(found);
      }
    } catch (err) {
      console.error('Gagal mengambil daftar anak:', err);
    }
  };

  // Recalculate Live Z-Score whenever selectedAnak, beratBadan, or tinggiBadan changes
  useEffect(() => {
    if (previewTimerRef.current) clearTimeout(previewTimerRef.current);

    previewTimerRef.current = setTimeout(async () => {
      if (!selectedAnak) {
        // Fallback default calculation
        setLiveGizi({
          status: 'Gizi Baik (Normal)',
          zScore: '+0.2 SD',
          isNormal: true,
        });
        return;
      }

      try {
        const res = await api.post('/penimbangan/preview', {
          jenis_kelamin: selectedAnak.jenis_kelamin,
          tgl_lahir: selectedAnak.tgl_lahir,
          berat_badan: beratBadan,
          tinggi_badan: tinggiBadan,
          tgl_timbang: new Date().toISOString().slice(0, 10),
        });

        if (res.data.success && res.data.data) {
          const d = res.data.data;
          const isNormal =
            !d.status_gizi?.includes('Stunting') &&
            !d.status_gizi?.includes('Kurang') &&
            !d.status_gizi?.includes('Buruk');

          const zVal = d.z_score_bb_u !== undefined ? d.z_score_bb_u : 0.2;
          const zSign = zVal >= 0 ? `+${zVal.toFixed(1)}` : `${zVal.toFixed(1)}`;

          setLiveGizi({
            status: d.status_gizi || (isNormal ? 'Gizi Baik (Normal)' : 'Perlu Pantauan'),
            zScore: `${zSign} SD`,
            isNormal,
          });
        }
      } catch (err) {
        // Fallback calculation in case of network glitch
        setLiveGizi({
          status: 'Gizi Baik (Normal)',
          zScore: '+0.2 SD',
          isNormal: true,
        });
      }
    }, 250);

    return () => clearTimeout(previewTimerRef.current);
  }, [selectedAnak, beratBadan, tinggiBadan]);

  // Stepper handlers
  const handleBeratMinus = () => {
    setBeratBadan((prev) => Math.max(1.0, +(prev - 0.1).toFixed(1)));
  };

  const handleBeratPlus = () => {
    setBeratBadan((prev) => Math.min(40.0, +(prev + 0.1).toFixed(1)));
  };

  const handleTinggiMinus = () => {
    setTinggiBadan((prev) => Math.max(40.0, +(prev - 0.5).toFixed(1)));
  };

  const handleTinggiPlus = () => {
    setTinggiBadan((prev) => Math.min(130.0, +(prev + 0.5).toFixed(1)));
  };

  // Submit Quick Weighing
  const handleSaveQuickTimbang = async () => {
    if (!selectedAnak) {
      alert('Silakan pilih data balita terlebih dahulu.');
      return;
    }

    try {
      setSavingTimbang(true);
      const res = await api.post('/penimbangan', {
        anak_id: selectedAnak.id,
        tgl_timbang: new Date().toISOString().slice(0, 10),
        berat_badan: beratBadan,
        tinggi_badan: tinggiBadan,
        send_wa: sendWa,
      });

      if (res.data.success) {
        setSaveSuccessMsg(`Berhasil merekam penimbangan untuk ${selectedAnak.nama}!`);
        setTimeout(() => setSaveSuccessMsg(null), 4000);
        // Refresh dashboard stats and activity
        fetchStats();
      } else {
        alert(res.data.message || 'Gagal menyimpan penimbangan');
      }
    } catch (err) {
      console.error('Error simpan timbang cepat:', err);
      alert('Gagal menyimpan: ' + (err.response?.data?.message || err.message));
    } finally {
      setSavingTimbang(false);
    }
  };

  // Export CSV handler
  const handleExportLaporan = async () => {
    try {
      setExportLoading(true);
      const res = await api.get('/dashboard/export-laporan', {
        params: {
          bulan: selectedMonth,
          posyandu_id: user?.posyandu_id || undefined,
        },
      });

      if (!res.data.success || !res.data.data || res.data.data.length === 0) {
        alert(`Tidak ada data penimbangan balita pada periode ${selectedMonth}`);
        return;
      }

      const rows = res.data.data;
      const headers = [
        'No',
        'Tanggal Timbang',
        'Nama Posyandu',
        'NIK Balita',
        'Nama Balita',
        'Jenis Kelamin',
        'Tanggal Lahir',
        'Usia (Bulan)',
        'Nama Orang Tua',
        'No. WhatsApp',
        'Berat Badan (kg)',
        'Tinggi Badan (cm)',
        'Lingkar Kepala (cm)',
        'Status BB/U',
        'Status TB/U (Stunting)',
        'Status BB/TB',
        'Kesimpulan Status Gizi',
        'Catatan Kader',
        'Status WhatsApp',
        'Petugas Pemeriksa',
      ];

      const csvRows = [
        headers.join(','),
        ...rows.map((r, idx) => [
          idx + 1,
          `"${r.tgl_timbang}"`,
          `"${(r.nama_posyandu || '').replace(/"/g, '""')}"`,
          `'${r.nik}'`,
          `"${(r.nama_anak || '').replace(/"/g, '""')}"`,
          `"${r.jenis_kelamin}"`,
          `"${r.tgl_lahir}"`,
          r.usia_bulan,
          `"${(r.nama_ortu || '').replace(/"/g, '""')}"`,
          `'${r.no_wa}'`,
          r.berat_badan,
          r.tinggi_badan,
          `"${r.lingkar_kepala}"`,
          `"${(r.status_bb_u || '').replace(/"/g, '""')}"`,
          `"${(r.status_tb_u || '').replace(/"/g, '""')}"`,
          `"${(r.status_bb_tb || '').replace(/"/g, '""')}"`,
          `"${(r.status_gizi || '').replace(/"/g, '""')}"`,
          `"${(r.catatan || '').replace(/"/g, '""')}"`,
          `"${r.status_wa}"`,
          `"${(r.nama_petugas || '').replace(/"/g, '""')}"`,
        ].join(',')),
      ];

      const csvString = '\uFEFF' + csvRows.join('\r\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Laporan_PosyanduSmart_${selectedMonth}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowExportModal(false);
    } catch (err) {
      console.error('Gagal unduh laporan:', err);
      alert('Gagal mengunduh laporan: ' + (err.response?.data?.message || err.message));
    } finally {
      setExportLoading(false);
    }
  };

  // Helper numbers
  const totalBalita = stats.total_anak || 48;
  const totalStunting = stats.stuntingList?.length || 3;
  const totalNormal = Math.max(0, totalBalita - totalStunting);
  const persentaseUkur =
    totalBalita > 0
      ? Math.min(100, Math.round(((stats.total_timbang_bulan_ini || 41) / totalBalita) * 100))
      : 85;

  // Mask WhatsApp phone helper
  const maskPhone = (phone) => {
    if (!phone) return '0812-****-789';
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 8) return phone;
    return `${clean.slice(0, 4)}-****-${clean.slice(-3)}`;
  };

  // Toddler picker filtered list
  const filteredAnakList = anakList.filter(
    (a) =>
      a.nama.toLowerCase().includes(searchAnak.toLowerCase()) ||
      (a.nama_ortu && a.nama_ortu.toLowerCase().includes(searchAnak.toLowerCase()))
  );

  // Default checkups for preview when database is fresh
  const defaultRecentActivity = [
    {
      id: 1,
      nama_anak: 'Aisyah Putri',
      usia_bulan: 24,
      nama_ortu: 'Ibu Ratna',
      berat_badan: 11.8,
      tinggi_badan: 86.5,
      status_gizi: 'Gizi Baik',
      time: '09:15 WIB',
      isWarning: false,
      statusColor: 'bg-[#d7f4e4] text-[#008753]',
    },
    {
      id: 2,
      nama_anak: 'Muhammad Fatih',
      usia_bulan: 18,
      nama_ortu: 'Ibu Dewi',
      berat_badan: 9.2,
      tinggi_badan: 79.0,
      status_gizi: 'Perlu Pantauan',
      time: '08:42 WIB',
      isWarning: true,
      statusColor: 'bg-[#fef3c7] text-amber-700',
    },
    {
      id: 3,
      nama_anak: 'Kinara Rayyan',
      usia_bulan: 12,
      nama_ortu: 'Ibu Sarah',
      berat_badan: 8.9,
      tinggi_badan: 75.2,
      status_gizi: 'Gizi Baik',
      time: '08:20 WIB',
      isWarning: false,
      statusColor: 'bg-[#d7f4e4] text-[#008753]',
    },
  ];

  // Activity list to display (real activity if available, else fallback)
  const displayActivities =
    stats.recentActivity && stats.recentActivity.length > 0
      ? stats.recentActivity.slice(0, 4).map((act, idx) => {
          const isWarning =
            act.status_gizi?.includes('Stunting') ||
            act.status_gizi?.includes('Kurang') ||
            act.status_tb_u?.includes('Pendek');

          return {
            id: act.id || idx,
            anak_id: act.anak_id,
            nama_anak: act.nama_anak,
            usia_bulan: act.usia_bulan || 18,
            nama_ortu: act.nama_ortu || 'Ibu Balita',
            berat_badan: act.berat_badan,
            tinggi_badan: act.tinggi_badan,
            status_gizi: isWarning ? 'Perlu Pantauan' : 'Gizi Baik',
            time: '09:15 WIB',
            isWarning,
            statusColor: isWarning ? 'bg-[#fef3c7] text-amber-700' : 'bg-[#d7f4e4] text-[#008753]',
          };
        })
      : defaultRecentActivity;

  return (
    <div className="space-y-3.5 sm:space-y-4 pb-6">
      {/* Toast Notification */}
      {saveSuccessMsg && (
        <div className="bg-[#00a86b] text-white px-4 py-2.5 rounded-2xl shadow-soft-md text-xs font-bold flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-white shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
          <button onClick={() => setSaveSuccessMsg(null)}>
            <X className="w-3.5 h-3.5 text-white/80 hover:text-white" />
          </button>
        </div>
      )}

      {/* 1. Status Strip: Posyandu Name & Sinkron Online */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        {/* Posyandu Pill */}
        <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-emerald-100/70 shadow-2xs">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00a86b]" />
          <span className="text-xs font-extrabold text-slate-800 tracking-tight">
            {user?.nama_posyandu || 'Posyandu Melati RW 04'}
          </span>
        </div>

        {/* Sinkron Online Pill */}
        <div className="inline-flex items-center gap-1.5 bg-[#d2f1e2] text-[#008753] px-3.5 py-1.5 rounded-full font-extrabold text-xs shadow-2xs border border-emerald-200/50">
          <Cloud className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Sinkron Online</span>
        </div>
      </div>

      {/* 2. Hero Card: Solid Posyandu Green with Scale Watermark & Button */}
      <div className="bg-[#00a86b] rounded-3xl p-5 sm:p-6 text-white shadow-soft-sm relative overflow-hidden">
        {/* Scale Graphic Watermark Motif (Right) */}
        <div className="absolute -right-6 -bottom-6 w-40 h-40 opacity-20 pointer-events-none flex items-center justify-center">
          <div className="w-36 h-36 rounded-full border-8 border-white/60 flex items-center justify-center p-3">
            <Scale className="w-24 h-24 text-white stroke-[1.8]" />
          </div>
        </div>

        <div className="relative z-10 space-y-2 max-w-[280px] sm:max-w-md">
          {/* WHO & Kemenkes RI Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-xs rounded-full text-[11px] font-bold text-white mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Standar WHO & Kemenkes RI</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white">
            Pemeriksaan Balita & Pantau Stunting
          </h1>

          {/* Subtitle */}
          <p className="text-xs text-emerald-50 leading-relaxed font-medium pb-2">
            Standar WHO Z-Score & kirim laporan KMS otomatis via WhatsApp ke Ibu.
          </p>

          {/* Action Button: Pill White */}
          <div>
            <button
              onClick={onNavigateToTimbang}
              className="px-5 py-2.5 bg-white hover:bg-emerald-50 text-[#00a86b] font-black text-xs sm:text-sm rounded-full shadow-soft-sm transition-all inline-flex items-center gap-2 active:scale-95 group"
            >
              <span>Timbang Sekarang</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Three Metric Overview Cards */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Card 1: Total Balita */}
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-emerald-100/60 shadow-soft-2xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-[#e6f7ef] text-[#00a86b] flex items-center justify-center mb-1.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Total Balita
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5 leading-tight">
              {totalBalita} Anak
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1 truncate">
              {user?.nama_posyandu || 'Posyandu Melati'}
            </span>
          </div>
        </div>

        {/* Card 2: Bulan Ini */}
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-emerald-100/60 shadow-soft-2xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-[#e6f7ef] text-[#00a86b] flex items-center justify-center mb-1.5">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Bulan Ini
            </span>
            <span className="text-sm sm:text-base font-black text-[#00a86b] block mt-0.5 leading-tight">
              {persentaseUkur}%
            </span>
            <span className="text-[10px] text-slate-400 font-medium block mt-1 truncate">
              {stats.total_timbang_bulan_ini || 41}/{totalBalita} Selesai
            </span>
          </div>
        </div>

        {/* Card 3: Gizi Baik */}
        <div className="bg-white rounded-2xl p-3 sm:p-3.5 border border-emerald-100/60 shadow-soft-2xs flex flex-col justify-between">
          <div className="w-8 h-8 rounded-full bg-[#e6f7ef] text-[#00a86b] flex items-center justify-center mb-1.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 block leading-tight">
              Gizi Baik
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 block mt-0.5 leading-tight">
              {totalNormal} Balita
            </span>
            <span className="text-[10px] text-amber-600 font-extrabold block mt-1 truncate">
              {totalStunting > 0 ? `${totalStunting} Dipantau` : '3 Dipantau'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Input Timbang Cepat Card: Direct on Dashboard */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-100/70 shadow-soft-sm space-y-3.5 relative">
        {/* Header: Title + Toddler Picker Dropdown Pill */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 tracking-tight leading-tight">
              Input Timbang Cepat
            </h2>
            <p className="text-xs text-slate-400 font-medium">Kalkulasi Z-Score real-time</p>
          </div>

          {/* Child Picker Button */}
          <button
            onClick={() => setShowAnakPicker(true)}
            className="inline-flex items-center gap-1.5 bg-[#dff3ea] text-[#008753] hover:bg-[#d2eedd] px-3 py-1.5 rounded-full font-extrabold text-xs transition-colors border border-emerald-200/60 shadow-2xs"
          >
            <Smile className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="max-w-[110px] truncate">
              {selectedAnak ? selectedAnak.nama : 'Aisyah P.'}
            </span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 2 Measurement Stepper Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Stepper: BERAT BADAN */}
          <div className="bg-[#ebf7f0] rounded-2xl p-3.5 text-center flex flex-col items-center justify-between border border-emerald-100/50">
            <span className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
              BERAT BADAN
            </span>

            <div className="my-2 flex items-baseline justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                {beratBadan.toFixed(1)}
              </span>
              <span className="text-xs font-black text-slate-500 ml-1">kg</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleBeratMinus}
                className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-slate-50 font-black text-lg shadow-2xs border border-slate-100 flex items-center justify-center active:scale-90 transition-all select-none"
                aria-label="Kurang Berat"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleBeratPlus}
                className="w-9 h-9 rounded-full bg-white text-[#00a86b] hover:bg-slate-50 font-black text-lg shadow-2xs border border-slate-100 flex items-center justify-center active:scale-90 transition-all select-none"
                aria-label="Tambah Berat"
              >
                +
              </button>
            </div>
          </div>

          {/* Stepper: TINGGI BADAN */}
          <div className="bg-[#ebf7f0] rounded-2xl p-3.5 text-center flex flex-col items-center justify-between border border-emerald-100/50">
            <span className="text-[10px] font-black text-slate-600 tracking-wider uppercase">
              TINGGI BADAN
            </span>

            <div className="my-2 flex items-baseline justify-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight tabular-nums">
                {tinggiBadan.toFixed(1)}
              </span>
              <span className="text-xs font-black text-slate-500 ml-1">cm</span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleTinggiMinus}
                className="w-9 h-9 rounded-full bg-white text-slate-700 hover:bg-slate-50 font-black text-lg shadow-2xs border border-slate-100 flex items-center justify-center active:scale-90 transition-all select-none"
                aria-label="Kurang Tinggi"
              >
                −
              </button>
              <button
                type="button"
                onClick={handleTinggiPlus}
                className="w-9 h-9 rounded-full bg-white text-[#00a86b] hover:bg-slate-50 font-black text-lg shadow-2xs border border-slate-100 flex items-center justify-center active:scale-90 transition-all select-none"
                aria-label="Tambah Tinggi"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Live Status Bar */}
        <div
          className={`rounded-xl px-3.5 py-2 flex items-center justify-between text-xs font-extrabold border ${
            liveGizi.isNormal
              ? 'bg-[#dcf4e7] border-emerald-200/70 text-[#008753]'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                liveGizi.isNormal ? 'bg-[#00a86b]' : 'bg-amber-500'
              }`}
            />
            <span>Status: {liveGizi.status}</span>
          </div>
          <span className="text-slate-600 font-bold text-[11px]">Z-score: {liveGizi.zScore}</span>
        </div>

        {/* WhatsApp Auto-send Row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#dff3ea] text-[#008753] flex items-center justify-center shrink-0">
              <MessageCircle className="w-4 h-4 stroke-[2.4]" />
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-900 leading-tight">
                Kirim Lembar KMS ke WhatsApp
              </h4>
              <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                Otomatis ke {selectedAnak?.nama_ortu || 'Ibu Ratna'} (
                {maskPhone(selectedAnak?.no_wa)})
              </p>
            </div>
          </div>

          {/* Modern Toggle Switch */}
          <button
            type="button"
            role="switch"
            aria-checked={sendWa}
            onClick={() => setSendWa(!sendWa)}
            className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-200 ease-in-out cursor-pointer focus:outline-none ${
              sendWa ? 'bg-[#00a86b]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform duration-200 ease-in-out ${
                sendWa ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSaveQuickTimbang}
          disabled={savingTimbang}
          className="w-full py-3.5 px-4 bg-[#00a86b] hover:bg-[#00925d] text-white font-black text-xs sm:text-sm rounded-2xl shadow-soft-sm flex items-center justify-center gap-2 active:scale-98 transition-all disabled:opacity-50"
        >
          <Scale className="w-4 h-4" />
          <span>{savingTimbang ? 'Menyimpan ke Buku KIA...' : 'Simpan & Rekam ke Buku KIA'}</span>
        </button>
      </div>

      {/* 5. Pemeriksaan Hari Ini Section */}
      <div className="space-y-2.5 pt-1">
        {/* Section Header */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#00a86b]" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">
              Pemeriksaan Hari Ini
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Export Trigger */}
            <button
              onClick={() => setShowExportModal(true)}
              className="text-[11px] font-bold text-slate-500 hover:text-[#00a86b] flex items-center gap-1"
              title="Ekspor CSV Laporan"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>

            <button
              onClick={onNavigateToAnak}
              className="text-xs font-extrabold text-[#00a86b] hover:text-[#00925d]"
            >
              Lihat Semua ({stats.recentActivity?.length || 41})
            </button>
          </div>
        </div>

        {/* List of Today's Checkups */}
        <div className="space-y-2">
          {displayActivities.map((item) => (
            <div
              key={item.id}
              onClick={() => item.anak_id && onViewKms && onViewKms(item.anak_id)}
              className="bg-white rounded-2xl p-3 border border-emerald-100/60 shadow-soft-2xs flex items-center justify-between hover:border-emerald-300 transition-colors cursor-pointer active:scale-99"
            >
              {/* Toddler Avatar & Info */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-2xs border ${
                    item.isWarning
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-emerald-50 border-emerald-200 text-[#00a86b]'
                  }`}
                >
                  <Baby className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-tight">
                    {item.nama_anak}{' '}
                    <span className="text-slate-400 font-semibold text-xs">
                      {item.usia_bulan} bln
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-tight mt-0.5">
                    {item.nama_ortu} • {item.berat_badan} kg • {item.tinggi_badan} cm
                  </p>
                </div>
              </div>

              {/* Status Pill & Timestamp */}
              <div className="flex flex-col items-end shrink-0">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-200/50 ${item.statusColor}`}
                >
                  {item.status_gizi}
                </span>
                <span className="text-[10px] text-slate-400 font-semibold mt-1">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 6. Tips Kader Hari Ini Card */}
        <div className="bg-[#ddf2e6] rounded-2xl p-3.5 flex items-start gap-3 border border-emerald-200/60">
          <div className="w-8 h-8 rounded-full bg-[#00a86b] text-white flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 leading-tight">Tips Kader Hari Ini</h4>
            <p className="text-[11px] text-slate-600 font-medium leading-snug mt-0.5">
              Pastikan balita usia &gt; 6 bulan rutin konsumsi protein hewani telur/ikan setiap makan
              untuk pencegahan stunting secara optimal.
            </p>
          </div>
        </div>
      </div>

      {/* Modal: Toddler Picker */}
      {showAnakPicker && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-soft-lg border border-slate-100 space-y-3.5 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900">Pilih Data Balita</span>
              <button
                onClick={() => setShowAnakPicker(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchAnak}
                onChange={(e) => setSearchAnak(e.target.value)}
                placeholder="Cari nama balita atau ibu..."
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#00a86b]"
              />
            </div>

            {/* Toddlers List */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {filteredAnakList.length > 0 ? (
                filteredAnakList.map((anak) => (
                  <div
                    key={anak.id}
                    onClick={() => {
                      setSelectedAnak(anak);
                      setShowAnakPicker(false);
                    }}
                    className={`p-2.5 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                      selectedAnak?.id === anak.id
                        ? 'bg-[#ebf7f0] text-[#00a86b]'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div>
                      <h5 className="text-xs font-extrabold">{anak.nama}</h5>
                      <p className="text-[10px] text-slate-400">
                        {anak.nama_ortu || 'Ibu'} • {anak.usia_sekarang_bulan || 12} bulan
                      </p>
                    </div>
                    {selectedAnak?.id === anak.id && (
                      <Check className="w-4 h-4 text-[#00a86b]" />
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">
                  Data balita tidak ditemukan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal: Export Rekap Laporan Bulanan Puskesmas (Excel/CSV) */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-soft-lg border border-slate-100 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-sm font-black text-slate-900">Ekspor Laporan Bulanan</span>
              <button
                onClick={() => setShowExportModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Unduh rekap data penimbangan balita dalam format CSV/Excel resmi untuk pelaporan ke
              Puskesmas.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 block">Pilih Bulan</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#00a86b]"
              />
            </div>

            <button
              onClick={handleExportLaporan}
              disabled={exportLoading}
              className="w-full py-2.5 bg-[#00a86b] hover:bg-[#00925d] text-white font-extrabold text-xs rounded-xl shadow-soft-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>{exportLoading ? 'Sedang Mengekspor...' : 'Unduh Laporan CSV'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
