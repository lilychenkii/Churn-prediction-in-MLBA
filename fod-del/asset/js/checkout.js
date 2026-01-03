// API URL
const CHECKOUT_API_URL = 'http://localhost:5200/api/Order'; // Chỉ khai báo 1 lần

// Load checkout items
async function loadCheckoutItems() {
    try {
        console.log('Loading checkout items...');
        
        // Check if getUserCart exists
        if (typeof getUserCart !== 'function') {
            console.error('getUserCart is not defined!');
            console.log('Available functions:', Object.keys(window).filter(k => typeof window[k] === 'function' && k.includes('cart')));
            alert('Error: Cart system not loaded. Please go back to cart page.');
            window.location.href = 'index.html';
            return;
        }
        
        const cart = await getUserCart();
        console.log('🛒 Cart items:', cart);
        
        // Validate cart is array
        if (!Array.isArray(cart)) {
            console.error('Cart is not an array:', cart);
            alert('Error loading cart. Please try again.');
            window.location.href = 'index.html';
            return;
        }
        
        if (cart.length === 0) {
            alert('Your cart is empty!');
            window.location.href = 'index.html';
            return;
        }
        
        displayCheckoutItems(cart);
        
    } catch (error) {
        console.error('Error loading checkout items:', error);
        alert('Error loading cart. Please try again.');
        window.location.href = 'index.html';
    }
}

