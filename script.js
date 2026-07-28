const card = document.querySelector("#card");
const cover = document.querySelector(".card-cover");
const closeButton = document.querySelector(".close-card");
const cardControls = document.querySelector(".card-controls");
const songCard = document.querySelector(".song-card");
const songPlayer = document.querySelector(".song-player");
const voiceAudio = document.querySelector(".voice-audio");
const voicePlay = document.querySelector(".voice-play");
const voiceIcon = document.querySelector(".voice-icon");
const voiceStatus = document.querySelector(".voice-status");
const voiceProgress = document.querySelector(".voice-track i");
const announcement = document.querySelector("#announcement");
const popcornBurst = document.querySelector(".popcorn-burst");
const bookPages = [...document.querySelectorAll(".book-page")];

const popcornKernels = Array.from({ length: 14 });
let musicStarted = Boolean(songPlayer?.getAttribute("src"));

function startMusic() {
    if (musicStarted || !songPlayer) return;
    songPlayer.src = songPlayer.dataset.src;
    songCard.classList.add("is-playing");
    musicStarted = true;
}

function releasePopcorn() {
    popcornBurst.replaceChildren();

    popcornKernels.forEach((_, index) => {
        const kernel = document.createElement("span");
        const angle = -155 + (index / (popcornKernels.length - 1)) * 130;
        const distance = 115 + (index % 4) * 34;
        const x = Math.cos((angle * Math.PI) / 180) * distance;
        const y = Math.sin((angle * Math.PI) / 180) * distance;

        kernel.style.setProperty("--pop-x", `${x}px`);
        kernel.style.setProperty("--pop-y", `${y}px`);
        kernel.style.setProperty("--pop-rotation", `${-45 + index * 27}deg`);
        kernel.style.setProperty("--pop-delay", `${index * 38}ms`);
        kernel.style.setProperty("--pop-scale", `${0.72 + (index % 3) * 0.18}`);
        popcornBurst.appendChild(kernel);
    });

    window.setTimeout(() => popcornBurst.replaceChildren(), 1900);
}

function setOpen(isOpen) {
    card.classList.toggle("is-open", isOpen);
    cover.setAttribute("aria-expanded", String(isOpen));
    cover.setAttribute("aria-label", isOpen ? "Father’s Day card is open" : "Open Father’s Day card");
    cardControls.hidden = !isOpen;
    announcement.textContent = isOpen ? "The card is open. Happy Father’s Day, Pop!" : "The card is closed.";
}

function showPage(pageIndex, direction) {
    const currentPage = bookPages.find((page) => !page.hidden);
    const nextPage = bookPages.find((page) => Number(page.dataset.page) === pageIndex);

    if (!nextPage || currentPage === nextPage) return;

    currentPage.classList.remove("is-current");
    currentPage.classList.add(direction === "next" ? "turning-forward" : "turning-back");

    window.setTimeout(() => {
        currentPage.hidden = true;
        currentPage.classList.remove("turning-forward", "turning-back");
        nextPage.hidden = false;
        nextPage.classList.add("is-current", direction === "next" ? "arriving-forward" : "arriving-back");
        window.setTimeout(() => nextPage.classList.remove("arriving-forward", "arriving-back"), 560);
        nextPage.querySelector("button")?.focus();
    }, 420);
}

cover.addEventListener("click", () => {
    if (!card.classList.contains("is-open")) {
        setOpen(true);
        releasePopcorn();
        window.setTimeout(startMusic, 1250);
    }
});

voicePlay.addEventListener("click", () => {
    if (voiceAudio.paused) {
        if (songPlayer.src) {
            songPlayer.removeAttribute("src");
            songCard.classList.remove("is-playing");
            musicStarted = false;
        }
        voiceAudio.play();
    } else {
        voiceAudio.pause();
    }
});

voiceAudio.addEventListener("play", () => {
    voiceIcon.textContent = "Ⅱ";
    voiceStatus.textContent = "Playing your message";
    voicePlay.setAttribute("aria-label", "Pause Katie’s voice message");
});

voiceAudio.addEventListener("pause", () => {
    voiceIcon.textContent = "▶";
    voiceStatus.textContent = voiceAudio.currentTime > 0 ? "Paused" : "Tap to listen";
    voicePlay.setAttribute("aria-label", "Play Katie’s voice message");
});

voiceAudio.addEventListener("timeupdate", () => {
    const progress = voiceAudio.duration ? (voiceAudio.currentTime / voiceAudio.duration) * 100 : 0;
    voiceProgress.style.width = `${progress}%`;
});

voiceAudio.addEventListener("ended", () => {
    voiceAudio.currentTime = 0;
    voiceProgress.style.width = "0%";
    voiceIcon.textContent = "▶";
    voiceStatus.textContent = "Play it again";
});

closeButton.addEventListener("click", () => {
    setOpen(false);
    voiceAudio.pause();
    voiceAudio.currentTime = 0;
    window.setTimeout(() => {
        bookPages.forEach((page) => {
            const isFirstPage = Number(page.dataset.page) === 0;
            page.hidden = !isFirstPage;
            page.classList.toggle("is-current", isFirstPage);
            page.classList.remove("turning-forward", "turning-back", "arriving-forward", "arriving-back");
        });
    }, 650);
    window.setTimeout(() => cover.focus(), 250);
});

document.addEventListener("click", (event) => {
    const nextButton = event.target.closest("[data-next]");
    const backButton = event.target.closest("[data-back]");

    if (nextButton) showPage(Number(nextButton.dataset.next), "next");
    if (backButton) showPage(Number(backButton.dataset.back), "back");
});
