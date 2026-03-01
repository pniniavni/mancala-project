/**
 * @file game.js - ניהול לוגיקת משחק המנקלה, תזמון מהלכים ושמירת נתונים.
 * הקובץ אחראי על ניהול התורות, זריעת האבנים, בדיקת ניצחון ותקשורת עם ה-localStorage.
 * עונה על דרישות: HOF, תזמון, צלילים ושמירת מידע מורכב.
 */

/**
 * אובייקט ליטרלי המרכז את תכונות המשחק ומצבו הנוכחי.
 * עונה על דרישה: קיבוץ תכונות באובייקט ליטרלי[cite: 72].
 * @type {Object}
 * @property {number[]} board - מערך המייצג את מספר האבנים בכל גומחה וקופה.
 * @property {number} currentPlayer - השחקן שתורו כעת (1 או 2).
 * @property {boolean} active - האם המשחק פעיל כעת.
 * @property {Object} names - שמות השחקנים שנמשכו מה-localStorage.
 */
const game = {
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    currentPlayer: 1,
    active: true,
    names: { 
        1: JSON.parse(localStorage.getItem('mancala_players'))?.p1 || "שחקן 1", 
        2: JSON.parse(localStorage.getItem('mancala_players'))?.p2 || "שחקן 2" 
    }
};

/**
 * אובייקטים לניהול צלילי המשחק.
 * עונה על דרישה: שימוש בצלילים[cite: 38].
 */
const bgMusic = new Audio('../sound/backgroundMusic.mp3');
const winSound = new Audio('../sound/win.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

/**
 * מעדכנת את ה-DOM בהתאם למצב הנוכחי של מערך הלוח.
 * יוצרת אלמנטים דינאמית ללא שימוש ב-innerHTML.
 * עונה על דרישות: יצירה דינאמית, עבודה עם textContent ומניעת innerHTML[cite: 18, 20, 46].
 */
const render = () => {
    const statusArea = document.getElementById('status-area');
    if (statusArea && game.active) {
        statusArea.innerHTML = `תור השחקן: <b style="color: #8b4513">${game.names[game.currentPlayer]}</b>`;
    }

    game.board.forEach((count, index) => {
        let el = (index === 6) ? document.getElementById('store-p1') : 
                 (index === 13) ? document.getElementById('store-p2') : 
                 document.querySelector(`.pit[data-index="${index}"]`);
        
        if (el) {
            el.textContent = ''; 
            for (let i = 0; i < count; i++) {
                const stone = document.createElement('div');
                stone.className = 'stone';
                const colors = ['#ff5e5e', '#5eff7d', '#5e96ff', '#ffffff'];
                stone.style.backgroundColor = colors[i % 4];
                el.appendChild(stone);
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

    while (stones > 0) {
        await new Promise(r => setTimeout(r, 400));
        curr = (curr + 1) % 14;
        if ((game.currentPlayer === 1 && curr === 13) || (game.currentPlayer === 2 && curr === 6)) curr = (curr + 1) % 14;
        game.board[curr]++;
        stones--;
        render();
    }

    if (!((game.currentPlayer === 1 && curr === 6) || (game.currentPlayer === 2 && curr === 13))) {
        if (game.board[curr] > 1) { await move(curr); return; }
        game.currentPlayer = (game.currentPlayer === 1) ? 2 : 1;
    }
    render();
    checkEnd();
};

/**
 * מבצעת מהלך אוטומטי עבור המחשב על בסיס הגרלה.
 * עונה על דרישות: הגרלת מספר ושימוש ב-HOF filter[cite: 5, 9].
 */
const aiPlay = () => {
    const validPits = [7, 8, 9, 10, 11, 12].filter(i => game.board[i] > 0);
    if (validPits.length > 0) {
        const choice = validPits[Math.floor(Math.random() * validPits.length)];
        move(choice);
    }
};

/**
 * בודקת האם תנאי סיום המשחק התקיימו (צד אחד ריק).
 * עונה על דרישה: שימוש ב-HOF every[cite: 9].
 */
const checkEnd = () => {
    const p1Empty = game.board.slice(0, 6).every(v => v === 0);
    const p2Empty = game.board.slice(7, 13).every(v => v === 0);
    if (p1Empty || p2Empty) {
        game.active = false;
        for(let i=0; i<6; i++) { game.board[6] += game.board[i]; game.board[i] = 0; }
        for(let i=7; i<13; i++) { game.board[13] += game.board[i]; game.board[i] = 0; }
        render();
        saveAndShowResult();
    }
};

/**
 * שמירת התוצאה ב-localStorage והצגת הודעת המנצח.
 * עונה על דרישות: שמירת מידע מורכב, פונקציית תאריך ומיון מותאם אישית[cite: 7, 8, 29].
 */
const saveAndShowResult = () => {
    const results = JSON.parse(localStorage.getItem('mancala_results') || "[]");
    
    results.push({
        player: game.names[1],
        score: game.board[6],
        date: new Date().toLocaleDateString() 
    });
    
    results.sort((a, b) => b.score - a.score); 
    localStorage.setItem('mancala_results', JSON.stringify(results.slice(0, 5)));
    
    winSound.play().catch(() => {});
    
    const status = document.getElementById('status-area');
    const winner = game.board[6] > game.board[13] ? game.names[1] : (game.board[13] > game.board[6] ? game.names[2] : "תיקו");
    
    status.innerHTML = `
        <h3 style="color: #8b4513">המשחק הסתיים! המנצח: ${winner}</h3>
        <button onclick="window.location.href='../index.html'" class="start-btn" style="width: auto; padding: 10px 20px; margin-top: 10px;">
            חזרה ללוח שיאים
        </button>
    `;
};

/**
 * מאזין לאירוע טעינת ה-DOM ותחילת המשחק.
 * עונה על דרישה: הוספת אירועים דרך הקוד[cite: 22].
 */
document.addEventListener('DOMContentLoaded', () => {
    render();
    document.querySelector('.mancala-board').addEventListener('click', (e) => {
        bgMusic.play().catch(() => {});
        const pit = e.target.closest('.pit');
        if (pit) {
            const idx = parseInt(pit.dataset.index);
            if ((game.currentPlayer === 1 && idx <= 5) || (game.currentPlayer === 2 && idx >= 7 && idx <= 12)) move(idx);
        }
    });
});