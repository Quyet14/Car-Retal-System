// Profile Page JavaScript - Fixed

const API_URL = '';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check Auth & Load Cached Data
    const userStr = localStorage.getItem('currentUser');

    if (!userStr) {
        window.location.href = '/auth/login.html';
        return;
    }

    try {
        // Attempt to parse and display cached data immediately
        const user = JSON.parse(userStr);
        if (user && typeof user === 'object') {
            displayProfile(user);
        }
    } catch (e) {
        console.error("Local storage data corrupt, clearing...", e);
        localStorage.removeItem('currentUser');
        window.location.href = '/auth/login.html';
        return;
    }

    // 2. Fetch Fresh Data (Background Update)
    loadProfile();
    setupNavigation();
});

async function loadProfile() {
    try {
        const response = await fetch(`${API_URL}/api/auth/profile`, {
            credentials: 'include'
        });

        if (response.ok) {
            const user = await response.json();
            // Update Local Storage with fresh data
            localStorage.setItem('currentUser', JSON.stringify(user));
            // Update UI
            displayProfile(user);
        } else {
            // If session expired (401), redirect
            if (response.status === 401) {
                localStorage.removeItem('currentUser');
                window.location.href = '/auth/login.html';
            }
        }
    } catch (error) {
        console.error('Load profile error:', error);
        // If API fails, we still have the cached data displayed from step 1
    }
}

function displayProfile(user) {
    if (!user) return;

    // Helper to safe check values
    const safeStr = (str) => str || '';

    // Update navbar
    const userNameEl = document.getElementById('userName');
    if (userNameEl) userNameEl.textContent = `${safeStr(user.firstName)} ${safeStr(user.lastName)}`;

    // Update avatar
    const avatarEl = document.getElementById('avatarInitials');
    if (avatarEl) {
        const first = user.firstName ? user.firstName[0] : '';
        const last = user.lastName ? user.lastName[0] : '';
        const emailInitial = user.email ? user.email[0] : 'U';
        avatarEl.textContent = (first + last).toUpperCase() || emailInitial.toUpperCase();
    }

    // Update profile info sidebar
    const profileNameEl = document.getElementById('profileName');
    if (profileNameEl) profileNameEl.textContent = `${safeStr(user.firstName)} ${safeStr(user.lastName)}`;

    const profileEmailEl = document.getElementById('profileEmail');
    if (profileEmailEl) profileEmailEl.textContent = safeStr(user.email);

    // Fill form
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput) firstNameInput.value = safeStr(user.firstName);

    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput) lastNameInput.value = safeStr(user.lastName);

    const emailInput = document.getElementById('email');
    if (emailInput) emailInput.value = safeStr(user.email);

    const countryInput = document.getElementById('country');
    if (countryInput && user.country) countryInput.value = user.country;
}

// --- TABS & NAVIGATION ---
function setupNavigation() {
    // Listen to tab changes to load data when needed
    const reservationTab = document.getElementById('v-pills-reservations-tab');
    if (reservationTab) {
        reservationTab.addEventListener('shown.bs.tab', () => {
            loadReservations();
        });
    }

    // Check URL Hash to open tab directly (e.g. profile.html#reservations)
    const hash = window.location.hash;
    if (hash === '#reservations') {
        const trigger = document.querySelector('button[data-bs-target="#reservations"]');
        if(trigger) bootstrap.Tab.getOrCreateInstance(trigger).show();
    }
}

