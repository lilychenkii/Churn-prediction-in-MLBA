// =================================================================
// === API Configuration
// =================================================================
const API_BASE_URL = 'http://localhost:5200/api/Product';

// =================================================================
// === API Functions - Thay thế localStorage bằng API calls
// =================================================================

// Chỉ chạy code này nếu đang ở trang admin_create.html
const imageUploadInput = document.getElementById('image-upload');
const imagePreview = document.getElementById('image-preview');
const imageDataInput = document.getElementById('image-data');

if (imageUploadInput && imagePreview && imageDataInput) {
    // Xử lý khi người dùng chọn file ảnh mới
    imageUploadInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                // Hiển thị ảnh xem trước
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                // Lưu dữ liệu ảnh dưới dạng base64 vào trường ẩn
                imageDataInput.value = e.target.result;
            }
            reader.readAsDataURL(file);
        }
    });
}

const createForm = document.getElementById('create-form');
if (createForm) {
    createForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newProduct = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            image_url: imageDataInput.value || null,
            descriptionname: document.getElementById('description').value || null,
            restaurantid: 1,
            categoryid: 1,
            available: true,
            rating_avg: 0,
            rating_count: 0
        };

        // Kiểm tra xem người dùng đã tải ảnh lên chưa
        if (!newProduct.image_url) {
            alert('Please upload an image for the product.');
            return;
        }
        
        try {
            await createProduct(newProduct);
            alert('Product added successfully!');
            window.location.href = 'admin_list.html';
        } catch (error) {
            alert('Error adding product: ' + error.message);
        }
    });
}
        
// Lấy tất cả sản phẩm từ API (tất cả pages)
async function getProducts() {
    try {
        let allProducts = [];
        let page = 1;
        let hasMore = true;
        
        while (hasMore) {
            // Request với pageSize=100 (max) để giảm số lần gọi API
            const response = await fetch(`${API_BASE_URL}?page=${page}&pageSize=100`);
            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }
            const data = await response.json();
            
            // Thêm products vào array
            allProducts = allProducts.concat(data.products || []);
            
            // Check nếu còn trang nữa
            const { currentPage, totalPages, totalCount } = data.pagination;
            console.log(`Loaded page ${currentPage}/${totalPages} - Total products: ${totalCount}`);
            
            if (currentPage >= totalPages) {
                hasMore = false;
            } else {
                page++;
            }
        }
        
        console.log(`Loaded ALL ${allProducts.length} products from database`);
        return allProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Lấy chi tiết sản phẩm theo ID
async function getProductById(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error fetching product:', error);
        return null;
    }
}

// Tạo sản phẩm mới
async function createProduct(productData) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to create product');
        }
        
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error creating product:', error);
        throw error;
    }
}

// Cập nhật sản phẩm
async function updateProduct(id, productData) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productData)
        });
        
        if (!response.ok) {
            throw new Error('Failed to update product');
        }
        
        const product = await response.json();
        return product;
    } catch (error) {
        console.error('Error updating product:', error);
        throw error;
    }
}

// Xóa sản phẩm
async function deleteProduct(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Failed to delete product');
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
}

// =================================================================
// === Utility Functions
// =================================================================

// Hàm lấy tham số từ URL (ví dụ: ?id=1)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}