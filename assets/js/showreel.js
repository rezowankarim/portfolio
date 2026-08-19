const SHOWREEL_SHEET_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS-o5E2exvDqH-OcAeHf5OgKm24xjS1HWP7OX7vyWE7IfVhmmLh42W2tBCjVDCRzLdQw2R9TilA6FmG/pub?output=csv';

async function loadShowreel() {
    const featuredContainer = document.getElementById('featured-video-container');
    const dynamicContainer = document.getElementById('dynamic-showreel-container');

    try {
        const res = await fetch(SHOWREEL_SHEET_CSV_URL);
        const text = await res.text();
        
        const rows = text.split('\n').map(r => r.trim()).filter(r => r.length > 0);
        if (rows.length <= 1) return;

        const dataRows = rows.slice(1);
        const categories = {};
        let firstFeaturedVideo = null;

        dataRows.forEach((row) => {
            const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
            const category = cols[0] || 'Shots Edits';
            const title = cols[1] || 'Watch Video';
            const videoId = cols[2] || '';

            if (videoId) {
                // ১. ১ম ভিডিও অথবা 'Featured Video' ক্যাটাগরির ভিডিও টপ প্লেয়ারে যাবে
                if (!firstFeaturedVideo || category.toLowerCase().includes('featured')) {
                    if (!firstFeaturedVideo) firstFeaturedVideo = { videoId, title };
                    if (category.toLowerCase().includes('featured')) return; // Featured রো আলাদা ক্যাটাগরি হিসেবে নিচে দেখাবে না
                }

                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push({ title, videoId });
            }
        });

        // ১. টপে 16:9 ল্যান্ডস্কেপ ভিডিও প্লেয়ার এম্বেড
        if (firstFeaturedVideo && featuredContainer) {
            featuredContainer.innerHTML = `
                <iframe 
                    src="https://www.youtube.com/embed/${firstFeaturedVideo.videoId}?rel=0&autoplay=0" 
                    title="${firstFeaturedVideo.title}" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            `;
        }

        // ২. নিচের ভিডিওগুলো ডিসপ্লে করা (ডিফল্ট: 9:16 রিল, অপশনাল: 16:9 ল্যান্ডস্কেপ)
        let html = '';
        for (const [catName, videos] of Object.entries(categories)) {
            // যদি ক্যাটাগরির নামে 'landscape' বা '16:9' থাকে তবে ল্যান্ডস্কেপ হবে, অন্যথায় 9:16 রিল
            const isLandscape = catName.toLowerCase().includes('landscape') || catName.toLowerCase().includes('16:9');
            const cardClass = isLandscape ? 'work-card-landscape' : 'work-card-reel';
            const thumbClass = isLandscape ? 'thumbnail-16-9' : 'thumbnail-9-16';

            html += `
                <div class="project-row" style="margin-bottom: 40px;">
                    <div class="row-header"><h3>${catName}</h3></div>
                    <div class="reel-cards-strip">
            `;

            videos.forEach(v => {
                html += `
                    <div class="${cardClass}">
                        <a href="https://youtube.com/watch?v=${v.videoId}" target="_blank" class="${thumbClass}">
                            <img src="https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg" 
                                 loading="lazy" alt="${v.title}">
                        </a>
                        <div class="work-info-box">
                            <h4>${v.title}</h4>
                            <a href="https://youtube.com/watch?v=${v.videoId}" target="_blank">Watch Reel →</a>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
        }

        if (dynamicContainer) {
            dynamicContainer.innerHTML = html;
        }

    } catch (err) {
        console.error('Error fetching showreel data:', err);
    }
}

document.addEventListener('DOMContentLoaded', loadShowreel);