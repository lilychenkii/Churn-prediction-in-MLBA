// Products Database - Will be loaded from API
let productsData = [];

// Pagination settings
const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let currentCategory = 'all';
let filteredProducts = [];

// Category names mapping
const categoryNames = {
    'all': 'All Products',
    'drink': 'Drink',
    'coffee': 'Coffee',
    'tea-milktea': 'Tea & Milktea',
    'frappuccino': 'Frappuccino',
    'latte': 'Latte',
    'cake': 'Cake',
    'cold-cake': 'Cold Cake',
    'bread': 'Bread',
    'cookies': 'Cookies',
    'tart': 'Tart',
    'sponge-cake': 'Sponge Cake'
};

// Get URL parameter
function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Filter products by category
function filterProducts(category) {
    console.log('Filtering by category:', category);
    console.log('Total products:', productsData.length);
    
    currentCategory = category;
    currentPage = 1;
    
    if (category === 'all') {
        filteredProducts = productsData;
    } else if (category === 'drink') {
        // Filter all drink categories
        filteredProducts = productsData.filter(product => 
            ['coffee', 'tea-milktea', 'frappuccino', 'latte'].includes(product.category)
        );
    } else if (category === 'cake') {
        // Filter all cake categories
        filteredProducts = productsData.filter(product => 
            ['cold-cake', 'bread', 'cookies', 'tart', 'sponge-cake'].includes(product.category)
        );
    } else {
        filteredProducts = productsData.filter(product => product.category === category);
    }
    
    console.log('Filtered products:', filteredProducts.length);
    console.log('Sample filtered:', filteredProducts.slice(0, 3));
    
    updateCategoryTitle();
    displayProducts();
    displayPagination();
    updateActiveTab();
}

// Update category title
function updateCategoryTitle() {
    const title = document.getElementById('category-title');
    const breadcrumb = document.getElementById('category-breadcrumb');
    const categoryName = categoryNames[currentCategory] || 'All';
    
    if (title) title.textContent = categoryName;
    if (breadcrumb) breadcrumb.textContent = categoryName;
}

// Display products
function displayProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Calculate pagination
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        container.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: #999;">No products in this category.</p>';
        return;
    }
    
    productsToShow.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.className = 'hot-product-item';
        
        productDiv.innerHTML = `
            <a href="product-detail.html?id=${product.id}">
                <img src="${product.image || product.imageUrl}" alt="${product.name}">
            </a>
            <p><a href="product-detail.html?id=${product.id}">${product.name}</a></p>
            <div class="product-item-price">
                <p>${formatPrice(product.price)}</p>
            </div>
            <button class="main-btn add-to-cart-btn" 
                    data-product-id="${product.id}"
                    data-product-name="${product.name}"
                    data-product-price="${product.price}"
                    data-product-image="${product.image || product.imageUrl}">
                <i class="ri-shopping-cart-line"></i> Add to Cart
            </button>
        `;
        
        container.appendChild(productDiv);
    });
    
    // Add event listeners to all add-to-cart buttons
    attachAddToCartEvents();
}

// Attach event listeners to add-to-cart buttons
function attachAddToCartEvents() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const product = {
                id: parseInt(this.dataset.productId),
                name: this.dataset.productName,
                price: parseFloat(this.dataset.productPrice),
                imageUrl: this.dataset.productImage,
                image: this.dataset.productImage
            };
            
            console.log('🛒 Adding product to cart:', product);
            
            // Check if addToCart function exists
            if (typeof addToCart !== 'function') {
                console.error('addToCart function not found!');
                alert('Error: Cart system not loaded. Please refresh the page.');
                return;
            }
            
            // Show loading on button
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="ri-loader-4-line"></i> Adding...';
            this.disabled = true;
            
            try {
                const result = await addToCart(product, 1);
                
                if (result.success) {
                    // Show success feedback
                    this.innerHTML = '<i class="ri-check-line"></i> Added!';
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                    }, 1500);
                } else {
                    alert(result.message || 'Failed to add to cart');
                    this.innerHTML = originalText;
                    this.disabled = false;
                }
            } catch (error) {
                console.error('Error adding to cart:', error);
                alert('Error adding to cart. Please try again.');
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    });
}

// Display pagination
function displayPagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    pagination.innerHTML = '';
    
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) return;
    
    // Previous button
    if (currentPage > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.innerHTML = '<i class="ri-arrow-left-s-line"></i>';
        prevBtn.onclick = () => changePage(currentPage - 1);
        pagination.appendChild(prevBtn);
    }
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.onclick = () => changePage(i);
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }
    
    // Next button
    if (currentPage < totalPages) {
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.innerHTML = '<i class="ri-arrow-right-s-line"></i>';
        nextBtn.onclick = () => changePage(currentPage + 1);
        pagination.appendChild(nextBtn);
    }
}

// Change page
function changePage(page) {
    currentPage = page;
    displayProducts();
    displayPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Update active tab
function updateActiveTab() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        if (tab.dataset.category === currentCategory) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

// Format price
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    }).format(price);
}

// Initialize menu page
document.addEventListener('DOMContentLoaded', async () => {
    // Show loading message
    const container = document.getElementById('products-container');
    if (container) {
        container.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: #999;">Loading products...</p>';
    }
    
    // Load products from API
    if (typeof fetchProductsFromAPI === 'function') {
        productsData = await fetchProductsFromAPI();
        
        if (productsData.length === 0) {
            if (container) {
                container.innerHTML = '<p style="text-align: center; width: 100%; padding: 40px; color: #f44336;">Cannot load products from server. Please check backend connection.</p>';
            }
            return;
        }
    } else {
        console.warn('fetchProductsFromAPI not found. Using empty products array.');
    }
    
    // Get category from URL
    const categoryFromURL = getURLParameter('category');
    if (categoryFromURL) {
        filterProducts(categoryFromURL);
    } else {
        filterProducts('all');
    }
    
    // Add event listeners to tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterProducts(category);
            
            // Update URL without reload
            const newUrl = category === 'all' ? 'menu.html' : `menu.html?category=${category}`;
            window.history.pushState({}, '', newUrl);
        });
    });
});