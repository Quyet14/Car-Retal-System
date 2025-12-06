// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
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
    
    document.getElementById('adminName').textContent = `${userData.firstName} ${userData.lastName}`;
}

async function loadDashboardStats() {
    try {
        // Load cars count
        const carsResponse = await fetch('/api/cars', { credentials: 'include' });
        if (carsResponse.ok) {
            const cars = await carsResponse.json();
            document.getElementById('totalCars').textContent = cars.length;
        }

        // Load reservations count
        const reservationsResponse = await fetch('/api/reservations/all', { credentials: 'include' });
        if (reservationsResponse.ok) {
            const reservations = await reservationsResponse.json();
            document.getElementById('totalReservations').textContent = reservations.length;
            
            // Calculate revenue
            const revenue = reservations.reduce((sum, r) => sum + (r.totalPrice || 0), 0);
            document.getElementById('totalRevenue').textContent = formatPrice(revenue);
        } else {
            // Fallback if endpoint doesn't exist
            document.getElementById('totalReservations').textContent = '-';
            document.getElementById('totalRevenue').textContent = '-';
        }

        // Users count (mock for now)
        document.getElementById('totalUsers').textContent = '-';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadRecentReservations() {
    const container = document.getElementById('recentReservations');
    
    try {
        const response = await fetch('/api/reservations/all', { credentials: 'include' });
        
        if (!response.ok) {
            container.innerHTML = '<p class="empty-state">Không thể tải dữ liệu</p>';
            return;
        }

        const reservations = await response.json();
        
        if (reservations.length === 0) {
            container.innerHTML = '<p class="empty-state">Chưa có đơn thuê xe nào</p>';
            return;
        }

        // Show only 5 most recent
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
