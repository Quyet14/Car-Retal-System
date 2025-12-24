// Home page JS: load "Popular Cars" from API and render

document.addEventListener('DOMContentLoaded', () => {
    loadPopularCars();
});

async function loadPopularCars() {
    const row = document.getElementById('popularCarsRow');
    const spinner = document.getElementById('popularCarsSpinner');

    if (!row) return;

    try {
        const res = await fetch('/api/cars', { credentials: 'include' });
        if (!res.ok) throw new Error('Không thể tải danh sách xe');

        const cars = await res.json();
        // Prefer AVAILABLE cars if status exists
        const available = Array.isArray(cars) ? cars.filter(c => !c.status || c.status === 'AVAILABLE') : [];
        const toShow = (available.length ? available : (Array.isArray(cars) ? cars : [])).slice(0, 4);

        // Clear spinner
        if (spinner) spinner.remove();

        if (toShow.length === 0) {
            row.innerHTML = `<div class="col-12 text-center py-4"><p class="text-muted">Không có xe nổi bật để hiển thị</p></div>`;
            return;
        }

        row.innerHTML = toShow.map(car => {
            const img = car.imageName || car.image || 'https://via.placeholder.com/300x200?text=No+Image';
            const imagePath = (img && !img.startsWith('/') && !img.startsWith('http')) ? '/uploads/' + img : img;
            const title = `${car.make || ''} ${car.model || ''}`.trim();
            const price = car.amount ? formatPrice(car.amount) : 'Liên hệ';
            const seats = car.seats ? car.seats + ' chỗ' : '';
            const transmission = car.transmission || '';

            return `
            <div class="col-xl-3 col-lg-4 col-md-6">
                <div class="car-card h-100">
                    <div class="car-header">
                        <div>
                            <h5 class="car-title">${escapeHtml(title)}</h5>
                            <span class="car-type">${escapeHtml(car.location || '')}</span>
                        </div>
                    </div>
                    <div class="car-image-container">
                        <img src="${imagePath}" alt="${escapeHtml(title)}" onerror="this.onerror=null;this.src='https://via.placeholder.com/300x200?text=No+Image'">
                    </div>
                    <div class="car-specs">
                        <div class="spec-item"><i class="fas fa-gas-pump"></i> ${escapeHtml(car.fuel || '')}</div>
                        <div class="spec-item"><i class="fas fa-circle-notch"></i> ${escapeHtml(transmission)}</div>
                        <div class="spec-item"><i class="fas fa-user-friends"></i> ${escapeHtml(seats)}</div>
                    </div>
                    <div class="car-footer">
                        <div>
                            <span class="price-text">${price}</span><span class="price-sub">/ngày</span>
                        </div>
                        <a href="/cars/booking.html?carId=${car.id}" class="btn btn-primary-custom btn-sm px-3">Thuê ngay</a>
                    </div>
                </div>
            </div>`;
        }).join('');

    } catch (err) {
        console.error('Error loading popular cars:', err);
        if (spinner) spinner.remove();
        row.innerHTML = `<div class="col-12 text-center py-4"><p class="text-muted">Không thể tải dữ liệu. Vui lòng thử lại sau.</p></div>`;
    }
}

function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function escapeHtml(text) {
    if (!text) return '';
    return ('' + text).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}