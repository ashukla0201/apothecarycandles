// Test if JavaScript is loading
console.log('script.js is loading!');
alert('JavaScript is working!');

// Simple Cart System
let cart = [];

// Initialize cart when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded - setting up cart');
    alert('DOM Content Loaded!');
    
    // Load cart from localStorage
    const savedCart = localStorage.getItem('apothecaryCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        console.log('Loaded cart from storage:', cart);
    }
    
    // Setup all Add to Cart buttons
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    console.log('Found buttons:', buttons.length);
    alert(`Found ${buttons.length} Add to Cart buttons`);
    
    buttons.forEach((button, index) => {
        console.log(`Setting up button ${index}:`, button.dataset.name);
        
        button.onclick = function(e) {
            e.preventDefault();
            console.log('Button clicked!');
            alert('Button was clicked!');
            
            const name = this.dataset.name;
            const price = parseInt(this.dataset.price);
            const image = this.dataset.image;
            
            console.log('Adding item:', { name, price, image });
            
            // Add to cart
            cart.push({
                name: name,
                price: price,
                image: image,
                quantity: 1
            });
            
            // Save to localStorage
            localStorage.setItem('apothecaryCart', JSON.stringify(cart));
            
            // Update cart counter
            const cartCount = document.getElementById('cart-count');
            if (cartCount) {
                cartCount.textContent = cart.length;
                console.log('Updated cart count to:', cart.length);
            }
            
            // Show simple alert
            alert(`${name} added to cart! Total items: ${cart.length}`);
            
            console.log('Cart now:', cart);
        };
    });
});

// Make functions available globally
window.updateCartCount = function() {
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
};

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
