document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('show');
            const icon = hamburger.querySelector('i');
            if(navLinks.classList.contains('show')) {
                icon.classList.remove('fa-bars');
                icon.classList.add('fa-times');
            } else {
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    }

    // --- Scroll Reveal Animation ---
    const revealElements = document.querySelectorAll('.reveal');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));

    // --- Hidden Email Reveal (Contact Page) ---
    const btnReveal = document.getElementById('btn-reveal-email');
    const emailDisplay = document.getElementById('email-display');
    if (btnReveal && emailDisplay) {
        btnReveal.addEventListener('click', () => {
            if (emailDisplay.style.display === 'block') {
                emailDisplay.style.display = 'none';
                btnReveal.innerText = 'Reveal Email';
            } else {
                const em = 'rezowancanon' + '@' + 'gmail.com';
                emailDisplay.innerHTML = `<a href="mailto:${em}">${em}</a>`;
                emailDisplay.style.display = 'block';
                btnReveal.innerText = 'Hide Email';
            }
        });
    }

    // --- Pricing Calculator Logic ---
    const calcSection = document.querySelector('.pricing-calculator');
    if (calcSection) {
        const rates = {
            'AI Advertisement':           { bd: 1500, intl: 40, type: 'time', base: 30 }, 
            'AI Video Production':        { bd: 800,  intl: 20, type: 'time', base: 60 },
            'AI Documentary':             { bd: 1000, intl: 25, type: 'time', base: 60 },
            'AI Historical Documentary':  { bd: 1200, intl: 30, type: 'time', base: 60 },
            'AI Song & Music':            { bd: 2000, intl: 50, type: 'piece' },
            'AI Music Video':             { bd: 1500, intl: 40, type: 'time', base: 60 },
            'AI Cartoon':                 { bd: 1000, intl: 25, type: 'time', base: 60 },
            'AI Shorts & Social Content': { bd: 800,  intl: 20, type: 'time', base: 60 },
            'AI Scriptwriting':           { bd: 500,  intl: 15, type: 'piece' },
            'AI Voice Over':              { bd: 600,  intl: 15, type: 'time', base: 60 },
            'AI Thumbnail & Poster':      { bd: 300,  intl: 8,  type: 'piece' },
        };

        let isBD = true;
        const btnBD = document.getElementById('btn-bd');
        const btnIntl = document.getElementById('btn-intl');
        const selectService = document.getElementById('calc-service');
        const slider = document.getElementById('calc-duration');
        const sliderContainer = document.getElementById('slider-wrap');
        const durationText = document.getElementById('duration-val');
        const priceDisplay = document.getElementById('price-display');

        const updateCalc = () => {
            const serviceName = selectService.value;
            const serviceData = rates[serviceName];
            if (!serviceData) return;

            let price = 0;
            const sym = isBD ? '৳' : '$';
            const rate = isBD ? serviceData.bd : serviceData.intl;

            if (serviceData.type === 'piece') {
                sliderContainer.style.display = 'none';
                price = rate;
            } else {
                sliderContainer.style.display = 'flex';
                const seconds = parseInt(slider.value);
                if (seconds < 60) {
                    durationText.innerText = `${seconds} sec`;
                } else {
                    const mins = Math.floor(seconds / 60);
                    const secs = seconds % 60;
                    durationText.innerText = secs > 0 ? `${mins}m ${secs}s` : `${mins} min`;
                }
                const units = seconds / serviceData.base;
                price = Math.ceil(units * rate);
            }

            const minPrice = isBD ? 300 : 8;
            if (price < minPrice) price = minPrice;
            priceDisplay.innerText = `${sym}${price.toLocaleString()}`;
        };

        btnBD.addEventListener('click', () => { isBD = true; btnBD.classList.add('active'); btnIntl.classList.remove('active'); updateCalc(); });
        btnIntl.addEventListener('click', () => { isBD = false; btnIntl.classList.add('active'); btnBD.classList.remove('active'); updateCalc(); });
        selectService.addEventListener('change', updateCalc);
        slider.addEventListener('input', updateCalc);
        updateCalc();
    }

    // --- Google Sheets Dynamic Projects & News Loader ---
    const SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/1d0DvC09G--rW6ar793Hy2jeVD1KUHSwOeywV6Aa7SQk/export?format=csv';
    
    const dynamicContainer = document.getElementById('dynamic-projects-container');
    const staticContainer = document.getElementById('static-projects-container');

    if (dynamicContainer && SHEET_CSV_URL !== '') {
        if(staticContainer) staticContainer.style.display = 'none';
        
        fetch(SHEET_CSV_URL)
            .then(response => {
                if (!response.ok) throw new Error("Network response was not ok");
                return response.text();
            })
            .then(csvText => {
                const rows = csvText.split('\n').slice(1); 
                const categories = {};

                // Parse CSV
                rows.forEach(row => {
                    // Handle commas inside quotes properly if they ever occur
                    const cols = row.split(','); 
                    if(cols && cols.length >= 2) {
                        const category = (cols[0] || '').trim();
                        const title = (cols[1] || '').trim();
                        const vidId = (cols[2] || '').trim();
                        const articleLink = (cols[3] || '').trim();
                        const imageLink = (cols[4] || '').trim();
                        
                        if(category !== '' && title !== '') {
                            if(!categories[category]) categories[category] = [];
                            categories[category].push({ title, vidId, articleLink, imageLink });
                        }
                    }
                });

                // Build HTML
                let html = '';
                for (const [catName, items] of Object.entries(categories)) {
                    html += `
                    <div class="project-row reveal visible">
                        <div class="row-header">
                            <h3>${catName}</h3>
                        </div>
                        <div class="project-cards-strip">
                    `;
                    items.forEach(item => {
                        // Logic for YouTube Video Card
                        if (item.vidId !== '') {
                            // Smart logic: If a custom image link is provided, use it. Otherwise, use YouTube default.
                            let thumbUrl = item.imageLink !== '' ? item.imageLink : `https://img.youtube.com/vi/${item.vidId}/maxresdefault.jpg`;
                            
                            html += `
                                <div class="work-card" style="min-width: 320px; margin:0;">
                                    <a href="https://youtube.com/watch?v=${item.vidId}" target="_blank">
                                        <img src="${thumbUrl}" onerror="this.src='https://img.youtube.com/vi/${item.vidId}/hqdefault.jpg'" loading="lazy" style="object-fit: cover; object-position: center;">
                                    </a>
                                    <div class="work-info">
                                        <h4>${item.title}</h4>
                                        <a href="https://youtube.com/watch?v=${item.vidId}" target="_blank" style="color: var(--a1); font-weight: 600;">Watch Video →</a>
                                    </div>
                                </div>
                            `;
                        } 
                        // Logic for News/Book Card
                        else if (item.articleLink !== '' && item.imageLink !== '') {
                            html += `
                                <div class="work-card" style="min-width: 320px; margin:0;">
                                    <a href="${item.articleLink}" target="_blank">
                                        <img src="${item.imageLink}" onerror="this.src='https://dummyimage.com/320x190/1a1a2e/ffffff&text=Image+Not+Found'" loading="lazy" style="object-fit: cover; object-position: top;">
                                    </a>
                                    <div class="work-info">
                                        <h4>${item.title}</h4>
                                        <a href="${item.articleLink}" target="_blank" style="color: var(--a2); font-weight: 600;">Read More →</a>
                                    </div>
                                </div>
                            `;
                        }
                    });
                    html += `</div></div>`;
                }
                dynamicContainer.innerHTML = html;
            })
            .catch(err => {
                console.error('Error loading Google Sheet:', err);
                dynamicContainer.innerHTML = '<p style="color:red; text-align:center;">Failed to load projects. Please try again later.</p>';
                if(staticContainer) staticContainer.style.display = 'block';
            });
    }
});
