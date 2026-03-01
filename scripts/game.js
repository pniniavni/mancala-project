/**
 * @file game.js - לוגיקת מנקלה מלאה לפרויקט סיום
 * עומד בדרישות: HOF, localStorage, DOM (createElement), צלילים ותזמון.
 */

// אובייקט הגדרות המשחק (דרישה לשימוש באובייקטים)
const gameConfig = {
    initialStones: 4,
    animationDelay: 400,
    colors: ['#ff5e5e', '#5eff7d', '#5e96ff', '#ffffff'] // הצבעים מהתמונה שלך
};

// מצב הלוח: 0-5 גומות שחקן 1, 6 קופה 1, 7-12 גומות שחקן 2, 13 קופה 2
let board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let currentPlayer = 1;

// טעינת צלילים מתיקיית sound
const bgMusic = new Audio('../sound/backgroundMusic.mp3');
const winSound = new Audio('../sound/win.wav'); 
bgMusic.loop = true;
bgMusic.volume = 0.8; // עוצמה חזקה כפי שביקשת

/**
 * עדכון ויזואלי של הלוח ללא innerHTML (דרישת קוד נקי)
 */
const updateUI = () => {
    board.forEach((count, index) => {
        let container;
        if (index === 6) container = document.getElementById('store-p1');
        else if (index === 13) container = document.getElementById('store-p2');
        else container = document.querySelector(`.pit[data-index="${index}"]`);

        if (container) {
            // ניקוי התא (דרישת אבטחה)
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            
            // יצירת אבנים דינאמית (דרישת DOM)
            for (let i = 0; i < count; i++) {
                const stone = document.createElement('div');
                stone.classList.add('stone');
                stone.style.backgroundColor = gameConfig.colors[i % 4];
                container.appendChild(stone);
            }
        }
    });

    const status = document.getElementById('status-area');
    if (status) {
        const pName = localStorage.getItem('username') || 'שחקן 1';
        status.textContent = `תור: ${currentPlayer === 1 ? pName : 'שחקן 2'}`;
    }
};

/**
 * ביצוע מהלך עם אנימציה ותזמון (setTimeout)
 */
async function makeMove(pitIndex) {
    let stones = board[pitIndex];
    if (stones === 0) return;

    board[pitIndex] = 0;
    let currentIndex = pitIndex;
    updateUI();

    while (stones > 0) {
        // השהיה לאנימציה (דרישת תזמון פונקציות)
        await new Promise(resolve => setTimeout(resolve, gameConfig.animationDelay));
        
        currentIndex = (currentIndex + 1) % 14;

        // דילוג על קופת יריב
        if ((currentPlayer === 1 && currentIndex === 13) || (currentPlayer === 2 && currentIndex === 6)) {
            currentIndex = (currentIndex + 1) % 14;
        }

        board[currentIndex]++;
        stones--;
        updateUI();
    }

    handleTurnEnd(currentIndex);
}

/**
 * ניהול סיום תור וחוקי המשך (החוק שביקשת)
 */
const handleTurnEnd = (lastIndex) => {
    const isStore = (currentPlayer === 1 && lastIndex === 6) || (currentPlayer === 2 && lastIndex === 13);
    
    if (isStore) {
        // תור נוסף (הודעה בסטטוס במקום alert)
        const status = document.getElementById('status-area');
        if (status) status.textContent = "זכית בתור נוסף!";
    } else if (board[lastIndex] > 1) {
        // חוק המשך: אם הגומה לא ריקה, ממשיכים אוטומטית עם האבנים שבה
        makeMove(lastIndex);
        return;
    } else {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }

    checkGameOver();
    updateUI();
};

/**
 * בדיקת סיום ואיסוף שאריות (שימוש ב-HOF every)
 */
const checkGameOver = () => {
    const side1Empty = board.slice(0, 6).every(v => v === 0);
    const side2Empty = board.slice(7, 13).every(v => v === 0);

    if (side1Empty || side2Empty) {
        bgMusic.pause();
        winSound.play().catch(e => console.log("Win sound blocked")); // צליל ניצחון
        
        // החוק שביקשת: איסוף שאריות האבנים לקופה של השחקן השני
        if (side1Empty) {
            for(let i = 7; i <= 12; i++) { 
                board[13] += board[i]; 
                board[i] = 0; 
            }
        } else {
            for(let i = 0; i <= 5; i++) { 
                board[6] += board[i]; 
                board[i] = 0; 
            }
        }
        
        saveHighScore();
        updateUI();
    }
};

/**
 * שמירת שיא ב-localStorage (דרישת שמירת מידע מורכב)
 */
const saveHighScore = () => {
    const scores = JSON.parse(localStorage.getItem('mancala_scores') || "[]");
    scores.push({
        name: localStorage.getItem('username') || 'אנונימי',
        score1: board[6],
        score2: board[13],
        date: new Date().toLocaleDateString()
    });
    
    // מיון מותאם אישית (דרישת sort)
    scores.sort((a, b) => Math.max(b.score1, b.score2) - Math.max(a.score1, a.score2));
    localStorage.setItem('mancala_scores', JSON.stringify(scores.slice(0, 5)));
};

// הוספת אירועים דרך הקוד (דרישת אירועים)
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    
    const boardElement = document.querySelector('.mancala-board');
    if (boardElement) {
        boardElement.addEventListener('click', async (e) => {
            // הפעלת מוזיקה בנגיעה ראשונה (פתרון לחסימת דפדפן)
            if (bgMusic.paused) bgMusic.play().catch(() => {});
            
            const pit = e.target.closest('.pit');
            if (pit) {
                const idx = parseInt(pit.dataset.index);
                // הגבלה: כל שחקן לוחץ רק על הצד שלו
                if ((currentPlayer === 1 && idx <= 5) || (currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                    await makeMove(idx);
                }
            }
        });
    }
});