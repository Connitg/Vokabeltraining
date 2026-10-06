let vocabList = JSON.parse(localStorage.getItem('cleanVocabList')) || [];
let streak = parseInt(localStorage.getItem('cleanStreak')) || 0;
let learnedCount = 0;
let currentMode = 'de-en';
let currentIndex = null;
let editingIndex = null;

// DOM Elements
const streakVal = document.getElementById('streak-val');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');

// Navigation
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');

// Study Controls
const modeTabs = document.querySelectorAll('.mode-tab');
const questionText = document.getElementById('question-text');
const cardTag = document.getElementById('card-tag');
const typeAnswerBox = document.getElementById('type-answer-box');
const userInput = document.getElementById('user-input');
const submitBtn = document.getElementById('submit-btn');
const quizGrid = document.getElementById('quiz-grid');

// Flashcard Controls
const flashcardBox = document.getElementById('flashcard-box');
const revealBtn = document.getElementById('reveal-btn');
const revealedAnswer = document.getElementById('revealed-answer');
const fcActions = document.getElementById('fc-actions');
const fcWrong = document.getElementById('fc-wrong');
const fcCorrect = document.getElementById('fc-correct');
const feedback = document.getElementById('feedback');

// List & Import
const vocabContainer = document.getElementById('vocab-container');
const totalCount = document.getElementById('total-count');
const searchInput = document.getElementById('search-input');
const clearAllBtn = document.getElementById('clear-all-btn');
const importText = document.getElementById('import-text');
const runImportBtn = document.getElementById('run-import-btn');

// Modal
const editModal = document.getElementById('edit-modal');
const editDeVal = document.getElementById('edit-de-val');
const editEnVal = document.getElementById('edit-en-val');
const cancelEdit = document.getElementById('cancel-edit');
const saveEdit = document.getElementById('save-edit');

// Init
function init() {
streakVal.innerText = streak;
updateProgress();
renderVocabList();
loadNextCard();
}

function saveData() {
localStorage.setItem('cleanVocabList', JSON.stringify(vocabList));
localStorage.setItem('cleanStreak', streak);
streakVal.innerText = streak;
totalCount.innerText = vocabList.length;
updateProgress();
renderVocabList();
}

function updateProgress() {
if (vocabList.length === 0) {
progressBar.style.width = '0%';
progressText.innerText = '0%';
return;
}
let pct = Math.min(Math.round((learnedCount / vocabList.length) * 100), 100);
progressBar.style.width = pct + '%';
progressText.innerText = pct + '%';
}

// Navigation Bar Switching
navItems.forEach(item => {
item.addEventListener('click', () => {
navItems.forEach(n => n.classList.remove('active'));
views.forEach(v => v.classList.remove('active'));

    item.classList.add('active');
    document.getElementById(item.dataset.target).classList.add('active');
});


});

// Mode Switching Tabs
modeTabs.forEach(tab => {
tab.addEventListener('click', () => {
modeTabs.forEach(t => t.classList.remove('active'));
tab.classList.add('active');
currentMode = tab.dataset.mode;
loadNextCard();
});
});

// Load Question
function loadNextCard() {
feedback.innerText = '';
userInput.value = '';
revealedAnswer.classList.add('hidden');
fcActions.classList.add('hidden');
revealBtn.classList.remove('hidden');

if (vocabList.length === 0) {
    questionText.innerText = 'Keine Vokabeln vorhanden.';
    cardTag.innerText = 'Info';
    typeAnswerBox.classList.add('hidden');
    quizGrid.classList.add('hidden');
    flashcardBox.classList.add('hidden');
    return;
}

currentIndex = Math.floor(Math.random() * vocabList.length);
const item = vocabList[currentIndex];

if (currentMode === 'de-en') {
    cardTag.innerText = 'Deutsch ➔ Englisch';
    questionText.innerText = item.de;
    typeAnswerBox.classList.remove('hidden');
    quizGrid.classList.add('hidden');
    flashcardBox.classList.add('hidden');
} else if (currentMode === 'en-de') {
    cardTag.innerText = 'Englisch ➔ Deutsch';
    questionText.innerText = item.en;
    typeAnswerBox.classList.remove('hidden');
    quizGrid.classList.add('hidden');
    flashcardBox.classList.add('hidden');
} else if (currentMode === 'quiz') {
    cardTag.innerText = 'Multiple Choice';
    questionText.innerText = item.de;
    typeAnswerBox.classList.add('hidden');
    quizGrid.classList.remove('hidden');
    flashcardBox.classList.add('hidden');
    setupQuiz(item.en);
} else if (currentMode === 'card') {
    cardTag.innerText = 'Karteikarte';
    questionText.innerText = item.de;
    typeAnswerBox.classList.add('hidden');
    quizGrid.classList.add('hidden');
    flashcardBox.classList.remove('hidden');
}


}

