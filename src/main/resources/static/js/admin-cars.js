// Admin Cars Management JavaScript

let allCars = [];
let brands = [];
let locations = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadBrandsAndLocations();
    loadCars();
    setupFilters();
});

function checkAdminAuth() {
    const user = localStorage.getItem('currentUser');
    if (!user) { window.location.href = '/auth/login.html'; return; }
    const userData = JSON.parse(user);
    if (!userData.roles || !userData.roles.includes('Admin')) {
        alert('Không có quyền truy cập');
        window.location.href = '/index.html';
        return;
    }
    document.getElementById('adminName').textContent = userData.firstName || 'Admin';
}

async function loadBrandsAndLocations() {
    brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes', 'Mazda', 'Kia', 'Hyundai', 'VinFast'];
    locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang', 'Đà Lạt'];
    populateSelects();
}

function populateSelects() {
    const makeSelect = document.getElementById('carMake');
    const locationSelect = document.getElementById('carLocation');
    const filterBrand = document.getElementById('filterBrand');
    const filterLocation = document.getElementById('filterLocation');

    const generateOptions = (items, defaultText) => {
        return `<option value="">${defaultText}</option>` +
               items.map(item => `<option value="${item}">${item}</option>`).join('');
    };

    if(makeSelect) makeSelect.innerHTML = generateOptions(brands, "Chọn hãng");
    if(filterBrand) filterBrand.innerHTML = generateOptions(brands, "Tất cả hãng");
    if(locationSelect) locationSelect.innerHTML = generateOptions(locations, "Chọn địa điểm");
    if(filterLocation) filterLocation.innerHTML = generateOptions(locations, "Tất cả địa điểm");
}

