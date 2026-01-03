// Checkout Page Functionality
const SHIPPING_FEE = 30000;

// Load cart and display order summary
function loadCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const orderItems = document.getElementById('order-items');
    const subtotalEl = document.getElementById('subtotal');
    const totalPriceEl = document.getElementById('total-price');
    
    // If cart is empty, redirect to home
    if (cart.length === 0) {
        alert('Giỏ hàng trống! Vui lòng thêm sản phẩm trước khi thanh toán.');
        window.location.href = 'index.html';
        return;
    }
    
    // Calculate subtotal
    let subtotal = 0;
    orderItems.innerHTML = '';
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="order-product-info">
                    <img src="${item.image}" alt="${item.name}" class="order-product-image">
                    <div>
                        <p class="product-name">${item.name}</p>
                        <p class="product-code">Mã: ${item.code}</p>
                    </div>
                </div>
            </td>
            <td class="text-center">x${item.quantity}</td>
            <td class="text-right">${formatPrice(item.price * item.quantity)}</td>
        `;
        orderItems.appendChild(row);
    });
    
    // Update totals
    const total = subtotal + SHIPPING_FEE;
    subtotalEl.textContent = formatPrice(subtotal);
    totalPriceEl.textContent = formatPrice(total);
}

// Format price
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + ' đ';
}

// Place order
function placeOrder() {
    const form = document.getElementById('checkoutForm');
    const customerName = document.getElementById('customerName').value.trim();
    const customerPhone = document.getElementById('customerPhone').value.trim();
    const customerAddress = document.getElementById('customerAddress').value.trim();
    const customerNote = document.getElementById('customerNote').value.trim();
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    // Validate form
    if (!customerName || !customerPhone || !customerAddress) {
        alert('Vui lòng điền đầy đủ thông tin người nhận!');
        return;
    }
    
    // Validate phone number (simple validation)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(customerPhone)) {
        alert('Số điện thoại không hợp lệ! Vui lòng nhập 10-11 số.');
        return;
    }
    
    // Get cart data
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('Giỏ hàng trống!');
        return;
    }
    
    // Calculate total
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + SHIPPING_FEE;
    
    // Create order object
    const order = {
        orderId: 'DH' + Date.now(),
        orderDate: new Date().toLocaleString('vi-VN'),
        customer: {
            name: customerName,
            phone: customerPhone,
            address: customerAddress,
            note: customerNote
        },
        items: cart,
        subtotal: subtotal,
        shippingFee: SHIPPING_FEE,
        total: total,
        paymentMethod: paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 'Chuyển khoản ngân hàng',
        status: 'Chờ xác nhận'
    };
    
    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Clear cart
    localStorage.removeItem('cart');
    
    // Show success message
    alert(`Đặt hàng thành công!\nMã đơn hàng: ${order.orderId}\n\nCảm ơn bạn đã đặt hàng. Chúng tôi sẽ liên hệ với bạn sớm nhất!`);
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Auto-fill customer info if logged in
function autoFillCustomerInfo() {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
        if (loggedInUser.hoten) {
            document.getElementById('customerName').value = loggedInUser.hoten;
        }
        if (loggedInUser.dienthoai) {
            document.getElementById('customerPhone').value = loggedInUser.dienthoai;
        }
        if (loggedInUser.diachi) {
            document.getElementById('customerAddress').value = loggedInUser.diachi;
        }
    }
}

// Initialize checkout page
document.addEventListener('DOMContentLoaded', () => {
    loadCheckoutCart();
    autoFillCustomerInfo();
    updateCartNumber();
});

