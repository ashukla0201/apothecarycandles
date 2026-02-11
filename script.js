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

// Buy button functionality
document.querySelectorAll('.buy-button').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const price = productCard.querySelector('.price').textContent;
        
        // Create order message
        const message = `I would like to order: ${productName} - ${price}`;
        
        // Open WhatsApp with pre-filled message
        const whatsappUrl = `https://wa.me/919956394794?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });
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

// Simple animation for product cards on scroll
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

// Observe all product cards
document.addEventListener('DOMContentLoaded', function() {
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// WhatsApp order functionality
document.querySelectorAll('.whatsapp-order').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPrice = productCard.querySelector('.price').textContent;
        
        const message = `Hi! I'd like to order: ${productName} - ${productPrice}`;
        const whatsappUrl = `https://wa.me/919956394794?text=${encodeURIComponent(message)}`;
        
        window.open(whatsappUrl, '_blank');
    });
});

// Razorpay payment functionality
document.querySelectorAll('.razorpay-payment').forEach(button => {
    button.addEventListener('click', function() {
        const productCard = this.closest('.product-card');
        const productName = productCard.dataset.productName;
        const productDescription = productCard.dataset.productDescription;
        const amount = productCard.dataset.amount;
        const currency = productCard.dataset.currency;
        
        const options = {
            key: 'rzp_test_1DP5mmOlF5G5ag', // Razorpay test key
            amount: amount,
            currency: currency,
            name: 'Apothecary Candles',
            description: `${productName} - ${productDescription}`,
            image: 'https://ashukla0201.github.io/apothecarycandles/logo.jpeg',
            handler: function (response) {
                // Payment successful
                alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
                
                // Send order confirmation via WhatsApp
                const message = `Hi! I've placed an order for: ${productName} - ${productCard.querySelector('.price').textContent}. Payment ID: ${response.razorpay_payment_id}`;
                const whatsappUrl = `https://wa.me/919956394794?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            },
            prefill: {
                name: '',
                email: '',
                contact: ''
            },
            notes: {
                product: productName,
                description: productDescription
            },
            theme: {
                color: '#8b7355'
            }
        };
        
        const rzp = new Razorpay(options);
        rzp.open();
    });
});

// Lightbox functionality
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-img');
const lightboxCaption = document.querySelector('.lightbox-caption');
const lightboxClose = document.querySelector('.lightbox-close');

// Add click event to all product images
document.addEventListener('DOMContentLoaded', function() {
    const productImages = document.querySelectorAll('.product-image');
    
    productImages.forEach(img => {
        img.addEventListener('click', function() {
            const imgSrc = this.src;
            const imgAlt = this.alt;
            
            lightboxImg.src = imgSrc;
            lightboxCaption.textContent = imgAlt;
            lightbox.style.display = 'block';
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        });
    });
});

// Close lightbox when clicking on close button
lightboxClose.addEventListener('click', function() {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable scrolling
});

// Close lightbox when clicking on the background
lightbox.addEventListener('click', function(e) {
    if (e.target === lightbox) {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
});

// Close lightbox with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.style.display === 'block') {
        lightbox.style.display = 'none';
        document.body.style.overflow = 'auto'; // Enable scrolling
    }
});
