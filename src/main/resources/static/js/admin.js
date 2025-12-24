// Admin Dashboard JavaScript

// Safety: Remove duplicate admin navs if present (keeps only the first)
document.addEventListener('DOMContentLoaded', () => {
    const navs = document.querySelectorAll('nav.admin-navbar');
    if (navs && navs.length > 1) {
        navs.forEach((n, idx) => {
            if (idx > 0) n.remove();
        });
    }

    checkAdminAuth();
    loadDashboardStats();
    loadRecentReservations();
});

function checkAdminAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        alert('Vui lòng đăng nhập để truy cập trang này');
        window.location.href = '/auth/login.html';
        return;
    }

    const userData = JSON.parse(user);

    // Check if user has Admin role
    if (!userData.roles || !userData.roles.includes('Admin')) {
        alert('Bạn không có quyền truy cập trang này');
        window.location.href = '/index.html';
        return;
    }

    if (document.getElementById('adminName')) {
        document.getElementById('adminName').textContent = `${userData.firstName} ${userData.lastName}`;
    }
}

async function loadDashboardStats() {
    // Load all stats in parallel where possible
    try {
        // Parallel fetches
        const [carsRes, reservationsRes, pendingRes, usersRes] = await Promise.allSettled([
            fetch('/api/cars', { credentials: 'include' }),
            fetch('/api/reservations/all', { credentials: 'include' }),
            fetch('/api/admin/cars/pending', { credentials: 'include' }),
            fetch('/api/admin/users', { credentials: 'include' })
        ]);

        // Helper: safe length for responses that should be arrays
        const safeLength = (x) => Array.isArray(x) ? x.length : 0;

        // Cars
        if (carsRes.status === 'fulfilled' && carsRes.value.ok) {
            const cars = await carsRes.value.json();
            const el = document.getElementById('totalCars');
            if (el) {
                if (Array.isArray(cars)) {
                    el.textContent = cars.length;
                } else {
                    console.warn('/api/cars returned unexpected payload:', cars);
                    el.textContent = '0';
                }
            }
        } else {
            const el = document.getElementById('totalCars'); if (el) el.textContent = '-';
        }

        // Reservations + revenue
        if (reservationsRes.status === 'fulfilled' && reservationsRes.value.ok) {
            const reservations = await reservationsRes.value.json();
            const elCount = document.getElementById('totalReservations');
            const elRev = document.getElementById('totalRevenue');

            if (Array.isArray(reservations)) {
                if (elCount) elCount.textContent = reservations.length;
                const revenue = reservations.reduce((s, r) => s + (r.totalPrice || 0), 0);
                if (elRev) elRev.textContent = formatPrice(revenue);
            } else {
                console.warn('/api/reservations/all returned unexpected payload:', reservations);
                if (elCount) elCount.textContent = '0';
                if (elRev) elRev.textContent = '0';
            }
        } else {
            const elCount = document.getElementById('totalReservations'); if (elCount) elCount.textContent = '-';
            const elRev = document.getElementById('totalRevenue'); if (elRev) elRev.textContent = '-';
        }

        // Pending
        if (pendingRes.status === 'fulfilled' && pendingRes.value.ok) {
            const pending = await pendingRes.value.json();
            const el = document.getElementById('totalPending');
            const badge = document.getElementById('navPendingBadge');
            if (Array.isArray(pending)) {
                if (el) el.textContent = pending.length;
                if (badge) { badge.innerText = pending.length; badge.style.display = pending.length > 0 ? 'inline-block' : 'none'; }
            } else {
                console.warn('/api/admin/cars/pending returned unexpected payload:', pending);
                if (el) el.textContent = '0';
                if (badge) { badge.innerText = '0'; badge.style.display = 'none'; }
            }
        } else {
            const el = document.getElementById('totalPending'); if (el) el.textContent = '0';
        }

        // Users
        if (usersRes.status === 'fulfilled' && usersRes.value.ok) {
            const users = await usersRes.value.json();
            const el = document.getElementById('totalUsers');
            if (Array.isArray(users)) {
                if (el) el.textContent = users.length;
            } else {
                console.warn('/api/admin/users returned unexpected payload:', users);
                if (el) el.textContent = '0';
            }
        } else {
            const el = document.getElementById('totalUsers'); if (el) el.textContent = '-';
        }

    } catch (err) {
        console.error('Error loading dashboard stats:', err);
    }
}

async function loadRecentReservations() {
    const container = document.getElementById('recentReservations');
    if (!container) return;

    try {
        const response = await fetch('/api/reservations/all', { credentials: 'include' });

        if (!response.ok) {
            container.innerHTML = '<p class="empty-state">Không thể tải dữ liệu</p>';
            return;
        }

        const reservations = await response.json();
        if (!reservations || reservations.length === 0) {
            container.innerHTML = '<p class="empty-state">Chưa có đơn thuê xe nào</p>';
            return;
        }

        const recent = reservations.slice(0, 5);

        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Khách hàng</th>
                        <th>Xe</th>
                        <th>Ngày thuê</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(r => `
                        <tr>
                            <td>#${r.id}</td>
                            <td>${r.fullName}</td>
                            <td>${r.carName}</td>
                            <td>${formatDate(r.startDate)}</td>
                            <td>${formatPrice(r.totalPrice)}</td>
                            <td><span class="status-badge status-${getStatusClass(r.status)}">${r.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        console.error('Error loading reservations:', error);
        container.innerHTML = '<p class="empty-state">Có lỗi xảy ra</p>';
    }
}

function getStatusClass(status) {
    const map = {
        'Đang xử lý': 'pending',
        'Đã xác nhận': 'confirmed',
        'Đã hủy': 'cancelled',
        'Hoàn thành': 'completed'
    };
    return map[status] || 'pending';
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
}

function logout() {
    fetch('/api/auth/logout', { credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });
}
