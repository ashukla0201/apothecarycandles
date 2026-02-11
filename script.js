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
            showNotification('Payment options are available above in the cart!');
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
                
                console.log('Creating cart item HTML for:', item.name, 'index:', index);
                console.log('Item details:', item);
                
                const itemHTML = `
                    <div class="cart-item" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center;">
                        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        <div class="cart-item-details" style="flex: 1;">
                            <div class="cart-item-name" style="font-weight: bold; margin-bottom: 0.5rem;">${item.name}</div>
                            <div class="cart-item-price" style="color: #666; margin-bottom: 0.5rem;">₹${item.price}</div>
                            <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; background: #f5f5f5; padding: 0.5rem; border-radius: 5px;">
                                <button onclick="updateQuantity(${index}, -1)" style="background: #8b7355; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">−</button>
                                <span style="font-weight: bold; min-width: 30px; text-align: center; font-size: 1.1rem; color: #333;">${item.quantity}</span>
                                <button onclick="updateQuantity(${index}, 1)" style="background: #8b7355; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">+</button>
                            </div>
                        </div>
                        <button onclick="removeItem(${index})" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Remove</button>
                    </div>
                `;
                
                cartHTML += itemHTML;
                console.log('Added item HTML:', itemHTML.substring(0, 100) + '...');
                console.log('Added quantity buttons for item:', item.name);
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

// Update quantity
function updateQuantity(index, change) {
    console.log('Updating quantity for index:', index, 'change:', change);
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            // Remove item if quantity is 0 or less
            removeItem(index);
        } else {
            // Save and update display
            localStorage.setItem('apothecaryCart', JSON.stringify(cart));
            updateCartCounter();
            updateCartDisplay();
            showNotification(`Quantity updated to ${cart[index].quantity}`);
        }
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
    console.log('Showing notification:', message);
    
    // Create notification element
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
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 10px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Make functions globally accessible
window.removeItem = removeItem;
window.updateCartDisplay = updateCartDisplay;
window.updateQuantity = updateQuantity;
window.payViaWhatsApp = payViaWhatsApp;
window.payViaRazorpay = payViaRazorpay;

// Payment functions
function payViaWhatsApp() {
    console.log('payViaWhatsApp called');
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    console.log('Collecting customer details...');
    // Get customer details
    const customerName = prompt('Please enter your name:');
    console.log('Customer name:', customerName);
    if (!customerName) return;
    
    const customerPhone = prompt('Please enter your phone number:');
    console.log('Customer phone:', customerPhone);
    if (!customerPhone) return;
    
    const customerAddress = prompt('Please enter your delivery address:');
    console.log('Customer address:', customerAddress);
    if (!customerAddress) return;
    
    console.log('Creating WhatsApp message...');
    // Create order message
    let orderMessage = `🕯️ *New Order - Apothecary Candles*%0A%0A`;
    orderMessage += `*Customer Details:*%0A`;
    orderMessage += `• Name: ${customerName}%0A`;
    orderMessage += `• Phone: ${customerPhone}%0A`;
    orderMessage += `• Address: ${customerAddress}%0A%0A`;
    orderMessage += `*Order Items:*%0A`;
    
    let total = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        orderMessage += `${item.name} x ${item.quantity} = ₹${itemTotal}%0A`;
    });
    
    orderMessage += `%0A*Total: ₹${total}*%0A%0A`;
    orderMessage += `Please confirm the order and payment details.`;
    
    console.log('Opening WhatsApp...');
    const whatsappUrl = `https://wa.me/919956394794?text=${orderMessage}`;
    window.open(whatsappUrl, '_blank');
}

function payViaRazorpay() {
    console.log('payViaRazorpay called');
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    console.log('Collecting customer details for Razorpay...');
    // Get customer details
    const customerName = prompt('Please enter your name:');
    console.log('Customer name:', customerName);
    if (!customerName) return;
    
    const customerPhone = prompt('Please enter your phone number:');
    console.log('Customer phone:', customerPhone);
    if (!customerPhone) return;
    
    const customerAddress = prompt('Please enter your delivery address:');
    console.log('Customer address:', customerAddress);
    if (!customerAddress) return;
    
    console.log('Initializing Razorpay payment...');
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
            console.log('Payment successful:', response);
            showNotification(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
            
            // Send order confirmation via WhatsApp
            let confirmationMessage = `✅ *Payment Confirmed*%0A%0A`;
            confirmationMessage += `*Customer Details:*%0A`;
            confirmationMessage += `• Name: ${customerName}%0A`;
            confirmationMessage += `• Phone: ${customerPhone}%0A`;
            confirmationMessage += `• Address: ${customerAddress}%0A%0A`;
            confirmationMessage += `*Payment Details:*%0A`;
            confirmationMessage += `Payment ID: ${response.razorpay_payment_id}%0A`;
            confirmationMessage += `Amount: ₹${total}%0A`;
            confirmationMessage += `Items: ${orderItems}%0A%0A`;
            confirmationMessage += `Please process the order for delivery.`;
            
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
            name: customerName,
            contact: customerPhone
        },
        notes: {
            customer_name: customerName,
            customer_phone: customerPhone,
            customer_address: customerAddress,
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
    
    console.log('Opening Razorpay modal...');
    const rzp = new Razorpay(options);
    rzp.open();
}
