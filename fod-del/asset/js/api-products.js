// API Configuration
const API_BASE_URL = 'http://localhost:5200/api/Product';

// Fetch all products from backend (no pagination - for compatibility)
async function fetchProductsFromAPI() {
    try {
        const response = await fetch(`${API_BASE_URL}/all`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const products = await response.json();
        
        console.log('Raw products from API:', products.slice(0, 2)); // Log first 2 products
        
        // Transform backend data to frontend format
        const transformed = products.map(product => ({
            code: `SP${String(product.itemid).padStart(3, '0')}`, // Convert itemid to SP001 format
            name: product.name,
            category: getCategoryFromId(product.categoryid), // Map categoryid to category name
            price: product.price,
            image: getImageUrl(product.image_url),
            description: product.descriptionname || '',
            id: product.itemid,
            available: product.available
        }));
        
        console.log('Transformed products:', transformed.slice(0, 2)); // Log first 2 transformed
        
        return transformed;
    } catch (error) {
        console.error('Error fetching products:', error);
        return []; // Return empty array if API fails
    }
}

// Get image URL - handle both base64 and file path
function getImageUrl(imageUrl) {
    if (!imageUrl) return 'http://localhost:5200/images/default.jpg';
    
    // If base64, use directly
    if (imageUrl.startsWith('data:image')) {
        return imageUrl;
    }
    
    // If already has full URL, return as is
    if (imageUrl.startsWith('http')) {
        return imageUrl;
    }
    
    // If file path, create full URL to backend server
    const fullPath = `http://localhost:5200/${imageUrl}`;
    console.log('Image path transform:', imageUrl, '→', fullPath);
    return fullPath;
}

// Map category ID to category name
function getCategoryFromId(categoryId) {
    const categoryMap = {
        1: 'cold-cake',
        2: 'bread',
        3: 'cookies',
        4: 'tart',
        5: 'sponge-cake',
        6: 'coffee',
        7: 'tea-milktea',
        8: 'frappuccino',
        9: 'latte'
    };
    const result = categoryMap[categoryId] || 'other';
    console.log(`Category mapping: ID ${categoryId} → "${result}"`);
    return result;
}

// Fetch products with pagination
async function fetchProductsWithPagination(page = 1, pageSize = 10, filters = {}) {
    try {
        let url = `${API_BASE_URL}?page=${page}&pageSize=${pageSize}`;
        
        // Add filters
        if (filters.categoryId) url += `&categoryId=${filters.categoryId}`;
        if (filters.search) url += `&search=${encodeURIComponent(filters.search)}`;
        if (filters.available !== undefined) url += `&available=${filters.available}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        // Transform products
        const transformedProducts = data.products.map(product => ({
            code: `SP${String(product.itemid).padStart(3, '0')}`,
            name: product.name,
            category: getCategoryFromId(product.categoryid),
            price: product.price,
            image: getImageUrl(product.image_url),
            description: product.descriptionname || '',
            id: product.itemid,
            available: product.available
        }));
        
        return {
            products: transformedProducts,
            pagination: data.pagination
        };
    } catch (error) {
        console.error('Error fetching products with pagination:', error);
        return {
            products: [],
            pagination: {
                currentPage: 1,
                totalPages: 0,
                totalCount: 0,
                pageSize: pageSize,
                hasPrevious: false,
                hasNext: false
            }
        };
    }
}

// Fetch single product by ID
async function fetchProductById(productId) {
    try {
        const response = await fetch(`${API_BASE_URL}/${productId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const product = await response.json();
        
        return {
            code: `SP${String(product.itemid).padStart(3, '0')}`,
            name: product.name,
            category: getCategoryFromId(product.categoryid),
            price: product.price,
            image: getImageUrl(product.image_url),
            description: product.descriptionname || '',
            id: product.itemid,
            available: product.available
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
  const searchInput = document.getElementById('search-input');
  const searchBtn   = document.getElementById('search-btn');
  const listEl      = document.getElementById('hot-products-container');

  // Render danh sách product
  function renderProducts(products) {
    listEl.innerHTML = '';
    if (!products || !products.length) {
      listEl.innerHTML = '<p style="width:100%;text-align:center;color:#999;padding:30px;">No products found.</p>';
      return;
    }
    products.forEach(p => {
      const item = document.createElement('div');
      item.className = 'hot-product-item';
      item.innerHTML = `
        <img src="${p.image}" alt="${p.name}">
        <p>${p.name}</p>
        <p>${Number(p.price).toLocaleString()} đ</p>
      `;
      listEl.appendChild(item);
    });
  }

  // Gọi API tìm kiếm (server-side). Nếu backend không trả kết quả, fallback lọc client.
  async function handleSearch() {
    const keyword = (searchInput.value || '').trim();

    try {
      // Ưu tiên endpoint phân trang có query search (đã có sẵn trong api-products.js)
      const { products } = await fetchProductsWithPagination(1, 24, { search: keyword });
      if (products && products.length) return renderProducts(products);

      // Fallback: tải all rồi lọc client (phòng khi backend chưa implement ?search=)
      const all = await fetchProductsFromAPI();
      const filtered = keyword
        ? all.filter(p =>
            String(p.name || '').toLowerCase().includes(keyword.toLowerCase()) ||
            String(p.code || '').toLowerCase().includes(keyword.toLowerCase())
          )
        : all;
      return renderProducts(filtered);
    } catch (e) {
      console.error('Search error:', e);
      listEl.innerHTML = '<p style="width:100%;text-align:center;color:#c00;padding:30px;">Search error. Please try again.</p>';
    }
  }

  // Sự kiện: click icon & Enter
  searchBtn?.addEventListener('click', handleSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  // Tải danh sách ban đầu
  try {
    const initial = await fetchProductsFromAPI();
    renderProducts(initial);
  } catch {
    listEl.innerHTML = '<p style="width:100%;text-align:center;color:#c00;padding:30px;">Cannot load products.</p>';
  }
});