// Display checkout items
function displayCheckoutItems(cart) {
    const checkoutItemsContainer = document.getElementById('order-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping-fee');
    const totalElement = document.getElementById('total-price');

    if (!checkoutItemsContainer) {
        console.error('checkout-items container not found');
        return;
    }
    
    const orderItemsBody = document.getElementById('order-items');

    orderItemsBody.innerHTML = '';

    let subtotal = 0;

    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
    
    const row = document.createElement('tr');
    row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.quantity}</td>
        <td>${formatPrice(itemTotal)}</td>
    `;
    orderItemsBody.appendChild(row);
});
    
    // Calculate shipping (free if > 200k, else 30k)
    const shipping = subtotal > 200000 ? 0 : 30000;
    
    // Calculate discount if coupon applied
    let discount = 0;
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discount = subtotal * (appliedCoupon.value / 100);
        } else if (appliedCoupon.type === 'fixed') {
            discount = appliedCoupon.value;
        } else if (appliedCoupon.type === 'shipping') {
            discount = shipping;
        }
        
        // Show discount row
        const discountRow = document.getElementById('discount-row');
        const discountAmount = document.getElementById('discount-amount');
        if (discountRow && discountAmount) {
            discountRow.style.display = 'flex';
            discountAmount.textContent = `- ${formatPrice(discount)}`;
        }
    }
    
    const total = subtotal + shipping - discount;
    
    if (subtotalElement) subtotalElement.textContent = formatPrice(subtotal);
    if (shippingElement) shippingElement.textContent = formatPrice(shipping);
    if (totalElement) totalElement.textContent = formatPrice(total);
    
    console.log('Checkout items displayed');
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Place order
async function placeOrder(event) {
    if (event) event.preventDefault();
    
    try {
        console.log('Placing order...');
        
        // DISABLE BUTTON NGAY ĐỂ TRÁNH DOUBLE-CLICK
        const placeOrderBtn = document.getElementById('place-order-btn');
        if (placeOrderBtn) {
            if (placeOrderBtn.disabled) {
                console.warn('Button already disabled - preventing duplicate submission');
                return; // Thoát nếu đang xử lý rồi
            }
            placeOrderBtn.disabled = true;
            placeOrderBtn.textContent = 'Đang xử lý...';
        }
        
        // Check if user is logged in
        const user = getCurrentUser();
        if (!user || !user.id) {
            alert('Please login to place order');
            window.location.href = 'login.html';
            return;
        }
        
        // Check if getUserCart exists
        if (typeof getUserCart !== 'function') {
            console.error('getUserCart is not defined!');
            alert('Error: Cart system not loaded. Please refresh the page.');
            return;
        }
        
        // Get cart items
        const cart = await getUserCart();
        
        if (!Array.isArray(cart) || cart.length === 0) {
            alert('Your cart is empty!');
            window.location.href = 'index.html';
            return;
        }
        
        // Get form data
        const fullName = document.getElementById('customerName')?.value;
        const phone = document.getElementById('customerPhone')?.value;
        const deliveryAddress = document.getElementById('deliveryAddress')?.value;
        const notes = document.getElementById('customerNote')?.value;
        const saveAddress = document.getElementById('saveAddress')?.checked;
        
        // Get payment method
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cod';
        
        // Validate form
        if (!fullName || !phone || !deliveryAddress) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // Calculate totals with discount
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 200000 ? 0 : 30000;
        
        let discount = 0;
        let couponCode = null;
        
        if (appliedCoupon) {
            couponCode = appliedCoupon.code;
            if (appliedCoupon.type === 'percent') {  // Match database: 'percent'
                discount = subtotal * (appliedCoupon.value / 100);
            } else if (appliedCoupon.type === 'fixed') {
                discount = appliedCoupon.value;
            } else if (appliedCoupon.type === 'shipping') {
                discount = shipping;
            }
        }
        
        const total = subtotal + shipping - discount;
        
        // Optional: Save address to customer profile if checkbox is checked
        if (saveAddress) {
            try {
                await fetch(`http://localhost:5200/api/Customer/${user.id}/address`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: deliveryAddress,
                        phone: phone
                    })
                });
                console.log('Address saved to customer profile');
            } catch (error) {
                console.error('Error saving address (non-critical):', error);
            }
        }
        
        // Prepare order data
        const orderData = {
            customerId: user.id,
            restaurantId: 1,
            deliveryAddress: deliveryAddress,
            notes: notes || null,
            discount: discount,
            couponCode: couponCode,
            paymentMethod: paymentMethod,
            deliveryFee: shipping,  // Add shipping fee
            items: cart.map(item => ({
                itemId: item.id,
                quantity: item.quantity,
                unitPrice: item.price
            }))
        };
        
        console.log('Sending order data:', orderData);
        
        // Send to API
        const response = await fetch(CHECKOUT_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });
        
        console.log('Response status:', response.status);
        
        const result = await response.json();
        console.log('Response body:', result);
        
        if (response.ok) {
            console.log('Order placed successfully!');
            console.log('Order ID:', result.orderId);
            console.log('Driver info:', result.driver);
            
            // Show driver info FIRST if available
            if (result.driver) {
                displayDriverInfo(result.driver);
                console.log('Driver info displayed');
            } else {
                console.log('No driver info in response');
            }
            
            // Show restaurant info if available
            if (result.restaurant) {
                displayRestaurantInfo(result.restaurant);
                console.log('Restaurant info displayed');
            } else {
                console.log('No restaurant info in response');
            }
            
            // Xử lý theo phương thức thanh toán
            if (paymentMethod === 'bank') {
                // CHUYỂN KHOẢN: KHÔNG XÓA GIỎ HÀNG - Chờ xác nhận thanh toán
                // Hiển thị modal SAU KHI driver info đã show
                setTimeout(() => {
                    showBankTransferInfo(result, paymentMethod);
                }, 500); // Delay 500ms để user thấy driver info trước
                
            } else {
                // COD: Show success message with driver info, KHÔNG redirect ngay
                let driverInfo = '';
                if (result.driver) {
                    driverInfo = `\n\nYour Driver:\n${result.driver.fullName}\nPhone: ${result.driver.phone}\nVehicle: ${result.driver.vehicleType} - ${result.driver.plateNumber}\nRating: ⭐ ${result.driver.ratingAvg}/5.0`;
                }
                
                alert(`Order Placed Successfully!\n\nOrder ID: #${result.orderId}\nTotal: ${formatPrice(result.total)}\n\nPayment Method: Cash on Delivery (COD)${driverInfo}\n\nThank you for your order!\n\nYou can see your driver details on this page before returning home.`);
                
                // Clear cart
                if (typeof clearDisplayedCart === 'function') {
                    clearDisplayedCart();
                }
                
                // Clear cart in API
                if (user.id) {
                    try {
                        await fetch(`http://localhost:5200/api/Cart/clear/${user.id}`, {
                            method: 'DELETE'
                        });
                    } catch (error) {
                        console.error('Error clearing cart:', error);
                    }
                }
                
                // Disable place order button
                const placeOrderBtn = document.getElementById('place-order-btn');
                if (placeOrderBtn) {
                    placeOrderBtn.disabled = true;
                    placeOrderBtn.textContent = 'Order Placed';
                    placeOrderBtn.style.background = '#888';
                }
                
                // Add a "Go to Home" button instead of auto-redirect
                const checkoutBtnContainer = placeOrderBtn?.parentElement;
                if (checkoutBtnContainer && !document.getElementById('go-home-btn')) {
                    const goHomeBtn = document.createElement('a');
                    goHomeBtn.id = 'go-home-btn';
                    goHomeBtn.href = 'index.html';
                    goHomeBtn.className = 'main-btn checkout-btn-submit';
                    goHomeBtn.textContent = 'Go to Home';
                    goHomeBtn.style.marginTop = '10px';
                    checkoutBtnContainer.appendChild(goHomeBtn);
                }
                
                // Scroll to driver info to make sure user sees it
                const driverSection = document.getElementById('driver-info-section');
                if (driverSection) {
                    driverSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
            
        } else {
            // Log chi tiết lỗi
            console.error('API Error:', result);
            throw new Error(result.message || result.error || 'Failed to place order');
        }
        
    } catch (error) {
        console.error('Error placing order:', error);
        alert('Error placing order: ' + error.message);
        
        // Reset button on error
        const btn = document.getElementById('place-order-btn');
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Place Order';
        }
    }
}

