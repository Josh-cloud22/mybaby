// Ambient Floating Hearts Background System
const heartsContainer = document.getElementById('hearts-container');
const MAX_HEARTS = 45;
const HEART_EMOJIS = ['❤️', '💖', '💕', '💗', '🌸', '✨'];

function spawnHeart(isBurst = false, xPos = null, yPos = null) {
  // If there are too many active hearts, don't spawn more (except for bursts)
  if (!isBurst && heartsContainer.children.length >= MAX_HEARTS) {
    return;
  }

  const heart = document.createElement('div');
  heart.className = 'floating-heart';
  
  // Choose a random emoji
  const emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
  heart.textContent = emoji;

  // Sizing
  const scale = (Math.random() * 0.8 + 0.4).toFixed(2); // 0.4x to 1.2x scale
  
  // Initial positioning
  let x = xPos !== null ? xPos : Math.random() * 100; // in %
  let y = yPos !== null ? yPos : 0; // in px from bottom if burst

  heart.style.left = `${x}%`;
  if (isBurst) {
    heart.style.bottom = `${y}px`;
  }

  // Animation values (using CSS variables)
  const drift = (Math.random() * 200 - 100).toFixed(0); // -100px to 100px sway
  const rotation = (Math.random() * 360 - 180).toFixed(0); // rotation angle
  const duration = isBurst 
    ? (Math.random() * 2 + 2).toFixed(1) // faster for burst: 2s to 4s
    : (Math.random() * 4 + 4).toFixed(1); // normal: 4s to 8s
  
  heart.style.setProperty('--drift', `${drift}px`);
  heart.style.setProperty('--rotation', `${rotation}deg`);
  heart.style.setProperty('--scale', scale);
  heart.style.animationDuration = `${duration}s`;
  
  // Set starting opacity slightly higher for bursts
  if (isBurst) {
    heart.style.opacity = '0.9';
  }

  heartsContainer.appendChild(heart);

  // Remove heart element when animation completes
  heart.addEventListener('animationend', () => {
    heart.remove();
  });
}

// Spawn ambient hearts in background continuously
let ambientHeartTimer = setInterval(() => {
  spawnHeart(false);
}, 350);

// Celebratory burst of hearts
function burstHearts(count = 35) {
  for (let i = 0; i < count; i++) {
    // Random position around bottom/center of the screen
    const x = Math.random() * 80 + 10; // 10% to 90%
    const y = Math.random() * 100; // 0px to 100px from bottom
    spawnHeart(true, x, y);
  }
}

// Dodging "No" Button Logic
const cardQuestion = document.querySelector('.card-question');
const yesBtn = document.getElementById('btn-yes');
const noBtn = document.getElementById('btn-no');

function repositionNoButton(event) {
  // Prevent any default tap/click behaviors on touch screens
  if (event && event.type === 'touchstart') {
    event.preventDefault();
  }

  // Card dimensions and boundary padding
  const cardRect = cardQuestion.getBoundingClientRect();
  const yesRect = yesBtn.getBoundingClientRect();
  const noRect = noBtn.getBoundingClientRect();

  const padding = 20; // Safe distance from card edges
  const avoidMargin = 15; // Extra padding around Yes button to ensure zero overlapping

  // Size of elements
  const cardW = cardRect.width;
  const cardH = cardRect.height;
  const noW = noRect.width || 120;
  const noH = noRect.height || 48;

  // Yes button coordinates relative to the card container
  const yesLeft = yesRect.left - cardRect.left;
  const yesTop = yesRect.top - cardRect.top;
  const yesW = yesRect.width;
  const yesH = yesRect.height;

  // Freeze the "No" button into absolute positioning on its first dodge
  if (noBtn.style.position !== 'absolute') {
    const currentLeft = noRect.left - cardRect.left;
    const currentTop = noRect.top - cardRect.top;
    
    noBtn.style.position = 'absolute';
    noBtn.style.margin = '0';
    noBtn.style.left = `${currentLeft}px`;
    noBtn.style.top = `${currentTop}px`;
    
    // Force a style recalculation to let transition start from current position
    noBtn.offsetHeight; 
  }

  let randomX = 0;
  let randomY = 0;
  let attempts = 0;
  let isOverlapping = true;

  while (isOverlapping && attempts < 100) {
    // Generate potential coordinates within card bounds (excluding padding)
    randomX = padding + Math.random() * (cardW - noW - padding * 2);
    randomY = padding + Math.random() * (cardH - noH - padding * 2);

    // Bounding coordinates
    const noRight = randomX + noW;
    const noBottom = randomY + noH;
    const yesRight = yesLeft + yesW;
    const yesBottom = yesTop + yesH;

    // Check collision overlap (extended by avoidMargin)
    const xOverlap = (randomX < yesRight + avoidMargin) && (noRight > yesLeft - avoidMargin);
    const yOverlap = (randomY < yesBottom + avoidMargin) && (noBottom > yesTop - avoidMargin);

    isOverlapping = xOverlap && yOverlap;
    attempts++;
  }

  // Update style positions
  noBtn.style.left = `${randomX}px`;
  noBtn.style.top = `${randomY}px`;
}

// Bind dodge events for desktop mouseover and mobile touchstart
noBtn.addEventListener('mouseenter', repositionNoButton);
noBtn.addEventListener('touchstart', repositionNoButton, { passive: false });

// Page Navigation Logic
const pageQuestion = document.getElementById('page-question');
const pageReveal = document.getElementById('page-reveal');

yesBtn.addEventListener('click', () => {
  // 1. Add CSS fade-out transition class to page-question
  pageQuestion.classList.add('fade-out');
  
  // 2. Fire celebratory heart burst
  burstHearts(40);
  
  // 3. Swap active classes after fade transition duration (400ms)
  setTimeout(() => {
    pageQuestion.classList.remove('active', 'fade-out');
    pageReveal.classList.add('active');
    
    // Fire another burst from bottom of page-reveal for extra splash
    setTimeout(() => burstHearts(25), 300);
  }, 400);
});

// Replay functionality
const replayBtn = document.getElementById('btn-replay');
replayBtn.addEventListener('click', () => {
  // Fade out Page 2
  pageReveal.classList.add('fade-out');
  
  setTimeout(() => {
    // Reset No Button position and styles back to layout flow
    noBtn.style.position = '';
    noBtn.style.left = '';
    noBtn.style.top = '';
    noBtn.style.margin = '';
    
    // Switch active page back to Question Card
    pageReveal.classList.remove('active', 'fade-out');
    pageQuestion.classList.add('active');
  }, 400);
});
