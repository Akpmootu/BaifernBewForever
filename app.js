// app.js - E-Wedding Card Application Logic

// 1. IMAGE DATABASE (exact matches to disk files)
const RETOUCH_IMAGES = [
  "Retouch/Wedding-28.jpg",
  "Retouch/Wedding-175.jpg",
  "Retouch/Wedding-274.jpg",
  "Retouch/Wedding-361.jpg",
  "Retouch/Wedding-584.jpg"
];

const SETS_IMAGES = {
  1: [
    "set 1/1.jpg", "set 1/2.jpg", "set 1/3.jpg", "set 1/4.jpg", "set 1/5.jpg",
    "set 1/6.jpg", "set 1/7.jpg", "set 1/8.jpg", "set 1/9.jpg"
  ],
  2: [
    "set 2/1.jpg", "set 2/2.jpg", "set 2/3.jpg", "set 2/4.jpg", "set 2/5.jpg",
    "set 2/6.jpg", "set 2/7.jpg", "set 2/8.jpg", "set 2/9.jpg", "set 2/10.jpg"
  ],
  3: [
    "set 3/1.jpg", "set 3/2.jpg", "set 3/3.jpg", "set 3/4.jpg", "set 3/5.jpg",
    "set 3/6.jpg", "set 3/7.jpg", "set 3/8.jpg", "set 3/9.jpg", "set 3/10.jpg"
  ],
  4: [
    "set 4/1.jpg", "set 4/2.jpg", "set 4/3.jpg", "set 4/4.jpg", "set 4/5.jpg",
    "set 4/6.jpg", "set 4/7.jpg", "set 4/8.jpg", "set 4/9.jpg", "set 4/10.jpg"
  ],
  5: [
    "set 5/1.jpg", "set 5/2.jpg", "set 5/3.jpg", "set 5/4.jpg", "set 5/5.jpg",
    "set 5/6.jpg", "set 5/7.jpg", "set 5/8.jpg", "set 5/9.jpg", "set 5/10.jpg"
  ],
  6: [
    "set 6/1.jpg", "set 6/2.jpg", "set 6/3.jpg", "set 6/4.jpg", "set 6/5.jpg",
    "set 6/6.jpg", "set 6/7.jpg", "set 6/8.jpg", "set 6/9.jpg", "set 6/10.jpg"
  ]
};

// Flatten all set images to a single array for random divider selections
const ALL_SET_IMAGES = Object.values(SETS_IMAGES).flat();

// Google Sheets API Web App URL (User will configure this)
// For setup instructions, check google_sheets_script.js
let GOOGLE_SHEETS_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbwSc554u7VLgxybz7x-LkMIpM0c6qfzKmhPnZdgJqzTUsMWbRBznALFor3kB52Odyx0/exec"; 

// 2. DOM ELEMENTS
const envelopeCover = document.getElementById("envelope-cover");
const openEnvelopeBtn = document.getElementById("open-envelope-btn");
const mainContent = document.getElementById("main-content");
const bgMusic = document.getElementById("bg-music");
const musicWidget = document.getElementById("music-widget");
const musicToggleBtn = document.getElementById("music-toggle-btn");
const heroBgImg = document.getElementById("hero-bg-img");

// RSVP Form Elements
const rsvpForm = document.getElementById("rsvp-form");
const attendanceStatusInput = document.getElementById("attendance-status");
const attendChoiceBtns = document.querySelectorAll(".attend-choice-btn");
const attendingDetails = document.getElementById("attending-details");
const btnMinusFollower = document.getElementById("btn-minus-follower");
const btnPlusFollower = document.getElementById("btn-plus-follower");
const followersCountInput = document.getElementById("followers-count");
const needAccommodationCheckbox = document.getElementById("need-accommodation");
const accommodationDates = document.getElementById("accommodation-dates");
const checkInInput = document.getElementById("check-in-date");
const checkOutInput = document.getElementById("check-out-date");
const submitRsvpBtn = document.getElementById("submit-rsvp-btn");
const rsvpStatusMsg = document.getElementById("rsvp-status-msg");

// Gallery Elements
const galleryGrid = document.getElementById("gallery-grid");
const galleryTabs = document.querySelectorAll(".gallery-tab");

