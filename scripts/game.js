/**
 * @file game.js - לוגיקת משחק המנקלה המלאה
 * עומד בדרישות: JSDoc, ES6+, HOF, ושימוש ב-BOM.
 */

/** @type {Object} אובייקט ליטרלי לניהול מצב המשחק (דרישה 72) */
const gameManager = {
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    currentPlayer: 1,
    isGameActive: true,
    // שימוש ב-BOM לקבלת רמת הקושי (דרישה 30)
    mode: new URLSearchParams(window.location.search).get('mode') || 'human',
    colors: ['#ff5e5e', '#5eff7d', '#5e96ff', '#ffffff']
};

// טעינת צלילים (דרישה 38)
const bgMusic = new Audio('../sound/backgroundMusic.mp3');
const winSound = new Audio('../sound/win.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

/**
 * יצירת אלמנטים דינאמית ב-DOM ללא innerHTML (דרישה 18, 46)
 */
const renderBoard = () => {
    gameManager.board.forEach((count, index) => {
        let container;
        if (index === 6) container = document.getElementById('store-p1');
        else if (index === 13) container = document.getElementById('store-p2');
        else container = document.querySelector(`.pit[data-index="${index}"]`);

        if (container) {
            // ניקוי ע"י textContent כדרישה לקוד נקי (דרישה 20)
            container.textContent = ''; 
            
            for (let i = 0; i < count; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone'); // שימוש ב-classList (דרישה 19)
                stone.style.backgroundColor = gameManager.colors[i % 4];
                container.appendChild(stone);
            }
        }
    });
    updateStatus();
};

/**
 * פונקציה אסינכרונית לביצוע מהלך עם תזמון (דרישה 27)
 * @param {number} pitIndex - אינדקס הגומחה
 */
const makeMove = async (pitIndex) => {
    if (!gameManager.isGameActive || gameManager.board[pitIndex] === 0) return;

    let stones = gameManager.board[pitIndex];
    gameManager.board[pitIndex] = 0;
    let currentIndex = pitIndex;
    renderBoard();

    while (stones > 0) {
        // שימוש ב-Promise ותזמון לאנימציה (דרישה 27)
        await new Promise(resolve => setTimeout(resolve, 400));
        currentIndex = (currentIndex + 1) % 14;

        // דילוג על קופת יריב
        if ((gameManager.currentPlayer === 1 && currentIndex === 13) || 
            (gameManager.currentPlayer === 2 && currentIndex === 6)) {
            currentIndex = (currentIndex + 1) % 14;
        }

        gameManager.board[currentIndex]++;
        stones--;
        renderBoard();
    }

    handleTurnLogic(currentIndex);
};

/**
 * ניהול לוגיקת התור וחוקי ההמשך
 */
const handleTurnLogic = (lastIndex) => {
    const isStore = (gameManager.currentPlayer === 1 && lastIndex === 6) || 
                    (gameManager.currentPlayer === 2 && lastIndex === 13);
    
    if (isStore) {
        // תור נוסף
    } else if (gameManager.board[lastIndex] > 1) {
        // חוק המשך התנועה (זריעה חוזרת)
        makeMove(lastIndex);
        return;
    } else {
        gameManager.currentPlayer = (gameManager.currentPlayer === 1) ? 2 : 1;
    }

    checkWinCondition();

    // מהלך מחשב (דרישה 5, 88)
    if (gameManager.isGameActive && gameManager.mode === 'ai' && gameManager.currentPlayer === 2) {
        setTimeout(aiPlay, 1000);
    }
};

/**
 * הגרלת מהלך עבור המחשב (דרישה 5, 9)
 */
const aiPlay = () => {
    // שימוש ב-filter (HOF) למציאת גומחות חוקיות (דרישה 9)
    const pits = [7, 8, 9, 10, 11, 12].filter(i => gameManager.board[i] > 0);
    if (pits.length > 0) {
        const randomPit = pits[Math.floor(Math.random() * pits.length)];
        makeMove(randomPit);
    }
};

/**
 * בדיקת סיום המשחק ושימוש ב-HOF (דרישה 9)
 */
const checkWinCondition = () => {
    const p1Empty = gameManager.board.slice(0, 6).every(v => v === 0); // שימוש ב-every
    const p2Empty = gameManager.board.slice(7, 13).every(v => v === 0);

    if (p1Empty || p2Empty) {
        gameManager.isGameActive = false;
        // איסוף שאריות האבנים
        if (p1Empty) {
            for(let i=7; i<=12; i++) { gameManager.board[13] += gameManager.board[i]; gameManager.board[i]=0; }
        } else {
            for(let i=0; i<=5; i++) { gameManager.board[6] += gameManager.board[i]; gameManager.board[i]=0; }
        }
        renderBoard();
        saveToLocalStorage(); // שמירת מידע מורכב (דרישה 29)
        winSound.play().catch(() => {});
    }
};

/**
 * עדכון טקסט סטטוס ושימוש במחרוזות (דרישה 7)
 */
const updateStatus = () => {
    const status = document.getElementById('status-area');
    const userJson = localStorage.getItem('current_user');
    const userData = userJson ? JSON.parse(userJson) : { name: "שחקן 1" };
    
    const name = gameManager.currentPlayer === 1 ? userData.name : "שחקן 2/מחשב";
    status.textContent = `תור: ${name}`.replace(":", " -"); // פונקציית מחרוזת (דרישה 7)
};

/**
 * שמירת תוצאה ומיון מותאם אישית (דרישה 8, 29)
 */
const saveToLocalStorage = () => {
    const scores = JSON.parse(localStorage.getItem('mancala_results') || "[]");
    const user = JSON.parse(localStorage.getItem('current_user')) || {name: "אנונימי"};
    
    scores.push({
        player: user.name,
        score: gameManager.board[6],
        date: new Date().toLocaleDateString() // פונקציית תאריך (דרישה 7)
    });

    // מיון מותאם אישית (דרישה 8)
    scores.sort((a, b) => b.score - a.score);
    localStorage.setItem('mancala_results', JSON.stringify(scores.slice(0, 5)));
};

// הוספת אירועים דרך הקוד (דרישה 22)
document.addEventListener('DOMContentLoaded', () => {
    renderBoard();
    document.querySelector('.mancala-board').addEventListener('click', (e) => {
        if (bgMusic.paused) bgMusic.play().catch(() => {});
        
        const pit = e.target.closest('.pit');
        if (pit) {
            const idx = parseInt(pit.dataset.index); // שימוש ב-data-* (דרישה 21)
            if ((gameManager.currentPlayer === 1 && idx <= 5) || 
                (gameManager.currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                makeMove(idx);
            }
        }
    });
});

// שימוש ב-BOM ואירוע נוסף (Esc ליציאה) (דרישה 23, 25)
window.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        if(window.confirm("לחזור לדף הבית?")) window.location.href = "../index.html";
    }
});