// DOM Elements
const sliderContainer = document.getElementById('sliderContainer');
const slider = document.getElementById('slider');
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const dotsContainer = document.getElementById('dots');
const progressBar = document.getElementById('progressBar');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const slideCounter = document.getElementById('slideCounter');
const preloader = document.getElementById('preloader');

// Slider state
let currentSlideIndex = 0;
let isAnimating = false;
let autoSlideInterval;
let isFullscreen = false;
let touchStartX = 0;
let touchEndX = 0;
const totalSlides = slides.length;
const slideChangeDuration = 700; // Match CSS transition duration

// Initialize slider
createDots();
updateSlider();
startAutoSlide();
loadImages();

// Event listeners
prevBtn.addEventListener('click', prevSlide);
nextBtn.addEventListener('click', nextSlide);
fullscreenBtn.addEventListener('click', toggleFullscreen);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
    if (e.key === 'Escape' && isFullscreen) toggleFullscreen();
    if (e.key === 'f') toggleFullscreen();
});

// Touch events for mobile swipe
sliderContainer.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    clearInterval(autoSlideInterval);
}, { passive: true });

sliderContainer.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
    startAutoSlide();
}, { passive: true });

// Mouse drag for desktop
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslate = 0;

sliderContainer.addEventListener('mousedown', (e) => {
    isDragging = true;
    startPos = e.clientX;
    clearInterval(autoSlideInterval);
    slider.style.cursor = 'grabbing';
    slider.style.transition = 'none';
});

sliderContainer.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const currentPosition = e.clientX;
    currentTranslate = prevTranslate + currentPosition - startPos;
    slider.style.transform = `translateX(calc(-${currentSlideIndex * 100}% + ${currentTranslate}px))`;
});

sliderContainer.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    slider.style.cursor = 'grab';
    slider.style.transition = `transform ${slideChangeDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
    
    const movedBy = currentTranslate - prevTranslate;
    
    if (movedBy < -100 && currentSlideIndex < totalSlides - 1) {
        nextSlide();
    } else if (movedBy > 100 && currentSlideIndex > 0) {
        prevSlide();
    } else {
        slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    }
    
    prevTranslate = 0;
    currentTranslate = 0;
    startAutoSlide();
});

sliderContainer.addEventListener('mouseleave', () => {
    if (isDragging) {
        isDragging = false;
        slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
        slider.style.transition = `transform ${slideChangeDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
        startAutoSlide();
    }
});

// Pause autoplay on hover
sliderContainer.addEventListener('mouseenter', () => {
    clearInterval(autoSlideInterval);
});

sliderContainer.addEventListener('mouseleave', () => {
    startAutoSlide();
});

// Functions
function createDots() {
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        
        // Ripple effect
        dot.addEventListener('click', () => {
            if (index === currentSlideIndex || isAnimating) return;
            
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            dot.appendChild(ripple);
            
            const rect = dot.getBoundingClientRect();
            ripple.style.left = `${rect.width / 2}px`;
            ripple.style.top = `${rect.height / 2}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
            
            goToSlide(index);
        });
        
        dotsContainer.appendChild(dot);
    });
}

function updateSlider() {
    // Update slider position
    slider.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
    
    // Update active slide classes
    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === currentSlideIndex);
    });
    
    // Update dots
    const dots = document.querySelectorAll('.dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlideIndex);
        
        // Reset progress animation
        if (index === currentSlideIndex) {
            dot.querySelector('.ripple')?.remove();
            const ripple = document.createElement('span');
            ripple.classList.add('ripple');
            dot.appendChild(ripple);
            
            const rect = dot.getBoundingClientRect();
            ripple.style.left = `${rect.width / 2}px`;
            ripple.style.top = `${rect.height / 2}px`;
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });
    
    // Update counter
    slideCounter.textContent = `${currentSlideIndex + 1} / ${totalSlides}`;
    
    // Reset progress bar
    progressBar.style.width = '0%';
    progressBar.style.transition = 'none';
    void progressBar.offsetWidth; // Trigger reflow
    progressBar.style.transition = `width 5s linear`;
    progressBar.style.width = '100%';
}

function nextSlide() {
    if (isAnimating) return;
    isAnimating = true;
    
    currentSlideIndex = (currentSlideIndex + 1) % totalSlides;
    updateSlider();
    
    setTimeout(() => {
        isAnimating = false;
    }, slideChangeDuration);
}

function prevSlide() {
    if (isAnimating) return;
    isAnimating = true;
    
    currentSlideIndex = (currentSlideIndex - 1 + totalSlides) % totalSlides;
    updateSlider();
    
    setTimeout(() => {
        isAnimating = false;
    }, slideChangeDuration);
}

function goToSlide(index) {
    if (isAnimating || index === currentSlideIndex) return;
    isAnimating = true;
    
    currentSlideIndex = index;
    updateSlider();
    
    setTimeout(() => {
        isAnimating = false;
    }, slideChangeDuration);
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) {
        nextSlide();
    } else if (touchEndX > touchStartX + 50) {
        prevSlide();
    }
}

function startAutoSlide() {
    clearInterval(autoSlideInterval);
    autoSlideInterval = setInterval(() => {
        nextSlide();
    }, 7000);
}

function toggleFullscreen() {
    if (!isFullscreen) {
        if (sliderContainer.requestFullscreen) {
            sliderContainer.requestFullscreen();
        } else if (sliderContainer.webkitRequestFullscreen) {
            sliderContainer.webkitRequestFullscreen();
        } else if (sliderContainer.msRequestFullscreen) {
            sliderContainer.msRequestFullscreen();
        }
        sliderContainer.classList.add('fullscreen');
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
        sliderContainer.classList.remove('fullscreen');
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
    isFullscreen = !isFullscreen;
}

function loadImages() {
    let loadedCount = 0;
    
    document.querySelectorAll('.slide-image').forEach(img => {
        if (img.complete) {
            loadedCount++;
            checkAllLoaded();
        } else {
            img.addEventListener('load', () => {
                loadedCount++;
                checkAllLoaded();
            });
            img.addEventListener('error', () => {
                // Handle error (maybe show placeholder)
                loadedCount++;
                checkAllLoaded();
            });
        }
    });
    
    function checkAllLoaded() {
        if (loadedCount === totalSlides) {
            // All images loaded
            setTimeout(() => {
                preloader.style.opacity = '0';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 500);
            }, 500);
        }
    }
}

// Handle fullscreen change events
document.addEventListener('fullscreenchange', handleFullscreenChange);
document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
document.addEventListener('msfullscreenchange', handleFullscreenChange);

function handleFullscreenChange() {
    isFullscreen = !!document.fullscreenElement || 
                    !!document.webkitFullscreenElement || 
                    !!document.msFullscreenElement;
    
    if (isFullscreen) {
        sliderContainer.classList.add('fullscreen');
        fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        sliderContainer.classList.remove('fullscreen');
        fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
    }
}
