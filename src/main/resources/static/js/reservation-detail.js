document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
        document.getElementById('detailContainer').innerHTML = '<div class="alert alert-warning">Không có ID đơn đặt</div>';
        return;
    }

    loadReservation(id);

    document.getElementById('cancelBtn').addEventListener('click', async () => {
        if (!confirm('Bạn có chắc muốn hủy đơn này?')) return;
        try {
            const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE', credentials: 'include' });
            if (res.ok) {
                alert('Đã hủy đơn thành công');
                window.location.href = '/profile/profile.html#reservations';
            } else if (res.status === 401) {
                alert('Vui lòng đăng nhập');
                window.location.href = '/auth/login.html';
            } else {
                const text = await res.text();
                alert('Không thể hủy đơn: ' + text);
            }
        } catch (e) {
            alert('Lỗi kết nối');
        }
    });
});

async function loadReservation(id) {
    try {
        const res = await fetch(`/api/reservations/${id}`, { credentials: 'include' });
        if (!res.ok) {
            if (res.status === 401) {
                window.location.href = '/auth/login.html';
                return;
            }
            document.getElementById('detailContainer').innerHTML = '<div class="alert alert-danger">Không thể tải chi tiết đơn</div>';
            return;
        }

        const r = await res.json();
        document.getElementById('carImage').src = r.carImage;
        document.getElementById('carName').textContent = r.carName;
        document.getElementById('period').textContent = new Date(r.startDate).toLocaleDateString('vi-VN') + ' - ' + new Date(r.endDate).toLocaleDateString('vi-VN');
        document.getElementById('pickupLocation').textContent = r.pickupLocation || 'Showroom';
        document.getElementById('statusLabel').textContent = r.status;
        document.getElementById('totalPrice').textContent = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(r.totalPrice);
        document.getElementById('fullName').textContent = r.fullName;
        document.getElementById('phone').textContent = r.phone || '-';
        document.getElementById('email').textContent = r.email || '-';
        document.getElementById('notes').textContent = r.notes || '-';
        document.getElementById('startDate').textContent = new Date(r.startDate).toLocaleDateString('vi-VN');
        document.getElementById('endDate').textContent = new Date(r.endDate).toLocaleDateString('vi-VN');

        // Show cancel button for codes PENDING or CONFIRMED
        const code = (r.statusCode || '').toUpperCase();
        const cancelBtn = document.getElementById('cancelBtn');
        if (code === 'PENDING' || code === 'CONFIRMED') {
            cancelBtn.classList.remove('d-none');
        }
        document.getElementById('backToList').classList.remove('d-none');

    } catch (err) {
        console.error('Load reservation error', err);
        document.getElementById('detailContainer').innerHTML = '<div class="alert alert-danger">Lỗi tải chi tiết</div>';
    }
}