// Menubar responsive
const Menubar = document.querySelector('.header-bar-icon');
const headerNav = document.querySelector('.header-nav');
if (Menubar && headerNav) {
    Menubar.addEventListener('click', () => {
        headerNav.classList.toggle('active');
    });
}

// Sticky header
window.addEventListener('scroll', () => {
    const header = document.querySelector('#header');
    if (header) {
        if (scrollY > 50) {
            header.classList.add('active');
        } else {
            header.classList.remove('active');
        }
    }
});

// Quantity controls for product detail page
const quanPlus = document.querySelector('.ri-add-line');
const quanMinus = document.querySelector('.ri-subtract-line');
const quanInput = document.querySelector('.quantity-input');

if (quanPlus && quanMinus && quanInput) {
    let qty = 1;
    quanPlus.addEventListener('click', () => {
        qty++;
        quanInput.value = qty;
    });
    quanMinus.addEventListener('click', () => {
        if (qty <= 1) {
            return false;
        } else {
            qty--;
            quanInput.value = qty;
        }
    });
}

// ============================================
// CART MODAL UI
// ============================================

// Display cart modal
async function displayCart() {
    const cart = await getUserCart();
    
    console.log('displayCart called, cart:', cart);
    
    // Kiểm tra cart có phải array không
    if (!Array.isArray(cart)) {
        console.error('❌ Cart is not an array:', cart);
        displayCartItems([]);
        return;
    }
    
    displayCartItems(cart);
}

// Helper function to display cart items
function displayCartItems(cart) {
    const cartItemsBody = document.getElementById('cart-items');
    const cartEmpty = document.querySelector('.cart-empty');
    const cartTable = document.querySelector('.cart-table');
    const cartTotalElement = document.getElementById('cart-total-price');
    
    if (!cartItemsBody) {
        console.warn('cart-items element not found');
        return;
    }
    
    // Clear existing items
    cartItemsBody.innerHTML = '';
    
    if (cart.length === 0) {
        if (cartTable) cartTable.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'block';
        if (cartTotalElement) cartTotalElement.textContent = '0 đ';
        return;
    }
    
    if (cartTable) cartTable.style.display = 'table';
    if (cartEmpty) cartEmpty.style.display = 'none';
    
    let total = 0;
    
    cart.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.code || `ITEM_${item.id}`}</td>
            <td><img src="${item.image || item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover;"></td>
            <td>${item.name}</td>
            <td>${formatPrice(item.price)}</td>
            <td>
                <div class="cart-item-quantity">
                    <button onclick="decreaseQuantity(${item.id})">-</button>
                    <input type="number" value="${item.quantity}" readonly>
                    <button onclick="increaseQuantity(${item.id})">+</button>
                </div>
            </td>
            <td>${formatPrice(itemTotal)}</td>
            <td><button class="cart-delete-btn" onclick="removeFromCart(${item.id})"><i class="ri-delete-bin-line"></i></button></td>
        `;
        cartItemsBody.appendChild(row);
    });
    
    if (cartTotalElement) {
        cartTotalElement.textContent = formatPrice(total);
    }
    
    console.log('Cart displayed:', cart.length, 'items, total:', total);
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Increase quantity
async function increaseQuantity(productId) {
    const cart = await getUserCart();
    
    if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        return;
    }
    
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    const user = getCurrentUser();
    
    if (user && user.id) {
        // Update in database
        if (item.cart_itemid) {
            try {
                const response = await fetch(`http://localhost:5200/api/Cart/${item.cart_itemid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: item.quantity + 1 })
                });
                
                if (response.ok) {
                    await updateCartDisplay();
                    displayCart();
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        }
    } else {
        // Update in localStorage
        item.quantity++;
        localStorage.setItem('cart_guest', JSON.stringify(cart));
        await updateCartDisplay();
        displayCart();
    }
}

