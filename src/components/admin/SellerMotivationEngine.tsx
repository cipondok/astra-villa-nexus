import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Copy, Clock, TrendingDown, Handshake, Zap, BarChart3, DollarSign, Home, AlertTriangle, ChevronRight, Target, RefreshCw, Calendar, Shield } from "lucide-react";
import { toast } from "sonner";

const anim = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.04 } } };
function cp(t: string) { navigator.clipboard.writeText(t); toast.success("Copied"); }

const CopyBlock = ({ text, label, tone }: { text: string; label?: string; tone?: string }) => (
  <div className="relative">
    {(label || tone) && (
      <div className="flex items-center gap-2 mb-2">
        {label && <Badge variant="secondary" className="text-[10px]">{label}</Badge>}
        {tone && <Badge variant="outline" className="text-[10px]">{tone}</Badge>}
      </div>
    )}
    <pre className="text-xs bg-muted p-3 rounded-lg whitespace-pre-wrap font-sans leading-relaxed">{text}</pre>
    <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-6 w-6 p-0" onClick={() => cp(text)}>
      <Copy className="w-3 h-3" />
    </Button>
  </div>
);

const URGENCY = [
  {
    frame: "Market Timing Window",
    icon: Clock,
    psychology: "Position current moment as optimal — delay equals loss",
    chat: `Pak/Bu [Nama], saya ingin share update pasar yang menurut saya penting untuk keputusan Anda.

📊 Kondisi pasar saat ini di [Area]:
• Jumlah investor aktif yang mencari: [X] orang
• Rata-rata waktu listing terjual: [Y] hari
• Tren harga 3 bulan terakhir: [naik/stabil/mulai melambat]

Yang perlu diperhatikan:
Pasar properti bergerak dalam siklus. Saat ini kita berada di fase dimana buyer demand masih kuat — tapi sinyal menunjukkan [faktor: kenaikan suku bunga / musim sepi / new supply masuk] bisa mengubah dinamika dalam [X] minggu ke depan.

Artinya: window terbaik untuk mendapatkan harga optimal adalah sekarang, bukan nanti.

Saya tidak ingin Anda terburu-buru — tapi saya juga tidak ingin Anda kehilangan momentum yang ada sekarang.

Mau kita diskusikan strategi pricing yang optimal untuk window ini?`,
    call: `• "Pasar sedang di fase yang menguntungkan seller — tapi window-nya terbatas."
• "Data kami menunjukkan buyer activity akan shifting dalam beberapa minggu."
• "Ini bukan soal buru-buru — ini soal timing yang tepat."
• "Lebih baik close di harga bagus sekarang daripada menunggu tanpa kepastian."`,
  },
  {
    frame: "Buyer Demand Fluctuation",
    icon: BarChart3,
    psychology: "Show that demand is real but not permanent",
    chat: `Pak/Bu [Nama], update penting soal interest di properti Anda:

📈 Aktivitas minggu ini:
• [X] investor melihat listing Anda
• [Y] menyimpan ke watchlist
• [Z] menanyakan detail lebih lanjut

Ini sinyal positif — artinya properti Anda menarik perhatian pasar.

Tapi yang perlu saya sampaikan secara jujur:
Dari pengalaman kami, investor yang aktif browsing sekarang biasanya membuat keputusan dalam [7-14] hari. Setelah itu, mereka beralih ke opsi lain atau menunda investasi.

Kalau kita bisa merespons interest ini dengan cepat — jadwalkan viewing, tunjukkan fleksibilitas, berikan informasi lengkap — peluang closing jauh lebih tinggi.

Demand itu seperti gelombang: datangnya cepat, perginya juga cepat. Lebih baik kita tangkap sekarang.

Bagaimana kalau kita atur jadwal viewing minggu ini?`,
    call: `• "Ada interest nyata di properti Anda — tapi investor tidak akan menunggu lama."
• "Demand bergerak dalam gelombang. Yang sekarang ini kuat, tapi sementara."
• "Kalau kita responsif sekarang, peluang closing minggu ini tinggi."
• "Saya suggest kita tangkap momentum ini sebelum perhatian investor berpindah."`,
  },
  {
    frame: "Liquidity Opportunity Positioning",
    icon: Zap,
    psychology: "Frame the sale as a strategic capital event, not just selling property",
    chat: `Pak/Bu [Nama], saya ingin reframe perspektif tentang properti Anda:

Properti yang sudah listing lama tanpa progress sebenarnya bukan aset — itu capital yang terkunci.

💡 Pertimbangan finansial:
• Modal yang terikat di properti ini: Rp [X]B
• Opportunity cost per tahun (jika diinvestasikan di instrumen lain): estimasi Rp [Y]M
• Biaya pemeliharaan + pajak tahunan: Rp [Z]M
• Total biaya "menunggu" per bulan: estimasi Rp [A]M

Sebaliknya, jika closing terjadi sekarang:
• Capital bisa langsung di-deploy ke instrumen yang menghasilkan
• Tidak ada lagi biaya pemeliharaan
• Peace of mind — tidak perlu mikir soal properti ini lagi

Kadang keputusan terbaik bukan mendapatkan harga tertinggi — tapi mendapatkan harga yang tepat di waktu yang tepat, lalu menggunakan capital-nya lebih produktif.

Mau kita hitung bersama berapa sebenarnya "biaya menunggu" untuk properti Anda?`,
    call: `• "Properti yang tidak terjual bukan aset — itu capital yang terkunci."
• "Setiap bulan menunggu punya biaya nyata: maintenance, pajak, opportunity cost."
• "Closing sekarang di harga yang fair bisa lebih menguntungkan daripada menunggu harga impian."
• "Mari kita hitung cost of waiting yang sebenarnya."`,
  },
  {
    frame: "Cost of Waiting Narrative",
    icon: TrendingDown,
    psychology: "Make inaction feel expensive — quantify the invisible loss",
    chat: `Pak/Bu [Nama], saya perlu jujur tentang sesuatu yang jarang dibicarakan:

⏳ Fakta tentang listing yang terlalu lama di pasar:

1. Stigma pasar — Setelah [60-90] hari, investor mulai bertanya "kenapa belum terjual?" Persepsi bergeser dari "opportunity" ke "ada masalah."

2. Price erosion — Data kami menunjukkan listing yang >90 hari rata-rata akhirnya close di harga [10-15]% lebih rendah dari yang bisa didapat di bulan pertama.

3. Negotiation power shift — Semakin lama di pasar, semakin kuat posisi buyer untuk menawar agresif. Mereka tahu Anda butuh jual.

4. Opportunity cost — Sementara properti ini menunggu, capital Anda tidak menghasilkan apa-apa.

Properti Anda sudah [X] hari di pasar. Saya tidak ingin kita masuk ke zona dimana persepsi pasar mulai berubah negatif.

Rekomendasi saya: mari kita evaluasi pricing strategy dan buat properti ini menjadi yang paling kompetitif di segmennya. Lebih baik close di harga yang sedikit lebih rendah tapi cepat, daripada menunggu lama dan akhirnya close lebih rendah lagi.

Kapan bisa kita discuss?`,
    call: `• "Listing yang terlalu lama di pasar sebenarnya merugikan Anda."
• "Data menunjukkan: semakin lama, harga akhir semakin rendah — bukan sebaliknya."
• "Buyer mulai mempertanyakan 'kenapa belum terjual' setelah 90 hari."
• "Rekomendasi saya: adjust sekarang dan close cepat, bukan menunggu dan close lebih rendah."`,
  },
];