// Lightbox Elements
const galleryLightbox = document.getElementById("gallery-lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCloseBtn = document.querySelector(".lightbox-close-btn");
const lightboxZoomBtn = document.getElementById("lightbox-zoom-btn");
const lightboxLikeBtn = document.getElementById("lightbox-like-btn");
const lightboxLikeCount = document.getElementById("lightbox-like-count");
const lightboxDownloadLink = document.getElementById("lightbox-download-link");
const imgWrapper = document.querySelector(".lightbox-img-wrapper");

let currentLightboxImgUrl = "";

// 3. MUSIC & ENVELOPE INITIALIZATION (YOUTUBE INTEGRATION)
let ytPlayer = null;
let ytReady = false;
let ytPlayRequested = false;

// Dynamically load YouTube Iframe API
(function loadYouTubeAPI() {
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
})();

// Callback when YouTube API is ready
window.onYouTubeIframeAPIReady = function() {
  ytPlayer = new YT.Player('youtube-player', {
    videoId: '3mYVyVY-lU4',
    playerVars: {
      'autoplay': 0,
      'controls': 0,
      'disablekb': 1,
      'loop': 1,
      'playlist': '3mYVyVY-lU4', // Required for looping single video
      'rel': 0,
      'showinfo': 0,
      'start': 7 // Start at 7 seconds as requested
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
};

function onPlayerReady(event) {
  ytReady = true;
  if (ytPlayRequested) {
    playMusic();
  }
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.ENDED) {
    if (ytPlayer && typeof ytPlayer.playVideo === 'function') {
      ytPlayer.playVideo();
    }
  }
}

openEnvelopeBtn.addEventListener("click", (e) => {
  // Spawn golden seal explosion particles at the click coordinates
  const rect = openEnvelopeBtn.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  createGoldSealExplosion(x, y);

  // Play opening music
  playMusic();
  
  // Wait a short time for the particle burst effect before sliding the envelope
  setTimeout(() => {
    envelopeCover.classList.add("slide-up");
    mainContent.classList.remove("hidden");
    
    // Initialize dynamic contents and GSAP effects after envelope slides away
    setTimeout(() => {
      envelopeCover.classList.add("hidden");
      initializeEffects();
    }, 1200);
  }, 400);
});

function updateMusicIcon(isPlaying) {
  const icon = musicToggleBtn.querySelector("i");
  const tooltip = document.querySelector(".music-tooltip");
  if (!icon) return;
  if (isPlaying) {
    icon.className = "fa-solid fa-music spin-animation";
    if (tooltip) tooltip.textContent = "ปิดเพลง";
  } else {
    icon.className = "fa-solid fa-play";
    if (tooltip) tooltip.textContent = "เล่นเพลง";
  }
}

function playMusic() {
  ytPlayRequested = true;
  if (ytPlayer && ytReady && typeof ytPlayer.playVideo === 'function') {
    ytPlayer.playVideo();
    musicWidget.classList.remove("paused");
    updateMusicIcon(true);
  } else {
    // Fallback to HTML5 audio if YouTube is not ready
    bgMusic.play().then(() => {
      musicWidget.classList.remove("paused");
      updateMusicIcon(true);
    }).catch((err) => {
      console.log("Audio autoplay prevented. Awaiting user interaction.", err);
    });
  }
}

function pauseMusic() {
  ytPlayRequested = false;
  if (ytPlayer && ytReady && typeof ytPlayer.pauseVideo === 'function') {
    ytPlayer.pauseVideo();
    musicWidget.classList.add("paused");
    updateMusicIcon(false);
  } else {
    bgMusic.pause();
    musicWidget.classList.add("paused");
    updateMusicIcon(false);
  }
}

musicToggleBtn.addEventListener("click", () => {
  const isPlaying = !musicWidget.classList.contains("paused");
  if (isPlaying) {
    pauseMusic();
  } else {
    playMusic();
  }
});

// 4. RANDOMIZATION & PRELOADING
function randomizeRetouchImages() {
  // Select random image for welcome homepage (can be any of the 5)
  const randomHeroBg = RETOUCH_IMAGES[Math.floor(Math.random() * RETOUCH_IMAGES.length)];
  heroBgImg.src = randomHeroBg;

  // Select random image for Wedding Timeline (can be any of the 5)
  const randomTimelineBg = RETOUCH_IMAGES[Math.floor(Math.random() * RETOUCH_IMAGES.length)];
  const timelinePhoto = document.querySelector(".timeline-photo");
  if (timelinePhoto) {
    timelinePhoto.src = randomTimelineBg;
  }
}

// Particle effects generators
function createGoldenSparkles() {
  const container = document.getElementById('envelope-cover');
  if (!container) return;
  for (let i = 0; i < 25; i++) {
    const sparkle = document.createElement('div');
    sparkle.className = 'gold-sparkle';
    sparkle.style.left = `${Math.random() * 100}%`;
    sparkle.style.top = `${Math.random() * 100}%`;
    
    const size = Math.random() * 4 + 3; // 3px to 7px
    sparkle.style.width = `${size}px`;
    sparkle.style.height = `${size}px`;
    
    sparkle.style.animationDelay = `${Math.random() * 6}s`;
    sparkle.style.animationDuration = `${Math.random() * 4 + 4}s`;
    
    container.appendChild(sparkle);
  }
}

function createGoldSealExplosion(x, y) {
  const parent = document.body;
  const numParticles = 24;
  
  for (let i = 0; i < numParticles; i++) {
    const particle = document.createElement("div");
    particle.className = "seal-particle";
    
    const rand = Math.random();
    if (rand < 0.35) {
      particle.innerHTML = '<i class="fa-solid fa-star"></i>';
    } else if (rand < 0.70) {
      particle.innerHTML = '<i class="fa-solid fa-heart"></i>';
    } else {
      particle.innerHTML = '<i class="fa-solid fa-circle"></i>';
    }
    
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 120 + 40;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance;
    
    particle.style.setProperty("--x", `${destX}px`);
    particle.style.setProperty("--y", `${destY}px`);
    
    parent.appendChild(particle);
    
    setTimeout(() => {
      particle.remove();
    }, 800);
  }
}


function setupRandomDividers() {
  const dividers = document.querySelectorAll(".random-image-divider");
  const shuffledImages = [...ALL_SET_IMAGES].sort(() => 0.5 - Math.random());
  
  dividers.forEach((divider, index) => {
    const bgElement = divider.querySelector(".divider-parallax-bg");
    const imagePath = shuffledImages[index % shuffledImages.length];
    
    // Set image background
    bgElement.style.backgroundImage = `url('${imagePath}')`;
    
    // Remove skeleton state when background image loaded (simulated via timer or load)
    const imgObj = new Image();
    imgObj.src = imagePath;
    imgObj.onload = () => {
      const skeleton = divider.querySelector(".divider-skeleton");
      if (skeleton) skeleton.remove();
    };
  });
}

// 5. CALENDAR & COUNTDOWN TIMERS
function setupGoogleCalendarLink() {
  const calendarLink = document.getElementById("google-calendar-link");
  const title = encodeURIComponent("The Wedding of Baifern & Bew (#BBVOWS)");
  const dates = "20260726T170000/20260726T230000"; // Friday, July 26, 2026. 17:00 to 23:00
  const details = encodeURIComponent(
    "เรียนเชิญร่วมงานฉลองมงคลสมรสคุณใบเฟิร์น และคุณบิว\n\n" +
    "กำหนดการเริ่มงาน: 17:00 - 23:00 น.\n" +
    "แฮชแท็ก: #BBVOWS\n\n" +
    "จัดงาน ณ Beach Yard Hostel Koh Phangan สไตล์ Vow Ceremony ริมชายหาดอันโรแมนติก"
  );
  const location = encodeURIComponent("Beach Yard Hostel khophangan");
  
  calendarLink.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

function startCountdown() {
  // Target: 2026-07-26 at 17:00:00 (Kophangan Local Time)
  const targetDate = new Date("2026-07-26T17:00:00").getTime();
  
  const timer = setInterval(() => {
    const now = new Date().getTime();
    const distance = targetDate - now;
    
    if (distance < 0) {
      clearInterval(timer);
      document.getElementById("countdown-grid").innerHTML = "<div class='countdown-ended'>Congratulations to the Happy Couple!</div>";
      return;
    }
    
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);
    
    document.getElementById("cd-days").textContent = String(days).padStart(2, '0');
    document.getElementById("cd-hours").textContent = String(hours).padStart(2, '0');
    document.getElementById("cd-minutes").textContent = String(minutes).padStart(2, '0');
    document.getElementById("cd-seconds").textContent = String(seconds).padStart(2, '0');
  }, 1000);
}

// 6. GALLERY RENDER AND TABS
function loadGallerySet(setNumber) {
  galleryGrid.innerHTML = "";
  const images = SETS_IMAGES[setNumber];
  
  images.forEach((imgPath, idx) => {
    const item = document.createElement("div");
    item.className = "gallery-item";
    
    const skeleton = document.createElement("div");
    skeleton.className = "gallery-item-skeleton skeleton-loader";
    
    const img = document.createElement("img");
    img.src = imgPath;
    img.alt = `Prewedding Set ${setNumber} Photo ${idx+1}`;
    img.className = "gallery-img";
    img.loading = "lazy";
    img.addEventListener("load", () => {
      skeleton.remove();
    });
    // Handle cached images
    if (img.complete) {
      skeleton.remove();
    }
    
    const overlay = document.createElement("div");
    overlay.className = "gallery-item-overlay";
    overlay.innerHTML = `<i class="fa-solid fa-expand"></i>`;
    
    item.appendChild(skeleton);
    item.appendChild(img);
    item.appendChild(overlay);
    
    item.addEventListener("click", () => openLightbox(imgPath));
    galleryGrid.appendChild(item);
  });
}

function setupGalleryTabs() {
  galleryTabs.forEach(tab => {
    tab.addEventListener("click", () => {
      galleryTabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      const setNumber = parseInt(tab.getAttribute("data-set"));
      loadGallerySet(setNumber);
    });
  });
}

// 7. LIGHTBOX CONTROLS WITH PERSISTENT LIKES
function openLightbox(imagePath) {
  currentLightboxImgUrl = imagePath;
  lightboxImage.src = imagePath;
  lightboxDownloadLink.href = imagePath;
  imgWrapper.classList.remove("zoomed");
  
  // Load local likes count
  const likeKey = `like_${imagePath}`;
  const isLiked = localStorage.getItem(likeKey) === "true";
  const likeCount = parseInt(localStorage.getItem(`count_${imagePath}`) || Math.floor(Math.random() * 5) + 3); // initial mock likes
  
  localStorage.setItem(`count_${imagePath}`, likeCount); // save default count if not set
  
  lightboxLikeCount.textContent = likeCount;
  
  if (isLiked) {
    lightboxLikeBtn.classList.add("liked");
    lightboxLikeBtn.querySelector("i").className = "fa-solid fa-heart";
  } else {
    lightboxLikeBtn.classList.remove("liked");
    lightboxLikeBtn.querySelector("i").className = "fa-regular fa-heart";
  }
  
  galleryLightbox.classList.add("show");
}

function closeLightbox() {
  galleryLightbox.classList.remove("show");
}

lightboxCloseBtn.addEventListener("click", closeLightbox);
galleryLightbox.addEventListener("click", (e) => {
  if (e.target === galleryLightbox || e.target === imgWrapper) {
    closeLightbox();
  }
});

// Zoom photo toggler
lightboxZoomBtn.addEventListener("click", () => {
  imgWrapper.classList.toggle("zoomed");
});

// Double tap/click to zoom
imgWrapper.addEventListener("dblclick", () => {
  imgWrapper.classList.toggle("zoomed");
});

// Like Interaction
lightboxLikeBtn.addEventListener("click", (e) => {
  const likeKey = `like_${currentLightboxImgUrl}`;
  const countKey = `count_${currentLightboxImgUrl}`;
  const isLiked = localStorage.getItem(likeKey) === "true";
  let count = parseInt(localStorage.getItem(countKey) || 0);
  
  if (isLiked) {
    // Unlike
    localStorage.setItem(likeKey, "false");
    count = Math.max(0, count - 1);
    lightboxLikeBtn.classList.remove("liked");
    lightboxLikeBtn.querySelector("i").className = "fa-regular fa-heart";
  } else {
    // Like
    localStorage.setItem(likeKey, "true");
    count += 1;
    lightboxLikeBtn.classList.add("liked");
    lightboxLikeBtn.querySelector("i").className = "fa-solid fa-heart";
    
    // Spawn floating heart particles on like
    createHeartExplosion(e.clientX, e.clientY);
  }
  
  localStorage.setItem(countKey, count);
  lightboxLikeCount.textContent = count;
});

function createHeartExplosion(x, y) {
  const parent = document.body;
  const numParticles = 8;
  
  for (let i = 0; i < numParticles; i++) {
    const heart = document.createElement("i");
    heart.className = "fa-solid fa-heart heart-particle";
    
    // Position at mouse click coordinates
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    
    // Setup random float values
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 30;
    const destX = Math.cos(angle) * distance;
    const destY = Math.sin(angle) * distance - 80; // drift upward
    
    heart.style.setProperty("--x", `${destX}px`);
    heart.style.setProperty("--y", `${destY}px`);
    
    parent.appendChild(heart);
    
    // Clean up
    setTimeout(() => {
      heart.remove();
    }, 1200);
  }
}

// 8. RSVP SUBMISSION AND TOGGLES
attendChoiceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    attendChoiceBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    const val = btn.getAttribute("data-value");
    attendanceStatusInput.value = val;
    
    if (val === "attend") {
      attendingDetails.classList.remove("hidden");
    } else {
      attendingDetails.classList.add("hidden");
    }
  });
});

