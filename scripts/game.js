// מערך שמייצג את הלוח: 0-5 גומות שחקן 1, 6 קופה שחקן 1, 7-12 גומות שחקן 2, 13 קופה שחקן 2
let board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let currentPlayer = 1; // שחקן 1 מתחיל
const playerName = localStorage.getItem('currentPlayer') || 'שחקן 1';

// הצגת שם השחקן על המסך
document.getElementById('current-player-name').innerText = playerName;