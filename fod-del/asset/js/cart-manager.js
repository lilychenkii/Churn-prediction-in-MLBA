const CART_API_URL = 'http://localhost:5200/api/Cart';

// Lấy giỏ hàng của user hiện tại
async function getUserCart() {
    const user = getCurrentUser();
    
    if (user && user.id) {
        // User đã login - lấy từ database
        try {
            const response = await fetch(`${CART_API_URL}/${user.id}`);
            
            if (response.ok) {
                const cartItems = await response.json();
                console.log('Cart from API:', cartItems);
                
                // Validate response is array
                if (!Array.isArray(cartItems)) {
                    console.error('API returned non-array:', cartItems);
                    return [];
                }
                
                // Convert sang format tương thích
                const formattedCart = cartItems.map(item => {
                    // Fix image path: dùng backend URL
                    let imagePath = item.product?.imageUrl || "images/default.jpg";
                    if (imagePath && !imagePath.startsWith('http')) {
                        imagePath = `http://localhost:5200/${imagePath}`;
                    }
                    
                    return {
                        id: item.product?.id || item.itemid,
                        cart_itemid: item.cart_itemid,
                        name: item.product?.name || "Unknown Product",
                        price: item.product?.price || 0,
                        image: imagePath,
                        imageUrl: imagePath,
                        quantity: item.quantity || 1,
                        code: `ITEM_${item.product?.id || item.itemid}`,
                        added_at: item.added_at
                    };
                });
                
                console.log('Formatted cart:', formattedCart);
                return formattedCart;
                
            } else if (response.status === 404) {
                console.log('Cart not found (404), returning empty array');
                return [];
            } else {
                console.error('Error loading cart, status:', response.status);
                const errorText = await response.text();
                console.error('Error details:', errorText);
                return [];
            }
        } catch (error) {
            console.error('Fetch error:', error);
            // Fallback to localStorage on error
            const localCart = localStorage.getItem(`cart_user_${user.id}`);
            return localCart ? JSON.parse(localCart) : [];
        }
    } else {
        // Guest - dùng localStorage
        try {
            const guestCart = localStorage.getItem('cart_guest');
            const cart = guestCart ? JSON.parse(guestCart) : [];
            
            // Validate is array
            if (!Array.isArray(cart)) {
                console.warn('localStorage cart is not array, resetting');
                localStorage.setItem('cart_guest', '[]');
                return [];
            }
            
            console.log('Guest cart from localStorage:', cart);
            return cart;
        } catch (error) {
            console.error('Error parsing localStorage cart:', error);
            localStorage.setItem('cart_guest', '[]');
            return [];
        }
    }
}

// Thêm sản phẩm vào giỏ hàng
async function addToCart(product, quantity = 1) {
    console.log('addToCart called:', { product, quantity });
    
    // Validate product data
    if (!product || !product.id || !product.name || !product.price) {
        console.error('nvalid product data:', product);
        return { success: false, message: 'Invalid product data' };
    }
    
    const user = getCurrentUser();
    
    if (user && user.id) {
        // User đã login - lưu vào database
        try {
            console.log('Sending POST to API...');
            
            const response = await fetch(CART_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customerId: user.id,
                    itemId: product.id,
                    quantity: quantity
                })
            });
            
            console.log('Response status:', response.status);
            
            const result = await response.json();
            console.log('Response body:', result);
            
            if (response.ok && result.success) {
                await updateCartDisplay();
                return { success: true, message: 'Added to cart successfully!' };
            } else {
                console.error('API returned error:', result);
                return { success: false, message: result.message || 'Failed to add to cart' };
            }
        } catch (error) {
            console.error('Fetch error:', error);
            return { success: false, message: 'Connection error: ' + error.message };
        }
    } else {
        // Guest - lưu vào localStorage
        console.log('Saving to guest cart (localStorage)');
        
        try {
            let cart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
            
            // Validate is array
            if (!Array.isArray(cart)) {
                console.warn('cart_guest is not array, resetting');
                cart = [];
            }
            
            const existingItem = cart.find(item => item.id === product.id);
            
            if (existingItem) {
                console.log('Item exists, updating quantity');
                existingItem.quantity += quantity;
            } else {
                console.log('Adding new item to cart');
                
                // Fix image path for guest cart - dùng backend URL
                let imagePath = product.imageUrl || product.image || 'images/default.jpg';
                if (imagePath && !imagePath.startsWith('http')) {
                    imagePath = `http://localhost:5200/${imagePath}`;
                }
                
                cart.push({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    image: imagePath,
                    imageUrl: imagePath,
                    quantity: quantity,
                    code: `ITEM_${product.id}`,
                    added_at: new Date().toISOString()
                });
            }
            
            localStorage.setItem('cart_guest', JSON.stringify(cart));
            console.log('Saved to localStorage:', cart);
            
            await updateCartDisplay();
            
            return { success: true, message: 'Added to cart successfully!' };
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return { success: false, message: 'Error saving to cart' };
        }
    }
}

