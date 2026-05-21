// ===== Model Data =====
const models = [
    { name: "Valentina Reis", category: "Editorial", img: "https://picsum.photos/seed/afresh-m1/400/550.jpg" },
    { name: "Amara Okafor", category: "Runway", img: "https://picsum.photos/seed/afresh-m2/400/550.jpg" },
    { name: "Suki Tanaka", category: "Commercial", img: "https://picsum.photos/seed/afresh-m3/400/550.jpg" },
    { name: "Ingrid Svensson", category: "Editorial", img: "https://picsum.photos/seed/afresh-m4/400/550.jpg" },
    { name: "Naomi Carter", category: "Runway", img: "https://picsum.photos/seed/afresh-m5/400/550.jpg" },
    { name: "Lucia Fernandez", category: "Plus Size", img: "https://picsum.photos/seed/afresh-m6/400/550.jpg" },
    { name: "Zara Khan", category: "Fitness", img: "https://picsum.photos/seed/afresh-m7/400/550.jpg" },
    { name: "Elise Dubois", category: "Editorial", img: "https://picsum.photos/seed/afresh-m8/400/550.jpg" },
    { name: "Maya Johnson", category: "Commercial", img: "https://picsum.photos/seed/afresh-m9/400/550.jpg" },
    { name: "Chiara Rossi", category: "Runway", img: "https://picsum.photos/seed/afresh-m10/400/550.jpg" }
];

// ===== Build Carousel =====
const carouselTrack = document.getElementById('carouselTrack');
models.forEach(m => {
    const card = document.createElement('div');
    card.className = 'model-card';
    card.innerHTML = `
        <div class="model-card-socials">
            <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
            <a href="#" aria-label="Portfolio"><i class="fas fa-external-link-alt"></i></a>
        </div>
        <img class="model-card-img" src="${m.img}" alt="${m.name}" loading="lazy">
        <div class="model-card-overlay">
            <div class="model-card-name">${m.name}</div>
            <div class="model-card-category">${m.category}</div>
        </div>
    `;
    carouselTrack.appendChild(card);
});

// Carousel navigation
let carouselPos = 0;
const cardWidth = 296; // 280 + 16 gap
const maxScroll = (models.length * cardWidth) - carouselTrack.parentElement.clientWidth + 48;

function moveCarousel(direction) {
    const viewportWidth = carouselTrack.parentElement.clientWidth;
    const visibleCards = Math.floor(viewportWidth / cardWidth);
    const step = visibleCards * cardWidth;
    carouselPos += direction * step;
    carouselPos = Math.max(0, Math.min(carouselPos, maxScroll));
    carouselTrack.style.transform = `translateX(-${carouselPos}px)`;
}

document.getElementById('carouselPrev').addEventListener('click', () => moveCarousel(-1));
document.getElementById('carouselNext').addEventListener('click', () => moveCarousel(1));

// Drag to scroll
let isDragging = false, startX = 0, scrollStart = 0;
carouselTrack.addEventListener('mousedown', e => {
    isDragging = true;
    startX = e.pageX;
    scrollStart = carouselPos;
    carouselTrack.style.transition = 'none';
});
window.addEventListener('mousemove', e => {
    if (!isDragging) return;
    const diff = startX - e.pageX;
    carouselPos = Math.max(0, Math.min(scrollStart + diff, maxScroll));
    carouselTrack.style.transform = `translateX(-${carouselPos}px)`;
});
window.addEventListener('mouseup', () => {
    isDragging = false;
    carouselTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
});

// Touch support
carouselTrack.addEventListener('touchstart', e => {
    isDragging = true;
    startX = e.touches[0].pageX;
    scrollStart = carouselPos;
    carouselTrack.style.transition = 'none';
}, { passive: true });
carouselTrack.addEventListener('touchmove', e => {
    if (!isDragging) return;
    const diff = startX - e.touches[0].pageX;
    carouselPos = Math.max(0, Math.min(scrollStart + diff, maxScroll));
    carouselTrack.style.transform = `translateX(-${carouselPos}px)`;
}, { passive: true });
carouselTrack.addEventListener('touchend', () => {
    isDragging = false;
    carouselTrack.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)';
});

// ===== Charts =====
const chartFont = { family: "'Outfit', sans-serif" };
const gridColor = 'rgba(201,168,76,0.08)';
const tickColor = '#a09888';

// Doughnut chart
new Chart(document.getElementById('doughnutChart'), {
    type: 'doughnut',
    data: {
        labels: ['Editorial', 'Commercial', 'Runway', 'Plus Size', 'Fitness'],
        datasets: [{
            data: [35, 25, 20, 12, 8],
            backgroundColor: [
                '#c9a84c',
                '#e8d48b',
                '#8a6f2e',
                '#e85d75',
                '#6bb5ff'
            ],
            borderColor: '#0e0e0e',
            borderWidth: 3,
            hoverBorderColor: '#f5f0e8',
            hoverBorderWidth: 2
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '65%',
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: tickColor,
                    font: { ...chartFont, size: 12 },
                    padding: 16,
                    usePointStyle: true,
                    pointStyleWidth: 10
                }
            },
            tooltip: {
                backgroundColor: '#1a1a1a',
                titleColor: '#f5f0e8',
                bodyColor: '#c9a84c',
                borderColor: 'rgba(201,168,76,0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                titleFont: { ...chartFont, weight: '700' },
                bodyFont: chartFont,
                callbacks: {
                    label: ctx => ` ${ctx.label}: ${ctx.parsed}%`
                }
            }
        }
    }
});

