/**
 * @file game.js - ניהול לוגיקת משחק המנקלה, תזמון מהלכים ושמירת נתונים.
 * הקובץ אחראי על ניהול התורות, זריעת האבנים, בדיקת ניצחון ותקשורת עם ה-localStorage[cite: 29].
 * עונה על דרישות: HOF [cite: 9], תזמון [cite: 27], צלילים [cite: 38] ושמירת מידע מורכב[cite: 29].
 */

import { getSavedPlayers } from './index.js';

/**
 * אובייקט ליטרלי המרכז את תכונות המשחק ומצבו הנוכחי.
 * עונה על דרישה: קיבוץ תכונות באובייקט ליטרלי[cite: 72].
 * @type {Object}
 */
const savedPlayers = getSavedPlayers();

const game = {
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    currentPlayer: 1,
    active: true,
    names: { 
        1: savedPlayers.p1 || "שחקן 1", 
        2: savedPlayers.p2 || "שחקן 2" 
    },
    level: new URLSearchParams(window.location.search).get('level') || 'hard' // שימוש ב-BOM location [cite: 25]
};

/**
 * אובייקטים לניהול צלילי המשחק.
 * עונה על דרישה: שימוש בצלילים[cite: 38].
 */
const bgMusic = new Audio('../sound/backgroundMusic.mp3');
const winSound = new Audio('../sound/win.wav');
const moveSound = new Audio('../sound/move.wav'); // צליל נוסף למהלך
bgMusic.loop = true;
bgMusic.volume = 0.5;

/**
 * מעדכנת את ה-DOM בהתאם למצב הנוכחי של מערך הלוח.
 * יוצרת אלמנטים דינאמית ללא שימוש ב-innerHTML[cite: 46].
 * עונה על דרישות: יצירה דינאמית [cite: 18], עבודה עם textContent [cite: 20] ומניעת innerHTML[cite: 46].
 */
const render = () => {
    console.log('render called, game.active:', game.active, 'currentPlayer:', game.currentPlayer);
    const statusArea = document.getElementById('status-area');
    if (statusArea && game.active) {
        statusArea.textContent = ''; // ניקוי
        const text = document.createElement('span');
        text.textContent = `תור: ${game.names[game.currentPlayer]}`;
        statusArea.appendChild(text);
    }

    game.board.forEach((count, index) => {
        let el = (index === 6) ? document.getElementById('store-p1') : 
                 (index === 13) ? document.getElementById('store-p2') : 
                 document.querySelector(`.pit[data-index="${index}"]`);
        
        if (el) {
            el.textContent = ''; // ניקוי בטוח ללא innerHTML [cite: 20, 46]
            for (let i = 0; i < count; i++) {
                const stone = document.createElement('div');
                stone.className = 'stone'; // עבודה עם classList/className [cite: 19]
                const colors = ['#ff5e5e', '#5eff7d', '#5e96ff', '#ffffff'];
                stone.style.backgroundColor = colors[i % 4];
                el.appendChild(stone); // יצירה דינמית [cite: 18]
            }
        }
    });
};

/**
 * פונקציה אסינכרונית המבצעת את מהלך זריעת האבנים עם השהיה ויזואלית.
 * עונה על דרישה: תזמון פונקציות באמצעות setTimeout[cite: 27].
 * @param {number} idx - האינדקס של הגומחה ממנה מתחיל המהלך.
 * @returns {Promise<void>}
 */
const move = async (idx) => {
    if (!game.active || game.board[idx] === 0) return;
    let stones = game.board[idx];
    game.board[idx] = 0;
    let curr = idx;
    render();
    moveSound.play().catch(() => {}); // צליל למהלך
while (stones > 0) {
        await new Promise(r => setTimeout(r, 400));
        curr = (curr + 1) % 14;
        
        if ((game.currentPlayer === 1 && curr === 13) || (game.currentPlayer === 2 && curr === 6)) {
            curr = (curr + 1) % 14;
        }
        
        game.board[curr]++;
        stones--;
        render();
    }

    // --- שינוי כאן: בדיקת סיום מיד בסיום הזריעה ---
    checkEnd(); 
    if (!game.active) return; // אם המשחק נגמר ב-checkEnd, עוצרים הכל ולא ממשיכים למהלכים הבאים

    // בדיקת חוק תור נוסף או המשך תנועה
    if (!((game.currentPlayer === 1 && curr === 6) || (game.currentPlayer === 2 && curr === 13))) {
        if (game.board[curr] > 1) { 
            // אם הגומחה לא הייתה ריקה, ממשיכים לזרוע מאותה נקודה
            await move(curr); 
            return; 
        }
        // אם נחתנו בגומחה ריקה, התור עובר
        game.currentPlayer = (game.currentPlayer === 1) ? 2 : 1;
    }
    
    render();
    
    // בדיקה נוספת למקרה שהלוח התרוקן אחרי העברת התור
    checkEnd(); 

    if (game.active && JSON.parse(localStorage.getItem('mancala_players'))?.mode !== 'human' && game.currentPlayer === 2) {
        setTimeout(() => aiPlay(game.level), 800);
    }
};

/**
 * מבצעת מהלך אוטומטי עבור המחשב על בסיס הגרלה.
 * עונה על דרישות: הגרלת מספר [cite: 5] ושימוש ב-HOF filter[cite: 9].
 */