const ALIGNMENT = [
  {
    script: "Realistic Pricing Guidance",
    icon: Target,
    text: `Pak/Bu [Nama], saya ingin share data pasar yang bisa membantu pricing strategy Anda:

📊 Analisis Komparatif [Area]:
• Harga listing Anda: Rp [X]B
• AI fair market value: Rp [Y]B
• Harga rata-rata terjual (bukan listing) di segmen ini: Rp [Z]B
• Gap antara listing Anda vs harga pasar: [A]%

🏘️ Properti comparable yang baru terjual:
• [Alamat 1]: Rp [P1]B — terjual dalam [D1] hari
• [Alamat 2]: Rp [P2]B — terjual dalam [D2] hari
• [Alamat 3]: Rp [P3]B — terjual dalam [D3] hari

Yang perlu dipahami:
Ada perbedaan antara harga yang kita inginkan dan harga yang pasar mau bayar. Tugas saya adalah membantu Anda menemukan sweet spot — harga yang maksimal tapi tetap realistis untuk menarik buyer serius.

Rekomendasi AI kami: Rp [Recommended]B
Di harga ini, probabilitas closing dalam 30 hari: [X]%

Ini bukan tentang "turunkan harga" — ini tentang "temukan harga yang tepat untuk close cepat."

Bagaimana menurut Anda?`,
  },
  {
    script: "Competitive Listing Comparison",
    icon: BarChart3,
    text: `Pak/Bu [Nama], saya perlu transparan tentang kompetisi di pasar:

🏠 Properti sejenis yang saat ini bersaing dengan listing Anda:

1. [Properti A] — Rp [X]B
   • Spek: [detail] | Days on market: [Y]
   • Keunggulan: [apa yang lebih baik dari properti klien]

2. [Properti B] — Rp [X]B
   • Spek: [detail] | Days on market: [Y]
   • Keunggulan: [apa yang lebih baik]

3. [Properti C] — Rp [X]B
   • Spek: [detail] | Days on market: [Y]
   • Keunggulan: [apa yang lebih baik]

📍 Posisi properti Anda:
• Harga Anda: [highest/middle/lowest] di segmen ini
• Keunggulan Anda: [spesifik — lokasi, view, ukuran, dll]
• Area yang perlu di-address: [harga / kondisi / akses]

Agar properti Anda menjadi pilihan PERTAMA yang investor pertimbangkan (bukan pilihan ke-3 atau ke-4), kita perlu [strategi: adjust harga / improve presentasi / tambah fleksibilitas terms].

Mau kita buat strategi untuk membuat listing Anda paling kompetitif?`,
  },
  {
    script: "First Serious Buyer Advantage",
    icon: Handshake,
    text: `Pak/Bu [Nama], ada sesuatu penting yang ingin saya sampaikan:

Kami punya investor yang menunjukkan interest serius di properti Anda. Intent score mereka: [X]/100 — ini termasuk tinggi.

🎯 Kenapa buyer pertama yang serius itu penting:

1. Mereka sudah riset — buyer ini bukan window shopper, mereka sudah bandingkan opsi dan memilih properti Anda

2. Negosiasi lebih cepat — buyer yang serius tidak mau buang waktu, mereka mau deal yang fair dan cepat

3. Risiko lebih rendah — buyer serius lebih jarang cancel karena mereka sudah committed secara mental

4. Leverage Anda masih kuat — ini buyer pertama, jadi Anda belum terlihat "desperate"

⚠️ Yang perlu diwaspadai:
Kalau buyer serius pertama ini pergi karena kita terlalu lama merespons atau terlalu rigid di harga, buyer berikutnya mungkin datang dalam [X] minggu — dan mereka akan tahu bahwa ada buyer sebelumnya yang walk away. Itu melemahkan posisi negosiasi Anda.

Rekomendasi: Tangkap buyer ini. Tunjukkan fleksibilitas yang masuk akal. Close deal yang baik.

Mau saya arrange pertemuan atau negosiasi langsung?`,
  },
];

