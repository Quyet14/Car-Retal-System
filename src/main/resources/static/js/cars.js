// Cars Page JavaScript - Updated for New UI Design

const API_URL = ''; // Để trống nếu cùng domain
let allCars = [];
let filteredCars = [];
let currentPage = 1;
const carsPerPage = 9;

// Khởi tạo
document.addEventListener('DOMContentLoaded', () => {
    checkAuth(); // Chạy ngay khi load trang
    loadCars();
    setupFilters();
});

// === 1. XỬ LÝ ẨN/HIỆN NÚT ĐĂNG NHẬP ===
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');

    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');

    if (userStr) {
        try {
            const user = JSON.parse(userStr);

            if (navAuth) {
                navAuth.style.setProperty('display', 'none', 'important');
                navAuth.classList.remove('d-flex');
            }

            if (navUser) {
                navUser.style.display = 'block';
            }

            if (userName) {
                const fullName = (user.firstName && user.lastName)
                               ? `${user.firstName} ${user.lastName}`
                               : (user.email || "Xin chào");
                userName.textContent = fullName;
            }

            if (user.roles && user.roles.includes('Admin') && adminLink) {
                adminLink.style.display = 'block';
            }

        } catch (e) {
            console.error("Lỗi đọc user:", e);
            localStorage.removeItem('currentUser');
        }
    } else {
        if (navAuth) {
            navAuth.style.display = 'flex';
            navAuth.classList.add('d-flex');
        }
        if (navUser) {
            navUser.style.display = 'none';
        }
    }
}

function logout() {
    fetch(`${API_URL}/api/auth/logout`, { credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });
}

