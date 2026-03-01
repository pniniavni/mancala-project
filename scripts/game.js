// מערך שמייצג את הלוח: 0-5 גומות שחקן 1, 6 קופה שחקן 1, 7-12 גומות שחקן 2, 13 קופה שחקן 2
console.log("הקובץ game.js נטען בהצלחה!");
let board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let currentPlayer = 1; // שחקן 1 מתחיל
const playerName = localStorage.getItem('currentPlayer') || 'שחקן 1';

// פונקציה לעדכון הלוח (התצוגה הוויזואלית)
function updateUI() {
    document.getElementById('current-player-name').innerText = (currentPlayer === 1) ? playerName : "מחשב/שחקן 2";
    
    board.forEach((count, index) => {
        let container;
        if (index === 6) container = document.getElementById('store-p1');
        else if (index === 13) container = document.getElementById('store-p2');
        else container = document.querySelector(`.pit[data-index="${index}"]`);

        if (container) {
            container.innerHTML = ''; // ניקוי
            for (let i = 0; i < count; i++) {
                const stone = document.createElement('div');
                const colors = ['red', 'blue', 'green', 'white'];
                stone.className = `stone ${colors[i % 4]}`;
                container.appendChild(stone);
            }
        }
    });
}

// לוגיקה של ביצוע מהלך
function makeMove(pitIndex) {
    let stones = board[pitIndex];
    if (stones === 0) return; // אי אפשר לבחור גומה ריקה

    board[pitIndex] = 0;
    let currentIndex = pitIndex;

    while (stones > 0) {
        currentIndex = (currentIndex + 1) % 14;

        // דילוג על קופת היריב
        if ((currentPlayer === 1 && currentIndex === 13) || (currentPlayer === 2 && currentIndex === 6)) {
            continue;
        }

        board[currentIndex]++;
        stones--;
    }

    // בדיקת תור נוסף: אם האבן האחרונה נחתה בקופה של השחקן
    const landedInStore = (currentPlayer === 1 && currentIndex === 6) || (currentPlayer === 2 && currentIndex === 13);
    
    if (!landedInStore) {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }

    updateUI();
    checkGameOver();
}

// בדיקה אם המשחק נגמר
function checkGameOver() {
    const side1Empty = board.slice(0, 6).every(val => val === 0);
    const side2Empty = board.slice(7, 13).every(val => val === 0);

    if (side1Empty || side2Empty) {
        alert("המשחק נגמר! בדקו את הקופות לראות מי המנצח.");
        // כאן אפשר להוסיף חישוב נקודות סופי
    }
}

// הוספת אירועי לחיצה לגומחות
// החליפי את החלק האחרון בקובץ game.js בקוד הזה:
document.addEventListener('DOMContentLoaded', () => {
    updateUI(); // מצייר את האבנים בפעם הראשונה

    // מאזין לכל לחיצה על הלוח
    document.querySelector('.mancala-board').addEventListener('click', (event) => {
        // בודק אם לחצנו על גומחה (או על אבן בתוך גומחה)
        const pit = event.target.closest('.pit');
        
        if (pit) {
            const index = parseInt(pit.getAttribute('data-index'));
            console.log("לחיצה על גומה:", index); // תראי את זה ב-Console (F12)
            
            // שחקן 1 יכול ללחוץ רק על 0-5
            if (currentPlayer === 1 && index <= 5) {
                makeMove(index);
            } 
            // שחקן 2 יכול ללחוץ רק על 7-12
            else if (currentPlayer === 2 && index >= 7 && index <= 12) {
                makeMove(index);
            }
        }
    });
});
// הפעלה ראשונית
updateUI();