
// ===================================
// HELPER: FIND AN ELEMENT
// ===================================

const $ = (id) => document.getElementById(id);

const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
).matches;


// ===================================
// SCREEN TRANSITIONS
// ===================================

let transitioning = false;

function showScreen(nextId) {
    if (transitioning) return;

    const current = document.querySelector(".screen.active");
    const next = $(nextId);

    if (!next || current === next) return;

    transitioning = true;

    current.classList.add("leaving");

    const delay = reducedMotion ? 0 : 550;

    setTimeout(() => {
        current.classList.remove("active", "leaving");
        next.classList.add("active");

        window.scrollTo(0, 0);

        transitioning = false;

        const heading = next.querySelector("h1, h2");
        if (heading) {
            heading.setAttribute("tabindex", "-1");
            heading.focus({ preventScroll: true });
        }
    }, delay);
}


// ===================================
// STARRY WELCOME SCREEN
// ===================================

const starsContainer = $("stars");

for (let i = 0; i < 100; i++) {
    const star = document.createElement("div");

    star.classList.add("star");

    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";

    star.style.animationDelay = Math.random() * 4 + "s";
    star.style.animationDuration =
        (2 + Math.random() * 4) + "s";

    starsContainer.appendChild(star);
}


// ===================================
// ENTER OUR WORLD
// ===================================

$("entry").addEventListener("click", () => {
    showScreen("letter-screen");
});


// ===================================
// ANIMATED ENVELOPE
// ===================================

let letterOpened = false;

$("envelope").addEventListener("click", () => {
    if (letterOpened) return;

    letterOpened = true;

    $("envelope").classList.add("open");
    $("envelope").setAttribute("aria-expanded", "true");

    const delay = reducedMotion ? 0 : 950;

    setTimeout(() => {
        $("letter").classList.remove("hidden");
    }, delay);
});

$("start-game").addEventListener("click", () => {
    showScreen("game-screen");
});


// ===================================
// MEMORY MATCHING GAME
// ===================================

const memories = [
    { symbol: "💗", message: "A little heart, just for you!" },
    { symbol: "🌙", message: "Our little universe!" },
    { symbol: "🎸", message: "Every story needs its own soundtrack!" },
    { symbol: "🌸", message: "Here's a little flower for you!" },
    { symbol: "✨", message: "You found a little sparkle!" },
    { symbol: "🧸", message: "Sending you the biggest hug!" }
];

let firstCard = null;
let secondCard = null;
let boardLocked = false;
let pairsFound = 0;
let flipTimer = null;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

function setupGame() {
    clearTimeout(flipTimer);

    firstCard = null;
    secondCard = null;
    boardLocked = false;
    pairsFound = 0;

    $("game-board").innerHTML = "";
    $("game-complete").classList.add("hidden");
    $("match-message").textContent = "";
    $("game-status").textContent = "Pairs found: 0 / 6";

    const deck = shuffle([...memories, ...memories]);

    deck.forEach((memory) => {
        const card = document.createElement("button");

        card.className = "game-card";
        card.type = "button";
        card.dataset.symbol = memory.symbol;
        card.setAttribute("aria-label", "Hidden memory card");

        const back = document.createElement("span");
        back.className = "card-back";
        back.textContent = "♡";

        const front = document.createElement("span");
        front.className = "card-front";
        front.textContent = memory.symbol;

        card.append(back, front);

        card.addEventListener("click", () => {
            flipCard(card, memory);
        });

        $("game-board").appendChild(card);
    });
}