// === 2. CÁC HÀM XỬ LÝ XE (LOAD DATA) ===
async function loadCars() {
    const carsGrid = document.getElementById('carsGrid');

    if(carsGrid) {
        carsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-2 text-muted">Đang tải danh sách xe...</p>
            </div>`;
    }

    try {
        const response = await fetch(`${API_URL}/api/cars`, { credentials: 'include' });

        if (response.ok) {
            const data = await response.json();
            // Map dữ liệu
            allCars = data.map(car => ({
                id: car.id,
                make: car.make,
                model: car.model,
                year: car.year,
                location: car.location,
                amount: car.amount,
                // Ưu tiên ảnh thật -> fallback ảnh đẹp hơn
                imageName: car.imageName || car.image || 'https://freepngimg.com/thumb/car/4-2-car-png-hd.png',
                gallery: car.gallery || [],
                seats: car.seats || 5,
                transmission: car.transmission || 'Tự động',
                fuel: car.fuel || 'Xăng'
            }));
            filteredCars = [...allCars];
            displayCars();
        } else {
            console.warn("API lỗi, dùng dữ liệu mẫu");
            allCars = generateSampleCars();
            filteredCars = [...allCars];
            displayCars();
        }
    } catch (error) {
        console.error('Lỗi kết nối:', error);
        allCars = generateSampleCars();
        filteredCars = [...allCars];
        displayCars();
    }
}

// === [QUAN TRỌNG] HÀM RENDER GIAO DIỆN MỚI ===
function displayCars() {
    const carsGrid = document.getElementById('carsGrid');
    const resultCount = document.getElementById('resultCount');

    if (!carsGrid) return;
    if (resultCount) resultCount.textContent = filteredCars.length;

    const start = (currentPage - 1) * carsPerPage;
    const end = start + carsPerPage;
    const carsToShow = filteredCars.slice(start, end);

    if (carsToShow.length === 0) {
        carsGrid.innerHTML = `
            <div class="col-12 text-center py-5 bg-white rounded shadow-sm">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>Không tìm thấy xe nào</h5>
                <p class="text-muted">Thử thay đổi bộ lọc hoặc tìm từ khóa khác</p>
                <button class="btn btn-outline-primary mt-2" onclick="clearFilters()">Xóa bộ lọc</button>
            </div>`;
        displayPagination();
        return;
    }

    carsGrid.innerHTML = carsToShow.map(car => {

        // Xử lý Gallery nhỏ (Style mới: Căn giữa, bo góc)
        let galleryHtml = '';
        if (car.gallery && car.gallery.length > 0) {
            galleryHtml = `<div class="d-flex gap-1 mt-auto pt-2 justify-content-center" style="height: 30px;">`;
            // Lấy tối đa 3 ảnh
            car.gallery.slice(0, 3).forEach(link => {
                galleryHtml += `<img src="${link}" class="rounded-1 border" style="width: 35px; height: 100%; object-fit: cover;">`;

        // Fix image path: add /uploads/ if missing
        let mainImg = car.imageName || 'https://via.placeholder.com/300x200?text=No+Image';
        if (mainImg && !mainImg.startsWith('/') && !mainImg.startsWith('http')) {
            mainImg = '/uploads/' + mainImg;
        }

        // [MỚI] Xử lý hiển thị Gallery nhỏ
        let galleryHtml = '';
        if (car.gallery && car.gallery.length > 0) {
            galleryHtml = `<div class="d-flex gap-1 mt-2 overflow-hidden" style="height: 35px;">`;
            // Lấy tối đa 4 ảnh đầu tiên để hiển thị
            car.gallery.slice(0, 4).forEach(link => {
                // Fix gallery image path too
                let galleryImg = link;
                if (galleryImg && !galleryImg.startsWith('/') && !galleryImg.startsWith('http')) {
                    galleryImg = '/uploads/' + galleryImg;
                }
                galleryHtml += `<img src="${galleryImg}" class="rounded border" style="width: 45px; height: 100%; object-fit: cover;">`;

            });
            // Nếu còn nhiều ảnh hơn
            if(car.gallery.length > 3) {
                 galleryHtml += `<div class="d-flex align-items-center justify-content-center bg-light border rounded-1 small text-muted fw-bold" style="width: 35px; height: 100%; font-size: 10px;">+${car.gallery.length - 3}</div>`;
            }
            galleryHtml += `</div>`;
        } else {
            // Placeholder khoảng trắng để card đều nhau nếu không có gallery
            galleryHtml = `<div style="height: 30px;" class="mt-auto"></div>`;
        }

        return `
        <div class="col-md-6 col-lg-4">

            <div class="car-card h-100" onclick="showCarDetail(${car.id})" style="cursor: pointer;">

                <div class="car-header">
                    <div>
                        <h5 class="car-title text-truncate" style="max-width: 200px;" title="${car.make} ${car.model}">
                            ${car.make} ${car.model}
                        </h5>
                        <span class="car-type text-muted small"><i class="fas fa-map-marker-alt me-1"></i> ${car.location}</span>

            <div class="car-card h-100 shadow-sm border-0" onclick="showCarDetail(${car.id})" style="cursor: pointer; transition: transform 0.2s;">
                <div class="car-img-wrapper position-relative" style="height: 200px; overflow: hidden; border-radius: 12px 12px 0 0;">
                    <img src="${mainImg}" alt="${car.make}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-warning text-dark fw-bold shadow-sm">${car.year}</span>

                    </div>
                    <i class="far fa-heart text-secondary heart-icon"></i>
                </div>

                <div class="car-img-wrapper">
                    <img src="${car.imageName}" alt="${car.make}">
                </div>

                <div class="car-specs">
                    <div class="spec-item" title="Nhiên liệu">
                        <i class="fas fa-gas-pump text-secondary"></i>
                        <span>${car.fuel}</span>
                    </div>
                    <div class="spec-item" title="Hộp số">
                        <i class="fas fa-circle-notch text-secondary"></i>
                        <span>${car.transmission}</span>
                    </div>
                    <div class="spec-item" title="Số chỗ">
                        <i class="fas fa-user-friends text-secondary"></i>
                        <span>${car.seats} chỗ</span>
                    </div>
                </div>

                ${galleryHtml}

                <div class="car-footer mt-3 pt-3 border-top">
                    <div>
                        <span class="price-text text-primary">${formatPrice(car.amount)}</span>
                        <span class="price-sub">/ngày</span>
                    </div>
                    <button class="btn btn-primary-custom btn-sm px-3 shadow-sm" onclick="event.stopPropagation(); rentCar(${car.id})">
                        Thuê ngay
                    </button>
                </div>
            </div>
        </div>
        `;
    }).join('');

    displayPagination();
}

// === 3. CÁC HÀM PHỤ TRỢ (GIỮ NGUYÊN LOGIC CŨ) ===
function displayPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
    pagination.innerHTML = html;
}

function goToPage(page) {
    if (page < 1 || page > Math.ceil(filteredCars.length / carsPerPage)) return;
    currentPage = page;
    displayCars();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function setupFilters() {
    const ids = ['locationFilter', 'brandFilter', 'yearFilter', 'priceFilter', 'searchInput'];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.addEventListener(id.includes('Input') || id.includes('price') ? 'input' : 'change', applyFilters);
    });
}

function applyFilters() {
    const location = document.getElementById('locationFilter')?.value || '';
    const brand = document.getElementById('brandFilter')?.value || '';
    const year = document.getElementById('yearFilter')?.value || '';
    const maxPrice = document.getElementById('priceFilter')?.value || '';
    const term = document.getElementById('searchInput')?.value.toLowerCase() || '';

    filteredCars = allCars.filter(car => {
        if (location && car.location !== location) return false;
        if (brand && car.make !== brand) return false;
        if (year && car.year !== parseInt(year)) return false;
        if (maxPrice && car.amount > parseInt(maxPrice)) return false;
        if (term && !car.make.toLowerCase().includes(term) && !car.model.toLowerCase().includes(term)) return false;
        return true;
    });

    currentPage = 1;
    displayCars();
}

function clearFilters() {
    ['locationFilter', 'brandFilter', 'yearFilter', 'searchInput'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
    // Reset thanh trượt giá
    const priceRange = document.getElementById('priceFilter');
    if(priceRange) {
        priceRange.value = priceRange.max; // Mặc định về max
        document.getElementById('priceValue').innerText = new Intl.NumberFormat('vi-VN').format(priceRange.max) + 'đ';
    }

    filteredCars = [...allCars];
    currentPage = 1;
    displayCars();
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function showCarDetail(carId) {
    window.location.href = `/cars/car-detail.html?id=${carId}`;
}

function rentCar(carId) {
    const user = localStorage.getItem('currentUser');
    if (!user) {
        alert('Vui lòng đăng nhập để đặt xe!');
        window.location.href = '/auth/login.html';
        return;
    }
    window.location.href = `/cars/booking.html?carId=${carId}`;
}

function generateSampleCars() {
    const brands = ['Toyota', 'Honda', 'Mazda', 'Ford', 'Mercedes'];
    const locs = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng'];
    return Array.from({length: 12}, (_, i) => ({
        id: i+1,
        make: brands[Math.floor(Math.random() * brands.length)],
        model: 'Series ' + (i+1),
        year: 2020 + Math.floor(Math.random() * 5),
        location: locs[Math.floor(Math.random() * locs.length)],
        amount: 500000 + Math.floor(Math.random() * 20) * 50000,
        imageName: 'https://freepngimg.com/thumb/car/4-2-car-png-hd.png',
        gallery: [],
        seats: 4 + Math.floor(Math.random() * 2) * 3,
        transmission: Math.random() > 0.5 ? 'Tự động' : 'Số sàn',
        fuel: Math.random() > 0.5 ? 'Xăng' : 'Dầu'
    }));
}