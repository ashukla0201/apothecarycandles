// Simple Cart System
let cart = [];

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - setting up cart');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('apothecaryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('Loaded cart from storage:', cart);
    }
    
    // Update cart display on load
    setTimeout(() => {
        updateCartDisplay();
        updateCartCounter();
    }, 100);
    
    // Setup all Add to Cart buttons
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    console.log('Found buttons:', buttons.length);
    
    buttons.forEach((button, index) => {
        button.onclick = function(e) {
            e.preventDefault();
            console.log('Button clicked!');
            
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            const image = this.dataset.image;
            
            console.log('Adding item:', { name, price, image });
            console.log('Cart before add:', JSON.parse(JSON.stringify(cart)));
            
            // Check if item already exists in cart - use manual loop for reliability
            let existingItem = null;
            let existingIndex = -1;
            
            for (let i = 0; i < cart.length; i++) {
                if (cart[i].name === name) {
                    existingItem = cart[i];
                    existingIndex = i;
                    break;
                }
            }
            
            console.log('Existing item found:', existingItem);
            console.log('Existing index:', existingIndex);
            
            if (existingItem && existingIndex !== -1) {
                // Increase quantity if item exists
                cart[existingIndex].quantity += 1;
                console.log('Updated existing item quantity:', cart[existingIndex]);
                showNotification(`${name} quantity increased to ${cart[existingIndex].quantity}!`);
            } else {
                // Add new item if doesn't exist
                cart.push({
                    name: name,
                    price: price,
                    image: image,
                    quantity: 1
                });
                console.log('Added new item to cart');
                showNotification(`${name} added to cart!`);
            }
            
            // Save to localStorage
            localStorage.setItem('apothecaryCart', JSON.stringify(cart));
            
            console.log('Cart after update:', cart);
            
            // Update cart counter and display
            updateCartCounter();
            updateCartDisplay();
        };
    });
    
    // Setup cart action buttons
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (clearCartBtn) {
        clearCartBtn.onclick = function() {
            cart = [];
            localStorage.setItem('apothecaryCart', JSON.stringify(cart));
            updateCartCounter();
            updateCartDisplay();
            showNotification('Cart cleared!');
        };
    }
    
    if (checkoutBtn) {
        checkoutBtn.onclick = function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            showNotification('Proceeding to checkout (checkout page to be implemented)');
        };
    }
});

// Update cart counter
function updateCartCounter() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        // Calculate total quantity of all items
        const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalQuantity;
        console.log('Updated cart count to:', totalQuantity);
    }
}

// Update cart display
function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    console.log('Updating cart display, cart length:', cart.length);
    console.log('Cart items element:', cartItems);
    console.log('Cart total element:', cartTotal);
    console.log('Current cart:', cart);
    
    if (cartItems && cartTotal) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
            cartTotal.textContent = '0';
            console.log('Cart is empty, showing empty message');
        } else {
            let cartHTML = '';
            let total = 0;
            
            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                
                cartHTML += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}">
                        <div class="cart-item-details">
                            <div class="cart-item-name">${item.name}</div>
                            <div class="cart-item-price">₹${item.price}</div>
                            <div class="cart-item-quantity">
                                <span>Quantity: ${item.quantity}</span>
                            </div>
                        </div>
                        <button class="remove-item" onclick="removeItem(${index})">Remove</button>
                    </div>
                `;
            });
            
            // Add payment options after cart items
            cartHTML += `
                <div class="payment-section" style="margin-top: 2rem; padding-top: 2rem; border-top: 2px solid #eee;">
                    <h4>Payment Options</h4>
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        <button onclick="payViaWhatsApp()" class="btn-whatsapp" style="flex: 1; padding: 1rem; background: #25D366; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                            💬 Order via WhatsApp
                        </button>
                        <button onclick="payViaRazorpay()" class="btn-razorpay" style="flex: 1; padding: 1rem; background: #3395ff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;">
                            💳 Pay Online
                        </button>
                    </div>
                </div>
            `;
            
            cartItems.innerHTML = cartHTML;
            cartTotal.textContent = total;
            console.log('Updated cart display with total:', total);
            console.log('Cart HTML generated:', cartHTML.substring(0, 200) + '...');
        }
    } else {
        console.log('Cart display elements not found - cartItems:', !!cartItems, 'cartTotal:', !!cartTotal);
    }
}

// Remove item from cart
function removeItem(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    localStorage.setItem('apothecaryCart', JSON.stringify(cart));
    updateCartCounter();
    updateCartDisplay();
    showNotification(`${itemName} removed from cart`);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 10000;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Make functions globally accessible
window.removeItem = removeItem;
window.updateCartDisplay = updateCartDisplay;
window.payViaWhatsApp = payViaWhatsApp;
window.payViaRazorpay = payViaRazorpay;

// Payment functions
function payViaWhatsApp() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Create order message
    let orderMessage = `🕯️ *New Order - Apothecary Candles*%0A%0A`;
    orderMessage += `*Order Items:*%0A`;
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderMessage += `${item.name} x ${item.quantity} = ₹${itemTotal}%0A`;
    });
    
    orderMessage += `%0A*Total: ₹${total}*%0A%0A`;
    orderMessage += `Please confirm the order and payment details.%0A%0A`;
    orderMessage += `*Customer Information Needed:*%0A`;
    orderMessage += `• Name%0A`;
    orderMessage += `• Phone Number%0A`;
    orderMessage += `• Delivery Address`;
    
    const whatsappUrl = `https://wa.me/919956394794?text=${orderMessage}`;
    window.open(whatsappUrl, '_blank');
}