// Hiển thị thông tin chuyển khoản ngân hàng
function showBankTransferInfo(orderResult, paymentMethod) {
    // Get modal first
    const modal = document.getElementById('bank-transfer-modal');
    
    // Update modal content
    document.getElementById('transfer-amount').textContent = formatPrice(orderResult.total);
    document.getElementById('transfer-note').textContent = `SIPSWEET ${orderResult.orderId}`;
    document.getElementById('modal-order-id').textContent = `#${orderResult.orderId}`;
    
    // Lưu userId, orderId, total để dùng khi đóng modal
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.id && modal) {
        modal.dataset.userId = currentUser.id;
        modal.dataset.orderId = orderResult.orderId;
        modal.dataset.orderTotal = orderResult.total;
    }
    
    // Show modal
    if (modal) {
        modal.style.display = 'flex';
    }
}

// Close modal - User đã xem thông tin TK
async function closeBankModal() {
    const modal = document.getElementById('bank-transfer-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Display success message
    const orderId = modal?.dataset?.orderId || 'N/A';
    const orderTotal = modal?.dataset?.orderTotal || '0';
    
    alert(`Order Confirmed!\n\nOrder ID: #${orderId}\nTotal: ${formatPrice(parseFloat(orderTotal))}\n\nPayment Method: Bank Transfer\n\nPlease complete the transfer within 24 hours.\n\nYou can see your driver details below before returning home.`);
    
    // Xóa giỏ hàng SAU KHI user đã xem thông tin chuyển khoản
    if (typeof clearDisplayedCart === 'function') {
        clearDisplayedCart();
    }
    
    // Clear cart in API
    const userId = modal?.dataset?.userId;
    if (userId) {
        try {
            await fetch(`http://localhost:5200/api/Cart/clear/${userId}`, {
                method: 'DELETE'
            });
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    }
    
    // Disable place order button
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.disabled = true;
        placeOrderBtn.textContent = 'Order Placed';
        placeOrderBtn.style.background = '#888';
    }
    
    // Add "Go to Home" button
    const checkoutBtnContainer = placeOrderBtn?.parentElement;
    if (checkoutBtnContainer && !document.getElementById('go-home-btn')) {
        const goHomeBtn = document.createElement('a');
        goHomeBtn.id = 'go-home-btn';
        goHomeBtn.href = 'index.html';
        goHomeBtn.className = 'main-btn checkout-btn-submit';
        goHomeBtn.textContent = 'Go to Home';
        goHomeBtn.style.marginTop = '10px';
        checkoutBtnContainer.appendChild(goHomeBtn);
    }
    
    // Scroll to driver info
    const driverSection = document.getElementById('driver-info-section');
    if (driverSection && driverSection.style.display !== 'none') {
        setTimeout(() => {
            driverSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }
}

// Export function to global
window.closeBankModal = closeBankModal;

// Display driver info on page
function displayDriverInfo(driver) {
    const driverSection = document.getElementById('driver-info-section');
    const driverName = document.getElementById('driver-name');
    const driverPhone = document.getElementById('driver-phone');
    const driverVehicle = document.getElementById('driver-vehicle');
    const driverPlate = document.getElementById('driver-plate');
    const driverRating = document.getElementById('driver-rating');
    const driverDeliveryTime = document.getElementById('driver-delivery-time');
    
    if (!driverSection) return;
    
    // Populate driver info
    if (driverName) driverName.textContent = driver.fullName || '-';
    if (driverPhone) driverPhone.textContent = driver.phone || '-';
    if (driverVehicle) driverVehicle.textContent = driver.vehicleType || '-';
    if (driverPlate) driverPlate.textContent = driver.plateNumber || '-';
    if (driverRating) driverRating.textContent = driver.ratingAvg ? `⭐ ${driver.ratingAvg}/5.0` : '⭐ -';
    
    // Format delivery time
    if (driverDeliveryTime && driver.estimatedDeliveryTime) {
        const deliveryDate = new Date(driver.estimatedDeliveryTime);
        const timeString = deliveryDate.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
        driverDeliveryTime.textContent = timeString;
    }
    
    // Show the section
    driverSection.style.display = 'block';
    
    // Scroll to driver info
    driverSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.displayDriverInfo = displayDriverInfo;

// Display restaurant info on page
function displayRestaurantInfo(restaurant) {
    const restaurantSection = document.getElementById('restaurant-info-section');
    const restaurantName = document.getElementById('restaurant-name');
    const restaurantCuisine = document.getElementById('restaurant-cuisine');
    const restaurantPhone = document.getElementById('restaurant-phone');
    const restaurantAddress = document.getElementById('restaurant-address');
    const restaurantRating = document.getElementById('restaurant-rating');
    
    if (!restaurantSection) return;
    
    // Populate restaurant info
    if (restaurantName) restaurantName.textContent = restaurant.name || '-';
    if (restaurantCuisine) restaurantCuisine.textContent = restaurant.cuisineType || '-';
    if (restaurantPhone) restaurantPhone.textContent = restaurant.phone || '-';
    if (restaurantAddress) restaurantAddress.textContent = restaurant.address || '-';
    if (restaurantRating) restaurantRating.textContent = restaurant.ratingAvg ? `⭐ ${restaurant.ratingAvg}/5.0` : '⭐ -';
    
    // Show the section
    restaurantSection.style.display = 'block';
    
    // Scroll to restaurant info
    restaurantSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.displayRestaurantInfo = displayRestaurantInfo;

// Coupon functionality
let appliedCoupon = null;

async function applyCoupon() {
    const couponInput = document.getElementById('coupon-code');
    const couponMessage = document.getElementById('coupon-message');
    const couponCode = couponInput.value.trim().toUpperCase();
    
    if (!couponCode) {
        couponMessage.innerHTML = '<span style="color: #E195AB;">Please enter a coupon code</span>';
        return;
    }
    
    try {
        const response = await fetch(`http://localhost:5200/api/Coupon/validate/${couponCode}`);
        const result = await response.json();
        
        if (result.valid) {
            appliedCoupon = result.coupon;
            couponMessage.innerHTML = `<span style="color: #E195AB;">${result.message}</span>`;
            couponInput.disabled = true;
            
            // Recalculate totals
            await loadCheckoutItems();
        } else {
            couponMessage.innerHTML = `<span style="color: #E195AB;">${result.message}</span>`;
            appliedCoupon = null;
        }
    } catch (error) {
        console.error('Error validating coupon:', error);
        couponMessage.innerHTML = '<span style="color: #E195AB;">Error validating coupon</span>';
    }
}

window.applyCoupon = applyCoupon;

// Initialize checkout page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Checkout page loaded');
    
    // Check if required functions exist
    console.log('Functions check:');
    console.log('  - getCurrentUser:', typeof getCurrentUser);
    console.log('  - getUserCart:', typeof getUserCart);
    console.log('  - clearDisplayedCart:', typeof clearDisplayedCart);
    
    // Check if user is logged in
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('Please login to checkout');
        window.location.href = 'login.html';
        return;
    }
    
    // Load checkout items
    loadCheckoutItems();
    
    // Attach button click event
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener('click', function(e) {
            e.preventDefault(); // Tránh reload trang
            placeOrder(e);
        });
    } else {
        console.error('place-order-btn not found!');
    }
});

// Export functions
window.loadCheckoutItems = loadCheckoutItems;
window.placeOrder = placeOrder;

console.log('checkout.js loaded');