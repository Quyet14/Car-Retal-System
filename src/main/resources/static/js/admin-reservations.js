// Admin Reservations Management JavaScript

let allReservations = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadReservations();
    setupFilters();
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

async function loadReservations() {
    const container = document.getElementById('reservationsTable');
    container.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        // Try to load all reservations (admin endpoint)
        let response = await fetch('/api/reservations/all', { credentials: 'include' });
        
        // Fallback to user reservations if admin endpoint doesn't exist
        if (!response.ok) {
            response = await fetch('/api/reservations', { credentials: 'include' });
        }
        
        if (!response.ok) {
            container.innerHTML = '<p class="empty-state">Không thể tải dữ liệu</p>';
            return;
        }

        allReservations = await response.json();
        displayReservations(allReservations);
    } catch (error) {
        console.error('Error loading reservations:', error);
        container.innerHTML = '<p class="empty-state">Có lỗi xảy ra</p>';
    }
}

function displayReservations(reservations) {
    const container = document.getElementById('reservationsTable');
    
    if (reservations.length === 0) {
        container.innerHTML = '<p class="empty-state">Chưa có đơn thuê xe nào</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Khách hàng</th>
                    <th>Xe</th>
                    <th>Ngày thuê</th>
                    <th>Số ngày</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map(r => `
                    <tr>
                        <td>#${r.id}</td>
                        <td>
                            <div>${r.fullName}</div>
                            <small style="color: var(--text-secondary);">${r.phone}</small>
                        </td>
                        <td>${r.carName}</td>
                        <td>
                            <div>${formatDate(r.startDate)}</div>
                            <small style="color: var(--text-secondary);">đến ${formatDate(r.endDate)}</small>
                        </td>
                        <td>${r.days} ngày</td>
                        <td>${formatPrice(r.totalPrice)}</td>
                        <td><span class="status-badge status-${getStatusClass(r.status)}">${r.status}</span></td>
                        <td class="actions">
                            <button class="btn-icon btn-view" onclick="viewReservation(${r.id})" title="Xem chi tiết">👁️</button>
                            ${r.status === 'Đang xử lý' ? `
                                <button class="btn-icon btn-edit" onclick="confirmReservation(${r.id})" title="Xác nhận">✅</button>
                                <button class="btn-icon btn-delete" onclick="cancelReservation(${r.id})" title="Hủy">❌</button>
                            ` : ''}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function setupFilters() {
    document.getElementById('searchReservation').addEventListener('input', filterReservations);
}

function filterReservations() {
    const search = document.getElementById('searchReservation').value.toLowerCase();
    const status = document.getElementById('filterStatus').value;
    
    let filtered = allReservations.filter(r => {
        const matchSearch = r.fullName.toLowerCase().includes(search) || 
                          r.phone.includes(search) ||
                          r.email.toLowerCase().includes(search);
        const matchStatus = !status || getStatusEnum(r.status) === status;
        
        return matchSearch && matchStatus;
    });
    
    displayReservations(filtered);
}

function getStatusEnum(statusText) {
    const map = {
        'Đang xử lý': 'PENDING',
        'Đã xác nhận': 'CONFIRMED',
        'Đã hủy': 'CANCELLED',
        'Hoàn thành': 'COMPLETED'
    };
    return map[statusText];
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

function viewReservation(id) {
    const reservation = allReservations.find(r => r.id === id);
    if (!reservation) return;
    
    const content = `
        <h2>Chi tiết đơn thuê xe #${reservation.id}</h2>
        
        <h3 style="margin-top: 2rem;">Thông tin xe</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Xe</label>
                <span>${reservation.carName}</span>
            </div>
            <div class="detail-item">
                <label>Giá thuê</label>
                <span>${formatPrice(reservation.dailyRate)}/ngày</span>
            </div>
        </div>
        
        <h3 style="margin-top: 2rem;">Thông tin thuê</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Ngày nhận xe</label>
                <span>${formatDateTime(reservation.startDate)}</span>
            </div>
            <div class="detail-item">
                <label>Ngày trả xe</label>
                <span>${formatDateTime(reservation.endDate)}</span>
            </div>
            <div class="detail-item">
                <label>Số ngày thuê</label>
                <span>${reservation.days} ngày</span>
            </div>
            <div class="detail-item">
                <label>Địa điểm nhận</label>
                <span>${reservation.pickupLocation || 'Chưa xác định'}</span>
            </div>
        </div>
        
        <h3 style="margin-top: 2rem;">Thông tin khách hàng</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Họ tên</label>
                <span>${reservation.fullName}</span>
            </div>
            <div class="detail-item">
                <label>Số điện thoại</label>
                <span>${reservation.phone}</span>
            </div>
            <div class="detail-item">
                <label>Email</label>
                <span>${reservation.email}</span>
            </div>
            <div class="detail-item">
                <label>Trạng thái</label>
                <span class="status-badge status-${getStatusClass(reservation.status)}">${reservation.status}</span>
            </div>
        </div>
        
        ${reservation.notes ? `
            <h3 style="margin-top: 2rem;">Ghi chú</h3>
            <div class="detail-item">
                <span>${reservation.notes}</span>
            </div>
        ` : ''}
        
        <h3 style="margin-top: 2rem;">Thanh toán</h3>
        <div class="detail-grid">
            <div class="detail-item">
                <label>Tổng tiền</label>
                <span style="font-size: 1.5rem; color: var(--primary-color); font-weight: bold;">${formatPrice(reservation.totalPrice)}</span>
            </div>
            <div class="detail-item">
                <label>Ngày đặt</label>
                <span>${formatDateTime(reservation.createdAt)}</span>
            </div>
        </div>
        
        <div style="margin-top: 2rem; display: flex; gap: 1rem; justify-content: flex-end;">
            ${reservation.status === 'Đang xử lý' ? `
                <button class="btn btn-primary" onclick="confirmReservation(${reservation.id}); closeReservationModal();">Xác nhận đơn</button>
                <button class="btn btn-outline" onclick="cancelReservation(${reservation.id}); closeReservationModal();">Hủy đơn</button>
            ` : ''}
            <button class="btn btn-outline" onclick="closeReservationModal()">Đóng</button>
        </div>
    `;
    
    document.getElementById('reservationDetail').innerHTML = content;
    document.getElementById('reservationModal').style.display = 'block';
}

async function confirmReservation(id) {
    if (!confirm('Xác nhận đơn thuê xe này?')) return;
    
    try {
        const response = await fetch(`/api/reservations/${id}/confirm`, {
            method: 'PUT',
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Đã xác nhận đơn thuê xe');
            loadReservations();
            closeReservationModal();
        } else {
            alert('Không thể xác nhận đơn thuê xe');
        }
    } catch (error) {
        console.error('Error confirming reservation:', error);
        alert('Có lỗi xảy ra');
    }
}

async function cancelReservation(id) {
    if (!confirm('Hủy đơn thuê xe này?')) return;
    
    try {
        const response = await fetch(`/api/reservations/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Đã hủy đơn thuê xe');
            loadReservations();
        } else {
            alert('Không thể hủy đơn thuê xe');
        }
    } catch (error) {
        console.error('Error cancelling reservation:', error);
        alert('Có lỗi xảy ra');
    }
}

function closeReservationModal() {
    document.getElementById('reservationModal').style.display = 'none';
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

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN');
}

function logout() {
    fetch('/api/auth/logout', { credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('reservationModal');
    if (event.target === modal) {
        closeReservationModal();
    }
}
