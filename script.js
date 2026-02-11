// Shopping Cart Functionality
let cart = [];

// Initialize cart from localStorage
function initCart() {
    const savedCart = localStorage.getItem('apothecaryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('apothecaryCart', JSON.stringify(cart));
    updateCartUI();
}

// Update cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        cartTotal.textContent = '0';
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
                            <button class="quantity-btn" onclick="updateQuantity(${index}, -1)">-</button>
                            <span>${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateQuantity(${index}, 1)">+</button>
                        </div>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${index})">Remove</button>
                </div>
            `;
        });
        
        cartItems.innerHTML = cartHTML;
        cartTotal.textContent = total;
    }
}

// Add to cart
function addToCart(name, price, image) {
    const existingItem = cart.find(item => item.name === name);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            name: name,
            price: price,
            image: image,
            quantity: 1
        });
    }
    
    saveCart();
    
    // Show success message
    showNotification(`${name} added to cart!`);
}

// Update quantity
function updateQuantity(index, change) {
    cart[index].quantity += change;
    
    if (cart[index].quantity <= 0) {
        removeFromCart(index);
    } else {
        saveCart();
    }
}

// Remove from cart
function removeFromCart(index) {
    const itemName = cart[index].name;
    cart.splice(index, 1);
    saveCart();
    showNotification(`${itemName} removed from cart`);
}

// Clear cart
function clearCart() {
    cart = [];
    saveCart();
    showNotification('Cart cleared');
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #28a745;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 5px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
    }, 3000);
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
    // Initialize cart
    initCart();
    
    // Add to cart buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            const image = this.dataset.image;
            addToCart(name, price, image);
        });
    });
    
    // Cart action buttons
    document.getElementById('clear-cart').addEventListener('click', clearCart);
    document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
    
    // Checkout payment buttons
    document.getElementById('pay-whatsapp').addEventListener('click', payViaWhatsApp);
    document.getElementById('pay-razorpay').addEventListener('click', payViaRazorpay);
    
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