function payViaRazorpay() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Calculate total amount in paise
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const amountInPaise = total * 100;
    
    // Create order description
    const orderItems = cart.map(item => `${item.name} x ${item.quantity}`).join(', ');
    
    const options = {
        key: 'rzp_test_SEtS6ZUfqY5eIv',
        amount: amountInPaise,
        currency: 'INR',
        name: 'Apothecary Candles',
        description: orderItems,
        image: 'https://ashukla0201.github.io/apothecarycandles/logo.jpeg',
        handler: function (response) {
            // Payment successful
            showNotification(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            
            // Send order confirmation via WhatsApp
            let confirmationMessage = `✅ *Payment Confirmed*%0A%0A`;
            confirmationMessage += `Payment ID: ${response.razorpay_payment_id}%0A`;
            confirmationMessage += `Amount: ₹${total}%0A`;
            confirmationMessage += `Items: ${orderItems}%0A%0A`;
            confirmationMessage += `*Customer Information Needed:*%0A`;
            confirmationMessage += `• Name%0A`;
            confirmationMessage += `• Phone Number%0A`;
            confirmationMessage += `• Delivery Address`;
            
            const whatsappUrl = `https://wa.me/919956394794?text=${confirmationMessage}`;
            window.open(whatsappUrl, '_blank');
            
            // Clear cart after successful payment
            setTimeout(() => {
                cart = [];
                localStorage.setItem('apothecaryCart', JSON.stringify(cart));
                updateCartCounter();
                updateCartDisplay();
            }, 2000);
        },
        prefill: {
            name: '',
            email: '',
            contact: ''
        },
        notes: {
            items: orderItems
        },
        theme: {
            color: '#8b7355'
        },
        modal: {
            backdropclose: false,
            escape: false,
            handleback: true
        },
        config: {
            display: {
                blocks: {
                    banks: {
                        name: 'Pay via UPI',
                        instruments: [
                            {
                                method: 'upi'
                            }
                        ]
                    }
                },
                sequence: ['block.banks'],
                preferences: {
                    show_default_blocks: true
                }
            }
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}

// Checkout functionality
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Hide cart section, show checkout section
    document.getElementById('cart').style.display = 'none';
    document.getElementById('checkout').style.display = 'block';
    
    // Update checkout items
    updateCheckoutUI();
    
    // Scroll to checkout
    document.getElementById('checkout').scrollIntoView({ behavior: 'smooth' });
}

// Update checkout UI
function updateCheckoutUI() {
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    let checkoutHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        checkoutHTML += `
            <div class="checkout-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>₹${itemTotal}</span>
            </div>
        `;
    });
    
    checkoutItems.innerHTML = checkoutHTML;
    checkoutTotal.textContent = total;
}

