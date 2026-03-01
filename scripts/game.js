/**
 * @file game.js - לוגיקת משחק המנקלה
 * עומד בדרישות: HOF, localStorage, DOM, צלילים, ותזמון.
 */

// אובייקט הגדרות המשחק (דרישת אובייקט ליטרלי)
const gameConfig = {
    initialStones: 4,
    animationDelay: 400,
    colors: ['red', 'blue', 'green', 'white']
};

let board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let currentPlayer = 1;

// טעינת צלילים (נושא חדש)
const moveSound = new Audio('../assets/move.mp3');
const winSound = new Audio('../assets/win.mp3');
const bgMusic = new Audio('../assets/ambient.mp3');
bgMusic.volume = 0.2; // מוזיקת רקע נמוכה
bgMusic.loop = true;

/**
 * עדכון ממשק המשתמש ללא שימוש ב-innerHTML
 */
const updateUI = () => {
    board.forEach((count, index) => {
        const container = (index === 6) ? document.getElementById('store-p1') : 
                          (index === 13) ? document.getElementById('store-p2') : 
                          document.querySelector(`.pit[data-index="${index}"]`);
        
        if (container) {
            // ניקוי אלמנטים בצורה בטוחה (דרישת פרויקט)
            while (container.firstChild) container.removeChild(container.firstChild);
            
            for (let i = 0; i < count; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone', gameConfig.colors[i % 4]);
                container.appendChild(stone);
            }
        }
    });
};

/**
 * פיזור אבנים עם אנימציה ותזמון
 * @param {number} pitIndex - אינדקס הגומחה שנבחרה
 */
const makeMove = async (pitIndex) => {
    if (board[pitIndex] === 0) return;
    
    bgMusic.play().catch(() => {}); // הפעלת מוזיקת רקע בצעד הראשון
    
    let stones = board[pitIndex];
    board[pitIndex] = 0;
    let currentIndex = pitIndex;
    updateUI();

    while (stones > 0) {
        await new Promise(resolve => setTimeout(resolve, gameConfig.animationDelay));
        currentIndex = (currentIndex + 1) % 14;

        // דילוג על קופת יריב
        if ((currentPlayer === 1 && currentIndex === 13) || (currentPlayer === 2 && currentIndex === 6)) {
            currentIndex = (currentIndex + 1) % 14;
        }

        board[currentIndex]++;
        stones--;
        moveSound.play().catch(() => {}); // צליל תזוזה
        updateUI();
    }

    handleTurnEnd(currentIndex);
};

const handleTurnEnd = (lastIndex) => {
    const isStore = (currentPlayer === 1 && lastIndex === 6) || (currentPlayer === 2 && lastIndex === 13);
    
    if (!isStore) {
        // חוק המשך: אם נחת בגומה לא ריקה (לוגיקה שביקשת)
        if (board[lastIndex] > 1) {
            makeMove(lastIndex);
            return;
        }
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }
    
    checkWinner();
    updateUI();
};

const checkWinner = () => {
    const side1Empty = board.slice(0, 6).every(v => v === 0);
    const side2Empty = board.slice(7, 13).every(v => v === 0);

    if (side1Empty || side2Empty) {
        winSound.play();
        // שמירת שיא ב-localStorage (דרישת פרויקט)
        localStorage.setItem('lastScore', JSON.stringify(board));
    }
};

// הוספת אירועים דרך הקוד (בלבד)
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    document.querySelector('.mancala-board').addEventListener('click', (e) => {
        const pit = e.target.closest('.pit');
        if (pit) {
            const idx = parseInt(pit.dataset.index);
            if ((currentPlayer === 1 && idx <= 5) || (currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                makeMove(idx);
            }
        }
    });
});