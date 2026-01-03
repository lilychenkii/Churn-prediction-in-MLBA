// Navigation Fix Script
// Đảm bảo tất cả các link navigation hoạt động đúng

document.addEventListener('DOMContentLoaded', function() {
    // Fix tất cả các link trong header
    const headerLinks = document.querySelectorAll('.header-nav a[href]');
    
    headerLinks.forEach(link => {
        // Chỉ xử lý những link có href thực sự (không phải #)
        const href = link.getAttribute('href');
        
        if (href && href !== '#' && href !== '') {
            link.addEventListener('click', function(e) {
                // Cho phép link hoạt động bình thường
                // Không prevent default nếu là link trang
                if (href.endsWith('.html')) {
                    console.log('Navigating to:', href);
                }
            });
        }
    });
    
    console.log('Navigation fix loaded successfully!');
});

