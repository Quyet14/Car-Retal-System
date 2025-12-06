// Cars Page JavaScript

const API_URL = '';
let allCars = [];
let filteredCars = [];
let currentPage = 1;
const carsPerPage = 9;

// Check authentication
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadCars();
    setupFilters();
});

function checkAuth() {
    const user = localStorage.getItem('currentUser');
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');

    if (user) {
        const userData = JSON.parse(user);
        navAuth.style.display = 'none';
        navUser.style.display = 'flex';
        userName.textContent = `${userData.firstName} ${userData.lastName}`;
    } else {
        navAuth.style.display = 'flex';
        navUser.style.display = 'none';
    }
}

function logout() {
    fetch(`${API_URL}/api/auth/logout`, {
        credentials: 'include'
    }).finally(() => {
        localStorage.removeItem('currentUser');
        window.location.href = '/index.html';
    });
}

// Load Cars
async function loadCars() {
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '<div class="loading">Đang tải danh sách xe...</div>';

    try {
        const response = await fetch(`${API_URL}/api/cars`, {
            credentials: 'include'
        });

        if (response.ok) {
            allCars = await response.json();
            // Map backend data to frontend format
            allCars = allCars.map(car => ({
                id: car.id,
                make: car.make,
                model: car.model,
                year: car.year,
                location: car.location,
                amount: car.amount,
                imageName: car.imageName,
                seats: car.seats || 5,
                transmission: car.transmission || 'Tự động',
                features: ['Tự động', 'Điều hòa', 'GPS', 'Bluetooth']
            }));
            filteredCars = [...allCars];
            displayCars();
        } else {
            // Fallback to mock data if API fails
            allCars = generateSampleCars();
            filteredCars = [...allCars];
            displayCars();
        }
    } catch (error) {
        console.error('Error loading cars:', error);
        // Fallback to mock data
        allCars = generateSampleCars();
        filteredCars = [...allCars];
        displayCars();
    }
}

function generateSampleCars() {
    const brands = ['Toyota', 'Honda', 'Ford', 'BMW', 'Mercedes-Benz', 'Audi'];
    const models = ['Camry', 'Civic', 'Mustang', '3 Series', 'C-Class', 'A4', 'Corolla', 'Accord', 'Explorer'];
    const locations = ['Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ'];
    const cars = [];

    for (let i = 0; i < 24; i++) {
        cars.push({
            id: i + 1,
            make: brands[i % brands.length],
            model: models[i % models.length],
            year: 2020 + (i % 5),
            location: locations[i % locations.length],
            amount: 500000 + (i * 50000),
            imageName: `car-${i + 1}.jpg`,
            features: ['Tự động', 'Điều hòa', 'GPS', 'Bluetooth'],
            seats: 5,
            transmission: i % 2 === 0 ? 'Tự động' : 'Số sàn'
        });
    }

    return cars;
}

function displayCars() {
    const carsGrid = document.getElementById('carsGrid');
    const start = (currentPage - 1) * carsPerPage;
    const end = start + carsPerPage;
    const carsToShow = filteredCars.slice(start, end);

    if (carsToShow.length === 0) {
        carsGrid.innerHTML = '<div class="empty-state">Không tìm thấy xe phù hợp</div>';
        return;
    }

    carsGrid.innerHTML = carsToShow.map(car => `
        <div class="car-card" onclick="showCarDetail(${car.id})">
            <div class="car-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
                🚗
            </div>
            <div class="car-info">
                <h3 class="car-title">${car.make} ${car.model}</h3>
                <div class="car-details">
                    <span>📅 ${car.year}</span>
                    <span>📍 ${car.location}</span>
                </div>
                <div class="car-features">
                    <span>👥 ${car.seats} chỗ</span>
                    <span>⚙️ ${car.transmission}</span>
                </div>
                <div class="car-price">${formatPrice(car.amount)}/ngày</div>
                <button class="btn btn-primary btn-block" onclick="event.stopPropagation(); rentCar(${car.id})">
                    Thuê ngay
                </button>
            </div>
        </div>
    `).join('');

    displayPagination();
}

function displayPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    pagination.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayCars();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Filters
function setupFilters() {
    document.getElementById('locationFilter').addEventListener('change', applyFilters);
    document.getElementById('brandFilter').addEventListener('change', applyFilters);
    
    // Debounce price filter
    let priceTimeout;
    document.getElementById('priceFilter').addEventListener('input', () => {
        clearTimeout(priceTimeout);
        priceTimeout = setTimeout(applyFilters, 500);
    });
    
    document.getElementById('yearFilter').addEventListener('change', applyFilters);
    
    // Debounce search
    let searchTimeout;
    document.getElementById('searchInput').addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(searchCars, 500);
    });
}

function applyFilters() {
    const location = document.getElementById('locationFilter').value;
    const brand = document.getElementById('brandFilter').value;
    const maxPrice = document.getElementById('priceFilter').value;
    const year = document.getElementById('yearFilter').value;

    filteredCars = allCars.filter(car => {
        if (location && car.location !== location) return false;
        if (brand && car.make !== brand) return false;
        if (maxPrice && car.amount > parseInt(maxPrice)) return false;
        if (year && car.year !== parseInt(year)) return false;
        return true;
    });

    currentPage = 1;
    displayCars();
}

function clearFilters() {
    document.getElementById('locationFilter').value = '';
    document.getElementById('brandFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('yearFilter').value = '';
    filteredCars = [...allCars];
    currentPage = 1;
    displayCars();
}

async function searchCars() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    
    if (!searchTerm) {
        filteredCars = [...allCars];
        currentPage = 1;
        displayCars();
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/api/cars/search?query=${encodeURIComponent(searchTerm)}`, {
            credentials: 'include'
        });
        
        if (response.ok) {
            const cars = await response.json();
            filteredCars = cars.map(car => ({
                id: car.id,
                make: car.make,
                model: car.model,
                year: car.year,
                location: car.location,
                amount: car.amount,
                imageName: car.imageName,
                seats: car.seats || 5,
                transmission: car.transmission || 'Tự động',
                features: ['Tự động', 'Điều hòa', 'GPS', 'Bluetooth']
            }));
            currentPage = 1;
            displayCars();
        } else {
            // Fallback to local search
            filteredCars = allCars.filter(car => 
                car.make.toLowerCase().includes(searchTerm) ||
                car.model.toLowerCase().includes(searchTerm) ||
                car.location.toLowerCase().includes(searchTerm)
            );
            currentPage = 1;
            displayCars();
        }
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to local search
        filteredCars = allCars.filter(car => 
            car.make.toLowerCase().includes(searchTerm) ||
            car.model.toLowerCase().includes(searchTerm) ||
            car.location.toLowerCase().includes(searchTerm)
        );
        currentPage = 1;
        displayCars();
    }
}

function sortCars() {
    const sortBy = document.getElementById('sortBy').value;

    switch(sortBy) {
        case 'price-asc':
            filteredCars.sort((a, b) => a.amount - b.amount);
            break;
        case 'price-desc':
            filteredCars.sort((a, b) => b.amount - a.amount);
            break;
        case 'year-desc':
            filteredCars.sort((a, b) => b.year - a.year);
            break;
    }

    displayCars();
}

// Car Detail - redirect to detail page
function showCarDetail(carId) {
    window.location.href = `/cars/car-detail.html?id=${carId}`;
}

function closeCarModal() {
    document.getElementById('carModal').style.display = 'none';
}

function rentCar(carId) {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        alert('Vui lòng đăng nhập để thuê xe');
        window.location.href = '/auth/login.html';
        return;
    }

    window.location.href = `/cars/booking.html?carId=${carId}`;
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('carModal');
    if (event.target === modal) {
        closeCarModal();
    }
}
