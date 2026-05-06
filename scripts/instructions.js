/**
 * @fileoverview דף ההוראות - טיפול במוזיקה
 */

/**
 * פונקציה להפעלת המוזיקה מיידית
 */
const startMusicQuickly = () => {
    const instructionsMusic = new Audio('../sound/forGame.mp3');
    instructionsMusic.loop = true;
    instructionsMusic.volume = 1.0;
    instructionsMusic.play().catch(e => console.log("Waiting for interaction..."));
    
    // הסרת מאזינים לאחר הפעלה
    const events = ['click', 'mousedown', 'keydown', 'touchstart'];
    events.forEach(event => document.removeEventListener(event, startMusicQuickly));
};

// הוספת מאזינים להפעלת מוזיקה
const events = ['click', 'mousedown', 'keydown', 'touchstart'];
events.forEach(event => document.addEventListener(event, startMusicQuickly, { once: true }));