const MOTIVATION = [
  { trigger: "Financial Timing Benefits", icon: DollarSign, scripts: [
    `"Pak/Bu [Nama], timing closing sangat berpengaruh pada keuntungan bersih Anda. Kalau closing bulan ini, ada beberapa keuntungan finansial:\n\n• Pajak: [potensi penghematan pajak jika close sebelum akhir tahun fiskal]\n• Reinvestment: capital bisa langsung bekerja di instrumen lain mulai bulan depan\n• Cash position: memperkuat posisi keuangan Anda untuk opportunity lain yang mungkin muncul\n\nSetiap bulan delay = Rp [X]M opportunity cost. Itu uang nyata yang hilang."`,
    `"Saya tahu ini bukan hanya soal uang — tapi secara finansial, closing sekarang di Rp [X]B dan reinvest hasilnya bisa menghasilkan lebih banyak dalam 2 tahun dibanding menunggu harga naik Rp [Y]M."`,
  ]},
  { trigger: "Capital Redeployment", icon: RefreshCw, scripts: [
    `"Pak/Bu [Nama], pertanyaan yang mungkin perlu dipertimbangkan: apakah capital yang terikat di properti ini sedang bekerja seproduktif mungkin untuk Anda?\n\nJika di-close sekarang, Rp [X]B bisa:\n• Deposito: Rp [Y]M/bulan passive income\n• Reksa dana: estimasi [Z]% return/tahun\n• Properti yang lebih liquid: yield [A]%/tahun\n• Bisnis: modal kerja yang langsung menghasilkan\n\nKadang, menjual bukan kehilangan — tapi memindahkan capital ke tempat yang lebih produktif."`,
    `"Saya punya klien yang dulu juga ragu menjual. Setelah closing, mereka reinvest ke [instrumen] dan dalam 18 bulan menghasilkan lebih dari selisih harga yang mereka 'korbankan.' Timing beats price."`,
  ]},
  { trigger: "Prolonged Market Exposure Risk", icon: AlertTriangle, scripts: [
    `"Pak/Bu [Nama], saya ingin jujur tentang risiko jika properti ini terus di pasar terlalu lama:\n\n1. Persepsi 'stale listing' — buyer mulai curiga kenapa belum terjual\n2. Price anchoring shift — setiap kali ada listing baru yang lebih murah, benchmark pasar bergeser turun\n3. Maintenance cost — setiap bulan ada biaya yang terus berjalan\n4. Market shift risk — kondisi ekonomi bisa berubah kapan saja\n\nSaya bukan menakut-nakuti — saya memberikan data yang sama yang saya berikan ke semua seller yang saya bantu. Yang paling sukses adalah yang bertindak berdasarkan data, bukan emosi."`,
    `"Properti Anda sudah [X] hari di pasar. Sweet spot untuk closing dengan harga terbaik biasanya di 30-60 hari pertama. Setelah itu, statistik menunjukkan penurunan harga akhir. Mari kita pastikan ini close di window yang masih optimal."`,
  ]},
];

