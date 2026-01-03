// API Configuration
const AUTH_API_URL = 'http://localhost:5200/api/Auth';

// Update menu based on login status
        function updateAuthMenu() {
            const authMenuContainer = document.getElementById('auth-menu');
            const user = getCurrentUser();
            
            if (isUserLoggedIn() && user) {
                // User is logged in - show user name and logout button
                authMenuContainer.innerHTML = `
                    <li><a href="#" style="color: #E195AB; font-weight: 600;">👤 ${user.full_name}</a></li>
                    <li><a href="#" onclick="handleLogout(event)" style="color: #dc3545;">LOGOUT</a></li>
                `;
            } else {
                // User not logged in - show login and signup
                authMenuContainer.innerHTML = `
                    <li><a href="login.html">LOGIN</a></li>
                    <li><a href="signup.html">SIGN UP</a></li>
                `;
            }
        }
        
        // Handle logout
        function handleLogout(event) {
            event.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logout();
            }
        }
        
        // Load hot products from API
        async function loadHotProducts() {
            const container = document.getElementById('hot-products-container');
            
            if (typeof fetchProductsFromAPI !== 'function') {
                container.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: #f44336;">API not available</p>';
                return;
            }
            
            const products = await fetchProductsFromAPI();
            
            if (products.length === 0) {
                container.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: #f44336;">No products available</p>';
                return;
            }
            
            // Display first 6 products as hot products
            const hotProducts = products.slice(0, 6);
            container.innerHTML = '';
            
            hotProducts.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.className = 'hot-product-item';
                productDiv.dataset.code = product.code;
                productDiv.dataset.name = product.name;
                productDiv.dataset.price = product.price;
                productDiv.dataset.image = product.image;
                
                productDiv.innerHTML = `
                    <a href="product-detail.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"></a>
                    <p><a href="product-detail.html?id=${product.id}">${product.name}</a></p>
                    <div class="product-item-price">
                    <p>${product.price.toLocaleString('vi-VN')} <sup>đ</sup></p>
                    </div>
                    <button class="main-btn add-to-cart-btn" 
                        data-product-id="${product.id}"
                        data-product-name="${product.name}"
                        data-product-price="${product.price}"
                        data-product-image="${product.image}"
                        onclick="addProductToCart(this)">
                      Add to Cart
                    </button>
                `;
                
                container.appendChild(productDiv);
            });
        }
        
        // Reload cart sau khi load trang (nếu đã login)
        document.addEventListener('DOMContentLoaded', async function() {
            updateAuthMenu();
            await loadHotProducts(); // Load hot products from API
            
            // Load giỏ hàng của user nếu đã đăng nhập
            if (isUserLoggedIn() && typeof updateCartDisplay === 'function') {
            await updateCartDisplay(); //  Đổi từ updateCartNumber thành updateCartDisplay
    }
        });

