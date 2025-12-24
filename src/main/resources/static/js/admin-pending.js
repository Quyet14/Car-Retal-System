let pendingCars = [];
let selectedCarId = null;

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth(); // Hàm này dùng chung hoặc copy từ admin-cars.js
    loadPendingCars();
});

async function loadPendingCars() {
    const container = document.getElementById('pendingCarsTable');
    container.innerHTML = '<div class="loading">Đang tải...</div>';

    try {
        // Gọi API lấy xe PENDING (Cần thêm API này ở Bước 3)
        const response = await fetch('/api/admin/cars/pending', { credentials: 'include' });
        if (response.ok) {
            pendingCars = await response.json();
            renderTable(pendingCars);
        } else {
            container.innerHTML = '<p class="empty-state">Không có dữ liệu</p>';
        }
    } catch (error) {
        container.innerHTML = `<p class="empty-state">Lỗi: ${error.message}</p>`;
    }
}

function renderTable(cars) {
    const container = document.getElementById('pendingCarsTable');
    if (cars.length === 0) {
        container.innerHTML = '<p class="empty-state">Không có yêu cầu ký gửi nào.</p>';
        return;
    }

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Ảnh</th>
                    <th>Thông tin xe</th>
                    <th>Người gửi</th>
                    <th>Giá đề xuất</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
    `;

    html += cars.map(car => `
        <tr>
            <td>#${car.id}</td>
            <td><img src="${car.imageName}" style="width:60px; height:40px; object-fit:cover; border-radius:4px;"></td>
            <td><strong>${car.make.name} ${car.model}</strong><br><small>${car.year}</small></td>
            <td>${car.ownerName || 'null'}</td>
            <td class="fw-bold text-primary">${new Intl.NumberFormat('vi-VN').format(car.amount)}đ</td>
            <td>
                <button class="btn btn-sm btn-success" onclick="approveCar(${car.id})">✔ Duyệt</button>
                <button class="btn btn-sm btn-danger" onclick="rejectCar(${car.id})">✖ Hủy</button>
            </td>
        </tr>
    `).join('');

    html += '</tbody></table>';
    container.innerHTML = html;
}

// Hàm Duyệt xe
async function approveCar(id) {
    if(!confirm("Bạn có chắc chắn muốn duyệt xe này lên sàn?")) return;
    updateStatus(id, 'AVAILABLE');
}

// Hàm Từ chối
async function rejectCar(id) {
    if(!confirm("Bạn có chắc chắn muốn từ chối yêu cầu này?")) return;
    updateStatus(id, 'REJECTED');
}

async function updateStatus(id, status) {
    try {
        const res = await fetch(`/api/admin/cars/${id}/status?status=${status}`, {
            method: 'PUT',
            credentials: 'include'
        });
        if(res.ok) {
            alert("Thành công!");
            loadPendingCars();
        } else {
            alert("Lỗi cập nhật trạng thái");
        }
    } catch(e) { console.error(e); alert("Lỗi kết nối"); }
}

// (Copy thêm hàm checkAdminAuth và logout từ file cũ vào đây)
function checkAdminAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        window.location.href = '/auth/login.html';
        return;
    }
    const userData = JSON.parse(user);
    if (!userData.roles || !userData.roles.includes('Admin')) {
        alert('Không có quyền truy cập');
        window.location.href = '/index.html';
        return;
    }
    const adminNameEl = document.getElementById('adminName');
    if(adminNameEl) {
        adminNameEl.textContent = userData.firstName || 'Admin';
    }
}

function logout() {
    fetch('/api/auth/logout', { credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });
}

function closeDetailModal() {
    document.getElementById('detailModal').style.display = 'none';
}
window.onclick = function(event) {
    const modal = document.getElementById('detailModal');
    if (event.target == modal) {
        closeDetailModal();
    }
}