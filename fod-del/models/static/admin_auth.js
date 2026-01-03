// API Configuration
const AUTH_API_URL = 'http://localhost:5200/api/Auth';

// Admin Login Function
async function adminLogin(username, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login/admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        const data = await response.json();
        
        if (data.success) {
            // Lưu thông tin admin vào localStorage
            localStorage.setItem('admin', JSON.stringify(data.user));
            localStorage.setItem('isAdminLoggedIn', 'true');
            return data;
        } else {
            return data;
        }
    } catch (error) {
        console.error('Admin login error:', error);
        return {
            success: false,
            message: 'Không thể kết nối đến server!'
        };
    }
}

// Admin Logout Function
function adminLogout() {
    localStorage.removeItem('admin');
    localStorage.removeItem('isAdminLoggedIn');
    window.location.href = 'login_admin.html';
}

// Check if someone is logged in
function isAdminLoggedIn() {
    return localStorage.getItem('isAdminLoggedIn') === 'true';
}

// Get current admin
function getCurrentAdmin() {
    const adminStr = localStorage.getItem('admin');
    return adminStr ? JSON.parse(adminStr) : null;
}

// Check role = 'admin' / 'technical'
function hasRole(roleName) {
    const admin = getCurrentAdmin();
    if (!admin) return false;
    const r = (admin.role || admin.Role || "").toLowerCase();
    return r === String(roleName).toLowerCase();
}

// 🔐 Protect trang chỉ cho ADMIN
function protectAdminPage() {
    if (!isAdminLoggedIn() || !hasRole("admin")) {
        adminLogout(); // clear + quay về login
    }
}

// 🔐 Protect trang chỉ cho TECHNICAL
function protectTechnicalPage() {
    if (!isAdminLoggedIn() || !hasRole("technical")) {
        adminLogout();
    }
}