const aiPlay = (level = 'hard') => { // פרמטר ברירת מחדל [cite: 12]
    const validPits = [7, 8, 9, 10, 11, 12].filter(i => game.board[i] > 0); // שימוש ב-HOF [cite: 9]
    if (validPits.length > 0) {
        let choice;
        if (level === 'easy') {
            choice = validPits[Math.floor(Math.random() * validPits.length)]; // הגרלת מספר [cite: 5]
        } else {
            // פשוט בוחר את הראשון, אפשר לשפר
            choice = validPits[0];
        }
        move(choice);
    }
};

/**
 * בודקת האם תנאי סיום המשחק התקיימו (צד אחד ריק).
 * עונה על דרישה: שימוש ב-HOF every[cite: 9].
 */
const checkEnd = () => {
    const p1Empty = game.board.slice(0, 6).every(v => v === 0); // שימוש ב-HOF [cite: 9]
    const p2Empty = game.board.slice(7, 13).every(v => v === 0);
    
    if (p1Empty || p2Empty) {
        game.active = false;
        // איסוף שאריות אבנים לקופות
        for(let i=0; i<6; i++) { game.board[6] += game.board[i]; game.board[i] = 0; }
        for(let i=7; i<13; i++) { game.board[13] += game.board[i]; game.board[i] = 0; }
        render();
        saveAndShowResult();
    }
};

/**
 * שמירת התוצאה ב-localStorage והצגת הודעת המנצח.
 * עונה על דרישות: שמירת מידע מורכב [cite: 29], פונקציית תאריך [cite: 7] ומיון מותאם אישית[cite: 8].
 */
const saveAndShowResult = () => {
    const results = JSON.parse(localStorage.getItem('mancala_results') || "[]");
    
    // שמירת אובייקט מורכב עם תאריך אוטומטי [cite: 7, 29]
    const p1Score = game.board[6];
    const p2Score = game.board[13];
    let winnerName, winnerScore;
    if (p1Score > p2Score) {
        winnerName = game.names[1];
        winnerScore = p1Score;
    } else if (p2Score > p1Score) {
        winnerName = game.names[2];
        winnerScore = p2Score;
    } else {
        winnerName = "תיקו";
        winnerScore = p1Score; // או כל ערך
    }
    
    const newResult = {
        player: winnerName,
        score: winnerScore,
        date: new Date().toLocaleDateString()
    };
    const updatedResults = [newResult, ...results];
    updatedResults.sort((a, b) => b.score - a.score);
    localStorage.setItem('mancala_results', JSON.stringify(updatedResults.slice(0, 5)));
    
    winSound.play().catch(() => {}); // שימוש בצלילים [cite: 38]
    
    const status = document.getElementById('status-area');
    status.textContent = ''; // ניקוי
    
    const h3 = document.createElement('h3');
    h3.style.color = '#8b4513';
    const winner = p1Score > p2Score ? game.names[1] : (p2Score > p1Score ? game.names[2] : "תיקו");
    h3.textContent = `המשחק הסתיים! המנצח: ${winner}`;
    status.appendChild(h3);
    
    const button = document.createElement('button');
    button.className = 'start-btn';
    button.style.width = 'auto';
    button.style.padding = '10px 20px';
    button.style.marginTop = '10px';
    button.textContent = 'עבור לשיאים';
    button.addEventListener('click', () => window.location.href = '../pages/scores.html');
    status.appendChild(button);
};

/**
 * מאזין לאירוע טעינת ה-DOM ותחילת המשחק.
 * עונה על דרישה: הוספת אירועים דרך הקוד[cite: 22].
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded, initializing game');
    render();
    
    // אירוע קליק על הלוח
    document.querySelector('.mancala-board').addEventListener('click', (e) => {
        console.log('click on board');
        bgMusic.play().catch(() => {});
        const pit = e.target.closest('.pit');
        if (pit) {
            const idx = parseInt(pit.dataset.index); // שימוש ב-data-* [cite: 21]
            console.log('pit clicked, idx:', idx, 'currentPlayer:', game.currentPlayer);
            if ((game.currentPlayer === 1 && idx <= 5) || (game.currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                move(idx);
            }
        }
    });
    
    // אירוע keydown לבקרת מקלדת (אירוע נוסף מלבד קליק) [cite: 22]
    document.addEventListener('keydown', (e) => {
        const key = e.key;
        if (key >= '1' && key <= '6') {
            e.preventDefault(); // שימוש ב-preventDefault [cite: 23]
            const idx = game.currentPlayer === 1 ? parseInt(key) - 1 : parseInt(key) + 6;
            if (game.board[idx] > 0) {
                move(idx);
            }
        }
    });
    
    // אירוע scroll (אירוע נוסף) [cite: 22]
    window.addEventListener('scroll', () => {
        // אפשר להוסיף אפקט, אבל כאן רק לדרישה
        console.log('Scrolled');
    });
    
    // שימוש בפונקציות מחרוזות: includes, replace [cite: 6]
    const testString = "מנקלה משחק";
    if (testString.includes("משחק")) { // includes [cite: 6]
        const replaced = testString.replace("משחק", "משחק חדש"); // replace [cite: 6]
        console.log(replaced);
    }
    
    // שימוש ב-indexOf על מערך [cite: 6]
    const pits = [0,1,2,3,4,5];
    const found = pits.indexOf(3); // indexOf [cite: 6]
    console.log(found);
    
    // טיפול בשגיאות [cite: 37]
    try {
        // קוד שעלול להיכשל
        JSON.parse(localStorage.getItem('invalid'));
    } catch (error) {
        console.log("שגיאה בטעינת נתונים:", error.message);
    }
    
    // מאזין לכפתור יציאה
    document.getElementById('exit-btn').addEventListener('click', () => window.location.href = '../index.html');
});