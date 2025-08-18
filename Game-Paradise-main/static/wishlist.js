document.addEventListener('DOMContentLoaded', () => {
    // Load wishlist items
    loadWishlist();
    
    // Set up logout button
    if (activeUser) {
        document.getElementById('logoutBtn').addEventListener('click', logout);
    }
    
    function logout() {
        fetch("/logout")
            .then(() => {
                window.location.href = '/';
            });
    }

    function loadWishlist() {
        fetch('/api/wishlist')
            .then(response => response.json())
            .then(items => {
                const container = document.querySelector('.wishlist-container');
                if (items.length === 0) {
                    container.innerHTML = `
                        <div class="empty-wishlist">
                            <i class="far fa-heart"></i>
                            <h3>Your wishlist is empty</h3>
                            <p>Add games to your wishlist to save them for later</p>
                        </div>
                    `;
                    return;
                }
                
                container.innerHTML = '';
                items.forEach(item => {
                    const itemElement = document.createElement('div');
                    itemElement.classList.add('wishlist-item');
                    itemElement.innerHTML = `
                        <img src="/static/${item.img_path}" alt="${item.name}">
                        <h3>${item.name}</h3>
                        <div class="price">$${(item.price / 100).toFixed(2)}</div>
                        <div class="wishlist-actions">
                            <button class="add-to-cart" data-appid="${item.appid}">Add to Cart</button>
                            <button class="remove-from-wishlist" data-appid="${item.appid}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                    container.appendChild(itemElement);
                });
                
                // Add event listeners
                document.querySelectorAll('.add-to-cart').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const appid = this.getAttribute('data-appid');
                        addToCart(appid);
                    });
                });
                
                document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
                    btn.addEventListener('click', function() {
                        const appid = this.getAttribute('data-appid');
                        removeFromWishlist(appid);
                    });
                });
            });
    }
    
    function addToCart(appid) {
        // Find the item in the wishlist
        fetch('/api/wishlist')
            .then(response => response.json())
            .then(items => {
                const item = items.find(i => i.appid === appid);
                if (item) {
                    // Add to cart
                    fetch("/add", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ selected: item })
                    })
                    .then(() => {
                        alert(`${item.name} added to cart!`);
                    });
                }
            });
    }
    
    function removeFromWishlist(appid) {
        fetch('/remove_from_wishlist', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ appid })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadWishlist();
            }
        });
    }
});