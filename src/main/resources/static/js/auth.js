// Authentication JavaScript

const API_URL = '';

// Register Form
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        const password = formData.get('password');
        const confirmPassword = formData.get('confirmPassword');
        
        // Validate password length
        if (password.length < 8) {
            showError('Mật khẩu phải có ít nhất 8 ký tự');
            return;
        }
        
        // Validate password match
        if (password !== confirmPassword) {
            showError('Mật khẩu xác nhận không khớp');
            return;
        }
        
        const data = {
            email: formData.get('email'),
            password: password,
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            country: formData.get('country')
        };
        
        const btn = document.getElementById('registerBtn');
        btn.disabled = true;
        btn.textContent = 'Đang xử lý...';
        
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                showSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận tài khoản.');
                registerForm.reset();
                setTimeout(() => {
                    window.location.href = '/auth/login.html';
                }, 2000);
            } else {
                const error = await response.json();
                showError(error.message || 'Đăng ký thất bại');
            }
        } catch (error) {
            console.error('Register error:', error);
            showError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Đăng ký';
        }
    });
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(loginForm);
        const data = {
            email: formData.get('email'),
            password: formData.get('password')
        };

        const btn = document.getElementById('loginBtn');
        btn.disabled = true;
        btn.textContent = 'Đang đăng nhập...';

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Get user profile
                const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
                    credentials: 'include'
                });

                if (profileResponse.ok) {
                    const user = await profileResponse.json();
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    console.log('Login successful, user roles:', user.roles);

                    // Redirect based on role
                    if (user.roles && user.roles.includes('Admin')) {
                        console.log('Redirecting to admin dashboard...');
                        window.location.href = '/admin/dashboard.html';
                    } else {
                        console.log('Redirecting to home page...');
                        window.location.href = '/index.html';
                    }
                } else {
                    console.error('Profile fetch failed:', profileResponse.status);
                    showError('Không thể lấy thông tin người dùng');
                }
            } else {
                console.error('Login failed:', response.status);
                try {
                    const error = await response.json();
                    showError(error.message || 'Đăng nhập thất bại');
                } catch (e) {
                    showError('Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            showError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Đăng nhập';
        }
    });
}

// Forgot Password Form
const forgotPasswordForm = document.getElementById('forgotPasswordForm');
if (forgotPasswordForm) {
    forgotPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(forgotPasswordForm);
        const data = {
            email: formData.get('email')
        };

        const btn = document.getElementById('submitBtn');
        btn.disabled = true;
        btn.textContent = 'Đang gửi...';

        try {
            const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                showSuccess('Link đặt lại mật khẩu đã được gửi đến email của bạn.');
                forgotPasswordForm.reset();
            } else {
                showError('Có lỗi xảy ra. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            showError('Có lỗi xảy ra. Vui lòng thử lại.');
        } finally {
            btn.disabled = false;
            btn.textContent = 'Gửi link đặt lại mật khẩu';
        }
    });
}

// Helper Functions
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.add('show');
        setTimeout(() => {
            errorDiv.classList.remove('show');
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.classList.add('show');
        setTimeout(() => {
            successDiv.classList.remove('show');
        }, 5000);
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