function handleResult(isCorrect, answerStr) {
if (isCorrect) {
feedback.innerText = '✅ Richtig!';
feedback.style.color = 'var(--accent-green)';
streak++;
learnedCount++;
saveData();
setTimeout(loadNextCard, 1000);
} else {
feedback.innerText = ❌ Richtig wäre: ${answerStr};
feedback.style.color = 'var(--accent-red)';
streak = 0;
saveData();
}
}

// Text Input Submit
submitBtn.addEventListener('click', () => {
if (currentIndex === null) return;
const item = vocabList[currentIndex];
const val = userInput.value.trim().toLowerCase();

if (currentMode === 'de-en') {
    handleResult(val === item.en.toLowerCase(), item.en);
} else {
    handleResult(val === item.de.toLowerCase(), item.de);
}


});

// Quiz Setup
function setupQuiz(correctAnswer) {
quizGrid.innerHTML = '';
let options = [correctAnswer];

while (options.length < Math.min(4, vocabList.length)) {
    let rand = vocabList[Math.floor(Math.random() * vocabList.length)].en;
    if (!options.includes(rand)) options.push(rand);
}

options.sort(() => Math.random() - 0.5);

options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'quiz-btn';
    btn.innerText = opt;
    btn.onclick = () => handleResult(opt.toLowerCase() === correctAnswer.toLowerCase(), correctAnswer);
    quizGrid.appendChild(btn);
});


}

// Flashcard Events
revealBtn.addEventListener('click', () => {
if (currentIndex === null) return;
revealedAnswer.innerText = vocabList[currentIndex].en;
revealedAnswer.classList.remove('hidden');
fcActions.classList.remove('hidden');
revealBtn.classList.add('hidden');
});

fcCorrect.addEventListener('click', () => handleResult(true, ''));
fcWrong.addEventListener('click', () => handleResult(false, vocabList[currentIndex].en));

// Render List & Search
function renderVocabList() {
vocabContainer.innerHTML = '';
const q = searchInput.value.toLowerCase();
totalCount.innerText = vocabList.length;

vocabList.forEach((item, idx) => {
    if (item.de.toLowerCase().includes(q) || item.en.toLowerCase().includes(q)) {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `
            <div class="vocab-info">
                <span class="vocab-de">${item.de}</span>
                <span class="vocab-en">${item.en}</span>
            </div>
            <div class="vocab-actions">
                <button class="icon-btn" onclick="openEditModal(${idx})">✏️</button>
                <button class="icon-btn" onclick="deleteVocabItem(${idx})">🗑️</button>
            </div>
        `;
        vocabContainer.appendChild(card);
    }
});


}

searchInput.addEventListener('input', renderVocabList);

// Import List
runImportBtn.addEventListener('click', () => {
const raw = importText.value.trim();
if (!raw) return;

const lines = raw.split('\n');
let added = 0;

lines.forEach(l => {
    const parts = l.split(/[=-:]/);
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
    loadNextCard();
    alert(`${added} Vokabeln erfolgreich hinzugefügt!`);
}


});

// Edit & Delete
window.openEditModal = function(index) {
editingIndex = index;
editDeVal.value = vocabList[index].de;
editEnVal.value = vocabList[index].en;
editModal.classList.remove('hidden');
};

cancelEdit.addEventListener('click', () => editModal.classList.add('hidden'));

saveEdit.addEventListener('click', () => {
if (editingIndex !== null) {
vocabList[editingIndex].de = editDeVal.value.trim();
vocabList[editingIndex].en = editEnVal.value.trim();
saveData();
editModal.classList.add('hidden');
loadNextCard();
}
});

window.deleteVocabItem = function(index) {
vocabList.splice(index, 1);
saveData();
loadNextCard();
};

clearAllBtn.addEventListener('click', () => {
if (confirm('Wirklich alle Vokabeln löschen?')) {
vocabList = [];
saveData();
loadNextCard();
}
});

init();