// --- RESERVATIONS LOGIC ---
async function loadReservations() {
    const container = document.getElementById('reservationsList');
    if (!container) return;

    // Show Loading
    container.innerHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary spinner-border-sm" role="status"></div>
            <p class="mt-2 small text-muted">Đang tải lịch sử...</p>
        </div>`;

    try {
        const response = await fetch('/api/reservations', { credentials: 'include' });

        if (response.ok) {
            const bookings = await response.json();
            renderBookings(bookings, container);
        } else if (response.status === 401) {
            // Nếu chưa đăng nhập
            container.innerHTML = `<div class="alert alert-warning small">Vui lòng đăng nhập để xem đơn đặt xe.</div>`;
        } else {
            // Mock Data nếu API chưa sẵn sàng (để bạn xem giao diện)
            console.warn("API chưa có, dùng dữ liệu mẫu.");
            const mockData = [
                { id: 1, carName: "Mercedes-Benz C300", startDate: "2023-12-01", endDate: "2023-12-03", totalPrice: 3000000, status: "CONFIRMED", carImage: "https://via.placeholder.com/150", pickupLocation: "TP.HCM" },
                { id: 2, carName: "Mazda 3 Luxury", startDate: "2023-11-15", endDate: "2023-11-16", totalPrice: 1200000, status: "COMPLETED", carImage: "https://via.placeholder.com/150", pickupLocation: "Hà Nội" }
            ];
            renderBookings(mockData, container);
        }
    } catch (error) {
        console.error("Lỗi load đơn:", error);
        container.innerHTML = '<div class="alert alert-danger small">Không thể tải danh sách đơn hàng.</div>';
    }
}

function renderBookings(bookings, container) {
    if (!bookings || bookings.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-folder-open fa-3x text-muted mb-3"></i>
                <p class="text-muted">Bạn chưa có chuyến đi nào.</p>
                <a href="/cars/cars.html" class="btn btn-primary-custom btn-sm">Đặt xe ngay</a>
            </div>`;
        return;
    }

    container.innerHTML = bookings.map(item => {
        // Class cho status badge
        // Determine status code and labels
        const code = item.statusCode || (item.status ? item.status.toUpperCase() : '');
        let statusClass = 'status-pending';
        let statusLabel = item.status || '';
        if (code === 'CONFIRMED') { statusClass = 'status-confirmed'; statusLabel = item.status || 'Đã xác nhận'; }
        else if (code === 'COMPLETED') { statusClass = 'status-completed'; statusLabel = item.status || 'Hoàn thành'; }
        else if (code === 'CANCELLED') { statusClass = 'status-cancelled'; statusLabel = item.status || 'Đã hủy'; }
        else { statusLabel = item.status || 'Đang xử lý'; }

        // Format
        const dateStart = new Date(item.startDate).toLocaleDateString('vi-VN');
        const dateEnd = new Date(item.endDate).toLocaleDateString('vi-VN');
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.totalPrice);
        const img = item.carImage || 'https://via.placeholder.com/200x150?text=Car';

        return `
        <div class="reservation-card">
            <div class="row align-items-center">
                <div class="col-md-3 mb-3 mb-md-0">
                    <img src="${img}" class="res-car-img w-100" alt="Xe">
                </div>
                <div class="col-md-6 mb-3 mb-md-0 res-info">
                    <h5>${item.carName}</h5>
                    <div class="detail-row mb-1">
                        <span><i class="far fa-calendar-alt me-2 text-primary"></i>Ngày thuê:</span>
                        <span>${dateStart} - ${dateEnd}</span>
                    </div>
                    <div class="detail-row mb-1">
                        <span><i class="fas fa-map-marker-alt me-2 text-danger"></i>Nhận xe:</span>
                        <span>${item.pickupLocation || 'Showroom'}</span>
                    </div>
                    <div class="mt-2">
                        <span class="status-badge ${statusClass}">${statusLabel}</span>
                    </div>
                </div>
                <div class="col-md-3 text-md-end border-start-md ps-md-4">
                    <div class="text-muted small mb-1">Tổng cộng</div>
                    <div class="fs-5 fw-bold text-primary mb-3">${price}</div>
                    <button class="btn btn-outline-secondary btn-sm w-100 mb-2" onclick="window.location.href='/profile/reservation-detail.html?id=${item.id}'">Chi tiết</button>
                    ${code === 'PENDING' || code === 'CONFIRMED' ?
                        `<button class="btn btn-outline-danger btn-sm w-100" onclick="cancelBooking(${item.id})">Hủy đơn</button>` : ''}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

async function cancelBooking(id) {
    if(!confirm("Bạn có chắc muốn hủy đơn này?")) return;
    try {
        const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE', credentials: 'include' });
        if(res.ok) {
            alert("Đã hủy thành công!");
            loadReservations(); // Reload lại list
        } else {
            alert("Không thể hủy đơn này.");
        }
    } catch(e) {
        alert("Lỗi kết nối.");
    }
}

// --- FORMS ---
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const msg = document.getElementById('updateMessage');
        const btn = e.target.querySelector('button[type="submit"]');

        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang lưu...';

        const formData = new FormData(e.target);
        const data = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            country: formData.get('country')
        };

        try {
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (res.ok) {
                // Update Local & UI
                const current = JSON.parse(localStorage.getItem('currentUser'));
                const updated = { ...current, ...data };
                localStorage.setItem('currentUser', JSON.stringify(updated));
                displayProfile(updated);

                msg.className = 'alert alert-success mt-3 small';
                msg.textContent = 'Cập nhật thành công!';
                msg.classList.remove('d-none');
            } else {
                throw new Error();
            }
        } catch (error) {
            msg.className = 'alert alert-danger mt-3 small';
            msg.textContent = 'Lỗi cập nhật.';
            msg.classList.remove('d-none');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Lưu thay đổi';
            setTimeout(() => msg.classList.add('d-none'), 3000);
        }
    });
}

const passForm = document.getElementById('passwordForm');
if (passForm) {
    passForm.addEventListener('submit', (e) => {
        e.preventDefault();
        alert("Chức năng đổi mật khẩu đang bảo trì (Demo).");
    });
}

function logout() {
    fetch(`${API_URL}/api/auth/logout`, { credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });
}