// Follower count adjusters
btnMinusFollower.addEventListener("click", () => {
  let val = parseInt(followersCountInput.value);
  if (val > 0) {
    followersCountInput.value = val - 1;
  }
});

btnPlusFollower.addEventListener("click", () => {
  let val = parseInt(followersCountInput.value);
  if (val < 10) {
    followersCountInput.value = val + 1;
  }
});

// Accommodation checkbox toggle
needAccommodationCheckbox.addEventListener("change", () => {
  if (needAccommodationCheckbox.checked) {
    accommodationDates.classList.remove("hidden");
    checkInInput.required = true;
    checkOutInput.required = true;
  } else {
    accommodationDates.classList.add("hidden");
    checkInInput.required = false;
    checkOutInput.required = false;
    checkInInput.value = "";
    checkOutInput.value = "";
  }
});

// Datepicker constraints
checkInInput.addEventListener("change", () => {
  if (checkInInput.value) {
    // Checkout date must be after check-in date
    checkOutInput.min = checkInInput.value;
  }
});

// Submit RSVP Form
rsvpForm.addEventListener("submit", (e) => {
  e.preventDefault();
  
  // UI Loading State
  submitRsvpBtn.disabled = true;
  submitRsvpBtn.querySelector(".btn-text").classList.add("hidden");
  submitRsvpBtn.querySelector(".btn-loading").classList.remove("hidden");
  
  // Collect Form Data
  const formData = {
    name: document.getElementById("guest-name").value,
    status: attendanceStatusInput.value,
    followers: parseInt(followersCountInput.value) || 0,
    need_accommodation: needAccommodationCheckbox.checked,
    check_in_date: checkInInput.value || "",
    check_out_date: checkOutInput.value || "",
    wishes: document.getElementById("best-wishes").value
  };
  
  if (GOOGLE_SHEETS_WEBAPP_URL !== "") {
    // Submit to real Google sheet endpoint
    fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: "POST",
      mode: "no-cors", // Required to bypass CORS restriction of Apps Script Web App
      redirect: "follow",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(formData)
    })
    .then(() => {
      showSubmissionResult(true, "ส่งข้อมูล RSVP สำเร็จ! ขอขอบคุณสำหรับการร่วมตอบรับคำเชิญของพวกเรา");
    })
    .catch((err) => {
      console.error("Error submitting to Google Sheets:", err);
      showSubmissionResult(false, "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ โปรดติดต่อผู้จัดทำ");
    });
  } else {
    // Fallback Mock Mode (so user can verify immediately)
    setTimeout(() => {
      console.log("Mock RSVP Submission:", formData);
      showSubmissionResult(true, "ระบบกำลังแสดงผลแบบจำลอง (Mock): บันทึกข้อมูล RSVP ของท่านสำเร็จแล้ว! (กรุณาตั้งค่า Google Sheets API ในภายหลัง)");
    }, 1500);
  }
});

