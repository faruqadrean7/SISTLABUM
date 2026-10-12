// SISTLABUM Global App Controller & Interactive Utilities

const App = {
    // 1. Toast Notification System
    toast(message, type = 'success', duration = 3500) {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            document.body.appendChild(container);
        }

        const icons = {
            success: '✅',
            warning: '⚠️',
            error: '🛑',
            info: 'ℹ️'
        };

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span style="font-size: 18px;">${icons[type] || 'ℹ️'}</span>
            <div style="flex-grow: 1;">${message}</div>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    // 2. Modal Controller
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.add('active');
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.classList.remove('active');
    },

    // 3. Format Tanggal Indonesia
    formatDate(dateStr) {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    },

    // 4. Injeksi Floating Prototype Navigator (Memudahkan Demo & Peninjauan)
    injectRoleSwitcher(activeKey) {
        if (document.querySelector('.role-switcher-bar')) return;

        const nav = document.createElement('div');
        nav.className = 'role-switcher-bar';
        nav.innerHTML = `
            <span style="font-size: 11px; font-weight: 800; color: #64748B; text-transform: uppercase; margin-right: 4px; letter-spacing: 0.05em;">PROTOTYPE:</span>
            <a href="/" class="role-switcher-btn ${activeKey === 'public' ? 'active' : ''}">🌐 Publik</a>
            <a href="/masuk.html" class="role-switcher-btn ${activeKey === 'login' ? 'active' : ''}">🔑 Masuk SSO</a>
            <a href="/ppdb.html" class="role-switcher-btn ${activeKey === 'ppdb' ? 'active' : ''}">📋 PPDB</a>
            <a href="/siswa/" class="role-switcher-btn ${activeKey === 'siswa' ? 'active' : ''}">🎓 Siswa</a>
            <a href="/siswa/cbt.html" class="role-switcher-btn ${activeKey === 'cbt' ? 'active' : ''}">📝 CBT Lab</a>
            <a href="/ortu/" class="role-switcher-btn ${activeKey === 'ortu' ? 'active' : ''}">👨‍👩‍👧 Ortu</a>
            <a href="/admin/" class="role-switcher-btn ${activeKey === 'admin' ? 'active' : ''}">👨‍🏫 Admin TU</a>
        `;
        document.body.appendChild(nav);
    }
};

window.App = App;
