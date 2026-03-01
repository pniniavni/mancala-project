// מערך הלוח: 0-5 גומות שחקן 1, 6 קופה שחקן 1, 7-12 גומות שחקן 2, 13 קופה שחקן 2
let board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let currentPlayer = 1;
const delay = ms => new Promise(res => setTimeout(res, ms));

// פונקציה לעדכון התצוגה של האבנים
function updateUI() {
    const pName = localStorage.getItem('currentPlayer') || 'שחקן 1';
    document.getElementById('current-player-name').innerText = (currentPlayer === 1) ? pName : "שחקן 2";
    
    board.forEach((count, index) => {
        let container = (index === 6) ? document.getElementById('store-p1') : 
                        (index === 13) ? document.getElementById('store-p2') : 
                        document.querySelector(`.pit[data-index="${index}"]`);
        if (container) {
            container.innerHTML = ''; // מנקה את הגומה
            // יוצר אבנים חדשות לפי הכמות במערך
            for (let i = 0; i < count; i++) {
                const s = document.createElement('div');
                const colors = ['red', 'blue', 'green', 'white'];
                s.className = `stone ${colors[i % 4]}`;
                container.appendChild(s);
            }
        }
    });
}

// לוגיקת המהלך עם אנימציה איטית
async function makeMove(pitIndex) {
    let stones = board[pitIndex];
    if (stones === 0) return;
    
    board[pitIndex] = 0;
    updateUI();

    let currentIndex = pitIndex;
    while (stones > 0) {
        await delay(500); // השהיה של חצי שנייה בין אבן לאבן
        currentIndex = (currentIndex + 1) % 14;

        // דילוג על קופת היריב
        if ((currentPlayer === 1 && currentIndex === 13) || (currentPlayer === 2 && currentIndex === 6)) {
            currentIndex = (currentIndex + 1) % 14;
        }

        board[currentIndex]++;
        stones--;
        updateUI();
    }

    // בדיקה: האם נחתת בקופה שלך? (תור נוסף)
    const inStore = (currentPlayer === 1 && currentIndex === 6) || (currentPlayer === 2 && currentIndex === 13);
    
    if (inStore) {
        alert("זכית בתור נוסף!");
    } 
    // אם נחתת בגומה לא ריקה - המשך תנועה (חוק ה"זרימה")
    else if (board[currentIndex] > 1) {
        alert("המקום לא ריק - ממשיכים עם האבנים!");let board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
let currentPlayer = 1;
const delay = ms => new Promise(res => setTimeout(res, ms));

function updateUI() {
    const pName = localStorage.getItem('currentPlayer') || 'שחקן 1';
    document.getElementById('current-player-name').innerText = (currentPlayer === 1) ? pName : "שחקן 2";
    
    board.forEach((count, index) => {
        let container = (index === 6) ? document.getElementById('store-p1') : 
                        (index === 13) ? document.getElementById('store-p2') : 
                        document.querySelector(`.pit[data-index="${index}"]`);
        if (container) {
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const s = document.createElement('div');
                s.className = `stone ${['red','blue','green','white'][i%4]}`;
                container.appendChild(s);
            }
        }
    });
}

async function makeMove(pitIndex) {
    let stones = board[pitIndex];
    if (stones === 0) return;
    board[pitIndex] = 0;
    updateUI();

    let currentIndex = pitIndex;
    while (stones > 0) {
        await delay(300); // מהירות זרימה נעימה
        currentIndex = (currentIndex + 1) % 14;
        if ((currentPlayer === 1 && currentIndex === 13) || (currentPlayer === 2 && currentIndex === 6)) {
            currentIndex = (currentIndex + 1) % 14;
        }
        board[currentIndex]++;
        stones--;
        updateUI();
    }

    const inStore = (currentPlayer === 1 && currentIndex === 6) || (currentPlayer === 2 && currentIndex === 13);
    
    if (inStore) {
        // אין ALERT - השחקן פשוט לוחץ שוב
        console.log("תור נוסף"); 
    } else if (board[currentIndex] > 1) {
        // המשך תנועה אוטומטי ללא הודעה
        await makeMove(currentIndex);
    } else {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }
    updateUI();
}

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    document.querySelector('.mancala-board').addEventListener('click', async (e) => {
        const pit = e.target.closest('.pit');
        if (pit && (board[pit.dataset.index] > 0)) {
            const idx = parseInt(pit.dataset.index);
            if ((currentPlayer === 1 && idx <= 5) || (currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                await makeMove(idx);
            }
        }
    });
});
        await makeMove(currentIndex); 
    } 
    else {
        currentPlayer = (currentPlayer === 1) ? 2 : 1;
    }
    updateUI();
}

// הפעלה כשהדף נטען
document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    document.querySelector('.mancala-board').addEventListener('click', async (e) => {
        const pit = e.target.closest('.pit');
        if (pit) {
            const idx = parseInt(pit.dataset.index);
            // בדיקה שמותר לשחקן ללחוץ רק על הצד שלו
            if ((currentPlayer === 1 && idx <= 5) || (currentPlayer === 2 && idx >= 7 && idx <= 12)) {
                await makeMove(idx);
            }
        }
    });
});