// Cập nhật hiển thị giỏ hàng
async function updateCartDisplay() {
    try {
        const cart = await getUserCart();
        console.log('Updating cart display, items:', cart.length);
        
        // Validate cart is array
        if (!Array.isArray(cart)) {
            console.error('Cart is not an array in updateCartDisplay:', cart);
            return;
        }
        
        const cartIcon = document.querySelector('.header-cart i');
        
        if (cartIcon) {
            const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
            cartIcon.setAttribute('number', totalItems);
            console.log('Cart icon updated to:', totalItems);
        }
        
        // Update cart modal if displayed
        if (typeof displayCart === 'function') {
            const cartOverlay = document.querySelector('.cart-overlay');
            if (cartOverlay && cartOverlay.classList.contains('active')) {
                displayCart();
            }
        }
    } catch (error) {
        console.error('Error in updateCartDisplay:', error);
    }
}

// Xóa giỏ hàng hiển thị (khi logout)
function clearDisplayedCart() {
    // Xóa tất cả cart cache
    localStorage.removeItem('cart_guest');
    
    // Xóa tất cả cart của các user (tìm và xóa tất cả key bắt đầu bằng 'cart_user_')
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cart_user_')) {
            localStorage.removeItem(key);
        }
    });
    
    // Reset cart icon về 0
    const cartIcon = document.querySelector('.header-cart i');
    if (cartIcon) {
        cartIcon.setAttribute('number', '0');
    }
}

// Load giỏ hàng khi login
async function loadUserCartOnLogin() {
    await updateCartDisplay();
}

// Chuyển giỏ hàng guest sang user khi login
async function transferGuestCartToUser() {
    try {
        const guestCart = JSON.parse(localStorage.getItem('cart_guest') || '[]');
        
        if (!Array.isArray(guestCart) || guestCart.length === 0) {
            console.log('No guest cart to transfer');
            return;
        }
        
        const user = getCurrentUser();
        
        if (!user || !user.id) {
            console.warn('No user logged in, cannot transfer cart');
            return;
        }
        
        console.log('Transferring', guestCart.length, 'items from guest cart to user', user.id);
        
        for (const item of guestCart) {
            try {
                await fetch(CART_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        customerId: user.id,
                        itemId: item.id,
                        quantity: item.quantity
                    })
                });
            } catch (error) {
                console.error('Error transferring item:', item.id, error);
            }
        }
        
        localStorage.removeItem('cart_guest');
        await loadUserCartOnLogin();
        
        console.log('Guest cart transferred successfully');
    } catch (error) {
        console.error('Error in transferGuestCartToUser:', error);
    }
}

