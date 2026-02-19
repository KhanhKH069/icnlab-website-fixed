/**
 * ICN Lab Website Theme Configuration
 * 
 * Thay đổi file này để customize giao diện website
 * Không cần biết code, chỉ cần sửa các giá trị bên dưới!
 */

const THEME_CONFIG = {
    // ==============================================
    // HERO SECTION - Banner chính
    // ==============================================
    hero: {
        // Background gradient colors
        backgroundColor: {
            start: '#991b1b',    // Màu bắt đầu (đỏ đậm)
            middle: '#dc2626',   // Màu giữa (đỏ PTIT)
            end: '#b91c1c'       // Màu kết thúc (đỏ)
        },
        
        // Hiển thị hoa mai/đào không?
        showFlowers: true,
        
        // Màu hoa (vàng gold)
        flowerColor: '#fbbf24',
        
        // Text chính
        title: 'Intelligently Connected Networks Lab',
        
        // Text phụ - Thay đổi theo mùa/sự kiện
        seasonalText: {
            enabled: true,  // Bật/tắt text mùa
            text: '🎊 Chúc Mừng Năm Mới Bính Ngọ 2026 🎊',
            color: '#fbbf24',        // Màu vàng
            fontSize: '1.5rem'
        },
        
        // Mô tả
        description: 'Pioneering innovative solutions for next-generation networked systems through Edge Computing, IoT, and 5G/6G Technologies',
        
        // Statistics
        stats: [
            { number: '50+', label: 'Publications' },
            { number: '15+', label: 'Active Projects' },
            { number: '30+', label: 'Researchers' }
        ]
    },

    // ==============================================
    // COLORS - Màu sắc toàn bộ website
    // ==============================================
    colors: {
        primary: '#1a4d8f',      // Màu xanh chính
        red: '#dc2626',          // Màu đỏ PTIT
        redDark: '#991b1b',      // Màu đỏ đậm
        gold: '#fbbf24',         // Màu vàng
        accent: '#0ea5e9',       // Màu nhấn (xanh dương)
        dark: '#0f172a',         // Màu tối
        gray: '#64748b',         // Màu xám
        light: '#f8fafc',        // Màu sáng
        border: '#e2e8f0'        // Màu viền
    },

    // ==============================================
    // LOGO & BRANDING
    // ==============================================
    branding: {
        logoText: 'ICN Lab',
        logoSubtext: 'PTIT RESEARCH',
        // Để custom logo image, uncomment dòng dưới và thêm path
        // logoImage: '/assets/logo.png'
    },

    // ==============================================
    // NAVIGATION MENU
    // ==============================================
    navigation: [
        { text: 'Trang chủ', href: '#home' },
        { text: 'Giới thiệu', href: '#about' },
        { text: 'Nghiên cứu', href: '#research' },
        { text: 'Tin tức', href: '#news' },
        { text: 'Công bố', href: '#publications' },
        { text: 'Liên hệ', href: '#contact' }
    ],

    // ==============================================
    // THEME PRESETS - Các theme có sẵn
    // ==============================================
    // Uncomment preset bạn muốn dùng:
    
    presets: {
        // Theme Tết (đang dùng)
        tet: {
            name: 'Tết Nguyên Đán',
            heroBackground: 'linear-gradient(135deg, #991b1b 0%, #dc2626 50%, #b91c1c 100%)',
            showFlowers: true,
            seasonalText: '🎊 Chúc Mừng Năm Mới Bính Ngọ 2026 🎊',
            accentColor: '#fbbf24'
        },
        
        // Theme bình thường (sau Tết)
        normal: {
            name: 'Normal Theme',
            heroBackground: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
            showFlowers: false,
            seasonalText: null,
            accentColor: '#0ea5e9'
        },
        
        // Theme Giáng Sinh
        christmas: {
            name: 'Christmas',
            heroBackground: 'linear-gradient(135deg, #166534 0%, #22c55e 50%, #dc2626 100%)',
            showFlowers: true,
            seasonalText: '🎄 Merry Christmas 2025 🎅',
            accentColor: '#ef4444'
        },
        
        // Theme Quốc Khánh
        nationalDay: {
            name: 'National Day',
            heroBackground: 'linear-gradient(135deg, #dc2626 0%, #fbbf24 100%)',
            showFlowers: true,
            seasonalText: '🇻🇳 Chào Mừng Quốc Khánh 2/9 🇻🇳',
            accentColor: '#fbbf24'
        },
        
        // Theme Khai giảng
        backToSchool: {
            name: 'Back to School',
            heroBackground: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            showFlowers: false,
            seasonalText: '📚 Chào Mừng Năm Học Mới 📚',
            accentColor: '#60a5fa'
        }
    }
};

// ==============================================
// ACTIVE PRESET - Chọn theme hiện tại
// ==============================================
// Đổi giá trị này để thay đổi theme:
// 'tet', 'normal', 'christmas', 'nationalDay', 'backToSchool'
const ACTIVE_PRESET = 'tet';

// ==============================================
// AUTO-APPLY PRESET
// ==============================================
function applyPreset(presetName) {
    const preset = THEME_CONFIG.presets[presetName];
    if (!preset) {
        console.warn(`Preset "${presetName}" not found. Using default.`);
        return;
    }
    
    console.log(`🎨 Applying theme: ${preset.name}`);
    
    // Apply hero background
    const hero = document.querySelector('.hero');
    if (hero && preset.heroBackground) {
        hero.style.background = preset.heroBackground;
    }
    
    // Show/hide flowers
    const flowers = document.querySelectorAll('.tet-flower');
    flowers.forEach(flower => {
        flower.style.display = preset.showFlowers ? 'block' : 'none';
    });
    
    // Update seasonal text
    const seasonalTextEl = document.querySelector('.seasonal-text');
    if (seasonalTextEl) {
        if (preset.seasonalText) {
            seasonalTextEl.textContent = preset.seasonalText;
            seasonalTextEl.style.display = 'block';
        } else {
            seasonalTextEl.style.display = 'none';
        }
    }
    
    // Update accent color
    if (preset.accentColor) {
        document.documentElement.style.setProperty('--accent-color', preset.accentColor);
    }
}

// ==============================================
// DATE-BASED AUTO THEME (Optional)
// ==============================================
const AUTO_THEME = {
    enabled: false,  // Bật để tự động đổi theme theo ngày
    schedule: [
        { start: '12-20', end: '12-26', preset: 'christmas' },      // Giáng Sinh
        { start: '01-20', end: '02-20', preset: 'tet' },            // Tết Nguyên Đán
        { start: '08-25', end: '09-03', preset: 'nationalDay' },    // Quốc Khánh
        { start: '09-01', end: '09-10', preset: 'backToSchool' },   // Khai giảng
        // Default: 'normal' cho các ngày còn lại
    ]
};

function getAutoTheme() {
    if (!AUTO_THEME.enabled) return ACTIVE_PRESET;
    
    const now = new Date();
    const currentDate = `${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    for (const schedule of AUTO_THEME.schedule) {
        if (currentDate >= schedule.start && currentDate <= schedule.end) {
            return schedule.preset;
        }
    }
    
    return 'normal';  // Default theme
}

// ==============================================
// EXPORT
// ==============================================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { THEME_CONFIG, ACTIVE_PRESET, applyPreset, getAutoTheme };
}
