/**
 * @file game.js - ניהול לוגיקת משחק המנקלה.
 * סודר מחדש כדי למנוע שגיאות ReferenceError ולוודא טעינה נכונה.
 */

import { getSavedPlayers } from './index.js';

// --- 1. הגדרות ומשתנים גלובליים ---
const savedPlayers = getSavedPlayers();

const game = {
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    currentPlayer: 1,
    active: true,
    names: { 
        1: savedPlayers.p1 || "שחקן 1", 
        2: savedPlayers.p2 || "שחקן 2" 
    },
    level: new URLSearchParams(window.location.search).get('level') || 'hard'
};

// תיקון נתיבי צלילים (הוספת ../ במידה והקובץ בתיקיית scripts/pages)
const bgMusic = new Audio('../sound/backgroundMusic.mp3');
const winSound = new Audio('../sound/win.wav');
const moveSound = new Audio('../sound/move.wav');
bgMusic.loop = true;
bgMusic.volume = 0.5;

// --- 2. פונקציות עזר ורינדור ---

const render = () => {
    console.log('render called, game.active:', game.active, 'currentPlayer:', game.currentPlayer);
    const statusArea = document.getElementById('status-area');
    if (statusArea && game.active) {
        statusArea.textContent = ''; 
        const text = document.createElement('span');
        text.textContent = `תור: ${game.names[game.currentPlayer]}`;
        statusArea.appendChild(text);
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

const saveAndShowResult = () => {
    const results = JSON.parse(localStorage.getItem('mancala_results') || "[]");
    const p1Score = game.board[6];
    const p2Score = game.board[13];
    
    let winnerName = p1Score > p2Score ? game.names[1] : (p2Score > p1Score ? game.names[2] : "תיקו");
    let winnerScore = Math.max(p1Score, p2Score);
    
    const newResult = {
        player: winnerName,
        score: winnerScore,
        date: new Date().toLocaleDateString()
    };

    const updatedResults = [newResult, ...results];
    updatedResults.sort((a, b) => b.score - a.score);
    localStorage.setItem('mancala_results', JSON.stringify(updatedResults.slice(0, 5)));
    
    winSound.play().catch(() => {});
    
    const status = document.getElementById('status-area');
    if (status) {
        status.textContent = '';
        const h3 = document.createElement('h3');
        h3.style.color = '#8b4513';
        h3.textContent = `המשחק הסתיים! המנצח: ${winnerName}`;
        status.appendChild(h3);
        
        const button = document.createElement('button');
        button.className = 'start-btn';
        button.style.width = 'auto';
        button.textContent = 'עבור לשיאים';
        button.addEventListener('click', () => window.location.href = '../pages/scores.html');
        status.appendChild(button);
    }
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

// --- 3. לוגיקת המשחק (move ו-aiPlay) ---

const aiPlay = (level = 'hard') => {
    const validPits = [7, 8, 9, 10, 11, 12].filter(i => game.board[i] > 0);
    if (validPits.length > 0) {
        let choice = (level === 'easy') ? 
            validPits[Math.floor(Math.random() * validPits.length)] : 
            validPits[0];
        move(choice);
    }
};

const move = async (idx) => {
    if (!game.active || game.board[idx] === 0) return;
    
    let stones = game.board[idx];
    game.board[idx] = 0;
    let curr = idx;
    render();
    moveSound.play().catch(() => {});

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

    checkEnd(); 
    if (!game.active) return;

    const isStore = (game.currentPlayer === 1 && curr === 6) || (game.currentPlayer === 2 && curr === 13);
    
    if (!isStore) {
        if (game.board[curr] > 1) { 
            await move(curr); 
            return; 
        } else {
            game.currentPlayer = (game.currentPlayer === 1) ? 2 : 1;
        }
    }

    render();

    const playerConfig = JSON.parse(localStorage.getItem('mancala_players'));
    if (game.active && playerConfig?.mode !== 'human' && game.currentPlayer === 2) {
        setTimeout(() => aiPlay(game.level), 800);
    }
};

// --- 4. מאזיני אירועים (רק אחרי שהכל מוגדר!) ---

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded, initializing game');
    render();
    
    const board = document.querySelector('.mancala-board');
    if (board) {
        board.addEventListener('click', (e) => {
            bgMusic.play().catch(() => {});
            const pit = e.target.closest('.pit');
            if (pit) {
                const idx = parseInt(pit.dataset.index);
                if ((game.currentPlayer === 1 && idx <= 5) || (game.currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                    move(idx);
                }
            }
        });
    }
    
    document.addEventListener('keydown', (e) => {
        if (e.key >= '1' && e.key <= '6') {
            e.preventDefault();
            const idx = game.currentPlayer === 1 ? parseInt(e.key) - 1 : parseInt(e.key) + 6;
            if (game.board[idx] > 0) move(idx);
        }
    });

    document.getElementById('exit-btn')?.addEventListener('click', () => {
        window.location.href = '../index.html';
    });
});