// Login Function
async function login(username, password) {
    try {
        const response = await fetch(`${AUTH_API_URL}/login/customer`, {
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
            // Lưu thông tin user vào localStorage
            localStorage.setItem('currentUser', JSON.stringify(data.user)); // Đổi key để đồng nhất
            localStorage.setItem('isLoggedIn', 'true');
            return { success: true, message: 'Login successful!', user: data.user };
        } else {
            return { success: false, message: data.message || 'Login failed!' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: 'Cannot connect to server!'
        };
    }
}

// Signup Function
async function signup(userData) {
    try {
        const response = await fetch(`${AUTH_API_URL}/signup/customer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        const data = await response.json();
        
        if (data.success) {
            // Không tự động login, để user tự login
            return { success: true, message: 'Sign up successful!', user: data.user };
        } else {
            return { success: false, message: data.message || 'Sign up failed!' };
        }
    } catch (error) {
        console.error('Signup error:', error);
        return {
            success: false,
            message: 'Cannot connect to server!'
        };
    }
}

// Logout Function
function logout() {
    // Xóa thông tin user
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedIn');
    
    // Xóa giỏ hàng hiển thị
    if (typeof clearDisplayedCart === 'function') {
        clearDisplayedCart();
    }
    
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

// Check if user is logged in
function isUserLoggedIn() {
    return localStorage.getItem('isLoggedIn') === 'true';
}

// Get current user
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('currentUser');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}

// Update auth menu (dùng cho tất cả các trang)
function updateAuthMenu() {
    const authMenuContainer = document.getElementById('auth-menu');
    if (!authMenuContainer) return;
    
    const user = getCurrentUser();
    
    if (isUserLoggedIn() && user) {
        authMenuContainer.innerHTML = `
            <li><a href="#" style="color: #E195AB; font-weight: 600;">👤 ${user.full_name}</a></li>
            <li><a href="#" onclick="handleLogout(event)" style="color: #dc3545;">LOGOUT</a></li>
        `;
    } else {
        authMenuContainer.innerHTML = `
            <li><a href="login.html">LOGIN</a></li>
            <li><a href="signup.html">SIGN UP</a></li>
        `;
    }
}

// Handle logout event
function handleLogout(event) {
    event.preventDefault();
    if (confirm('Are you sure you want to logout?')) {
        logout();
    }
}

// Initialize login form
function initLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        const username = document.getElementById('taikhoan').value.trim();
        const password = document.getElementById('matkhau').value;
        
        if (!username || !password) {
            alert('Please fill in all fields!');
            return;
        }
        
        // Show loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Call login API
        const result = await login(username, password);
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            // XÓA CACHE CŨ của user trước (để tránh load data của user cũ)
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('cart_user_')) {
                    localStorage.removeItem(key);
                }
            });
            
            // Chuyển giỏ hàng guest (nếu có) sang user
            if (typeof transferGuestCartToUser === 'function') {
                await transferGuestCartToUser();
            }
            
            // Load giỏ hàng của user
            if (typeof loadUserCartOnLogin === 'function') {
                await loadUserCartOnLogin();
            }
            
            alert(result.message);
            
            // Kiểm tra có redirect URL không
            const redirectUrl = sessionStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                sessionStorage.removeItem('redirectAfterLogin');
                window.location.href = redirectUrl;
            } else {
                // Mặc định về trang chủ
                window.location.href = 'index.html';
            }
        } else {
            alert(result.message);
        }
    });
}

// Initialize signup form
function initSignupForm() {
    const signupForm = document.getElementById('signupForm');
    if (!signupForm) return;
    
    signupForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Get form data
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword')?.value;
        const fullname = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone')?.value.trim() || null;
        const dob = document.getElementById('dob')?.value || null;
        const gender = document.getElementById('gender')?.value || null;
        
        // Validate
        if (!username || !password || !fullname || !email) {
            alert('Please fill in all required fields!');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters!');
            return;
        }
        
        if (confirmPassword && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        const userData = {
            username: username,
            password: password,
            full_name: fullname,
            email: email,
            phone: phone,
            DOB: dob,
            gender: gender
        };
        
        // Show loading
        const submitBtn = event.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Signing up...';
        submitBtn.disabled = true;
        
        // Call signup API
        const result = await signup(userData);
        
        // Restore button
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (result.success) {
            alert(result.message + '\nPlease login to continue.');
            window.location.href = 'login.html';
        } else {
            alert(result.message);
        }
    });
}

// Auto initialize when DOM loaded
document.addEventListener('DOMContentLoaded', function() {
    updateAuthMenu();
    initLoginForm();
    initSignupForm();
});

// Export functions to window object
window.login = login;
window.signup = signup;
window.logout = logout;
window.isUserLoggedIn = isUserLoggedIn;
window.getCurrentUser = getCurrentUser;
window.updateAuthMenu = updateAuthMenu;
window.handleLogout = handleLogout;