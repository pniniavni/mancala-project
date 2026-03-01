/**
 * @file game.js - לוגיקת מנקלה מלאה
 */

const playersData = JSON.parse(localStorage.getItem('mancala_players')) || {
    p1: "שחקן 1", 
    p2: "שחקן 2", 
    mode: "ai"
};

const game = {
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    currentPlayer: 1,
    active: true,
    names: { 1: playersData.p1, 2: playersData.p2 }
};

const bgMusic = new Audio('../sound/backgroundMusic.mp3');
const winSound = new Audio('../sound/win.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

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
    if (game.active && playersData.mode === 'ai' && game.currentPlayer === 2) setTimeout(aiPlay, 800);
};

const aiPlay = () => {
    const validPits = [7, 8, 9, 10, 11, 12].filter(i => game.board[i] > 0);
    if (validPits.length > 0) move(validPits[Math.floor(Math.random() * validPits.length)]);
};

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
 * שמירת תוצאה והצגת הודעת סיום נקייה
 */
const saveAndShowResult = () => {
    const results = JSON.parse(localStorage.getItem('mancala_results') || "[]");
    
    // שמירה אוטומטית שקטה של הנתונים (דרישה 29)
    results.push({
        player: game.names[1],
        score: game.board[6],
        date: new Date().toLocaleDateString() // תאריך אוטומטי (דרישה 7)
    });
    
    results.sort((a, b) => b.score - a.score); // מיון (דרישה 8)
    localStorage.setItem('mancala_results', JSON.stringify(results.slice(0, 5)));
    
    winSound.play().catch(() => {});
    
    // הודעת סיום נקייה ללא הטקסט על השמירה
    const status = document.getElementById('status-area');
    const winner = game.board[6] > game.board[13] ? game.names[1] : (game.board[13] > game.board[6] ? game.names[2] : "תיקו");
    
    status.innerHTML = `
        <h3 style="color: #8b4513">המשחק הסתיים! המנצח: ${winner}</h3>
        <button onclick="window.location.href='../index.html'" class="start-btn" style="width: auto; padding: 10px 20px; margin-top: 10px;">
            חזרה ללוח שיאים
        </button>
    `;
};

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