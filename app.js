let vocabList = JSON.parse(localStorage.getItem('ultraVocabList')) || [];
let currentMode = 'de-en';
let currentIndex = null;
let streak = parseInt(localStorage.getItem('ultraStreak')) || 0;
let learnedCount = 0;
let editingIndex = null;

// DOM Elements
const streakEl = document.getElementById('streak-count');
const progressBar = document.getElementById('progress-bar-fill');
const progressPercent = document.getElementById('progress-percent');
const modeBtns = document.querySelectorAll('.mode-btn');

const standardGame = document.getElementById('standard-game');
const flashcardGame = document.getElementById('flashcard-game');
const modeLabel = document.getElementById('mode-label');
const questionText = document.getElementById('question-text');

const textInputGroup = document.getElementById('text-input-group');
const answerInput = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');

const quizOptionsGroup = document.getElementById('quiz-options-group');
const feedbackMsg = document.getElementById('feedback-msg');

// Flashcards
const flashcard = document.getElementById('flashcard');
const fcFront = document.getElementById('fc-front-text');
const fcBack = document.getElementById('fc-back-text');
const fcWrong = document.getElementById('fc-wrong');
const fcCorrect = document.getElementById('fc-correct');

// Management
const importText = document.getElementById('import-text');
const importBtn = document.getElementById('import-btn');
const searchInput = document.getElementById('search-input');
const vocabListUl = document.getElementById('vocab-list-ul');
const totalCountEl = document.getElementById('total-count');
const clearAllBtn = document.getElementById('clear-all-btn');

// Modal
const editModal = document.getElementById('edit-modal');
const editDe = document.getElementById('edit-de');
const editEn = document.getElementById('edit-en');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Initialisierung
function init() {
    streakEl.innerText = streak;
    updateProgress();
    renderList();
    nextQuestion();
}

function saveData() {
    localStorage.setItem('ultraVocabList', JSON.stringify(vocabList));
    localStorage.setItem('ultraStreak', streak);
    totalCountEl.innerText = vocabList.length;
    updateProgress();
    renderList();
}

function updateProgress() {
    if (vocabList.length === 0) {
        progressBar.style.width = '0%';
        progressPercent.innerText = '0%';
        return;
    }
    let pct = Math.min(Math.round((learnedCount / vocabList.length) * 100), 100);
    progressBar.style.width = pct + '%';
    progressPercent.innerText = pct + '%';
}

// Modus Wechsel
modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        modeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMode = btn.dataset.mode;
        nextQuestion();
    });
});

// Nächste Frage vorbereiten
function nextQuestion() {
    feedbackMsg.innerText = '';
    answerInput.value = '';
    flashcard.classList.remove('flipped');

    if (vocabList.length === 0) {
        questionText.innerText = 'Keine Vokabeln vorhanden!';
        return;
    }

    currentIndex = Math.floor(Math.random() * vocabList.length);
    const item = vocabList[currentIndex];

    if (currentMode === 'flashcard') {
        standardGame.classList.add('hidden');
        flashcardGame.classList.remove('hidden');
        fcFront.innerText = item.de;
        fcBack.innerText = item.en;
        return;
    }

    standardGame.classList.remove('hidden');
    flashcardGame.classList.add('hidden');

    if (currentMode === 'de-en') {
        modeLabel.innerText = 'Deutsch ➔ Englisch';
        questionText.innerText = item.de;
        textInputGroup.classList.remove('hidden');
        quizOptionsGroup.classList.add('hidden');
    } else if (currentMode === 'en-de') {
        modeLabel.innerText = 'Englisch ➔ Deutsch';
        questionText.innerText = item.en;
        textInputGroup.classList.remove('hidden');
        quizOptionsGroup.classList.add('hidden');
    } else if (currentMode === 'quiz') {
        modeLabel.innerText = '⚡ 4-Optionen Quiz';
        questionText.innerText = item.de;
        textInputGroup.classList.add('hidden');
        quizOptionsGroup.classList.remove('hidden');
        setupQuizOptions(item.en);
    }
}

