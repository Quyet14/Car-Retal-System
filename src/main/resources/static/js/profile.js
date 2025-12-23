// Profile Page JavaScript

const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadProfile();
    setupNavigation();
});

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = '/auth/login.html';
        return;
    }
}

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            displayProfile(user);
        } else {
            window.location.href = '/auth/login.html';
        }
    } catch (error) {
        console.error('Load profile error:', error);
    }
}

function displayProfile(user) {
    // Update navbar
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;

    // Update avatar
    const initials = `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    document.getElementById('avatarInitials').textContent = initials;

    // Update profile info
    document.getElementById('profileName').textContent = `${user.firstName} ${user.lastName}`;
    document.getElementById('profileEmail').textContent = user.email;

    // Fill form
    document.getElementById('firstName').value = user.firstName;
    document.getElementById('lastName').value = user.lastName;
    document.getElementById('email').value = user.email;
    document.getElementById('country').value = user.country;
}

// Profile Form
document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        email: formData.get('email'),
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        country: formData.get('country'),
        password: '' // Empty password means no change
    };

    try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            showMessage('updateMessage', 'Cập nhật thông tin thành công!');
            // Update localStorage
            const updatedUser = await fetch(`${API_URL}/api/auth/profile`, {
                credentials: 'include'
            }).then(r => r.json());
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            displayProfile(updatedUser);
        } else {
            alert('Cập nhật thất bại');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        alert('Có lỗi xảy ra');
    }
});

// Password Form
document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const currentPassword = formData.get('currentPassword');
    const newPassword = formData.get('newPassword');
    const confirmPassword = formData.get('confirmPassword');

    if (!currentPassword) {
        alert('Vui lòng nhập mật khẩu hiện tại');
        return;
    }

    if (newPassword.length < 8) {
        alert('Mật khẩu mới phải có ít nhất 8 ký tự');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
    }

    try {
        // Get current user info
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        
        const data = {
            email: currentUser.email,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            country: currentUser.country,
            currentPassword: currentPassword, // Gửi mật khẩu hiện tại
            password: newPassword
        };

        const response = await fetch(`${API_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
            localStorage.removeItem('currentUser');
            window.location.href = '/auth/login.html';
        } else {
            const error = await response.text();
            alert('Đổi mật khẩu thất bại: ' + error);
        }
    } catch (error) {
        console.error('Change password error:', error);
        alert('Có lỗi xảy ra');
    }
});

// Navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('.profile-nav-link');
    const sections = document.querySelectorAll('.profile-section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update active states
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));

            link.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // Load reservations when clicking on that tab
            if (targetId === 'reservations') {
                loadReservations();
            }
        });
    });

    // Check if URL has hash for reservations
    if (window.location.hash === '#reservations') {
        document.querySelector('a[href="#reservations"]').click();
    }
}

// Load and display reservations
async function loadReservations() {
    const reservationsList = document.getElementById('reservationsList');
    reservationsList.innerHTML = '<div class="loading">Đang tải...</div>';

    try {
        const response = await fetch('/api/reservations', {
            credentials: 'include'
        });

        if (!response.ok) {
            reservationsList.innerHTML = '<p class="empty-state">Không thể tải danh sách đơn thuê xe</p>';
            return;
        }

        const bookings = await response.json();

        if (bookings.length === 0) {
            reservationsList.innerHTML = '<p class="empty-state">Bạn chưa có đơn thuê xe nào</p>';
            return;
        }

        // Sort by newest first (already sorted from backend)
        // bookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        reservationsList.innerHTML = bookings.map(booking => {
            const startDate = new Date(booking.startDate);
            const endDate = new Date(booking.endDate);
            const createdAt = new Date(booking.createdAt);
            
            return `
            <div class="reservation-card">
                <div class="reservation-header">
                    <div class="reservation-car">
                        <img src="${booking.carImage}" alt="${booking.carName}">
                        <div>
                            <h4>${booking.carName}</h4>
                            <span class="status-badge status-${booking.status === 'Đang xử lý' ? 'pending' : 'confirmed'}">
                                ${booking.status}
                            </span>
                        </div>
                    </div>
                    <div class="reservation-price">
                        ${formatPrice(booking.totalPrice)}
                    </div>
                </div>
                <div class="reservation-details">
                    <div class="detail-row">
                        <span>📅 Ngày thuê:</span>
                        <span>${formatDate(startDate)} - ${formatDate(endDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span>📍 Địa điểm nhận:</span>
                        <span>${booking.pickupLocation || 'Chưa xác định'}</span>
                    </div>
                    <div class="detail-row">
                        <span>⏱️ Số ngày:</span>
                        <span>${booking.days} ngày</span>
                    </div>
                    <div class="detail-row">
                        <span>📞 Liên hệ:</span>
                        <span>${booking.phone}</span>
                    </div>
                    <div class="detail-row">
                        <span>🕐 Đặt lúc:</span>
                        <span>${formatDateTime(createdAt)}</span>
                    </div>
                    ${booking.notes ? `
                    <div class="detail-row">
                        <span>📝 Ghi chú:</span>
                        <span>${booking.notes}</span>
                    </div>
                    ` : ''}
                </div>
                <div class="reservation-actions">
                    <button class="btn btn-outline btn-sm" onclick="viewBookingDetail(${booking.id})">Chi tiết</button>
                    <button class="btn btn-outline btn-sm" onclick="cancelBooking(${booking.id})">Hủy đơn</button>
                </div>
            </div>
        `;
        }).join('');
    } catch (error) {
        console.error('Error loading reservations:', error);
        reservationsList.innerHTML = '<p class="empty-state">Có lỗi xảy ra khi tải danh sách đơn thuê xe</p>';
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

function formatDate(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleDateString('vi-VN');
}

function formatDateTime(date) {
    if (typeof date === 'string') {
        date = new Date(date);
    }
    return date.toLocaleString('vi-VN');
}

function viewBookingDetail(bookingId) {
    const bookings = JSON.parse(localStorage.getItem('userBookings') || '[]');
    const booking = bookings.find(b => b.id === bookingId);
    if (booking) {
        alert(`Chi tiết đơn thuê xe:\n\nXe: ${booking.carName}\nNgày: ${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}\nTổng tiền: ${formatPrice(booking.totalPrice)}\nTrạng thái: ${booking.status}`);
    }
}

async function cancelBooking(bookingId) {
    if (!confirm('Bạn có chắc muốn hủy đơn thuê xe này?')) {
        return;
    }

    try {
        const response = await fetch(`/api/reservations/${bookingId}`, {
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
        console.error('Error cancelling booking:', error);
        alert('Có lỗi xảy ra');
    }
}

function showMessage(elementId, message) {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 3000);
}

function logout() {
    fetch(`${API_URL}/api/auth/logout`, {
        credentials: 'include'
    }).finally(() => {
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
    });
}
