let vocabulary = JSON.parse(localStorage.getItem('vocab_master_data') || '[]');
let currentCardIndex = 0;
let isFlipped = false;
let currentQuizIndex = 0;

// Navigation
function navTo(sectionId, btn) {
  document.querySelectorAll('main section').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));

  document.getElementById(sectionId).classList.add('active');
  btn.classList.add('active');

  if (sectionId === 'cards-sec') initCards();
  if (sectionId === 'quiz-sec') initQuiz();
  if (sectionId === 'list-sec') renderList();
}

// --- SCANNER & LIVE PROGRESS ---
document.getElementById('photo-input').addEventListener('change', async function(e) {
  const file = e.target.files[0];
  if (!file) return;

  // 1. Bild-Vorschau anzeigen
  const previewContainer = document.getElementById('image-preview-container');
  const previewImg = document.getElementById('image-preview');
  previewImg.src = URL.createObjectURL(file);
  previewContainer.style.display = 'block';

  // 2. Ladebalken aktivieren
  const progressBox = document.getElementById('progress-container');
  const progressBar = document.getElementById('progress-bar');
  const statusText = document.getElementById('status-text');
  const progressPercent = document.getElementById('progress-percent');
  
  progressBox.style.display = 'flex';
  progressBar.style.width = '0%';

  try {
    const worker = await Tesseract.createWorker('eng', 1, {
      logger: m => {
        if (m.status === 'recognizing text') {
          const pct = Math.round((m.progress || 0) * 100);
          progressBar.style.width = pct + '%';
          progressPercent.innerText = pct + '%';
          statusText.innerText = "Lese Text aus Bild...";
        } else {
          statusText.innerText = "Lade OCR-Engine...";
        }
      }
    });

    const ret = await worker.recognize(file);
    await worker.terminate();

    document.getElementById('raw-text').value = ret.data.text;
    document.getElementById('ocr-result').style.display = 'block';
    progressBox.style.display = 'none';
  } catch (err) {
    statusText.innerText = "❌ Fehler beim Lesen!";
    console.error(err);
  }
});

function swapLanguagesInText() {
  const textarea = document.getElementById('raw-text');
  const lines = textarea.value.split('\n');
  const swapped = lines.map(line => {
    const parts = line.split(/[-:\t|]/);
    if (parts.length >= 2) {
      return `${parts[1].trim()} - ${parts[0].trim()}`;
    }
    return line;
  });
  textarea.value = swapped.join('\n');
}

function parseAndSaveVocab() {
  const rawText = document.getElementById('raw-text').value;
  const lines = rawText.split('\n');
  let addedCount = 0;

  lines.forEach(line => {
    const parts = line.split(/[-:\t|]|->/);
    if (parts.length >= 2) {
      const en = parts[0].trim();
      const de = parts[1].trim();
      if (en && de) {
        vocabulary.push({ en, de, level: 1 });
        addedCount++;
      }
    }
  });

  saveToStorage();
  alert(`${addedCount} Vokabeln hinzugefügt!`);
  document.getElementById('ocr-result').style.display = 'none';
  document.getElementById('image-preview-container').style.display = 'none';
  navTo('cards-sec', document.querySelectorAll('.bottom-nav button')[2]);
}

// --- MANUELLE EINGABE ---
function addSingleVocab() {
  const en = document.getElementById('manual-en').value.trim();
  const de = document.getElementById('manual-de').value.trim();

  if (!en || !de) {
    alert("Bitte Englisch und Deutsch ausfüllen!");
    return;
  }

  vocabulary.push({ en, de, level: 1 });
  saveToStorage();

  document.getElementById('manual-en').value = '';
  document.getElementById('manual-de').value = '';
  alert("Vokabel gespeichert!");
}

// --- KARTEIKARTEN ---
function initCards() {
  const controls = document.getElementById('card-controls');
  if (vocabulary.length === 0) {
    document.getElementById('card-content').innerText = "Keine Vokabeln da!";
    document.getElementById('card-lvl').innerText = "Level -";
    controls.style.display = 'none';
    return;
  }

  vocabulary.sort((a, b) => a.level - b.level);
  currentCardIndex = 0;
  isFlipped = false;
  controls.style.display = 'none';
  showCardContent();
}

function showCardContent() {
  const item = vocabulary[currentCardIndex];
  document.getElementById('card-content').innerText = isFlipped ? item.de : item.en;
  document.getElementById('card-lvl').innerText = `Level ${item.level}`;
}

function flipCard() {
  if (vocabulary.length === 0) return;
  isFlipped = !isFlipped;
  showCardContent();

  if (isFlipped) {
    document.getElementById('card-controls').style.display = 'flex';
  }
}

function rateCard(success) {
  const item = vocabulary[currentCardIndex];
  if (success) {
    if (item.level < 5) item.level++;
  } else {
    item.level = 1;
  }
  saveToStorage();
  initCards();
}

// --- QUIZ ---
function initQuiz() {
  if (vocabulary.length === 0) {
    document.getElementById('quiz-prompt').innerText = "Keine Vokabeln!";
    return;
  }
  currentQuizIndex = Math.floor(Math.random() * vocabulary.length);
  document.getElementById('quiz-prompt').innerText = vocabulary[currentQuizIndex].en;
  document.getElementById('quiz-input').value = '';
  document.getElementById('quiz-feedback').innerText = '';
}

function checkAnswer() {
  const input = document.getElementById('quiz-input').value.trim().toLowerCase();
  const correct = vocabulary[currentQuizIndex].de.toLowerCase();
  const feedback = document.getElementById('quiz-feedback');

  if (input === correct) {
    feedback.style.color = 'var(--success)';
    feedback.innerText = "Richtig! 🔥";
    setTimeout(initQuiz, 1000);
  } else {
    feedback.style.color = 'var(--danger)';
    feedback.innerText = `Falsch! Richtig wäre: "${vocabulary[currentQuizIndex].de}"`;
  }
}

// --- HELFER & STORAGE ---
function saveToStorage() {
  localStorage.setItem('vocab_master_data', JSON.stringify(vocabulary));
  updateCount();
}

function updateCount() {
  document.getElementById('vocab-count').innerText = vocabulary.length;
}

function renderList() {
  const list = document.getElementById('vocab-list');
  list.innerHTML = vocabulary.map(v => 
    `<li>
      <span><strong>${v.en}</strong> = ${v.de}</span> 
      <span class="lvl">Lvl ${v.level}</span>
    </li>`
  ).join('');
}

function clearVocab() {
  if (confirm("Wirklich alle Vokabeln löschen?")) {
    vocabulary = [];
    saveToStorage();
    renderList();
  }
}

updateCount();