// Quiz Optionen Bauen
function setupQuizOptions(correctAnswer) {
    quizOptionsGroup.innerHTML = '';
    let options = [correctAnswer];

    while (options.length < Math.min(4, vocabList.length)) {
        let randomWord = vocabList[Math.floor(Math.random() * vocabList.length)].en;
        if (!options.includes(randomWord)) options.push(randomWord);
    }

    options.sort(() => Math.random() - 0.5);

    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.innerText = opt;
        btn.onclick = () => handleAnswer(opt.toLowerCase() === correctAnswer.toLowerCase(), correctAnswer);
        quizOptionsGroup.appendChild(btn);
    });
}

// Antworten Auswerten
function handleAnswer(isCorrect, expected) {
    if (isCorrect) {
        feedbackMsg.innerText = '✅ Richtig! Weiter so!';
        feedbackMsg.style.color = 'var(--accent)';
        streak++;
        learnedCount++;
        streakEl.innerText = streak;
        saveData();
        setTimeout(nextQuestion, 1000);
    } else {
        feedbackMsg.innerText = `❌ Falsch! Richtig ist: ${expected}`;
        feedbackMsg.style.color = 'var(--danger)';
        streak = 0;
        streakEl.innerText = streak;
        saveData();
    }
}

checkBtn.addEventListener('click', () => {
    if (currentIndex === null) return;
    const item = vocabList[currentIndex];
    const userVal = answerInput.value.trim().toLowerCase();
    
    let isCorrect = false;
    let expected = '';

    if (currentMode === 'de-en') {
        isCorrect = userVal === item.en.toLowerCase();
        expected = item.en;
    } else if (currentMode === 'en-de') {
        isCorrect = userVal === item.de.toLowerCase();
        expected = item.de;
    }

    handleAnswer(isCorrect, expected);
});

// Flashcard Flip & Events
flashcard.addEventListener('click', () => flashcard.classList.toggle('flipped'));
fcCorrect.addEventListener('click', () => handleAnswer(true, ''));
fcWrong.addEventListener('click', () => handleAnswer(false, ''));

// Import Logik
importBtn.addEventListener('click', () => {
    const text = importText.value.trim();
    if (!text) return;

    const lines = text.split('\n');
    let added = 0;

    lines.forEach(line => {
        const parts = line.split(/[=-:]/);
        if (parts.length >= 2) {
            const de = parts[0].trim();
            const en = parts[1].trim();
            if (de && en) {
                vocabList.push({ de, en });
                added++;
            }
        }
    });

    if (added > 0) {
        importText.value = '';
        saveData();
        nextQuestion();
        alert(`${added} Vokabeln importiert!`);
    }
});

// Liste & Suche
function renderList() {
    vocabListUl.innerHTML = '';
    const filter = searchInput.value.toLowerCase();
    totalCountEl.innerText = vocabList.length;

    vocabList.forEach((item, idx) => {
        if (item.de.toLowerCase().includes(filter) || item.en.toLowerCase().includes(filter)) {
            const li = document.createElement('li');
            li.className = 'vocab-item';
            li.innerHTML = `
                <span><strong>${item.de}</strong> = ${item.en}</span>
                <div class="vocab-actions">
                    <button class="icon-btn" onclick="openEdit(${idx})">✏️</button>
                    <button class="icon-btn" onclick="deleteVocab(${idx})">❌</button>
                </div>
            `;
            vocabListUl.appendChild(li);
        }
    });
}

searchInput.addEventListener('input', renderList);

// Vokabel Einzel-Bearbeitung (In-Line Modal)
window.openEdit = function(index) {
    editingIndex = index;
    editDe.value = vocabList[index].de;
    editEn.value = vocabList[index].en;
    editModal.classList.remove('hidden');
};

saveEditBtn.addEventListener('click', () => {
    if (editingIndex !== null) {
        vocabList[editingIndex].de = editDe.value.trim();
        vocabList[editingIndex].en = editEn.value.trim();
        saveData();
        editModal.classList.add('hidden');
        nextQuestion();
    }
});

cancelEditBtn.addEventListener('click', () => editModal.classList.add('hidden'));

window.deleteVocab = function(index) {
    vocabList.splice(index, 1);
    saveData();
    nextQuestion();
};

clearAllBtn.addEventListener('click', () => {
    if (confirm('Möchtest du wirklich ALLE Vokabeln löschen?')) {
        vocabList = [];
        saveData();
        nextQuestion();
    }
});

init();