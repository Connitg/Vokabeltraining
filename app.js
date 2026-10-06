let vocabList = JSON.parse(localStorage.getItem('myVocabList')) || [];
let currentWordIndex = null;

// DOM Elemente
const deInput = document.getElementById('de-input');
const enInput = document.getElementById('en-input');
const addBtn = document.getElementById('add-btn');
const importText = document.getElementById('import-text');
const importBtn = document.getElementById('import-btn');
const questionEl = document.getElementById('question');
const answerInput = document.getElementById('answer-input');
const checkBtn = document.getElementById('check-btn');
const resultMsg = document.getElementById('result-msg');
const vocabListEl = document.getElementById('vocab-list');
const countEl = document.getElementById('count');
const clearBtn = document.getElementById('clear-btn');

// Speichern
function saveData() {
    localStorage.setItem('myVocabList', JSON.stringify(vocabList));
    renderList();
    nextQuestion();
}

// Einzelne Vokabel hinzufügen
addBtn.addEventListener('click', () => {
    const de = deInput.value.trim();
    const en = enInput.value.trim();

    if (de && en) {
        vocabList.push({ de, en });
        deInput.value = '';
        enInput.value = '';
        saveData();
    }
});

// Massen-Import verarbeiten
importBtn.addEventListener('click', () => {
    const text = importText.value.trim();
    if (!text) return;

    const lines = text.split('\n');
    let addedCount = 0;

    lines.forEach(line => {
        // Trennt bei = oder - oder :
        const parts = line.split(/[=-:]/);
        if (parts.length >= 2) {
            const de = parts[0].trim();
            const en = parts[1].trim();
            if (de && en) {
                vocabList.push({ de, en });
                addedCount++;
            }
        }
    });

    if (addedCount > 0) {
        importText.value = '';
        saveData();
        alert(`${addedCount} Vokabeln erfolgreich importiert!`);
    } else {
        alert('Konnte keine Vokabeln erkennen. Bitte Format beachten: "Wort = Translation"');
    }
});

// Nächste Frage vorbereiten
function nextQuestion() {
    resultMsg.innerText = '';
    answerInput.value = '';

    if (vocabList.length === 0) {
        questionEl.innerText = 'Keine Vokabeln vorhanden.';
        currentWordIndex = null;
        return;
    }

    currentWordIndex = Math.floor(Math.random() * vocabList.length);
    questionEl.innerText = vocabList[currentWordIndex].de;
}

// Antwort prüfen
checkBtn.addEventListener('click', () => {
    if (currentWordIndex === null) return;

    const userAns = answerInput.value.trim().toLowerCase();
    const correctAns = vocabList[currentWordIndex].en.toLowerCase();

    if (userAns === correctAns) {
        resultMsg.innerText = '✅ Richtig!';
        resultMsg.style.color = 'green';
        setTimeout(nextQuestion, 1200);
    } else {
        resultMsg.innerText = `❌ Falsch! Richtig wäre: ${vocabList[currentWordIndex].en}`;
        resultMsg.style.color = 'red';
    }
});

// Liste anzeigen
function renderList() {
    vocabListEl.innerHTML = '';
    countEl.innerText = vocabList.length;

    vocabList.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span><strong>${item.de}</strong> = ${item.en}</span> <button onclick="deleteVocab(${index})">❌</button>`;
        vocabListEl.appendChild(li);
    });
}

function deleteVocab(index) {
    vocabList.splice(index, 1);
    saveData();
}

clearBtn.addEventListener('click', () => {
    if (confirm('Wirklich alle Vokabeln löschen?')) {
        vocabList = [];
        saveData();
    }
});

// Start
renderList();
nextQuestion();