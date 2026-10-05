'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.getElementById('navigation');
function closeMenu(){ menuButton.setAttribute('aria-expanded','false'); navigation.classList.remove('is-open'); }
menuButton.addEventListener('click',()=>{const open=menuButton.getAttribute('aria-expanded')!=='true';menuButton.setAttribute('aria-expanded',String(open));navigation.classList.toggle('is-open',open);});
navigation.querySelectorAll('a').forEach(link=>link.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu();});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu();});
window.matchMedia('(min-width:1025px)').addEventListener('change',e=>{if(e.matches)closeMenu();});

const services=document.querySelectorAll('.service');
services.forEach(service=>service.addEventListener('toggle',()=>{if(service.open)services.forEach(other=>{if(other!==service)other.open=false;});}));
document.querySelectorAll('.service-discuss').forEach(link=>link.addEventListener('click',()=>{document.getElementById('contact-service').value=link.dataset.service;}));

const articles={
  'akuntansi':{category:'CATATAN PENGANTAR / AKUNTANSI',title:'Mulai Dari Tujuan, Sebelum Membenahi Laporan',body:'<p>Diskusi tentang laporan keuangan akan lebih terarah ketika kebutuhan penggunanya jelas. Sebelum membahas format, aplikasi, atau jadwal pekerjaan, mulailah dengan keputusan yang ingin didukung oleh informasi tersebut.</p><h3>Informasi ini akan digunakan untuk apa?</h3><p>Apakah manajemen ingin memahami kinerja, menata pelaporan, menyiapkan pembicaraan dengan bank, atau memperbaiki proses pencatatan? Jelaskan tujuan dan siapa yang akan membaca hasilnya.</p><h3>Bagaimana kondisi pencatatan saat ini?</h3><p>Ceritakan sistem yang digunakan, alur dokumen, pembagian peran, dan kendala yang paling sering muncul. Penjelasan yang apa adanya membantu menentukan titik awal penugasan.</p><h3>Apa yang perlu dibawa ke diskusi awal?</h3><ul><li>Gambaran singkat kegiatan usaha dan struktur tim keuangan.</li><li>Periode laporan yang ingin dibahas serta kondisi data yang tersedia.</li><li>Daftar persoalan yang paling menghambat pekerjaan.</li><li>Tujuan, tenggat, dan pihak yang akan menggunakan hasil pekerjaan.</li></ul><p>Informasi awal tersebut menjadi bahan untuk menyepakati ruang lingkup yang masuk akal. Kebutuhan dokumen rinci dibahas setelah konteks bisnis dan pengaturan kerahasiaan dipahami.</p><p class="reading-note">Catatan ini merupakan pengantar diskusi. Kebutuhan pelaporan dan kerangka akuntansi ditentukan sesuai kondisi serta ketentuan yang berlaku bagi entitas.</p>'},
  'audit':{category:'CATATAN PENGANTAR / AUDIT',title:'Menyiapkan Diskusi Sebelum Audit Dimulai',body:'<p>Persiapan awal membantu perusahaan dan auditor memahami kebutuhan penugasan. Percakapan dimulai dari tujuan, periode laporan, dan kondisi informasi yang tersedia.</p><h3>Jelaskan kebutuhan dan periode laporan</h3><p>Sampaikan alasan perusahaan membutuhkan audit, laporan yang akan diperiksa, serta pihak yang akan menggunakan laporan auditor. Informasikan pula tenggat yang perlu dipertimbangkan.</p><h3>Ceritakan kondisi proses pelaporan</h3><p>Jelaskan sistem pencatatan, tim yang bertanggung jawab, dan status penyusunan laporan keuangan. Sampaikan perubahan kegiatan usaha atau kendala data yang mungkin berpengaruh pada penugasan.</p><h3>Apa yang dapat dipersiapkan?</h3><ul><li>Gambaran kegiatan usaha, struktur entitas, dan pihak penghubung.</li><li>Periode laporan serta status ketersediaan catatan keuangan.</li><li>Informasi penugasan auditor sebelumnya, apabila ada.</li><li>Tujuan penggunaan laporan dan jadwal yang diharapkan.</li></ul><p>Daftar dokumen rinci dan jadwal pekerjaan dibahas setelah evaluasi penerimaan serta kesepakatan penugasan. Kesiapan dokumen tidak menentukan atau menjamin jenis opini yang akan diberikan.</p><p class="reading-note">Catatan ini merupakan pengantar komunikasi. Pelaksanaan audit mengikuti standar profesional dan hasil evaluasi penugasan.</p>'},
  'tax':{category:'CATATAN PENGANTAR / TAX',title:'Membawa Konteks Ke Dalam Diskusi Perpajakan',body:'<p>Pembahasan perpajakan memerlukan pemahaman mengenai kegiatan usaha dan transaksi yang menjadi pertanyaan. Menjelaskan konteks sejak awal membantu menentukan informasi apa yang perlu ditelaah.</p><h3>Mulai dari transaksi atau persoalannya</h3><p>Ceritakan apa yang terjadi, kapan transaksi berlangsung, serta pihak yang terlibat. Pisahkan fakta yang didukung dokumen dari asumsi atau penjelasan yang belum diverifikasi.</p><h3>Jelaskan tahap penyelesaiannya</h3><p>Sampaikan apakah kebutuhan Anda terkait perencanaan transaksi, penataan administrasi, review kepatuhan, atau klarifikasi atas dokumen tertentu. Sertakan tenggat yang sudah diketahui.</p><h3>Persiapan untuk percakapan awal</h3><ul><li>Gambaran kegiatan usaha dan jenis transaksi yang ingin dibahas.</li><li>Periode yang menjadi perhatian.</li><li>Daftar dokumen yang tersedia, tanpa mengirimkan data rahasia melalui formulir umum.</li><li>Pertanyaan dan hasil pembahasan yang Anda harapkan.</li></ul><p>Penelaahan dokumen, ketentuan yang relevan, dan alternatif langkah dilakukan sesuai konteks. Kesimpulan untuk satu transaksi tidak serta-merta dapat diterapkan pada transaksi lain.</p><p class="reading-note">Catatan ini merupakan panduan persiapan diskusi, bukan penetapan kewajiban pajak. Analisis kasus tertentu memerlukan dokumen dan ketentuan yang relevan.</p>'},
  'privasi':{category:'INFORMASI WEBSITE',title:'Privasi & Komunikasi',body:'<p>Website ini memperkenalkan profil profesional Hendrawanto dan menyediakan sarana untuk memulai komunikasi.</p><h3>Formulir kontak</h3><p>Nama, bidang diskusi, dan pesan yang Anda isi digunakan di perangkat Anda untuk menyusun tautan pesan WhatsApp. Website ini tidak mengirimkan isian ke basis data sendiri. Pesan baru dikirim kepada penerima setelah Anda memilih mengirimkannya di WhatsApp.</p><h3>Tautan ke layanan lain</h3><p>Tautan WhatsApp, email, YouTube, Instagram, dan website KAP membuka layanan terpisah. Penggunaan layanan tersebut mengikuti pengaturan dan kebijakan penyedianya.</p><h3>Kerahasiaan informasi</h3><p>Gunakan formulir hanya untuk gambaran umum. Pengiriman dokumen keuangan, data pribadi pihak lain, atau informasi rahasia dilakukan melalui saluran yang disepakati setelah komunikasi awal.</p><h3>Video YouTube</h3><p>Video ditampilkan melalui pemutar tertanam YouTube dengan domain youtube-nocookie.com. Saat pemutar dimuat atau digunakan, YouTube dapat menerima informasi teknis dan memproses data sesuai kebijakannya. Anda juga dapat membuka video langsung melalui tautan yang tersedia.</p><h3>Penggunaan website</h3><p>Dengan izin pengunjung, halaman publik menggunakan Google Analytics untuk statistik kunjungan dan perkiraan lokasi. Tag tidak dimuat sebelum Anda mengizinkan statistik. Pilihan dapat diubah melalui Preferensi statistik pada footer. Isian formulir tidak dikirim oleh kode analitik situs. Lihat <a href="/privasi/">informasi privasi dan statistik lengkap</a>. Pemutar video dan hosting merupakan layanan pihak ketiga dengan kebijakan masing-masing.</p><p>Untuk pertanyaan tentang komunikasi, hubungi <a href="mailto:info@hendrawanto.com">info@hendrawanto.com</a>.</p>'}
};
const dialog=document.getElementById('reading-dialog');
document.querySelectorAll('[data-article]').forEach(button=>button.addEventListener('click',()=>{const article=articles[button.dataset.article];document.getElementById('reading-category').textContent=article.category;document.getElementById('reading-title').textContent=article.title;document.getElementById('reading-body').innerHTML=article.body;dialog.showModal();dialog.scrollTop=0;}));
document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',event=>{if(event.target===dialog){const bounds=dialog.getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)dialog.close();}});

