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

async function loadBrandsAndLocations() {
    try {
        // Load brands from API
        const brandsResponse = await fetch('/api/admin/brands', { credentials: 'include' });
        if (brandsResponse.ok) {
            const brandsData = await brandsResponse.json();
            brands = brandsData.map(b => b.name);
        }
        
        // Load locations from API
        const locationsResponse = await fetch('/api/admin/locations', { credentials: 'include' });
        if (locationsResponse.ok) {
            const locationsData = await locationsResponse.json();
            locations = locationsData.map(l => l.name);
        }
    } catch (error) {
        console.error('Error loading brands/locations:', error);
        // Fallback to some default values
        brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi'];
        locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
    }
    
    // Populate selects
    const makeSelect = document.getElementById('carMake');
    const locationSelect = document.getElementById('carLocation');
    const filterBrand = document.getElementById('filterBrand');
    const filterLocation = document.getElementById('filterLocation');
    
    brands.forEach(brand => {
        makeSelect.innerHTML += `<option value="${brand}">${brand}</option>`;
        filterBrand.innerHTML += `<option value="${brand}">${brand}</option>`;
    });
    
    locations.forEach(loc => {
        locationSelect.innerHTML += `<option value="${loc}">${loc}</option>`;
        filterLocation.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
}

async function loadCars() {
    const container = document.getElementById('carsTable');
    container.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch('/api/cars', { credentials: 'include' });
        
        if (!response.ok) {
            container.innerHTML = '<p class="empty-state">Không thể tải dữ liệu</p>';
            return;
        }

        allCars = await response.json();
        displayCars(allCars);
    } catch (error) {
        console.error('Error loading cars:', error);
        container.innerHTML = '<p class="empty-state">Có lỗi xảy ra</p>';
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
                    <th>ID</th>
                    <th>Hình ảnh</th>
                    <th>Hãng</th>
                    <th>Model</th>
                    <th>Năm</th>
                    <th>Địa điểm</th>
                    <th>Giá/ngày</th>
                    <th>Thao tác</th>
                </tr>
            </thead>
            <tbody>
                ${cars.map(car => `
                    <tr>
                        <td>${car.id}</td>
                        <td><img src="${car.imageName || 'https://via.placeholder.com/60x40'}" alt="${car.make?.name || car.make}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;"></td>
                        <td>${car.make?.name || car.make}</td>
                        <td>${car.model}</td>
                        <td>${car.year}</td>
                        <td>${car.location?.name || car.location}</td>
                        <td>${formatPrice(car.amount)}</td>
                        <td class="actions">
                            <button class="btn-icon btn-edit" onclick="editCar(${car.id})" title="Sửa">✏️</button>
                            <button class="btn-icon btn-delete" onclick="deleteCar(${car.id})" title="Xóa">🗑️</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function setupFilters() {
    document.getElementById('searchCar').addEventListener('input', filterCars);
    document.getElementById('filterLocation').addEventListener('change', filterCars);
    document.getElementById('filterBrand').addEventListener('change', filterCars);
}

function filterCars() {
    const search = document.getElementById('searchCar').value.toLowerCase();
    const location = document.getElementById('filterLocation').value;
    const brand = document.getElementById('filterBrand').value;
    
    let filtered = allCars.filter(car => {
        const makeName = car.make?.name || car.make;
        const locationName = car.location?.name || car.location;
        const matchSearch = makeName.toLowerCase().includes(search) || 
                          car.model.toLowerCase().includes(search);
        const matchLocation = !location || locationName === location;
        const matchBrand = !brand || makeName === brand;
        
        return matchSearch && matchLocation && matchBrand;
    });
    
    displayCars(filtered);
}

function showAddCarModal() {
    document.getElementById('modalTitle').textContent = 'Thêm xe mới';
    document.getElementById('carForm').reset();
    document.getElementById('carId').value = '';
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
    document.getElementById('carImage').value = car.imageName || '';
    document.getElementById('carModal').style.display = 'block';
}

async function deleteCar(id) {
    if (!confirm('Bạn có chắc muốn xóa xe này?')) return;
    
    try {
        const response = await fetch(`/api/admin/cars/${id}`, {
            method: 'DELETE',
            credentials: 'include'
        });
        
        if (response.ok) {
            alert('Đã xóa xe thành công');
            loadCars();
        } else {
            const error = await response.text();
            alert('Không thể xóa xe: ' + error);
        }
    } catch (error) {
        console.error('Error deleting car:', error);
        alert('Có lỗi xảy ra');
    }
}

function closeCarModal() {
    document.getElementById('carModal').style.display = 'none';
}

// Handle form submit
document.getElementById('carForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const messageEl = document.getElementById('carMessage');
    const carId = document.getElementById('carId').value;
    
    const data = {
        make: document.getElementById('carMake').value,
        model: document.getElementById('carModel').value,
        year: parseInt(document.getElementById('carYear').value),
        location: document.getElementById('carLocation').value,
        amount: parseFloat(document.getElementById('carAmount').value),
        imageName: document.getElementById('carImage').value
    };
    
    messageEl.textContent = 'Đang xử lý...';
    messageEl.className = 'message info-message';
    
    try {
        const url = carId ? `/api/admin/cars/${carId}` : '/api/admin/cars';
        const method = carId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(data)
        });
        
        const result = await response.text();
        
        if (response.ok) {
            messageEl.textContent = result;
            messageEl.className = 'message success-message';
            setTimeout(() => {
                closeCarModal();
                loadCars();
            }, 2000);
        } else {
            messageEl.textContent = result;
            messageEl.className = 'message error-message';
        }
    } catch (error) {
        console.error('Error saving car:', error);
        messageEl.textContent = 'Có lỗi xảy ra: ' + error.message;
        messageEl.className = 'message error-message';
    }
});

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
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
    const modal = document.getElementById('carModal');
    if (event.target === modal) {
        closeCarModal();
    }
}
