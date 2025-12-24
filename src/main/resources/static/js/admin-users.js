// Admin Users Management

let allUsers = [];

document.addEventListener('DOMContentLoaded', () => {
    checkAdminAuth();
    loadUsers();
    setupFilters();
});

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

async function loadUsers() {
    const container = document.getElementById('usersTable');
    container.innerHTML = '<div class="loading">Đang tải...</div>';
    
    try {
        const response = await fetch('/api/admin/users', { credentials: 'include' });
        if (response.ok) {
            allUsers = await response.json();
            displayUsers(allUsers);
        } else {
            container.innerHTML = '<p class="empty-state">Không thể tải danh sách người dùng</p>';
        }
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="empty-state">Lỗi kết nối server</p>';
    }
}

function displayUsers(users) {
    const container = document.getElementById('usersTable');
    
    if (users.length === 0) {
        container.innerHTML = '<p class="empty-state">Chưa có người dùng nào</p>';
        return;
    }
    
    container.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Họ tên</th>
                    <th>Email</th>
                    <th>Vai trò</th>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                </tr>
            </thead>
            <tbody>
                ${users.map(user => `
                    <tr>
                        <td>${user.id}</td>
                        <td>${user.firstName || ''} ${user.lastName || ''}</td>
                        <td>${user.email}</td>
                        <td>
                            ${(user.roles || []).map(role => 
                                `<span class="status-badge ${role === 'Admin' ? 'status-confirmed' : 'status-pending'}">${role === 'Admin' ? 'Quản trị' : 'Khách hàng'}</span>`
                            ).join(' ')}
                        </td>
                        <td>
                            <span class="status-badge ${user.emailConfirmed ? 'status-confirmed' : 'status-pending'}">
                                ${user.emailConfirmed ? 'Đã xác thực' : 'Chưa xác thực'}
                            </span>
                        </td>
                        <td>${formatDate(user.createdAt)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function setupFilters() {
    document.getElementById('searchUser').addEventListener('input', filterUsers);
    document.getElementById('filterRole').addEventListener('change', filterUsers);
}

function filterUsers() {
    const search = document.getElementById('searchUser').value.toLowerCase();
    const role = document.getElementById('filterRole').value;
    
    const filtered = allUsers.filter(user => {
        const matchSearch = !search || 
            (user.firstName && user.firstName.toLowerCase().includes(search)) ||
            (user.lastName && user.lastName.toLowerCase().includes(search)) ||
            user.email.toLowerCase().includes(search);
        
        const matchRole = !role || (user.roles && user.roles.includes(role));
        
        return matchSearch && matchRole;
    });
    
    displayUsers(filtered);
}

function formatDate(dateString) {
    if (!dateString) return '—';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
}

function logout() {
    fetch('/api/auth/logout', { credentials: 'include' })
        .finally(() => {
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });
}
