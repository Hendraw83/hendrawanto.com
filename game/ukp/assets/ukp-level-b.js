(function(){'use strict';var currentLevel='A',playerName='',currentStep=1,score=0,timeLeft=160,timerInterval=null,gameActive=false,gameStarted=false,selectedAnswer=null,isAnswered=false;var questionsB=[{q:"Berdasarkan UU PPh (UU HPP), berapakah tarif PPh Badan standar yang berlaku untuk Tahun Pajak 2022 dan seterusnya?",options:["20%","22%","25%","19%"],answer:1,explanation:"Sesuai dengan UU Harmonisasi Peraturan Perpajakan (HPP), tarif PPh Badan ditetapkan sebesar 22%."},{q:"Metode penilaian persediaan yang diperbolehkan menurut Pasal 10 ayat (6) UU PPh adalah...",options:["LIFO dan FIFO","FIFO dan Rata-rata (Average)","LIFO dan Rata-rata","Metode Biaya Standar"],answer:1,explanation:"Menurut perpajakan Indonesia, metode penilaian persediaan hanya diizinkan menggunakan FIFO atau Rata-rata (Average)."},{q:"Objek PBB Sektor P5L meliputi Perkebunan, Perhutanan, Pertambangan Migas, Pertambangan Minerba, dan...",options:["Sektor Industri","Sektor Perdagangan","Sektor Lainnya","Sektor Perumahan"],answer:2,explanation:"PBB P5L mencakup Perkebunan, Perhutanan, Pertambangan Migas, Pertambangan Minerba, dan Sektor Lainnya."},{q:"Fasilitas pengurangan tarif sebesar 50% dari tarif Pasal 17 ayat (1b) untuk peredaran bruto sampai Rp 4,8 Miliar diatur dalam...",options:["Pasal 31E UU PPh","Pasal 23 UU PPh","Pasal 4 ayat (2) UU PPh","Pasal 22 UU PPh"],answer:0,explanation:"Pasal 31E UU PPh memberikan fasilitas pengurangan tarif 50% bagi Wajib Pajak Badan dalam negeri dengan peredaran bruto tertentu."},{q:"Masa manfaat dan tarif penyusutan (garis lurus) untuk Harta Berwujud Kelompok 1 adalah...",options:["8 tahun, 12.5%","4 tahun, 25%","16 tahun, 6.25%","20 tahun, 5%"],answer:1,explanation:"Harta kelompok 1 memiliki masa manfaat 4 tahun dengan tarif penyusutan garis lurus sebesar 25% per tahun."},{q:"Nilai Jual Kena Pajak (NJKP) untuk perhitungan PBB Sektor Pertambangan dan Perkebunan secara umum adalah...",options:["20% dari NJOP","30% dari NJOP","40% dari NJOP","50% dari NJOP"],answer:2,explanation:"NJKP untuk PBB sektor P5L (Perkebunan, Perhutanan, Pertambangan) ditetapkan sebesar 40% dari NJOP."}];var questionsC=[{q:"Prinsip utama yang mengatur alokasi hak pemajakan antara negara asal dan negara sumber dalam P3B adalah...",options:["Residence Principle dan Source Principle","Single Tax Principle","Destination Principle Only","Territorial Principle Only"],answer:0,explanation:"P3B (Tax Treaty) menyelaraskan Hak Pemajakan Negara Domisili (Residence) dan Negara Sumber (Source) untuk mencegah pajak berganda."},{q:"Metode Transfer Pricing yang membandingkan harga transaksi pihak independen yang sebanding adalah...",options:["Resale Price Method (RPM)","Cost Plus Method (CPM)","Comparable Uncontrolled Price (CUP)","Profit Split Method (PSM)"],answer:2,explanation:"Metode CUP membandingkan harga dalam transaksi independen yang sebanding dengan harga transaksi yang dipengaruhi hubungan istimewa."},{q:"Berdasarkan UU PPh Pasal 2 ayat (5), Bentuk Usaha Tetap (BUT) merupakan...",options:["Subjek Pajak Dalam Negeri","Subjek Pajak Luar Negeri yang pemajakannya dipersamakan dengan WP Badan DN","Bukan Subjek Pajak","Objek Pajak Final"],answer:1,explanation:"BUT adalah subjek pajak luar negeri yang pemenuhan kewajiban perpajakannya dipersamakan dengan Subjek Pajak Badan Dalam Negeri."},{q:"Sesuai PMK-213/PMK.03/2016, tiga pilar dokumen Transfer Pricing (TP Doc) terdiri dari...",options:["Local File, Master File, CbCR","Form 1771-Attachment, Invoices, Contracts","Audit Report, Financial Statement, Tax Return","Benchmarking Report, APA, MAP"],answer:0,explanation:"Dokumen Transfer Pricing wajib memuat Dokumen Induk (Master File), Dokumen Lokal (Local File), dan Laporan per Negara (CbCR)."},{q:"Pemotongan PPh Pasal 26 atas penghasilan berupa bunga atau royalti yang dibayarkan kepada Subjek Pajak Luar Negeri adalah sebesar...",options:["15% (kecuali P3B)","20% (kecuali P3B menentukan lain)","10% (final)","25%"],answer:1,explanation:"PPh Pasal 26 mengenakan tarif 20% dari jumlah bruto, atau tarif lebih rendah jika memenuhi syarat P3B (Tax Treaty)."},{q:"Branch Profit Tax (BPT) diatur dalam UU PPh Pasal 26 ayat (4) dengan tarif dasar...",options:["10%","15%","20% (sesudah PPh Badan)","25%"],answer:2,explanation:"BPT dikenakan sebesar 20% atas Penghasilan Kena Pajak sesudah dikurangi PPh Badan dari suatu BUT di Indonesia, kecuali ditanamkan kembali."}];function getQuestion(idx){var list=(currentLevel==='C')?questionsC:questionsB;return list[idx%list.length];}function injectStyles(){if(document.getElementById('he-ukp-custom-styles'))return;var style=document.createElement('style');style.id='he-ukp-custom-styles';style.textContent='#he-ukp-level-bar{display:flex;justify-content:center;align-items:center;gap:16px;background:#0f172a;padding:14px 20px;border-bottom:2px solid #334155;box-shadow:0 4px 20px rgba(0,0,0,0.3);position:relative;z-index:999999;font-family:sans-serif;}.he-level-btn{padding:10px 24px;border-radius:8px;font-weight:700;font-size:15px;border:2px solid transparent;cursor:pointer;background:#1e293b;color:#94a3b8;transition:all 0.2s;}.he-level-btn.active{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;border-color:#60a5fa;box-shadow:0 0 14px rgba(37,99,235,0.6);}#he-ukp-custom-stage{display:none;max-width:900px;margin:24px auto;padding:28px;background:#0f172a;color:#f8fafc;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.4);font-family:sans-serif;}.he-card{background:#1e293b;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:20px;}.he-title{font-size:24px;font-weight:800;color:#38bdf8;margin-bottom:10px;text-align:center;}.he-sub{font-size:14px;color:#94a3b8;text-align:center;margin-bottom:24px;}.he-input{width:100%;max-width:380px;display:block;margin:0 auto 20px;padding:12px 16px;border-radius:8px;border:1px solid #475569;background:#0f172a;color:#fff;font-size:16px;text-align:center;}.he-btn-start{display:block;margin:0 auto;padding:14px 40px;background:linear-gradient(135deg,#16a34a,#15803d);color:#fff;font-weight:700;font-size:18px;border:none;border-radius:8px;cursor:pointer;}.he-hud{display:flex;justify-content:space-between;align-items:center;background:#0f172a;padding:14px 20px;border-radius:10px;border:1px solid #334155;margin-bottom:20px;font-size:15px;font-weight:700;}.he-timer{color:#f87171;font-size:18px;background:rgba(239,68,68,0.15);padding:6px 14px;border-radius:6px;border:1px solid rgba(239,68,68,0.3);}.he-stairs-box{background:#0f172a;border:1px solid #334155;border-radius:12px;padding:20px;margin-bottom:24px;}.he-stairs-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}.he-avatar-display{display:flex;align-items:center;gap:12px;background:#1e293b;padding:8px 16px;border-radius:20px;border:1px solid #334155;}.he-suit-avatar{font-size:28px;line-height:1;display:inline-block;}.he-progress-bar-bg{width:100%;height:16px;background:#1e293b;border-radius:8px;overflow:hidden;border:1px solid #334155;margin-top:8px;}.he-progress-bar-fill{height:100%;background:linear-gradient(90deg,#0284c7,#38bdf8);width:1%;transition:width 0.4s ease;}.he-option-btn{display:block;width:100%;text-align:left;padding:14px 18px;margin:10px 0;background:#0f172a;color:#f8fafc;border:1px solid #334155;border-radius:8px;cursor:pointer;font-size:15px;}.he-option-btn.correct{background:#14532d!important;border-color:#22c55e!important;color:#f0fdf4!important;}.he-option-btn.wrong{background:#7f1d1d!important;border-color:#ef4444!important;color:#fef2f2!important;}.he-explanation{margin-top:16px;padding:16px;border-radius:8px;background:#0f172a;border-left:4px solid #38bdf8;font-size:14px;line-height:1.6;}.he-btn-next{display:block;margin:20px 0 0 auto;padding:12px 28px;background:#2563eb;color:#fff;font-weight:700;border:none;border-radius:8px;cursor:pointer;}';document.head.appendChild(style);}function ensureElements(){injectStyles();var rootEl=document.getElementById('root');if(!rootEl)return;var levelBar=document.getElementById('he-ukp-level-bar');if(!levelBar){levelBar=document.createElement('div');levelBar.id='he-ukp-level-bar';levelBar.innerHTML='<button class="he-level-btn '+(currentLevel==='A'?'active':'')+'" id="he-btn-lvl-a" onclick="window.heSelectLevel(\'A\')">UKP Level A</button><button class="he-level-btn '+(currentLevel==='B'?'active':'')+'" id="he-btn-lvl-b" onclick="window.heSelectLevel(\'B\')">UKP Level B</button><button class="he-level-btn '+(currentLevel==='C'?'active':'')+'" id="he-btn-lvl-c" onclick="window.heSelectLevel(\'C\')">UKP Level C</button>';document.body.insertBefore(levelBar,rootEl);}var customStage=document.getElementById('he-ukp-custom-stage');if(!customStage){customStage=document.createElement('div');customStage.id='he-ukp-custom-stage';document.body.insertBefore(customStage,rootEl.nextSibling);renderStage();}}window.heSelectLevel=function(lvl){currentLevel=lvl;var btnA=document.getElementById('he-btn-lvl-a');var btnB=document.getElementById('he-btn-lvl-b');var btnC=document.getElementById('he-btn-lvl-c');var rootEl=document.getElementById('root');var customStage=document.getElementById('he-ukp-custom-stage');if(btnA)btnA.className='he-level-btn'+(lvl==='A'?' active':'');if(btnB)btnB.className='he-level-btn'+(lvl==='B'?' active':'');if(btnC)btnC.className='he-level-btn'+(lvl==='C'?' active':'');if(lvl==='A'){if(rootEl)rootEl.style.display='block';if(customStage)customStage.style.display='none';if(timerInterval)clearInterval(timerInterval);gameActive=false;gameStarted=false;}else{if(rootEl)rootEl.style.display='none';if(customStage)customStage.style.display='block';resetGame();renderStage();}};function resetGame(){if(timerInterval)clearInterval(timerInterval);currentStep=1;score=0;timeLeft=160;gameActive=false;gameStarted=false;selectedAnswer=null;isAnswered=false;}window.heStartGame=function(){var input=document.getElementById('he-player-name-input');var val=input?input.value.trim():'';playerName=val||'Pendaki Perpajakan';gameStarted=true;gameActive=true;currentStep=1;score=0;timeLeft=160;selectedAnswer=null;isAnswered=false;if(timerInterval)clearInterval(timerInterval);timerInterval=setInterval(function(){if(!gameActive)return;timeLeft--;var timerEl=document.getElementById('he-hud-timer');if(timerEl)timerEl.innerText=timeLeft+'s';if(timeLeft<=0){clearInterval(timerInterval);gameActive=false;alert('Waktu 160 detik telah habis! Permainan selesai.');renderStage();}},1000);renderStage();};window.heAnswer=function(optIdx){if(isAnswered||!gameActive)return;isAnswered=true;selectedAnswer=optIdx;var qObj=getQuestion(currentStep-1);if(optIdx===qObj.answer){score+=10;}renderStage();};window.heNextStep=function(){if(currentStep>=100){if(timerInterval)clearInterval(timerInterval);gameActive=false;alert('Selamat! Anda telah mencapai Tangga 100!');renderStage();return;}currentStep++;selectedAnswer=null;isAnswered=false;renderStage();};function renderStage(){var customStage=document.getElementById('he-ukp-custom-stage');if(!customStage)return;if(!gameStarted){var subtitle=(currentLevel==='B')?'UKP Level B (PPh Badan, Akuntansi Pajak, PBB-P5L)':'UKP Level C (Pajak Internasional, Transfer Pricing, BUT/P3B)';customStage.innerHTML='<div class="he-card"><div class="he-title">Game UKP '+currentLevel+'</div><div class="he-sub">'+subtitle+'</div><p style="text-align:center;margin-bottom:20px;color:#cbd5e1;">Uji kemampuan perpajakan Anda melalui pendakian 100 Tangga dengan batas waktu <strong>160 detik</strong>!</p><input type="text" id="he-player-name-input" class="he-input" placeholder="Masukkan nama Anda..." value="'+playerName+'" /><button class="he-btn-start" onclick="window.heStartGame()">Mulai Pendakian</button></div>';return;}var qObj=getQuestion(currentStep-1);var progressPct=Math.min(100,Math.max(1,currentStep));var optionsHtml='';for(var i=0;i<qObj.options.length;i++){var cls='he-option-btn';if(isAnswered){if(i===qObj.answer)cls+=' correct';else if(i===selectedAnswer)cls+=' wrong';}optionsHtml+='<button class="'+cls+'" onclick="window.heAnswer('+i+')" '+(isAnswered?'disabled':'')+'>'+String.fromCharCode(65+i)+'. '+qObj.options[i]+'</button>';}var explanationHtml='';if(isAnswered){var isCorrect=(selectedAnswer===qObj.answer);explanationHtml='<div class="he-explanation"><strong style="color:'+(isCorrect?'#4ade80':'#f87171')+';">'+(isCorrect?'✓ Jawaban Benar!':'✕ Jawaban Salah!')+'</strong><p style="margin-top:8px;color:#e2e8f0;"><strong>Pembahasan:</strong> '+qObj.explanation+'</p><button class="he-btn-next" onclick="window.heNextStep()">Lanjut Tangga Berikutnya →</button></div>';}customStage.innerHTML='<div class="he-hud"><div>👤 Pemain: <span style="color:#38bdf8;">'+playerName+'</span> ('+currentLevel+')</div><div>🏆 Skor: <span style="color:#facc15;">'+score+'</span></div><div class="he-timer">⏱️ <span id="he-hud-timer">'+timeLeft+'s</span></div></div><div class="he-stairs-box"><div class="he-stairs-header"><div><strong>Kemajuan Pendakian:</strong> Tangga <span style="color:#38bdf8;font-size:18px;">'+currentStep+'</span> / 100</div><div class="he-avatar-display"><span class="he-suit-avatar" title="Orang Berjas Formal">👨‍💼</span><span style="font-size:13px;color:#cbd5e1;">Level '+currentLevel+'</span></div></div><div class="he-progress-bar-bg"><div class="he-progress-bar-fill" style="width:'+progressPct+'%;"></div></div></div><div class="he-card"><div style="font-size:13px;color:#38bdf8;text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;">Soal Tangga Ke-'+currentStep+'</div><div style="font-size:17px;font-weight:600;line-height:1.5;margin-bottom:16px;">'+qObj.q+'</div><div>'+optionsHtml+'</div>'+explanationHtml+'</div>';}ensureElements();setInterval(ensureElements,500);if(document.body){var observer=new MutationObserver(function(){ensureElements();});observer.observe(document.body,{childList:true,subtree:false});}})();-card { transition: all 0.5s ease-in-out; }
    .journey-sun { animation: ukpSunGlow 4s infinite alternate ease-in-out; }
    @keyframes ukpSunGlow {
      0% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,215,0,0.6)); }
      100% { transform: scale(1.08); filter: drop-shadow(0 0 25px rgba(255,215,0,0.9)); }
    }
    .journey-plane { animation: ukpPlaneFly 6s infinite ease-in-out; }
    @keyframes ukpPlaneFly { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
    .journey-birds { animation: ukpBirdFloat 5s infinite ease-in-out; }
    @keyframes ukpBirdFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    .journey-cloud { animation: ukpCloudDrift 8s infinite alternate ease-in-out; }
    @keyframes ukpCloudDrift { 0% { transform: translateX(0); } 100% { transform: translateX(10px); } }

    .journey-step.passed, .journey-step[data-passed="true"], .journey-step.completed {
      background: linear-gradient(135deg, #ffd700, #ffb700) !important;
      border-color: #ffe875 !important;
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.7) !important;
      color: #1e293b !important;
    }
    .journey-step.current, .journey-step[data-current="true"], .journey-step.active {
      background: linear-gradient(135deg, #10b981, #059669) !important;
      border-color: #34d399 !important;
      box-shadow: 0 0 16px rgba(52, 211, 153, 0.9) !important;
      animation: ukpStepPulse 1.5s infinite alternate ease-in-out;
      color: #ffffff !important;
    }
    @keyframes ukpStepPulse {
      0% { box-shadow: 0 0 10px rgba(52, 211, 153, 0.7); }
      100% { box-shadow: 0 0 22px rgba(52, 211, 153, 1); }
    }

    .journey-pet {
      transition: transform 0.4s ease, filter 0.4s ease;
      animation: ukpPetJump 2s infinite ease-in-out;
      position: relative;
    }
    @keyframes ukpPetJump {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-7px); }
    }
    .journey-pet::after {
      content: '';
      position: absolute;
      bottom: -6px;
      left: 15%;
      width: 70%;
      height: 8px;
      background: radial-gradient(ellipse at center, rgba(255, 215, 0, 0.85) 0%, rgba(255, 215, 0, 0) 70%);
      border-radius: 50%;
      pointer-events: none;
      animation: ukpAuraGlow 2s infinite ease-in-out;
    }
    @keyframes ukpAuraGlow {
      0%, 100% { opacity: 0.6; transform: scale(0.9); }
      50% { opacity: 1; transform: scale(1.25); }
    }

    .ukp-level-selector-bar {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: center;
      margin: 10px 0;
      padding: 6px 12px;
      background: rgba(15, 23, 42, 0.85);
      border-radius: 12px;
      border: 1px solid rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(8px);
      z-index: 999;
    }
    .ukp-level-btn {
      padding: 6px 14px;
      border-radius: 8px;
      border: 1px solid rgba(255,255,255,0.2);
      background: rgba(30, 41, 59, 0.7);
      color: #cbd5e1;
      font-weight: 700;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s ease;
    }
    .ukp-level-btn:hover {
      color: #fff;
      transform: translateY(-1px);
    }
    .ukp-level-btn.active-a {
      background: linear-gradient(135deg, #2563eb, #1d4ed8) !important;
      color: #ffffff !important;
      border-color: #60a5fa !important;
      box-shadow: 0 0 10px rgba(37, 99, 235, 0.5) !important;
    }
    .ukp-level-btn.active-b {
      background: linear-gradient(135deg, #7c3aed, #6d28d9) !important;
      color: #ffffff !important;
      border-color: #a78bfa !important;
      box-shadow: 0 0 10px rgba(124, 58, 237, 0.5) !important;
    }
  `;
  document.head.appendChild(styleEl);

  let currentLevel = localStorage.getItem('ukp_selected_level') || 'B';

  function setLevel(lvl) {
    currentLevel = lvl;
    localStorage.setItem('ukp_selected_level', lvl);
    updateUI();
  }

  function updateUI() {
    document.querySelectorAll('.journey-level, [data-testid="level-badge"]').forEach(el => {
      el.textContent = `LEVEL ${currentLevel}`;
    });
    document.querySelectorAll('.journey-timer, .ukp-timer-badge').forEach(el => {
      el.textContent = currentLevel === 'B' ? '160s' : '60s';
    });
    document.querySelectorAll('.ukp-btn-a').forEach(b => {
      if (currentLevel === 'A') b.classList.add('active-a');
      else b.classList.remove('active-a');
    });
    document.querySelectorAll('.ukp-btn-b').forEach(b => {
      if (currentLevel === 'B') b.classList.add('active-b');
      else b.classList.remove('active-b');
    });
  }

  const levelBQuestions = [
    {
      id: "b-1",
      topic: "PPh Badan & SPT 1771",
      prompt: "PT Utama Sejahtera mencatatkan Penghasilan Kena Pajak sebesar Rp 4.800.000.000 dengan peredaran bruto Rp 50.000.000.000 pada tahun pajak 2025. Berapakah fasilitas pengurangan tarif PPh Badan pasal 31E yang berhak diperoleh WP Badan tersebut?",
      options: [
        { id: "opt-1", text: "Fasilitas Pasal 31E berlaku penuh 50% untuk PKP hingga Rp 4,8 Miliar karena peredaran bruto tidak melebihi batas." },
        { id: "opt-2", text: "Fasilitas Pasal 31E tidak berlaku karena peredaran bruto melebihi Rp 50.000.000.000." },
        { id: "opt-3", text: "Fasilitas Pasal 31E berlaku proporsional untuk bagian PKP dari peredaran bruto Rp 4,8 Miliar." },
        { id: "opt-4", text: "PPh Badan dikenakan tarif final 0,5% sesuai PP 55 Tahun 2022." }
      ],
      correctOptionId: "opt-2",
      explanation: "Berdasarkan Pasal 31E UU PPh, fasilitas pengurangan tarif 50% diberikan untuk peredaran bruto sampai dengan Rp 50 Miliar. Jika peredaran bruto melebihi Rp 50 Miliar, seluruh PKP dikenakan tarif normal PPh Badan."
    },
    {
      id: "b-2",
      topic: "Akuntansi Perpajakan / Rekonsiliasi Fiskal",
      prompt: "Dalam rekonsiliasi fiskal PT Surya Gemilang, manakah di antara pos biaya berikut yang wajib dilakukan koreksi positif (non-deductible expense)?",
      options: [
        { id: "opt-1", text: "Biaya promosi yang dilengkapi daftar nominatif sesuai PMK." },
        { id: "opt-2", text: "Sumbangan penanggulangan bencana nasional yang memenuhi syarat PP 93/2010." },
        { id: "opt-3", text: "Biaya kenikmatan (fringe benefits) tempat tinggal karyawan di daerah terpencil." },
        { id: "opt-4", text: "Sanksi administrasi berupa denda/bunga pajak yang tercantum dalam STP PPh." }
      ],
      correctOptionId: "opt-4",
      explanation: "Sanksi administrasi berupa denda, bunga, atau kenaikan pajak sesuai Pasal 9 ayat (1) huruf k UU PPh merupakan non-deductible expense sehingga harus dikoreksi positif."
    },
    {
      id: "b-3",
      topic: "PBB Sektor P5L",
      prompt: "Pada perhitungan PBB Sektor Perkebunan (P5L), manakah komponen yang membentuk Nilai Jual Objek Pajak (NJOP) Tubuh Bumi untuk areal produktif?",
      options: [
        { id: "opt-1", text: "Nilai Standar Tanaman (NST) ditambah Biaya Investasi Tanaman (BIT)." },
        { id: "opt-2", text: "NJOP Bumi dasar ditambah Standar Investasi Tanaman (SIT) hasil produksi." },
        { id: "opt-3", text: "Hasil perkalian pendapatan bersih per hektar dengan angka kapitalisasi yang ditetapkan Dirjen Pajak." },
        { id: "opt-4", text: "NJOP Bangunan pemukiman karyawan di area perkebunan." }
      ],
      correctOptionId: "opt-3",
      explanation: "NJOP Tubuh Bumi areal produktif PBB Perkebunan dihitung berdasarkan konversi pendapatan bersih per hektar dikalikan angka kapitalisasi."
    },
    {
      id: "b-4",
      topic: "PPh Badan & SPT 1771",
      prompt: "Pengkreditan PPh Pasal 24 atas penghasilan dari luar negeri dalam SPT Tahunan PPh Badan 1771 ditentukan berdasarkan prinsip:",
      options: [
        { id: "opt-1", text: "Jumlah mana yang lebih rendah antara pajak yang dibayar di LN dengan batas maksimum kredit pajak per negara (Country-by-Country Limitation)." },
        { id: "opt-2", text: "Seluruh jumlah pajak yang dipotong di luar negeri tanpa pembatasan." },
        { id: "opt-3", text: "Pajak luar negeri yang dapat dikreditkan maksimal 25% dari total PPh terutang." },
        { id: "opt-4", text: "Dikreditkan penuh apabila Indonesia memiliki P3B (Tax Treaty) dengan negara tersebut." }
      ],
      correctOptionId: "opt-1",
      explanation: "Sesuai ketentuan Pasal 24 UU PPh dan PMK terkait, kredit pajak LN dihitung per negara dan dibatasi pada jumlah mana yang lebih rendah antara pajak terutang/dibayar di LN dan proporsi PPh terutang dalam negeri."
    },
    {
      id: "b-5",
      topic: "Akuntansi Perpajakan / Rekonsiliasi Fiskal",
      prompt: "Aset tetap mesin dibeli seharga Rp 400.000.000 dengan masa manfaat komersial 5 tahun (garis lurus) dan masa manfaat fiskal Kelompok 2 (8 tahun). Pada tahun ke-1, bagaimanakah dampak perbedaan penyusutan ini terhadap koreksi fiskal?",
      options: [
        { id: "opt-1", text: "Koreksi positif sebesar Rp 30.000.000 karena penyusutan komersial lebih besar dari penyusutan fiskal." },
        { id: "opt-2", text: "Koreksi negatif sebesar Rp 30.000.000." },
        { id: "opt-3", text: "Koreksi positif sebesar Rp 50.000.000." },
        { id: "opt-4", text: "Tidak ada koreksi karena metode penyusutan sama." }
      ],
      correctOptionId: "opt-1",
      explanation: "Penyusutan komersial = Rp 400M / 5 = Rp 80M. Penyusutan fiskal Kel 2 = Rp 400M / 8 = Rp 50M. Beban komersial > fiskal selisih Rp 30M, sehingga harus dilakukan Koreksi Positif Rp 30 Miliar."
    }
  ];

  const levelAQuestions = [
    {
      id: "a-1",
      topic: "Ketentuan Umum Perpajakan (KUP)",
      prompt: "Batas waktu penyampaian SPT Tahunan PPh Wajib Pajak Orang Pribadi adalah paling lama:",
      options: [
        { id: "opt-1", text: "3 bulan setelah akhir Tahun Pajak (31 Maret)" },
        { id: "opt-2", text: "4 bulan setelah akhir Tahun Pajak (30 April)" },
        { id: "opt-3", text: "2 bulan setelah akhir Tahun Pajak (28 Februari)" },
        { id: "opt-4", text: "6 bulan setelah akhir Tahun Pajak (30 Juni)" }
      ],
      correctOptionId: "opt-1",
      explanation: "Sesuai Pasal 3 ayat (3) UU KUP, batas waktu SPT Tahunan OP adalah 3 bulan setelah akhir tahun pajak."
    },
    {
      id: "a-2",
      topic: "PPh Pasal 21",
      prompt: "Berapakah besarnya Penghasilan Tidak Kena Pajak (PTKP) dasar untuk Wajib Pajak Orang Pribadi lajang (TK/0) per tahun?",
      options: [
        { id: "opt-1", text: "Rp 54.000.000" },
        { id: "opt-2", text: "Rp 58.500.000" },
        { id: "opt-3", text: "Rp 63.000.000" },
        { id: "opt-4", text: "Rp 45.000.000" }
      ],
      correctOptionId: "opt-1",
      explanation: "PTKP untuk Wajib Pajak sendiri (TK/0) adalah Rp 54.000.000 per tahun."
    }
  ];

  let localSession = {
    id: "ukp-session-" + Date.now(),
    phase: "IN_PROGRESS",
    mode: currentLevel,
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    lives: 41,
    position: 1,
    questionIndex: 0,
    questionCount: 100,
    totalAnswerMs: 0,
    startedAt: Date.now(),
    deadlineAt: Date.now() + (currentLevel === 'B' ? 160000 : 60000),
    turnId: "turn-0-" + Date.now(),
    feedback: null,
    result: null
  };

  function createSnapshot(qIndex, level) {
    const questions = level === 'B' ? levelBQuestions : levelAQuestions;
    const qRaw = questions[qIndex % questions.length];
    const duration = level === 'B' ? 160000 : 60000;

    localSession.questionIndex = qIndex;
    localSession.mode = level;
    localSession.deadlineAt = Date.now() + duration;
    localSession.turnId = "turn-" + qIndex + "-" + Date.now();
    localSession.question = {
      id: qRaw.id,
      sequence: qIndex + 1,
      topic: qRaw.topic,
      prompt: qRaw.prompt,
      options: qRaw.options
    };

    const snap = JSON.parse(JSON.stringify(localSession));
    return { data: snap, error: null, ...snap };
  }

  function processAnswer(selectedOptionId, level) {
    const questions = level === 'B' ? levelBQuestions : levelAQuestions;
    const qIndex = localSession.questionIndex;
    const qRaw = questions[qIndex % questions.length];
    const isCorrect = selectedOptionId === qRaw.correctOptionId;

    if (isCorrect) {
      localSession.score += 10;
      localSession.correctCount += 1;
      localSession.position += 1;
    } else {
      localSession.wrongCount += 1;
      localSession.lives = Math.max(0, localSession.lives - 1);
    }

    localSession.feedback = {
      turnId: localSession.turnId,
      questionId: qRaw.id,
      selectedOptionId: selectedOptionId,
      correctOptionId: qRaw.correctOptionId,
      correct: isCorrect,
      timedOut: false,
      explanation: qRaw.explanation,
      source: "local-hybrid-engine",
      scoreDelta: isCorrect ? 10 : 0,
      livesDelta: isCorrect ? 0 : -1,
      positionDelta: isCorrect ? 1 : 0
    };

    if (localSession.questionIndex + 1 >= localSession.questionCount || localSession.lives <= 0) {
      localSession.phase = "FINISHED";
      localSession.result = {
        score: localSession.score,
        correctCount: localSession.correctCount,
        wrongCount: localSession.wrongCount,
        passed: localSession.score >= 70
      };
    }

    const snap = JSON.parse(JSON.stringify(localSession));
    return { data: snap, error: null, ...snap };
  }

  const originalFetch = window.fetch;
  window.fetch = async function (resource, options) {
    const urlStr = typeof resource === 'string' ? resource : (resource && resource.url) || '';

    if (urlStr.includes('/functions/v1/ukp')) {
      if (currentLevel === 'B') {
        try {
          const body = options && options.body ? JSON.parse(options.body) : {};
          if (body.action === 'submit_answer' || body.selectedOptionId) {
            const resData = processAnswer(body.selectedOptionId || body.optionId, 'B');
            return new Response(JSON.stringify(resData), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } else {
            const resData = createSnapshot(body.questionIndex || 0, 'B');
            return new Response(JSON.stringify(resData), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        } catch (e) {
          const resData = createSnapshot(0, 'B');
          return new Response(JSON.stringify(resData), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      try {
        const resp = await originalFetch.apply(this, arguments);
        if (resp.ok) return resp;
        throw new Error('Supabase UKP returned ' + resp.status);
      } catch (err) {
        const resData = createSnapshot(0, 'A');
        return new Response(JSON.stringify(resData), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return originalFetch.apply(this, arguments);
  };

  function renderLevelSelector() {
    if (document.getElementById('ukp-level-selector-bar')) return;

    const navOrHeader = document.querySelector('header') || document.querySelector('.journey-card') || document.body;
    if (!navOrHeader) return;

    const bar = document.createElement('div');
    bar.id = 'ukp-level-selector-bar';
    bar.className = 'ukp-level-selector-bar';
    bar.innerHTML = `
      <span style="color:#94a3b8; font-size:12px; font-weight:600; margin-right:4px;">TINGKAT UKP:</span>
      <button type="button" class="ukp-level-btn ukp-btn-a ${currentLevel === 'A' ? 'active-a' : ''}">
        UKP Level A (60s)
      </button>
      <button <span style="color:#94a3b8; font-size:12px; font-weight:600; margin-right:4px;">TINGKAT UKP:</span>
      <button type="button" class="ukp-level-btn ukp-btn-a ${currentLevel === 'A' ? 'active-a' : ''}">
        UKP Level A
      </button>
      <button type="button" class="ukp-level-btn ukp-btn-b ${currentLevel === 'B' ? 'active-b' : ''}">
        UKP Level B
      </button>
      <button type="button" class="ukp-level-btn ukp-btn-c ${currentLevel === 'C' ? 'active-c' : ''}">
        UKP Level C
      </button>
    `;

    navOrHeader.insertBefore(bar, navOrHeader.firstChild);

    bar.querySelector('.ukp-btn-a').addEventListener('click', function () {
      setLevel('A');
    });
    bar.querySelector('.ukp-btn-b').addEventListener('click', function () {
      setLevel('B');
    });
    bar.querySelector('.ukp-btn-c')?.addEventListener('click', function () {
      setLevel('C');
    });type="button" class="ukp-level-btn ukp-btn-b ${currentLevel === 'B' ? 'active-b' : ''}">
        UKP Level B (160s — PPh Badan, Akuntansi Pajak & PBB-P5L)
      </button>
    `;

    navOrHeader.insertBefore(bar, navOrHeader.firstChild);

    bar.querySelector('.ukp-btn-a').addEventListener('click', function () {
      setLevel('A');
    });
    bar.querySelector('.ukp-btn-b').addEventListener('click', function () {
      setLevel('B');
    });

    updateUI();
  }

  const observer = new MutationObserver(() => {
    renderLevelSelector();
    updateUI();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      renderLevelSelector();
      updateUI();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    renderLevelSelector();
    updateUI();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  console.log('UKP Level A & Level B Engine Ready.');
})();