const COOPERATION = [
  {
    prompt: "Flexible Viewing Availability",
    icon: Calendar,
    text: `Pak/Bu [Nama], kami punya [X] investor yang ingin viewing minggu ini.

Untuk memaksimalkan peluang, saya suggest kita buka jadwal viewing yang fleksibel:

📅 Opsi yang ideal:
• Weekday pagi (9-11): cocok untuk investor profesional
• Weekend siang (1-4): cocok untuk pasangan/keluarga
• Sore hari (4-6): after-work viewing untuk busy executives

Yang perlu disiapkan:
✅ Properti bersih dan rapi
✅ Lampu semua menyala (kesan terang & luas)
✅ Dokumen siap ditunjukkan jika diminta
✅ AC menyala 30 menit sebelum viewing

Semakin mudah kita mengakomodasi jadwal investor, semakin cepat deal bisa bergerak.

Apakah Anda bisa available untuk [X] slot viewing minggu ini?`,
  },
  {
    prompt: "Fast Decision Encouragement",
    icon: Zap,
    text: `Pak/Bu [Nama], update: investor [Nama/kode] sudah viewing dan menunjukkan interest serius.

Mereka kemungkinan akan submit offer dalam [24-48] jam.

🎯 Yang perlu Anda siapkan:
1. Tentukan harga minimum yang Anda bisa terima (untuk diri sendiri, tidak perlu share ke saya)
2. Pikirkan terms yang bisa fleksibel (timeline closing, payment schedule)
3. Siapkan mental bahwa offer pertama biasanya bukan final — tapi proses negosiasi yang sehat

Ketika offer masuk, saya sarankan kita merespons dalam 24 jam maksimal. Kecepatan respons menunjukkan keseriusan dan menjaga momentum.

Investor yang serius tidak suka menunggu. Respons cepat = peluang closing tinggi.

Apakah Anda siap merespons cepat jika offer masuk?`,
  },
  {
    prompt: "Escrow Readiness Framing",
    icon: Shield,
    text: `Pak/Bu [Nama], kabar baik — kita mendekati tahap dimana buyer mungkin siap commit.

Untuk memperlancar proses, saya ingin pastikan dokumen Anda sudah siap:

📋 Checklist dokumen seller:
☐ Sertifikat hak milik / HGB (asli)
☐ IMB / PBG (ijin mendirikan bangunan)
☐ SPPT PBB terakhir + bukti bayar
☐ KTP pemilik
☐ Surat nikah (jika sudah menikah)
☐ Denah bangunan / site plan

💡 Tentang proses escrow:
• Dana buyer akan masuk ke rekening escrow — aman dan terproteksi
• Anda tidak perlu khawatir soal pembayaran karena semuanya terverifikasi
• Proses due diligence [14-30] hari — ini standar dan melindungi kedua pihak
• Setelah semua clear, dana release ke Anda

Semakin cepat dokumen lengkap, semakin smooth proses closing-nya.

Apakah dokumen di atas sudah Anda siapkan? Ada yang perlu bantuan?`,
  },
];

