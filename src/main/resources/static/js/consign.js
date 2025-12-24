// Consign Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

function checkAuth() {
    const userStr = localStorage.getItem('currentUser');
    if (!userStr) {
        alert("Vui lòng đăng nhập để sử dụng tính năng Ký gửi xe.");
        window.location.href = '/auth/login.html';
        return;
    }
    const user = JSON.parse(userStr);
    document.getElementById('userName').textContent = user.firstName || "User";
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = '/index.html';
}

// --- XỬ LÝ ẢNH PREVIEW ---
let selectedFiles = [];

function previewImages(event) {
    const files = event.target.files;
    const container = document.getElementById('previewContainer');

    // Clear cũ nếu muốn (hoặc append thêm)
    // container.innerHTML = '';
    // selectedFiles = [];

    if (files) {
        Array.from(files).forEach(file => {
            selectedFiles.push(file); // Lưu file để gửi đi

            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-item';
                container.appendChild(img);
            }
            reader.readAsDataURL(file);
        });
    }
}

// --- GỬI FORM ---
document.getElementById('consignForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const btn = e.target.querySelector('button[type="submit"]');
    const msgBox = document.getElementById('messageBox');

    // Validate
    if (selectedFiles.length < 1) {
        alert("Vui lòng tải lên ít nhất 1 hình ảnh của xe.");
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Đang xử lý...';
    msgBox.classList.add('d-none');

    // Chuẩn bị dữ liệu (Dùng FormData để gửi cả Text và File)
    const formData = new FormData(e.target);

    // Append các file ảnh vào FormData
    selectedFiles.forEach(file => {
        formData.append('images', file);
    });

    // Lấy ID người dùng hiện tại để gán chủ xe
    const user = JSON.parse(localStorage.getItem('currentUser'));
    formData.append('ownerId', user.id);
    formData.append('status', 'PENDING'); // Mặc định là chờ duyệt

    try {
        // --- GỌI API BACKEND ---
        // Lưu ý: Backend cần có endpoint POST /api/cars/consign hỗ trợ MultipartFile
        const response = await fetch('/api/cars/consign', {
            method: 'POST',
            body: formData, // Không cần set Content-Type, trình duyệt tự làm khi dùng FormData
            credentials: 'include'
        });

        if (response.ok) {
            msgBox.className = 'alert alert-success mt-3';
            msgBox.textContent = 'Gửi yêu cầu thành công! Chúng tôi sẽ liên hệ sớm.';
            msgBox.classList.remove('d-none');

            // Reset form
            e.target.reset();
            document.getElementById('previewContainer').innerHTML = '';
            selectedFiles = [];

            setTimeout(() => {
                window.location.href = '/profile/profile.html'; // Quay về trang cá nhân
            }, 2000);
        } else {
            const errText = await response.text();
            throw new Error(errText || 'Lỗi hệ thống');
        }
    } catch (error) {
        console.error(error);
        msgBox.className = 'alert alert-danger mt-3';
        msgBox.textContent = 'Gửi thất bại: ' + error.message;
        msgBox.classList.remove('d-none');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Gửi yêu cầu Ký Gửi';
    }
});