function showSubmissionResult(isSuccess, message) {
  submitRsvpBtn.disabled = false;
  submitRsvpBtn.querySelector(".btn-text").classList.remove("hidden");
  submitRsvpBtn.querySelector(".btn-loading").classList.add("hidden");
  
  rsvpStatusMsg.textContent = message;
  rsvpStatusMsg.className = `rsvp-status-msg ${isSuccess ? 'success' : 'error'}`;
  rsvpStatusMsg.classList.remove("hidden");
  
  if (isSuccess) {
    rsvpForm.reset();
    attendanceStatusInput.value = "attend";
    attendChoiceBtns.forEach(b => b.classList.remove("active"));
    document.querySelector("[data-value='attend']").classList.add("active");
    attendingDetails.classList.remove("hidden");
    accommodationDates.classList.add("hidden");
    needAccommodationCheckbox.checked = false;
  }
}

// 9. BOTTOM NAVIGATION ACTIVE ELEMENT OBSERVER
function setupNavObserver() {
  const sections = document.querySelectorAll("section");
  const navItems = document.querySelectorAll(".nav-item");
  
  window.addEventListener("scroll", () => {
    let current = "";
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
        current = section.getAttribute("id");
      }
    });
    
    // Special fallback for Home section or bottom scroll trigger
    if (window.scrollY < 200) {
      current = "home";
    }
    
    navItems.forEach(item => {
      item.classList.remove("active");
      
      const href = item.getAttribute("href").substring(1);
      // Map sections to nav items
      if (href === current || 
          (current === "map-sec" && href === "map-sec") ||
          (current === "rsvp-sec" && href === "rsvp-sec")) {
        item.classList.add("active");
      }
    });
  });
}