document.getElementById('contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  const nameInput=document.getElementById('contact-name');
  const messageInput=document.getElementById('contact-message');
  const service=document.getElementById('contact-service').value;
  const name=nameInput.value.trim();const message=messageInput.value.trim();
  if(!name){nameInput.setCustomValidity('Silakan isi nama Anda.');nameInput.reportValidity();return;}
  if(!message){messageInput.setCustomValidity('Silakan isi gambaran singkat kebutuhan.');messageInput.reportValidity();return;}
  const text='Halo Pak Hendrawanto, saya '+name+'.\n\nSaya ingin berdiskusi tentang '+service+'.\n\n'+message+'\n\nSaya menghubungi melalui website personal Bapak.';
  const url='https://wa.me/6281314286414?text='+encodeURIComponent(text);
  const fallback=document.getElementById('whatsapp-fallback');fallback.href=url;fallback.hidden=false;
  document.getElementById('form-status').textContent='Pesan siap dibuka. Jika WhatsApp belum terbuka, gunakan tautan di bawah.';
  window.open(url,'_blank','noopener,noreferrer');
});
['contact-name','contact-message'].forEach(id=>document.getElementById(id).addEventListener('input',event=>event.target.setCustomValidity('')));
document.getElementById('year').textContent=new Date().getFullYear();
document.querySelectorAll('.nav-drop-btn').forEach(b=>b.addEventListener('click',e=>{e.stopPropagation();const o=b.getAttribute('aria-expanded')!=='true';b.setAttribute('aria-expanded',String(o));b.parentElement.classList.toggle('open',o);}));
document.addEventListener('click',e=>{if(!e.target.closest('.nav-dropdown'))document.querySelectorAll('.nav-dropdown.open').forEach(d=>{d.classList.remove('open');d.querySelector('button').setAttribute('aria-expanded','false');});});

/* Count-up animation for track record stats */
(function(){
  var els=document.querySelectorAll('.track-stats strong');
  if(!els.length||!('IntersectionObserver' in window)) return;
  if(window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  els.forEach(function(el){
    var m=el.textContent.trim().match(/^(\d+)(.*)$/); if(!m) return;
    el.dataset.target=m[1]; el.dataset.suffix=m[2]; el.textContent='1'+m[2];
  });
  var io=new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(!en.isIntersecting) return; io.unobserve(en.target);
      var el=en.target, target=+el.dataset.target, suf=el.dataset.suffix||'', dur=1600, t0=null;
      if(!target){return;}
      function step(ts){ if(t0===null)t0=ts; var p=Math.min((ts-t0)/dur,1), e=1-Math.pow(1-p,3);
        el.textContent=Math.max(1,Math.round(1+(target-1)*e))+suf; if(p<1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    });
  },{threshold:.4});
  els.forEach(function(el){ if(el.dataset.target) io.observe(el); });
})();
