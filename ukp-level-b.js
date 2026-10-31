(function () {
  'use strict';

  const styleEl = document.createElement('style');
  styleEl.id = 'ukp-level-b-styles';
  styleEl.textContent = `
    .journey-card { transition: all 0.5s ease-in-out; }
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

    .ukp-level-selector {
      display: flex;
      gap: 10px;
      justify-content: center;
      margin: 15px 0;
      flex-wrap: wrap;
    }
    .ukp-level-btn {
      padding: 10px 16px;
      border-radius: 12px;
      border: 2px solid rgba(255,255,255,0.3);
      background: rgba(15, 23, 42, 0.8);
      color: #fff;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 14px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    }
    .ukp-level-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 12px rgba(0,0,0,0.3);
    }
    .ukp-level-btn.active-a {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      border-color: #60a5fa;
      box-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
    }
    .ukp-level-btn.active-b {
      background: linear-gradient(135deg, #8b5cf6, #6d28d9);
      border-color: #a78bfa;
      box-shadow: 0 0 15px rgba(139, 92, 246, 0.6);
    }
  `;
  document.head.appendChild(styleEl);

  let currentLevel = localStorage.getItem('ukp_selected_level') || 'B';

  function setLevel(lvl) {
    currentLevel = lvl;
    localStorage.setItem('ukp_selected_level', lvl);
    updateUIElements();
  }

  function updateUIElements() {
    document.querySelectorAll('.journey-level').forEach(el => {
      el.textContent = `LEVEL ${currentLevel}`;
    });
    document.querySelectorAll('.journey-timer, .ukp-timer-badge').forEach(el => {
      el.textContent = currentLevel === 'B' ? '160s' : '60s';
    });
    document.querySelectorAll('.ukp-level-btn-a').forEach(btn => {
      if (currentLevel === 'A') btn.classList.add('active-a');
      else btn.classList.remove('active-a');
    });
    document.querySelectorAll('.ukp-level-btn-b').forEach(btn => {
      if (currentLevel === 'B') btn.classList.add('active-b');
      else btn.classList.remove('active-b');
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
    score: 0,
    correctCount: 0,
    wrongCount: 0,
    lives: 41,
    position: 1,
    questionIndex: 0,
    questionCount: 100,
    totalAnswerMs: 0,
    startedAt: Date.now(),
    deadlineAt: Date.now() + 160000,
    turnId: "turn-0-" + Date.now(),
    feedback: null,
    result: null
  };

  function getSnapshot(qIndex, level) {
    const questions = level === 'B' ? levelBQuestions : levelAQuestions;
    const qRaw = questions[qIndex % questions.length];
    const timeLimitMs = level === 'B' ? 160000 : 60000;

    localSession.questionIndex = qIndex;
    localSession.mode = level;
    localSession.deadlineAt = Date.now() + timeLimitMs;
    localSession.turnId = "turn-" + qIndex + "-" + Date.now();
    localSession.question = {
      id: qRaw.id,
      sequence: qIndex + 1,
      topic: qRaw.topic,
      prompt: qRaw.prompt,
      options: qRaw.options
    };
    return localSession;
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

    return localSession;
  }

  const originalFetch = window.fetch;
  window.fetch = async function (resource, options) {
    const urlStr = typeof resource === 'string' ? resource : (resource && resource.url) || '';

    if (urlStr.includes('/functions/v1/ukp')) {
      if (currentLevel === 'B') {
        try {
          const body = options && options.body ? JSON.parse(options.body) : {};
          if (body.action === 'submit_answer' || body.selectedOptionId) {
            const snap = processAnswer(body.selectedOptionId || body.optionId, 'B');
            return new Response(JSON.stringify(snap), { status: 200, headers: { 'Content-Type': 'application/json' } });
          } else {
            const snap = getSnapshot(body.questionIndex || 0, 'B');
            return new Response(JSON.stringify(snap), { status: 200, headers: { 'Content-Type': 'application/json' } });
          }
        } catch (e) {
          const snap = getSnapshot(0, 'B');
          return new Response(JSON.stringify(snap), { status: 200, headers: { 'Content-Type': 'application/json' } });
        }
      }

      try {
        const resp = await originalFetch.apply(this, arguments);
        if (resp.ok) return resp;
        throw new Error('Supabase UKP returned ' + resp.status);
      } catch (err) {
        const snap = getSnapshot(0, 'A');
        return new Response(JSON.stringify(snap), { status: 200, headers: { 'Content-Type': 'application/json' } });
      }
    }

    return originalFetch.apply(this, arguments);
  };

  function injectSelectorUI() {
    if (document.getElementById('ukp-level-selector-wrap')) return;

    const container = document.querySelector('.journey-card') || document.querySelector('main') || document.body;
    if (!container) return;

    const selectorWrap = document.createElement('div');
    selectorWrap.id = 'ukp-level-selector-wrap';
    selectorWrap.className = 'ukp-level-selector';
    selectorWrap.innerHTML = `
      <button type="button" class="ukp-level-btn ukp-level-btn-a ${currentLevel === 'A' ? 'active-a' : ''}">
        UKP Level A (60s/soal)
      </button>
      <button type="button" class="ukp-level-btn ukp-level-btn-b ${currentLevel === 'B' ? 'active-b' : ''}">
        UKP Level B (160s/soal — PPh Badan, Akuntansi Pajak & PBB-P5L)
      </button>
    `;

    const targetHeader = container.querySelector('h1, h2, .journey-header, header') || container.firstChild;
    if (targetHeader && targetHeader.parentNode) {
      targetHeader.parentNode.insertBefore(selectorWrap, targetHeader.nextSibling);
    } else {
      container.insertBefore(selectorWrap, container.firstChild);
    }

    selectorWrap.querySelector('.ukp-level-btn-a').addEventListener('click', function () {
      setLevel('A');
    });

    selectorWrap.querySelector('.ukp-level-btn-b').addEventListener('click', function () {
      setLevel('B');
    });

    updateUIElements();
  }

  const observer = new MutationObserver(() => {
    injectSelectorUI();
    updateUIElements();
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      injectSelectorUI();
      updateUIElements();
      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    injectSelectorUI();
    updateUIElements();
    observer.observe(document.body, { childList: true, subtree: true });
  }

  console.log('UKP Level A & Level B (160s) Engine initialized successfully.');
})();