// 10. GSAP ANIMATIONS & PARALLAX SCROLL TRIGGER
function initializeEffects() {
  // Parallax Scroll for Random Photo Dividers
  const dividers = document.querySelectorAll(".random-image-divider");
  dividers.forEach(divider => {
    const bgElement = divider.querySelector(".divider-parallax-bg");
    
    gsap.fromTo(bgElement, 
      { y: "-10%" },
      { 
        y: "10%",
        ease: "none",
        scrollTrigger: {
          trigger: divider,
          start: "top bottom",
          end: "bottom top",
          scrub: true
        }
      }
    );
  });
  
  // Fade-in sections on scroll
  const scrollAnimates = document.querySelectorAll(".scroll-animate");
  scrollAnimates.forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

function handleStaticImageSkeletons() {
  document.querySelectorAll("img").forEach(img => {
    // Skip gallery images as they are handled dynamically
    if (img.classList.contains("gallery-img")) return;
    
    if (img.complete) {
      removeSiblingSkeleton(img);
    } else {
      img.addEventListener("load", () => removeSiblingSkeleton(img));
    }
  });
}

function removeSiblingSkeleton(img) {
  const parent = img.parentElement;
  if (parent) {
    const skeleton = parent.querySelector(".skeleton-loader");
    if (skeleton) {
      skeleton.remove();
    }
  }
}

function randomizeThankYouBackground() {
  const thankYouImg = document.getElementById("thank-you-img");
  if (thankYouImg) {
    const randomImg = ALL_SET_IMAGES[Math.floor(Math.random() * ALL_SET_IMAGES.length)];
    thankYouImg.src = randomImg;
  }
}

// 8.5 SPECIAL GIFT MODAL CONTROL
function setupGiftModal() {
  const openGiftBtn = document.getElementById("open-gift-btn");
  const giftModal = document.getElementById("gift-modal");
  const giftModalClose = document.getElementById("gift-modal-close");

  if (openGiftBtn && giftModal && giftModalClose) {
    openGiftBtn.addEventListener("click", () => {
      giftModal.classList.add("show");
    });
    
    giftModalClose.addEventListener("click", () => {
      giftModal.classList.remove("show");
    });
    
    giftModal.addEventListener("click", (e) => {
      if (e.target === giftModal) {
        giftModal.classList.remove("show");
      }
    });
  }
}

// 11. APP ENTRY POINT
function initApp() {
  randomizeRetouchImages();
  setupRandomDividers();
  setupGoogleCalendarLink();
  startCountdown();
  randomizeThankYouBackground();
  setupGiftModal();
  
  // Create gold sparkles on the envelope cover
  createGoldenSparkles();
  
  // Load gallery Set 1 initially
  loadGallerySet(1);
  setupGalleryTabs();
  
  // Setup skeletons for static images safely
  handleStaticImageSkeletons();
  
  setupNavObserver();
}

window.addEventListener("DOMContentLoaded", initApp);