// Payment functions
function payViaWhatsApp() {
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    
    if (!name || !email || !phone || !address) {
        showNotification('Please fill all customer details');
        return;
    }
    
    // Create order message
    let orderMessage = `🕯️ *New Order - Apothecary Candles*%0A%0A`;
    orderMessage += `*Customer Details:*%0A`;
    orderMessage += `Name: ${name}%0A`;
    orderMessage += `Email: ${email}%0A`;
    orderMessage += `Phone: ${phone}%0A`;
    orderMessage += `Address: ${address}%0A%0A`;
    orderMessage += `*Order Items:*%0A`;
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderMessage += `${item.name} x ${item.quantity} = ₹${itemTotal}%0A`;
    });
    
    orderMessage += `%0A*Total: ₹${total}*%0A%0A`;
    orderMessage += `Please confirm the order and payment details.`;
    
    const whatsappUrl = `https://wa.me/919956394794?text=${orderMessage}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after successful order
    setTimeout(() => {
        clearCart();
        document.getElementById('checkout').style.display = 'none';
        document.getElementById('cart').style.display = 'block';
        document.getElementById('checkout-form').reset();
    }, 2000);
}

function payViaRazorpay() {
    const name = document.getElementById('customer-name').value;
    const email = document.getElementById('customer-email').value;
    const phone = document.getElementById('customer-phone').value;
    const address = document.getElementById('customer-address').value;
    
    if (!name || !email || !phone || !address) {
        showNotification('Please fill all customer details');
        return;
    }
    
    // Calculate total amount in paise
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const amountInPaise = total * 100;
    
    // Create order description
    const orderItems = cart.map(item => `${item.name} x ${item.quantity}`).join(', ');
    
    const options = {
        key: 'rzp_test_SEtS6ZUfqY5eIv',
        amount: amountInPaise,
        currency: 'INR',
        name: 'Apothecary Candles',
        description: orderItems,
        image: 'https://ashukla0201.github.io/apothecarycandles/logo.jpeg',
        handler: function (response) {
            // Payment successful
            showNotification(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            
            // Send order confirmation via WhatsApp
            let confirmationMessage = `✅ *Payment Confirmed*%0A%0A`;
            confirmationMessage += `Payment ID: ${response.razorpay_payment_id}%0A`;
            confirmationMessage += `Customer: ${name}%0A`;
            confirmationMessage += `Phone: ${phone}%0A`;
            confirmationMessage += `Amount: ₹${total}%0A`;
            confirmationMessage += `Items: ${orderItems}%0A`;
            confirmationMessage += `Address: ${address}`;
            
            const whatsappUrl = `https://wa.me/919956394794?text=${confirmationMessage}`;
            window.open(whatsappUrl, '_blank');
            
            // Clear cart after successful payment
            setTimeout(() => {
                clearCart();
                document.getElementById('checkout').style.display = 'none';
                document.getElementById('cart').style.display = 'block';
                document.getElementById('checkout-form').reset();
            }, 2000);
        },
        prefill: {
            name: name,
            email: email,
            contact: phone
        },
        notes: {
            address: address,
            items: orderItems
        },
        theme: {
            color: '#8b7355'
        },
        modal: {
            backdropclose: false,
            escape: false,
            handleback: true
        },
        config: {
            display: {
                blocks: {
                    banks: {
                        name: 'Pay via UPI',
                        instruments: [
                            {
                                method: 'upi'
                            }
                        ]
                    }
                },
                sequence: ['block.banks'],
                preferences: {
                    show_default_blocks: true
                }
            }
        }
    };
    
    const rzp = new Razorpay(options);
    rzp.open();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - Initializing Cart System');
    
    // Initialize cart
    initCart();
    
    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    console.log('Found Add to Cart buttons:', addToCartButtons.length);
    
    addToCartButtons.forEach((button, index) => {
        console.log(`Button ${index}:`, button.dataset.name, button.dataset.price);
        
        button.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add to Cart button clicked');
            
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            const image = this.dataset.image;
            
            console.log('Adding to cart:', { name, price, image });
            addToCart(name, price, image);
        });
    });
    
    // Cart action buttons
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', proceedToCheckout);
    }
    
    // Checkout payment buttons
    const payWhatsAppBtn = document.getElementById('pay-whatsapp');
    const payRazorpayBtn = document.getElementById('pay-razorpay');
    
    if (payWhatsAppBtn) {
        payWhatsAppBtn.addEventListener('click', payViaWhatsApp);
    }
    
    if (payRazorpayBtn) {
        payRazorpayBtn.addEventListener('click', payViaRazorpay);
    }
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Product card animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
    
    // Lightbox functionality
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    const productImages = document.querySelectorAll('.product-image');
    productImages.forEach(img => {
        img.addEventListener('click', function() {
            const imgSrc = this.src;
            const imgAlt = this.alt;
            
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = imgAlt;
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    });
    
    lightboxClose.addEventListener('click', function() {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto';
    });
    
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightbox.style.display === 'block') {
            lightbox.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
    
    // Add scroll effect to header
    window.addEventListener('scroll', function() {
        const header = document.querySelector('header');
        if (window.scrollY > 100) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        } else {
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
        }
    });
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(notificationStyles);
