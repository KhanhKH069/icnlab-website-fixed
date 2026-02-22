/**
 * ICN Lab - Hero nền theo sự kiện / mùa
 * Tự động đổi background và text theo ngày hiện tại
 */

(function () {
    // (month, day) -> 1-12, 1-31
    function inRange(month, day, startM, startD, endM, endD) {
        const d = month * 100 + day;
        const start = startM * 100 + startD;
        const end = endM * 100 + endD;
        if (start <= end) return d >= start && d <= end;
        return d >= start || d <= end; // qua năm (e.g. 12/20 - 01/03)
    }

    // Thứ tự ưu tiên: kiểm tra từ trên xuống, match đầu tiên dùng
    const SEASONS = [
        {
            id: 'new_year_solar',
            name: 'Tết dương lịch',
            range: function (m, d) { return (m === 1 && d <= 3) || (m === 12 && d >= 30); },
            background: 'linear-gradient(135deg, #0c1445 0%, #1e3a8a 40%, #3b82f6 100%)',
            accentColor: '#fbbf24',
            text: 'Chúc Mừng Năm Mới',
            showText: true
        },
        {
            id: 'tet',
            name: 'Tết âm lịch',
            range: function (m, d) { return m === 1 && d >= 15 || m === 2 && d <= 25; },
            background: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%)',
            accentColor: '#fbbf24',
            text: 'Chúc Mừng Năm Mới Bính Ngọ 2026',
            showText: true
        },
        {
            id: 'christmas',
            name: 'Christmas',
            range: function (m, d) { return m === 12 && d >= 20 && d <= 26; },
            background: 'linear-gradient(135deg, #14532d 0%, #166534 40%, #dc2626 100%)',
            accentColor: '#fef3c7',
            text: 'Merry Christmas',
            showText: true
        },
        {
            id: 'back_to_school',
            name: 'Back to School',
            range: function (m, d) { return m === 9 && d <= 15; },
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
            accentColor: '#93c5fd',
            text: 'Chào Mừng Năm Học Mới',
            showText: true
        },
        {
            id: 'spring',
            name: 'Mùa xuân',
            range: function (m, d) { return m >= 3 && m <= 5; },
            background: 'linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 40%, #fce7f3 100%)',
            accentColor: '#059669',
            text: 'Mùa Xuân',
            showText: true
        },
        {
            id: 'summer',
            name: 'Mùa hè',
            range: function (m, d) { return m >= 6 && m <= 8; },
            background: 'linear-gradient(135deg, #fef3c7 0%, #fcd34d 30%, #0ea5e9 100%)',
            accentColor: '#0369a1',
            text: 'Mùa Hè',
            showText: true
        },
        {
            id: 'autumn',
            name: 'Mùa thu',
            range: function (m, d) { return m >= 9 && m <= 11; },
            background: 'linear-gradient(135deg, #78350f 0%, #b45309 30%, #f59e0b 70%, #fef3c7 100%)',
            accentColor: '#92400e',
            text: 'Mùa Thu',
            showText: true
        },
        {
            id: 'winter',
            name: 'Mùa đông',
            range: function (m, d) { return m === 12 || m === 1 || m === 2; },
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 40%, #334155 100%)',
            accentColor: '#94a3b8',
            text: 'Mùa Đông',
            showText: true
        }
    ];

    function getCurrentTheme() {
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        for (var i = 0; i < SEASONS.length; i++) {
            if (SEASONS[i].range(month, day)) {
                return SEASONS[i];
            }
        }
        return null;
    }

    var DARK_THEMES = ['new_year_solar', 'tet', 'christmas', 'winter', 'back_to_school', 'autumn'];

    function applyTheme(theme) {
        var hero = document.querySelector('.hero');
        var seasonalEl = document.querySelector('.hero .seasonal-text');
        if (!hero) return;

        hero.classList.remove('hero--dark');
        hero.style.background = '';

        if (theme) {
            hero.style.background = theme.background;
            hero.setAttribute('data-season', theme.id);
            if (theme.accentColor) {
                hero.style.setProperty('--hero-accent', theme.accentColor);
            }
            if (DARK_THEMES.indexOf(theme.id) !== -1) {
                hero.classList.add('hero--dark');
            }
            if (seasonalEl) {
                seasonalEl.textContent = theme.text;
                seasonalEl.style.display = theme.showText ? 'inline-block' : 'none';
                seasonalEl.style.color = theme.accentColor || '#fbbf24';
            }
        } else {
            hero.removeAttribute('data-season');
            if (seasonalEl) seasonalEl.style.display = 'none';
        }
    }

    function init() {
        var theme = getCurrentTheme();
        applyTheme(theme);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.ICNSeasonalHero = { getCurrentTheme: getCurrentTheme, applyTheme: applyTheme };
})();
