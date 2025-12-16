// Cars Page JavaScript - Fix lỗi hiển thị nút Auth & Thêm Gallery

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

// === 1. XỬ LÝ ẨN/HIỆN NÚT ĐĂNG NHẬP (QUAN TRỌNG) ===
function checkAuth() {
    const userStr = localStorage.getItem('currentUser');

    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const userName = document.getElementById('userName');
    const adminLink = document.getElementById('adminLink');

    if (userStr) {
        // --- ĐÃ ĐĂNG NHẬP ---
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
        // --- CHƯA ĐĂNG NHẬP ---
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
                <div class="spinner-border text-warning" role="status"></div>
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
                // Ưu tiên ảnh thật -> ảnh demo -> ảnh giữ chỗ
                imageName: car.imageName || car.image || 'https://via.placeholder.com/300x200?text=No+Image',
                // [MỚI] Map thêm trường gallery
                gallery: car.gallery || [],
                seats: car.seats || 5,
                transmission: car.transmission || 'Tự động'
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
            <div class="col-12 text-center py-5 bg-light rounded">
                <i class="fas fa-search fa-3x text-muted mb-3"></i>
                <h5>Không tìm thấy xe nào</h5>
                <p class="text-muted">Thử thay đổi bộ lọc hoặc tìm từ khóa khác</p>
                <button class="btn btn-outline-warning mt-2" onclick="clearFilters()">Xóa bộ lọc</button>
            </div>`;
        displayPagination();
        return;
    }

    carsGrid.innerHTML = carsToShow.map(car => {
        // [MỚI] Xử lý hiển thị Gallery nhỏ
        let galleryHtml = '';
        if (car.gallery && car.gallery.length > 0) {
            galleryHtml = `<div class="d-flex gap-1 mt-2 overflow-hidden" style="height: 35px;">`;
            // Lấy tối đa 4 ảnh đầu tiên để hiển thị
            car.gallery.slice(0, 4).forEach(link => {
                galleryHtml += `<img src="${link}" class="rounded border" style="width: 45px; height: 100%; object-fit: cover;">`;
            });
            // Nếu còn nhiều ảnh hơn thì hiện số lượng
            if(car.gallery.length > 4) {
                 galleryHtml += `<div class="d-flex align-items-center justify-content-center bg-light border rounded small text-muted" style="width: 35px; height: 100%;">+${car.gallery.length - 4}</div>`;
            }
            galleryHtml += `</div>`;
        }

        return `
        <div class="col-md-6 col-lg-4">
            <div class="car-card h-100 shadow-sm border-0" onclick="showCarDetail(${car.id})" style="cursor: pointer; transition: transform 0.2s;">
                <div class="car-img-wrapper position-relative" style="height: 200px; overflow: hidden; border-radius: 12px 12px 0 0;">
                    <img src="${car.imageName}" alt="${car.make}" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="position-absolute top-0 end-0 m-2">
                        <span class="badge bg-warning text-dark fw-bold shadow-sm">${car.year}</span>
                    </div>
                </div>
                <div class="card-body p-3 bg-white" style="border-radius: 0 0 12px 12px;">
                    <h5 class="fw-bold mb-1 text-dark">${car.make} ${car.model}</h5>

                    ${galleryHtml}

                    <p class="text-muted small mb-3 mt-2"><i class="fas fa-map-marker-alt me-1 text-danger"></i> ${car.location}</p>

                    <div class="d-flex justify-content-between align-items-center mb-3 bg-light p-2 rounded">
                        <div class="small text-secondary"><i class="fas fa-user me-1"></i> ${car.seats} chỗ</div>
                        <div class="small text-secondary"><i class="fas fa-cogs me-1"></i> ${car.transmission}</div>
                    </div>

                    <div class="d-flex justify-content-between align-items-end border-top pt-3">
                        <div>
                            <span class="fw-bold text-primary fs-5">${formatPrice(car.amount)}</span>
                            <small class="text-muted">/ngày</small>
                        </div>
                        <button class="btn btn-primary text-white fw-bold btn-sm px-3" onclick="event.stopPropagation(); rentCar(${car.id})">
                            Thuê Ngay
                        </button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }).join('');

    displayPagination();
}

// === 3. CÁC HÀM PHỤ TRỢ ===
function displayPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';
    html += `<button class="btn btn-outline-secondary me-1" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})"><i class="fas fa-chevron-left"></i></button>`;

    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="btn ${i === currentPage ? 'btn-warning text-white' : 'btn-outline-secondary'} me-1" onclick="goToPage(${i})">${i}</button>`;
    }

    html += `<button class="btn btn-outline-secondary" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})"><i class="fas fa-chevron-right"></i></button>`;
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
    ['locationFilter', 'brandFilter', 'yearFilter', 'priceFilter', 'searchInput'].forEach(id => {
        const el = document.getElementById(id);
        if(el) el.value = '';
    });
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

// Dữ liệu mẫu fallback
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
        imageName: 'https://images.unsplash.com/photo-1550355291-643a809b19e7?auto=format&fit=crop&w=500&q=60',
        gallery: [], // Mặc định rỗng cho data mẫu
        seats: 4 + Math.floor(Math.random() * 2) * 3,
        transmission: Math.random() > 0.5 ? 'Tự động' : 'Số sàn'
    }));
}