// Update menu based on login status
        function updateAuthMenu() {
            const authMenuContainer = document.getElementById('auth-menu');
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
        
        function handleLogout(event) {
            event.preventDefault();
            if (confirm('Bạn có chắc muốn đăng xuất?')) {
                logout();
            }
        }
        
        // Get URL parameter
        function getURLParameter(name) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(name);
        }
        
        // Load product detail
        async function loadProductDetail() {
            const productId = getURLParameter('id');
            
            if (!productId) {
                document.getElementById('product-detail-container').innerHTML = 
                    '<p style="text-align: center; width: 100%; padding: 40px; color: #f44336;">Product not found</p>';
                return;
            }
            
            if (typeof fetchProductById !== 'function') {
                document.getElementById('product-detail-container').innerHTML = 
                    '<p style="text-align: center; width: 100%; padding: 40px; color: #f44336;">API not available</p>';
                return;
            }
            
            const product = await fetchProductById(productId);
            
            if (!product) {
                document.getElementById('product-detail-container').innerHTML = 
                    '<p style="text-align: center; width: 100%; padding: 40px; color: #f44336;">Product not found</p>';
                return;
            }
            
            // Update breadcrumb
            document.getElementById('product-breadcrumb').textContent = product.name;
            
            // Update product detail section with data attributes
            const section = document.getElementById('product-detail-section');
            section.dataset.code = product.code;
            section.dataset.name = product.name;
            section.dataset.price = product.price;
            section.dataset.image = product.image;
            
            // Render product detail
            const container = document.getElementById('product-detail-container');
            container.innerHTML = `
                <div class="product-detail-left">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-detail-right">
                    <div class="product-detail-right-infor">
                        <h1>${product.name}</h1>
                        <div class="product-item-price">
                            <p>${product.price.toLocaleString('vi-VN')} <sup>đ</sup></p>
                        </div>
                    </div>
                    <div class="product-detail-right-des">
                        <h2>Description</h2>
                        <ul>
                            <li>${product.description || 'No description available'}</li>
                        </ul>
                    </div>
                    <div class="product-detail-right-quantity">
                        <h2>Quantity:</h2>
                        <div class="product-detail-right-quantity-input">
                            <i class="ri-subtract-line" onclick="decreaseDetailQuantity()"></i>
                            <input onkeydown="return false" class="quantity-input" type="number" value="1" id="detail-quantity">
                            <i class="ri-add-line" onclick="increaseDetailQuantity()"></i>
                        </div>
                    </div>
                    <div class="product-detail-right-addtocart">
                        <button class="main-btn" onclick="addProductDetailToCart()">Add to Cart</button>
                    </div>
                </div>
            `;
            
            // Load related products
            loadRelatedProducts(product.category);
        }
        
        // Increase/decrease quantity for detail page
        function increaseDetailQuantity() {
            const input = document.getElementById('detail-quantity');
            input.value = parseInt(input.value) + 1;
        }
        
        function decreaseDetailQuantity() {
            const input = document.getElementById('detail-quantity');
            if (parseInt(input.value) > 1) {
                input.value = parseInt(input.value) - 1;
            }
        }
        
        // Load related products (same category)
        async function loadRelatedProducts(category) {
            const container = document.getElementById('related-products-container');
            
            if (typeof fetchProductsFromAPI !== 'function') {
                container.innerHTML = '';
                return;
            }
            
            const allProducts = await fetchProductsFromAPI();
            const relatedProducts = allProducts.filter(p => p.category === category).slice(0, 4);
            
            if (relatedProducts.length === 0) {
                container.innerHTML = '';
                return;
            }
            
            container.innerHTML = '';
            relatedProducts.forEach(product => {
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
                    <button class="main-btn add-to-cart-btn" onclick="addProductToCart(this)">Add to cart</button>
                `;
                
                container.appendChild(productDiv);
            });
        }
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', async function () {
    updateAuthMenu();

    // Chỉ load chi tiết sản phẩm nếu trang có container (product-detail.html)
    if (document.getElementById('product-detail-container')) {
        await loadProductDetail();
    }

    // Luôn cập nhật số lượng giỏ hàng (guest hoặc user)
    await updateCartDisplay();
});
// Export functions
window.getUserCart = getUserCart;
window.addToCart = addToCart;
window.updateCartDisplay = updateCartDisplay;
window.clearDisplayedCart = clearDisplayedCart;
window.loadUserCartOnLogin = loadUserCartOnLogin;
window.transferGuestCartToUser = transferGuestCartToUser;
window.increaseDetailQuantity = increaseDetailQuantity;
window.decreaseDetailQuantity = decreaseDetailQuantity;

console.log('cart-manager.js loaded');