// Bar chart
new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
        labels: ['2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026'],
        datasets: [{
            label: 'Placement Rate',
            data: [72, 65, 78, 85, 91, 94, 97, 100],
            backgroundColor: ctx => {
                const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
                gradient.addColorStop(0, '#c9a84c');
                gradient.addColorStop(1, 'rgba(201,168,76,0.15)');
                return gradient;
            },
            borderColor: '#c9a84c',
            borderWidth: 1,
            borderRadius: 6,
            borderSkipped: false,
            barThickness: 36
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                grid: { color: gridColor, drawBorder: false },
                ticks: {
                    color: tickColor,
                    font: { ...chartFont, size: 11 },
                    callback: v => v + '%',
                    stepSize: 25
                },
                border: { display: false }
            },
            x: {
                grid: { display: false },
                ticks: {
                    color: tickColor,
                    font: { ...chartFont, size: 11 }
                },
                border: { display: false }
            }
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#1a1a1a',
                titleColor: '#f5f0e8',
                bodyColor: '#c9a84c',
                borderColor: 'rgba(201,168,76,0.3)',
                borderWidth: 1,
                cornerRadius: 8,
                titleFont: { ...chartFont, weight: '700' },
                bodyFont: chartFont,
                callbacks: {
                    label: ctx => ` Success Rate: ${ctx.parsed.y}%`
                }
            }
        }
    }
});

// ===== Scroll Reveal =====
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ===== Stat Counter Animation =====
let statsCounted = false;
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsCounted) {
            statsCounted = true;
            document.querySelectorAll('.stat-number').forEach(el => {
                const target = parseInt(el.dataset.target);
                const duration = 2000;
                const start = performance.now();
                function update(now) {
                    const elapsed = now - start;
                    const progress = Math.min(elapsed / duration, 1);
                    // Ease out cubic
                    const eased = 1 - Math.pow(1 - progress, 3);
                    el.textContent = Math.floor(eased * target) + (target > 100 ? '+' : target <= 100 && el.closest('.stat-item').querySelector('.stat-label').textContent.includes('%') ? '%' : '+');
                    if (progress < 1) requestAnimationFrame(update);
                    else {
                        if (target > 100) el.textContent = target.toLocaleString() + '+';
                        else if (el.closest('.stat-item').querySelector('.stat-label').textContent.includes('%')) el.textContent = target + '%';
                        else el.textContent = target + '+';
                    }
                }
                requestAnimationFrame(update);
            });
        }
    });
}, { threshold: 0.5 });
const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

// ===== Navigation Scroll Effect =====
const nav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 80) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
});

// ===== Mobile Menu =====
document.getElementById('mobileMenuBtn').addEventListener('click', () => {
    document.getElementById('mobileNav').classList.add('active');
    document.body.style.overflow = 'hidden';
});
document.getElementById('mobileNavClose').addEventListener('click', closeMobileNav);
function closeMobileNav() {
    document.getElementById('mobileNav').classList.remove('active');
    document.body.style.overflow = '';
}

// ===== File Upload =====
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileList = document.getElementById('fileList');
let uploadedFiles = [];

uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });

uploadArea.addEventListener('dragover', e => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--gold)';
    uploadArea.style.background = 'rgba(201,168,76,0.06)';
});
uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
});
uploadArea.addEventListener('drop', e => {
    e.preventDefault();
    uploadArea.style.borderColor = '';
    uploadArea.style.background = '';
    handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', () => handleFiles(fileInput.files));

function handleFiles(files) {
    Array.from(files).slice(0, 5 - uploadedFiles.length).forEach(file => {
        if (!file.type.startsWith('image/')) return;
        uploadedFiles.push(file);
    });
    renderFileList();
}

function renderFileList() {
    fileList.innerHTML = uploadedFiles.map((f, i) => `
        <div style="display:flex;align-items:center;gap:0.5rem;padding:0.4rem 0;font-size:0.85rem;color:var(--fg-muted);">
            <i class="fas fa-image" style="color:var(--gold);font-size:0.75rem;"></i>
            <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${f.name}</span>
            <button type="button" onclick="removeFile(${i})" style="background:none;border:none;color:#e85d75;cursor:pointer;font-size:0.8rem;" aria-label="Remove file"><i class="fas fa-times"></i></button>
        </div>
    `).join('');
}

window.removeFile = function(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
};

// ===== Form Submission =====
document.getElementById('applyForm').addEventListener('submit', function(e) {
    e.preventDefault();
    let valid = false;

    // Clear previous errors
    this.querySelectorAll('.form-group').forEach(g => g.classList.remove('error'));

    // Validate required fields
    const fname = document.getElementById('fname');
    const femail = document.getElementById('femail');
    const fdob = document.getElementById('fdob');
    const fterms = document.getElementById('fterms');

    if (!fname.value.trim()) {
        fname.closest('.form-group').classList.add('error');
        valid = false;
    }
    if (!femail.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(femail.value)) {
        femail.closest('.form-group').classList.add('error');
        valid = false;
    }
    if (!fdob.value) {
        fdob.closest('.form-group').classList.add('error');
        valid = false;
    }
    if (!fterms.checked) {
        showToast('Please agree to the terms of service.', 'error');
        valid = false;
    }

    if (valid) {
        showToast('Application submitted successfully! We will review your profile and get back to you within 7 business days.', 'success');
        this.reset();
        uploadedFiles = [];
        renderFileList();
    }
});

// ===== Toast Notification =====
window.showToast = function(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
    document.body.appendChild(toast);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => toast.classList.add('show'));
    });
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 4000);
};