async function loadCars() {
    const container = document.getElementById('carsTable');
    container.innerHTML = '<div class="loading">Đang tải...</div>';

    // Note: Assuming /api/admin/cars now has a GET mapping (added in Controller step)
    const apiUrl = '/api/admin/cars';

    try {
        const response = await fetch(apiUrl, { credentials: 'include' });
        if (response.ok) {
            allCars = await response.json();
            displayCars(allCars);
        } else {
            console.warn("Admin API failed");
            container.innerHTML = '<p class="empty-state">Không có dữ liệu xe</p>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = `<p class="empty-state">Lỗi: ${error.message}</p>`;
    }
}

function displayCars(cars) {
    const container = document.getElementById('carsTable');
    if (!cars || cars.length === 0) {
        container.innerHTML = '<p class="empty-state">Chưa có xe nào</p>';
        return;
    }

    let html = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th style="width: 50px;">ID</th>
                    <th style="width: 100px;">Ảnh</th>
                    <th>Thông tin xe</th>
                    <th>Thông số</th>
                    <th>Giá thuê</th>
                    <th style="width: 120px;">Thao tác</th>
                </tr>
            </thead>
            <tbody>
    `;

    html += cars.map(car => {
        const makeName = (typeof car.make === 'object' && car.make !== null) ? car.make.name : car.make;
        const locationName = (typeof car.location === 'object' && car.location !== null) ? car.location.name : car.location;
        const imgUrl = car.imageName && car.imageName.startsWith('http') ? car.imageName : (car.imageName || '/images/default-car.png');

        return `
            <tr>
                <td>#${car.id}</td>
                <td>
                    <div class="img-thumbnail-wrapper">
                        <img src="${imgUrl}" alt="Car" onerror="this.src='https://placehold.co/60x40?text=No+Img'">
                    </div>
                </td>
                <td>
                    <div class="fw-bold">${makeName} ${car.model}</div>
                    <div class="text-muted small">${locationName}</div>
                </td>
                <td>
                    <span class="badge bg-light text-dark border">${car.year}</span>
                    <span class="badge bg-light text-dark border">${car.transmission || 'Tự động'}</span>
                    <span class="badge bg-light text-dark border">${car.seats || 4} chỗ</span>
                </td>
                <td class="fw-bold text-primary">
                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(car.amount)}
                </td>
                <td class="actions">
                    <button class="btn-icon edit" onclick="editCar(${car.id})" title="Sửa">✏️</button>
                    <button class="btn-icon delete" onclick="deleteCar(${car.id})" title="Xóa">🗑️</button>
                </td>
            </tr>
        `;
    }).join('');

    html += '</tbody></table>';
    container.innerHTML = html;
}

function setupFilters() {
    const searchInput = document.getElementById('searchCar');
    const filterLoc = document.getElementById('filterLocation');
    const filterBr = document.getElementById('filterBrand');

    const handleFilter = () => {
        const search = searchInput.value.toLowerCase();
        const loc = filterLoc.value;
        const brand = filterBr.value;

        const filtered = allCars.filter(c => {
            const m = ((c.make?.name || c.make) || '').toLowerCase();
            const l = ((c.location?.name || c.location) || '');
            const model = (c.model || '').toLowerCase();
            return (m.includes(search) || model.includes(search)) && (!loc || l === loc) && (!brand || (c.make?.name || c.make) === brand);
        });
        displayCars(filtered);
    };

    if(searchInput) searchInput.addEventListener('input', handleFilter);
    if(filterLoc) filterLoc.addEventListener('change', handleFilter);
    if(filterBr) filterBr.addEventListener('change', handleFilter);
}

function showAddCarModal() {
    document.getElementById('modalTitle').textContent = 'Thêm xe mới';
    document.getElementById('carForm').reset();
    document.getElementById('carId').value = '';

    // Reset defaults for new fields
    document.getElementById('carFuel').value = 'Xăng';
    document.getElementById('carTransmission').value = 'Tự động';
    document.getElementById('carSeats').value = '4';

    document.getElementById('imageFile').value = '';
    document.getElementById('galleryFiles').value = '';
    if(document.getElementById('imageUrl')) document.getElementById('imageUrl').value = '';

    const msgEl = document.getElementById('carMessage');
    msgEl.textContent = '';
    msgEl.className = 'message';

    document.getElementById('carModal').style.display = 'block';
}

function editCar(id) {
    const car = allCars.find(c => c.id === id);
    if (!car) return;

    document.getElementById('modalTitle').textContent = 'Sửa thông tin xe';
    document.getElementById('carId').value = car.id;

    document.getElementById('carMake').value = (typeof car.make === 'object') ? car.make.name : car.make;
    document.getElementById('carModel').value = car.model;
    document.getElementById('carYear').value = car.year;
    document.getElementById('carAmount').value = car.amount;
    document.getElementById('carLocation').value = (typeof car.location === 'object') ? car.location.name : car.location;

    // Populate new fields
    document.getElementById('carFuel').value = car.fuel || 'Xăng';
    document.getElementById('carTransmission').value = car.transmission || 'Tự động';
    document.getElementById('carSeats').value = car.seats || 4;

    if(document.getElementById('imageUrl')) document.getElementById('imageUrl').value = car.imageName || '';

    document.getElementById('imageFile').value = '';
    document.getElementById('galleryFiles').value = '';
    document.getElementById('carMessage').textContent = '';
    document.getElementById('carModal').style.display = 'block';
}

function closeCarModal() {
    document.getElementById('carModal').style.display = 'none';
}

document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageEl = document.getElementById('carMessage');
    const carId = document.getElementById('carId').value;
    const url = carId ? `/api/admin/cars/${carId}` : '/api/admin/cars';
    const method = carId ? 'PUT' : 'POST';

    const formData = new FormData();
    formData.append('make', document.getElementById('carMake').value);
    formData.append('model', document.getElementById('carModel').value);
    formData.append('year', document.getElementById('carYear').value);
    formData.append('amount', document.getElementById('carAmount').value);
    formData.append('location', document.getElementById('carLocation').value);

    // NEW FIELDS
    formData.append('fuel', document.getElementById('carFuel').value);
    formData.append('transmission', document.getElementById('carTransmission').value);
    formData.append('seats', document.getElementById('carSeats').value);

    const fileInput = document.getElementById('imageFile');
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    } else {
        const oldImg = document.getElementById('imageUrl')?.value;
        if(oldImg) formData.append('imageName', oldImg);
    }

    const galleryInput = document.getElementById('galleryFiles');
    if (galleryInput && galleryInput.files.length > 0) {
        Array.from(galleryInput.files).forEach(file => {
            formData.append('gallery', file);
        });
    }

    messageEl.textContent = 'Đang xử lý...';
    messageEl.className = 'message info';
    messageEl.style.color = '#3563E9';

    try {
        const response = await fetch(url, { method: method, credentials: 'include', body: formData });
        if (response.ok) {
            messageEl.textContent = carId ? 'Cập nhật thành công!' : 'Thêm mới thành công!';
            messageEl.className = 'message success';
            messageEl.style.color = 'green';
            setTimeout(() => { closeCarModal(); loadCars(); }, 1000);
        } else {
            const txt = await response.text();
            messageEl.textContent = 'Lỗi: ' + txt;
            messageEl.className = 'message error';
            messageEl.style.color = 'red';
        }
    } catch (error) {
        console.error(error);
        messageEl.textContent = 'Lỗi kết nối';
        messageEl.className = 'message error';
        messageEl.style.color = 'red';
    }
});

async function deleteCar(id) {
    if (!confirm('Bạn có chắc chắn muốn xóa xe này?')) return;
    try {
        const res = await fetch(`/api/admin/cars/${id}`, { method: 'DELETE', credentials: 'include' });
        if(res.ok) { alert("Đã xóa xe thành công"); loadCars(); }
        else { const txt = await res.text(); alert('Lỗi: ' + txt); }
    } catch(e) { console.error(e); alert("Lỗi kết nối"); }
}

function logout() {
    fetch('/api/auth/logout', { credentials: 'include' }).finally(() => {
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
    });
}

window.onclick = function (event) {
    const modal = document.getElementById('carModal');
    if (event.target === modal) closeCarModal();
};