function flipCard(card, memory) {
    if (
        boardLocked ||
        card === firstCard ||
        card.classList.contains("matched")
    ) {
        return;
    }

    card.classList.add("flipped");
    card.setAttribute(
        "aria-label",
        "Revealed card: " + memory.symbol
    );

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    boardLocked = true;

    if (firstCard.dataset.symbol === secondCard.dataset.symbol) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");

        firstCard.disabled = true;
        secondCard.disabled = true;

        pairsFound++;

        $("game-status").textContent =
            "Pairs found: " + pairsFound + " / 6";

        $("match-message").textContent = memory.message;

        resetTurn();

        if (pairsFound === memories.length) {
            $("game-complete").classList.remove("hidden");
        }
    } else {
        $("match-message").textContent = "Try again! ♡";

        flipTimer = setTimeout(() => {
            firstCard.classList.remove("flipped");
            secondCard.classList.remove("flipped");

            firstCard.setAttribute(
                "aria-label",
                "Hidden memory card"
            );

            secondCard.setAttribute(
                "aria-label",
                "Hidden memory card"
            );

            resetTurn();
            flipTimer = null;
        }, 850);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    boardLocked = false;
}

$("restart-game").addEventListener("click", setupGame);

$("to-gallery").addEventListener("click", () => {
    showScreen("gallery-screen");
});

setupGame();


// ===================================
// GALLERY TO CAKE
// ===================================

$("to-cake").addEventListener("click", () => {
    showScreen("cake-screen");
});


// ===================================
// BIRTHDAY CAKE
// ===================================

const candles = document.querySelectorAll(".candle");

let blownCandles = 0;

candles.forEach((candle) => {
    candle.addEventListener("click", () => {
        if (candle.classList.contains("blown")) return;

        candle.classList.add("blown");
        candle.disabled = true;

        blownCandles++;

        const remaining = candles.length - blownCandles;

        if (remaining > 0) {
            $("cake-message").textContent =
                remaining + " candle(s) left! ✨";
        } else {
            $("cake-message").textContent =
                "Wish made! May it come true ♡";

            $("to-final").classList.remove("hidden");
        }
    });
});

$("to-final").addEventListener("click", () => {
    showScreen("final-screen");

    const delay = reducedMotion ? 0 : 600;

    setTimeout(() => {
        createHearts();
        createConfetti();
    }, delay);
});


// ===================================
// FLOATING HEARTS
// ===================================

function createHearts() {
    const container = $("final-hearts");

    container.innerHTML = "";

    for (let i = 0; i < 18; i++) {
        const heart = document.createElement("span");

        heart.className = "floating-heart";
        heart.textContent = "♡";

        heart.style.left = Math.random() * 100 + "%";
        heart.style.fontSize =
            (16 + Math.random() * 20) + "px";

        heart.style.animationDelay =
            Math.random() * -7 + "s";

        heart.style.animationDuration =
            (6 + Math.random() * 4) + "s";

        container.appendChild(heart);
    }
}


// ===================================
// CONFETTI
// ===================================

function createConfetti() {
    const container = $("confetti");

    container.innerHTML = "";

    const colors = [
        "#F5DCA2",
        "#FFF0E7",
        "#E8B7D4",
        "#C6B5E8"
    ];

    for (let i = 0; i < 65; i++) {
        const piece = document.createElement("span");

        piece.className = "confetti-piece";

        piece.style.left = Math.random() * 100 + "%";

        piece.style.backgroundColor =
            colors[Math.floor(Math.random() * colors.length)];

        piece.style.animationDelay =
            Math.random() * 2 + "s";

        piece.style.animationDuration =
            (3 + Math.random() * 3) + "s";

        container.appendChild(piece);

        piece.addEventListener("animationend", () => {
            piece.remove();
        });
    }
}


// ===================================
// REPLAY THE EXPERIENCE
// ===================================

$("replay").addEventListener("click", () => {
    letterOpened = false;

    $("envelope").classList.remove("open");
    $("envelope").setAttribute("aria-expanded", "false");
    $("letter").classList.add("hidden");

    setupGame();

    blownCandles = 0;

    candles.forEach((candle) => {
        candle.classList.remove("blown");
        candle.disabled = false;
    });

    $("cake-message").textContent =
        "Three little wishes are waiting ✨";

    $("to-final").classList.add("hidden");

    $("final-hearts").innerHTML = "";
    $("confetti").innerHTML = "";

    showScreen("welcome");
});
