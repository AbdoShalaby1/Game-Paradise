document.addEventListener('DOMContentLoaded', () => {
    // Wishlist buttons on store page
    document.querySelectorAll('.wishlist-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const appid = this.getAttribute('data-appid');
            const name = this.getAttribute('data-name');
            const img_path = this.getAttribute('data-img_path');
            const price = this.getAttribute('data-price');
            
            addToWishlist({
                appid,
                name,
                img_path,
                price
            });
        });
    });
    
    // Wishlist button on info page
    const infoWishlistBtn = document.getElementById('add-to-wishlist');
    if (infoWishlistBtn) {
        infoWishlistBtn.addEventListener('click', function() {
            const appid = this.getAttribute('data-appid');
            const name = this.getAttribute('data-name');
            const img_path = this.getAttribute('data-img_path');
            const price = this.getAttribute('data-price');
            
            addToWishlist({
                appid,
                name,
                img_path,
                price
            });
        });
    }
    
    function addToWishlist(item) {
        if (!activeUser) {
            alert('Please log in to add to wishlist');
            return;
        }
        
        fetch('/add_to_wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ item })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('Added to wishlist!');
            } else if (data.error) {
                alert(data.error);
            }
        });
    }
});