// Decrease quantity
async function decreaseQuantity(productId) {
    const cart = await getUserCart();
    
    if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        return;
    }
    
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    if (item.quantity <= 1) {
        removeFromCart(productId);
        return;
    }
    
    const user = getCurrentUser();
    
    if (user && user.id) {
        // Update in database
        if (item.cart_itemid) {
            try {
                const response = await fetch(`http://localhost:5200/api/Cart/${item.cart_itemid}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ quantity: item.quantity - 1 })
                });
                
                if (response.ok) {
                    await updateCartDisplay();
                    displayCart();
                }
            } catch (error) {
                console.error('Error updating quantity:', error);
            }
        }
    } else {
        // Update in localStorage
        item.quantity--;
        localStorage.setItem('cart_guest', JSON.stringify(cart));
        await updateCartDisplay();
        displayCart();
    }
}

// Add product to cart from button
async function addProductToCart(button) {
    const parentDiv = button.closest('.hot-product-item');
    
    const product = {
        id: parseInt(parentDiv.dataset.code.replace('SP', '')), // Extract ID from code
        name: parentDiv.dataset.name,
        price: parseFloat(parentDiv.dataset.price),
        imageUrl: parentDiv.dataset.image,
        image: parentDiv.dataset.image
    };
    
    console.log('Adding product:', product);
    
    // Check if addToCart exists
    if (typeof addToCart !== 'function') {
        alert('Cart system not loaded. Please refresh the page.');
        return;
    }
    
    // Show loading
    const originalText = button.innerHTML;
    button.innerHTML = '<i class="ri-loader-4-line"></i> Adding...';
    button.disabled = true;
    
    try {
        const result = await addToCart(product, 1);
        
        if (result.success) {
            button.innerHTML = '<i class="ri-check-line"></i> Added!';
            setTimeout(() => {
                button.innerHTML = originalText;
                button.disabled = false;
            }, 1500);
        } else {
            alert(result.message || 'Failed to add to cart');
            button.innerHTML = originalText;
            button.disabled = false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error adding to cart');
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Add product from detail page with quantity
async function addProductDetailToCart() {
    const section = document.getElementById('product-detail-section');
    const quantityInput = document.getElementById('detail-quantity');
    
    if (!section || !quantityInput) {
        alert('Error: Product detail elements not found');
        return;
    }
    
    const product = {
        id: parseInt(section.dataset.code.replace('SP', '')),
        name: section.dataset.name,
        price: parseFloat(section.dataset.price),
        imageUrl: section.dataset.image,
        image: section.dataset.image
    };
    
    const quantity = parseInt(quantityInput.value) || 1;
    
    console.log('Adding product from detail page:', product, 'Quantity:', quantity);
    
    // Check if addToCart exists
    if (typeof addToCart !== 'function') {
        alert('Cart system not loaded. Please refresh the page.');
        return;
    }
    
    // Find the button to show feedback
    const button = document.querySelector('.product-detail-right-addtocart .main-btn');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="ri-loader-4-line"></i> Adding...';
        button.disabled = true;
        
        try {
            const result = await addToCart(product, quantity);
            
            if (result.success) {
                button.innerHTML = '<i class="ri-check-line"></i> Added!';
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.disabled = false;
                }, 1500);
            } else {
                alert(result.message || 'Failed to add to cart');
                button.innerHTML = originalText;
                button.disabled = false;
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error adding to cart');
            button.innerHTML = originalText;
            button.disabled = false;
        }
    } else {
        // If button not found, just add to cart
        await addToCart(product, quantity);
    }
}

// Remove from cart
async function removeFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item?')) return;
    
    const cart = await getUserCart();
    
    if (!Array.isArray(cart)) {
        console.error('Cart is not an array');
        return;
    }
    
    const user = getCurrentUser();
    
    if (user && user.id) {
        // Remove from database
        const item = cart.find(i => i.id === productId);
        if (item && item.cart_itemid) {
            try {
                const response = await fetch(`http://localhost:5200/api/Cart/${item.cart_itemid}`, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    await updateCartDisplay();
                    displayCart();
                    alert('Item removed from cart');
                } else {
                    alert('Error removing item');
                }
            } catch (error) {
                console.error('Error removing item:', error);
                alert('Error removing item');
            }
        }
    } else {
        // Remove from localStorage
        const newCart = cart.filter(i => i.id !== productId);
        localStorage.setItem('cart_guest', JSON.stringify(newCart));
        await updateCartDisplay();
        displayCart();
        alert('Item removed from cart');
    }
}

// Continue shopping
function continueShopping() {
    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartOverlay) {
        cartOverlay.classList.remove('active');
    }
}

// Checkout
async function checkout() {
    const cart = await getUserCart();
    
    if (!Array.isArray(cart) || cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const user = getCurrentUser();
    
    if (!user || !user.id) {
        alert('Please login to checkout');
        sessionStorage.setItem('redirectAfterLogin', window.location.href);
        window.location.href = 'login.html';
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// ============================================
// CART MODAL EVENT LISTENERS
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const cartIcon = document.querySelector('.header-cart');
    const cartOverlay = document.querySelector('.cart-overlay');
    const cartClose = document.querySelector('.cart-close');
    
    // Open cart modal
    if (cartIcon) {
        cartIcon.addEventListener('click', function() {
            if (cartOverlay) {
                cartOverlay.classList.add('active');
                displayCart();
            }
        });
    }
    
    // Close cart modal
    if (cartClose) {
        cartClose.addEventListener('click', function() {
            if (cartOverlay) {
                cartOverlay.classList.remove('active');
            }
        });
    }
    
    // Close cart when clicking outside
    if (cartOverlay) {
        cartOverlay.addEventListener('click', function(e) {
            if (e.target === cartOverlay) {
                cartOverlay.classList.remove('active');
            }
        });
    }
    
    // Initialize cart number
    if (typeof updateCartDisplay === 'function') {
        updateCartDisplay();
    }
});

// Export functions for external use
window.displayCart = displayCart;
window.increaseQuantity = increaseQuantity;
window.decreaseQuantity = decreaseQuantity;
window.removeFromCart = removeFromCart;
window.continueShopping = continueShopping;
window.checkout = checkout;
window.formatPrice = formatPrice;