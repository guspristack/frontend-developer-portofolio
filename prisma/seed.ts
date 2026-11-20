import { disconnectDatabase, prisma } from '../server/database';

try {
  await prisma.$transaction(async (db) => {
    if (await db.profile.findUnique({ where: { id: 1 } })) return;
    await db.profile.create({
      data: {
        id: 1,
        name: 'Raka Aditya',
        title: 'Junior Front-end Developer',
        location: 'Yogyakarta, Indonesia',
        heroGreeting: 'Hai, saya Raka.',
        heroHeadline: 'Saya merancang\nuntuk web.',
        introduction: 'Saya membuat situs dan antarmuka responsif, dengan perhatian pada tipografi, aksesibilitas, dan komponen yang bisa dipakai ulang.',
        bio: 'Saya junior front-end developer yang senang menerjemahkan desain menjadi halaman yang nyaman dipakai. Saya biasa memulai dari alur dan struktur konten, lalu memeriksa hasilnya di ponsel dan dengan keyboard.',
        focus: 'Situs responsif dan komponen antarmuka',
        skills: 'React, HTML, CSS, dan Figma',
        contactNote: 'Terbuka untuk peran front-end junior dan kolaborasi desain web.',
        email: 'raka@ruangkarya.example',
        instagram: '',
        linkedin: '',
        github: '',
      },
    });
    await db.experience.createMany({ data: [
      {
        period: 'Feb–Okt 2026', title: 'Pengembangan situs · Proyek mandiri',
        description: 'Mendesain dan membuat prototipe Tumbuh, dari susunan konten hingga pengujian layout di ponsel.', position: 10,
      },
      {
        period: 'Jul–Nov 2025', title: 'Latihan desain dan pengembangan antarmuka',
        description: 'Mengeksplorasi direktori acara dan mendokumentasikan komponen, termasuk keadaan fokus, kosong, dan kesalahan.', position: 20,
      },
    ] });
    await db.project.createMany({ data: [
      {
        slug: 'tumbuh', name: 'Tumbuh', type: 'Landing page', icon: 'leaf',
        summary: 'Halaman toko tanaman rumahan dengan demo yang bisa dicoba.',
        story: 'Saya menyusun halaman dengan foto produk, panduan perawatan, dan tombol yang langsung menuju katalog. Saya membuat prototipe responsif untuk memeriksa keterbacaan dan susunan kartu di layar kecil.',
        role: 'Raka Aditya · Desain visual dan implementasi front-end',
        result: 'Prototipe responsif dengan katalog dan panduan perawatan.', tools: 'Figma · HTML · CSS', status: 'PUBLISHED', position: 10,
      },
      {
        slug: 'agenda', name: 'Agenda Lokal', type: 'Direktori acara', icon: 'calendar',
        summary: 'Direktori acara komunitas dengan daftar yang mudah dipindai.',
        story: 'Tanggal dan tempat saya letakkan di setiap kartu. Pengunjung bisa menyaring acara berdasarkan jenisnya tanpa kehilangan konteks tentang kapan dan di mana kegiatan berlangsung.',
        role: 'Raka Aditya · Desain kartu acara dan pengembangan filter',
        result: 'Prototipe direktori dengan filter kategori dan kartu acara.', tools: 'React · CSS Grid', status: 'PUBLISHED', position: 20,
      },
      {
        slug: 'komponen', name: 'Pustaka Komponen', type: 'Eksplorasi antarmuka', icon: 'panels',
        summary: 'Studi tombol, input, dan kartu untuk antarmuka yang konsisten.',
        story: 'Saya mendokumentasikan varian dan keadaan setiap komponen, termasuk fokus keyboard, input kosong, dan pesan kesalahan. Semua contoh disusun dalam satu halaman agar mudah dibandingkan.',
        role: 'Raka Aditya · Desain komponen dan dokumentasi',
        result: 'Pustaka contoh tombol, input, dan kartu beserta berbagai keadaannya.', tools: 'Figma · CSS Modules', status: 'PUBLISHED', position: 30,
      },
    ] });
    await db.plant.createMany({ data: [
      { name: 'Monstera', category: 'bright', image: 'monstera', light: 'Cahaya terang tidak langsung.', water: 'Periksa media tanam sebelum menyiram kembali.', position: 10 },
      { name: 'Lidah mertua', category: 'low', image: 'snake', light: 'Toleran pada cahaya yang lebih rendah.', water: 'Tunggu media mengering sebelum penyiraman berikutnya.', position: 20 },
      { name: 'Sirih gading', category: 'low', image: 'pothos', light: 'Cahaya terang tidak langsung membantu menjaga corak daun.', water: 'Siram saat permukaan media mulai kering.', position: 30 },
    ] });
  });
  console.log('Data awal portofolio siap.');
} finally {
  await disconnectDatabase();
}