const SellerMotivationEngine: React.FC = () => (
  <motion.div className="space-y-6" initial="hidden" animate="show" variants={stagger}>
    <motion.div variants={anim}>
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Home className="w-6 h-6 text-primary" /> Seller Motivation Engine
      </h2>
      <p className="text-muted-foreground text-sm mt-1">Accelerate seller decisions with rational urgency, market intelligence, and trust-based persuasion</p>
    </motion.div>

    <Tabs defaultValue="urgency" className="space-y-4">
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="urgency" className="text-xs">⏰ Urgency</TabsTrigger>
        <TabsTrigger value="alignment" className="text-xs">🎯 Alignment</TabsTrigger>
        <TabsTrigger value="motivation" className="text-xs">💡 Motivation</TabsTrigger>
        <TabsTrigger value="cooperation" className="text-xs">🤝 Cooperation</TabsTrigger>
      </TabsList>

      <TabsContent value="urgency" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {URGENCY.map((u) => (
            <motion.div key={u.frame} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <u.icon className="w-4 h-4 text-primary" /> {u.frame}
                  </CardTitle>
                  <p className="text-[10px] text-muted-foreground">Psychology: {u.psychology}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <CopyBlock text={u.chat} label="WhatsApp / Chat" />
                  <CopyBlock text={u.call} label="Call Script" tone="Phone" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="alignment" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {ALIGNMENT.map((a) => (
            <motion.div key={a.script} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <a.icon className="w-4 h-4 text-primary" /> {a.script}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CopyBlock text={a.text} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="motivation" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {MOTIVATION.map((m) => (
            <motion.div key={m.trigger} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <m.icon className="w-4 h-4 text-primary" /> {m.trigger}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {m.scripts.map((s, i) => (
                    <CopyBlock key={i} text={s} />
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>

      <TabsContent value="cooperation" className="space-y-4">
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
          {COOPERATION.map((c) => (
            <motion.div key={c.prompt} variants={anim}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <c.icon className="w-4 h-4 text-primary" /> {c.prompt}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CopyBlock text={c.text} />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </TabsContent>
    </Tabs>
  </motion.div>
);

export default SellerMotivationEngine;
