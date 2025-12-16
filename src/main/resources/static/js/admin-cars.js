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

// 1. AUTH & INIT
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
    document.getElementById('adminName').textContent = userData.firstName || 'Admin';
}

async function loadBrandsAndLocations() {
    // Giữ nguyên logic cũ của bạn (Fetch hoặc Mock data)
    try {
        const brandsRes = await fetch('/api/admin/brands', {credentials: 'include'});
        if(brandsRes.ok) {
            const data = await brandsRes.json();
            brands = data.map(b => b.name);
        }
        const locRes = await fetch('/api/admin/locations', {credentials: 'include'});
        if(locRes.ok) {
             const data = await locRes.json();
             locations = data.map(l => l.name);
        }
    } catch(e) { console.error(e); }

    // Fallback data nếu API lỗi
    if(brands.length === 0) brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes'];
    if(locations.length === 0) locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];

    populateSelects();
}

function populateSelects() {
    const makeSelect = document.getElementById('carMake');
    const locationSelect = document.getElementById('carLocation');
    const filterBrand = document.getElementById('filterBrand');
    const filterLocation = document.getElementById('filterLocation');

    if(makeSelect) {
        makeSelect.innerHTML = '<option value="">Chọn hãng</option>';
        brands.forEach(b => makeSelect.innerHTML += `<option value="${b}">${b}</option>`);
    }
    if(filterBrand) {
        filterBrand.innerHTML = '<option value="">Tất cả hãng</option>';
        brands.forEach(b => filterBrand.innerHTML += `<option value="${b}">${b}</option>`);
    }

    if(locationSelect) {
        locationSelect.innerHTML = '<option value="">Chọn địa điểm</option>';
        locations.forEach(l => locationSelect.innerHTML += `<option value="${l}">${l}</option>`);
    }
    if(filterLocation) {
        filterLocation.innerHTML = '<option value="">Tất cả địa điểm</option>';
        locations.forEach(l => filterLocation.innerHTML += `<option value="${l}">${l}</option>`);
    }
}

// 2. LOAD CARS
async function loadCars() {
    const container = document.getElementById('carsTable');
    container.innerHTML = '<div class="loading">Đang tải...</div>';
    try {
        const response = await fetch('/api/cars', { credentials: 'include' });
        if (response.ok) {
            allCars = await response.json();
            displayCars(allCars);
        } else {
            container.innerHTML = '<p class="empty-state">Lỗi tải dữ liệu</p>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="empty-state">Không thể kết nối Server</p>';
    }
}

function displayCars(cars) {
    const container = document.getElementById('carsTable');
    if (cars.length === 0) {
        container.innerHTML = '<p class="empty-state">Chưa có xe nào</p>';
        return;
    }
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th><th>Ảnh</th><th>Hãng & Tên</th><th>Năm</th><th>Giá/ngày</th><th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${cars.map(car => `
                    <tr>
                        <td>${car.id}</td>
                        <td><img src="${car.imageName || ''}" style="width:60px; height:40px; object-fit:cover; border-radius:4px;"></td>
                        <td>${car.make?.name || car.make} <br> <small>${car.model}</small></td>
                        <td>${car.year}</td>
                        <td>${new Intl.NumberFormat('vi-VN').format(car.amount)}</td>
                        <td class="actions">
                            <button class="btn-icon" onclick="editCar(${car.id})">✏️</button>
                            <button class="btn-icon" onclick="deleteCar(${car.id})">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// 3. FILTERING
function setupFilters() {
    document.getElementById('searchCar').addEventListener('input', filterCars);
    document.getElementById('filterLocation').addEventListener('change', filterCars);
    document.getElementById('filterBrand').addEventListener('change', filterCars);
}

function filterCars() {
    const search = document.getElementById('searchCar').value.toLowerCase();
    const loc = document.getElementById('filterLocation').value;
    const brand = document.getElementById('filterBrand').value;

    const filtered = allCars.filter(c => {
        const m = (c.make?.name || c.make).toLowerCase();
        return (m.includes(search) || c.model.toLowerCase().includes(search)) &&
               (!loc || (c.location?.name || c.location) === loc) &&
               (!brand || (c.make?.name || c.make) === brand);
    });
    displayCars(filtered);
}

// 4. MODAL ACTIONS
function showAddCarModal() {
    document.getElementById('modalTitle').textContent = 'Thêm xe mới';
    document.getElementById('carForm').reset();
    document.getElementById('carId').value = '';

    // Reset inputs file
    document.getElementById('imageFile').value = '';
    document.getElementById('galleryFiles').value = '';

    document.getElementById('carMessage').textContent = '';
    document.getElementById('carModal').style.display = 'block';
}

function editCar(id) {
    const car = allCars.find(c => c.id === id);
    if (!car) return;

    document.getElementById('modalTitle').textContent = 'Sửa thông tin xe';
    document.getElementById('carId').value = car.id;
    document.getElementById('carMake').value = car.make?.name || car.make;
    document.getElementById('carModel').value = car.model;
    document.getElementById('carYear').value = car.year;
    document.getElementById('carAmount').value = car.amount;
    document.getElementById('carLocation').value = car.location?.name || car.location;
    document.getElementById('imageUrl').value = car.imageName || '';

    // Reset inputs file (vì lý do bảo mật không set value file được)
    document.getElementById('imageFile').value = '';
    document.getElementById('galleryFiles').value = '';

    document.getElementById('carMessage').textContent = '';
    document.getElementById('carModal').style.display = 'block';
}

function closeCarModal() {
    document.getElementById('carModal').style.display = 'none';
}

// 5. SUBMIT FORM (CREATE / UPDATE)
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

    // 1. Ảnh đại diện
    const fileInput = document.getElementById('imageFile');
    const imageUrl = document.getElementById('imageUrl').value;
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    } else if (imageUrl) {
        formData.append('imageName', imageUrl);
    }

    // 2. Ảnh Gallery (MỚI)
    const galleryInput = document.getElementById('galleryFiles');
    if (galleryInput && galleryInput.files.length > 0) {
        for (let i = 0; i < galleryInput.files.length; i++) {
            formData.append('gallery', galleryInput.files[i]);
        }
    }

    messageEl.textContent = 'Đang xử lý...';
    messageEl.className = 'message';

    try {
        const response = await fetch(url, {
            method: method,
            credentials: 'include',
            body: formData
        });

        if (response.ok) {
            messageEl.textContent = 'Thành công!';
            messageEl.style.color = 'green';
            setTimeout(() => {
                closeCarModal();
                loadCars();
            }, 1000);
        } else {
            const txt = await response.text();
            messageEl.textContent = 'Lỗi: ' + txt;
            messageEl.style.color = 'red';
        }
    } catch (error) {
        console.error(error);
        messageEl.textContent = 'Lỗi kết nối server';
        messageEl.style.color = 'red';
    }
});

// 6. DELETE
async function deleteCar(id) {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
        const res = await fetch(`/api/admin/cars/${id}`, {method: 'DELETE', credentials: 'include'});
        if(res.ok) loadCars();
        else alert('Lỗi xóa xe');
    } catch(e) { console.error(e); }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}

window.onclick = function (event) {
    const modal = document.getElementById('carModal');
    if (event.target === modal) closeCarModal();
};