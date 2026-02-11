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
            
            // Update button states
            updateAddToCartButtons();
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
            updateAddToCartButtons(); // Update button states when cart is cleared
            showNotification('Cart cleared!');
        };
    }
    
    if (checkoutBtn) {
        checkoutBtn.onclick = function() {
            if (cart.length === 0) {
                showNotification('Your cart is empty!');
                return;
            }
            proceedToCheckout();
        };
    }
    
    // Setup checkout payment buttons
    const payWhatsAppBtn = document.getElementById('pay-whatsapp');
    const payRazorpayBtn = document.getElementById('pay-razorpay');
    
    if (payWhatsAppBtn) {
        payWhatsAppBtn.onclick = function() {
            processWhatsAppPayment();
        };
    }
    
    if (payRazorpayBtn) {
        payRazorpayBtn.onclick = function() {
            processRazorpayPayment();
        };
    }
    
    // Initialize button states on page load
    updateAddToCartButtons();
    
    // Setup lightbox functionality
    setupLightbox();
    
    // Setup international telephone input
    setupPhoneInput();
    
    // Setup address autocomplete (demo version for now)
    setupDemoAutocomplete();
});

// Initialize Google Maps Places autocomplete
function initAutocomplete() {
    console.log('Initializing Google Maps Places autocomplete...');
    
    const addressInput = document.getElementById('customer-address');
    const loadingIndicator = document.getElementById('address-loading');
    
    if (!addressInput) {
        console.log('Address input not found');
        return;
    }
    
    // Create autocomplete instance
    const autocomplete = new google.maps.places.Autocomplete(addressInput, {
        types: ['geocode', 'establishment'],
        fields: ['place_id', 'formatted_address', 'geometry', 'name', 'address_components'],
        componentRestrictions: { country: ['in', 'us', 'uk', 'ca', 'au'] } // Restrict to major countries
    });
    
    // Show loading indicator when searching
    addressInput.addEventListener('input', function() {
        if (this.value.length > 2) {
            loadingIndicator.style.display = 'block';
        } else {
            loadingIndicator.style.display = 'none';
        }
    });
    
    // Hide loading indicator when place is selected
    autocomplete.addListener('place_changed', function() {
        loadingIndicator.style.display = 'none';
        
        const place = autocomplete.getPlace();
        
        if (!place.place_id) {
            console.log('No place selected');
            return;
        }
        
        console.log('Place selected:', place);
        
        // Update the input with the formatted address
        addressInput.value = place.formatted_address;
        
        // Extract pincode if available (for Indian addresses)
        const pincodeComponent = place.address_components.find(component => 
            component.types.includes('postal_code')
        );
        
        if (pincodeComponent) {
            const pincodeInput = document.getElementById('customer-pincode');
            if (pincodeInput && !pincodeInput.value) {
                pincodeInput.value = pincodeComponent.long_name;
                console.log('Auto-filled pincode:', pincodeComponent.long_name);
            }
        }
        
        // Store place data for form submission
        addressInput.dataset.placeId = place.place_id;
        addressInput.dataset.formattedAddress = place.formatted_address;
        
        showNotification('Address selected successfully!');
    });
    
    // Handle keyboard navigation
    addressInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            // Prevent form submission when selecting from dropdown
            e.preventDefault();
        }
    });
    
    console.log('Google Maps Places autocomplete initialized');
}

// Demo autocomplete (works without Google Maps API)
function setupDemoAutocomplete() {
    console.log('Setting up demo address autocomplete...');
    
    const addressInput = document.getElementById('customer-address');
    const loadingIndicator = document.getElementById('address-loading');
    
    if (!addressInput) {
        console.log('Address input not found');
        return;
    }
    
    console.log('Address input found:', addressInput);
    
    // Sample addresses for demo
    const sampleAddresses = [
        { name: 'Vaishno Silver Bells', address: 'Vaishno Silver Bells, Sector 12, Dwarka, Delhi, 110075', pincode: '110075' },
        { name: 'Vaishno Silver Bells Apartment', address: 'Vaishno Silver Bells Apartment, Plot 12, Dwarka Sector 12, New Delhi, Delhi 110075', pincode: '110075' },
        { name: 'Silver Bells Society', address: 'Silver Bells Society, Phase 1, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'DLF Phase 1', address: 'DLF Phase 1, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Connaught Place', address: 'Connaught Place, New Delhi, Delhi, 110001', pincode: '110001' },
        { name: 'Nehru Place', address: 'Nehru Place, New Delhi, Delhi, 110019', pincode: '110019' },
        { name: 'Rajouri Garden', address: 'Rajouri Garden, New Delhi, Delhi, 110027', pincode: '110027' },
        { name: 'Karol Bagh', address: 'Karol Bagh, New Delhi, Delhi, 110005', pincode: '110005' },
        { name: 'Lajpat Nagar', address: 'Lajpat Nagar, New Delhi, Delhi, 110024', pincode: '110024' },
        { name: 'South Extension', address: 'South Extension, New Delhi, Delhi, 110049', pincode: '110049' }
    ];
    
    let currentTimeout;
    
    // Create dropdown container
    let dropdown = document.getElementById('address-dropdown');
    if (!dropdown) {
        dropdown = document.createElement('div');
        dropdown.id = 'address-dropdown';
        dropdown.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 5px 5px;
            max-height: 200px;
            overflow-y: auto;
            z-index: 1000;
            display: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        addressInput.parentNode.style.position = 'relative';
        addressInput.parentNode.appendChild(dropdown);
        console.log('Dropdown created and added');
    }
    
    // Handle input
    addressInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        console.log('Input changed:', query);
        
        clearTimeout(currentTimeout);
        
        if (query.length < 2) {
            dropdown.style.display = 'none';
            loadingIndicator.style.display = 'none';
            console.log('Query too short, hiding dropdown');
            return;
        }
        
        // Show loading
        loadingIndicator.style.display = 'block';
        console.log('Showing loading indicator');
        
        // Simulate API delay
        currentTimeout = setTimeout(() => {
            loadingIndicator.style.display = 'none';
            console.log('Searching for:', query);
            
            // Filter addresses
            const matches = sampleAddresses.filter(addr => 
                addr.name.toLowerCase().includes(query) || 
                addr.address.toLowerCase().includes(query)
            );
            
            console.log('Found matches:', matches.length);
            
            // Show dropdown
            if (matches.length > 0) {
                dropdown.innerHTML = matches.map(addr => `
                    <div style="padding: 10px; border-bottom: 1px solid #f0f0f0; cursor: pointer;" 
                         onmouseover="this.style.backgroundColor='#f8f9fa'" 
                         onmouseout="this.style.backgroundColor='white'"
                         onclick="selectAddress('${addr.address.replace(/'/g, "\\'")}', '${addr.pincode}')">
                        <div style="font-weight: 600; color: #333;">${addr.name}</div>
                        <div style="font-size: 0.85rem; color: #666;">${addr.address}</div>
                    </div>
                `).join('');
                dropdown.style.display = 'block';
                console.log('Dropdown shown with', matches.length, 'results');
            } else {
                dropdown.innerHTML = '<div style="padding: 10px; color: #666;">No addresses found</div>';
                dropdown.style.display = 'block';
                console.log('No matches found');
            }
        }, 300);
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!addressInput.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
            console.log('Clicked outside, hiding dropdown');
        }
    });
    
    console.log('Demo autocomplete setup complete');
}

// Global function for address selection
window.selectAddress = function(address, pincode) {
    const addressInput = document.getElementById('customer-address');
    const pincodeInput = document.getElementById('customer-pincode');
    const dropdown = document.getElementById('address-dropdown');
    
    addressInput.value = address;
    addressInput.dataset.formattedAddress = address;
    
    if (pincodeInput && !pincodeInput.value) {
        pincodeInput.value = pincode;
    }
    
    dropdown.style.display = 'none';
    showNotification('Address selected successfully!');
};

// Setup lightbox functionality
function setupLightbox() {
    console.log('Setting up lightbox functionality...');
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.querySelector('.lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');
    
    if (!lightbox || !lightboxImg || !lightboxClose) {
        console.log('Lightbox elements not found');
        return;
    }
    
    // Add click event to all product images (direct img tags with class product-image)
    const productImages = document.querySelectorAll('img.product-image');
    console.log('Found product images:', productImages.length);
    
    productImages.forEach((img, index) => {
        console.log(`Setting up lightbox for image ${index}:`, img.src);
        img.style.cursor = 'pointer';
        img.onclick = function() {
            console.log('Opening lightbox for image:', this.src);
            lightbox.style.display = 'block';
            lightboxImg.src = this.src;
            
            // Get caption from product name (next h3 element)
            const productName = this.nextElementSibling ? this.nextElementSibling.textContent : '';
            lightboxCaption.textContent = productName;
            console.log('Product caption:', productName);
        };
    });
    
    // Close lightbox when clicking the close button
    lightboxClose.onclick = function() {
        console.log('Closing lightbox via close button');
        lightbox.style.display = 'none';
    };
    
    // Close lightbox when clicking outside the image
    lightbox.onclick = function(event) {
        if (event.target === lightbox) {
            console.log('Closing lightbox via outside click');
            lightbox.style.display = 'none';
        }
    };
    
    // Close lightbox when pressing Escape key
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && lightbox.style.display === 'block') {
            console.log('Closing lightbox via Escape key');
            lightbox.style.display = 'none';
        }
    });
    
    console.log('Lightbox setup complete');
}

// Setup international telephone input
function setupPhoneInput() {
    console.log('Setting up international telephone input...');
    
    const phoneInput = document.getElementById('customer-phone');
    if (!phoneInput) {
        console.log('Phone input not found');
        return;
    }
    
    // Initialize intlTelInput
    const iti = window.intlTelInput(phoneInput, {
        initialCountry: "in", // Default to India
        separateDialCode: true,
        utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
        preferredCountries: ["in", "us", "uk", "ca", "au"],
        placeholderNumberType: "MOBILE",
        autoPlaceholder: "aggressive"
    });
    
    console.log('International telephone input setup complete');
    
    // Store the iti instance globally for validation
    window.phoneInputInstance = iti;
}

// Update add to cart button states
function updateAddToCartButtons() {
    const buttons = document.querySelectorAll('.add-to-cart-btn');
    buttons.forEach(button => {
        const productName = button.getAttribute('data-name');
        const isInCart = cart.some(item => item.name === productName);
        
        if (isInCart) {
            button.classList.add('added');
            button.textContent = 'Added to Cart';
        } else {
            button.classList.remove('added');
            button.textContent = 'Add to Cart';
        }
    });
}

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
                console.log('Item price:', item.price, 'Quantity:', item.quantity, 'Item total:', itemTotal);
                console.log('Running cart total:', total);
                
                const itemHTML = `
                    <div class="cart-item" style="border: 1px solid #ddd; padding: 1rem; margin-bottom: 1rem; display: flex; gap: 1rem; align-items: center;">
                        <img src="${item.image}" alt="${item.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 8px;">
                        <div class="cart-item-details" style="flex: 1;">
                            <div class="cart-item-name" style="font-weight: bold; margin-bottom: 0.5rem;">${item.name}</div>
                            <div class="cart-item-price" style="color: #666; margin-bottom: 0.5rem;">₹${item.price} each</div>
                            <div class="cart-item-quantity" style="display: flex; align-items: center; gap: 0.5rem; margin-top: 0.5rem; background: #f5f5f5; padding: 0.5rem; border-radius: 5px;">
                                <button onclick="updateQuantity(${index}, -1)" style="background: #8b7355; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">−</button>
                                <input type="number" value="${item.quantity}" min="1" max="99" onchange="setQuantity(${index}, this.value)" style="width: 60px; text-align: center; font-weight: bold; font-size: 1.1rem; border: 1px solid #ddd; border-radius: 4px; padding: 0.25rem;">
                                <button onclick="updateQuantity(${index}, 1)" style="background: #8b7355; color: white; border: none; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem; font-weight: bold; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">+</button>
                                <span style="margin-left: 1rem; font-weight: bold; color: #28a745;">= ₹${itemTotal}</span>
                            </div>
                        </div>
                        <button onclick="removeItem(${index})" style="background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 5px; cursor: pointer;">Remove</button>
                    </div>
                `;
                
                cartHTML += itemHTML;
                console.log('Added item HTML:', itemHTML.substring(0, 100) + '...');
                console.log('Added quantity buttons for item:', item.name);
            });
            
            console.log('Final cart total before display:', total);
            
            cartItems.innerHTML = cartHTML;
            cartTotal.textContent = total;
            console.log('Updated cart display with total:', total);
            console.log('Cart HTML generated:', cartHTML.substring(0, 200) + '...');
        }
    } else {
        console.log('Cart display elements not found - cartItems:', !!cartItems, 'cartTotal:', !!cartTotal);
    }
}

// Proceed to checkout
function proceedToCheckout() {
    console.log('Proceeding to checkout...');
    
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Hide cart section, show checkout section
    const cartSection = document.getElementById('cart');
    const checkoutSection = document.getElementById('checkout');
    
    console.log('Cart section:', cartSection);
    console.log('Checkout section:', checkoutSection);
    
    if (cartSection) {
        cartSection.style.display = 'none';
        console.log('Hidden cart section');
    }
    
    if (checkoutSection) {
        checkoutSection.style.display = 'block';
        console.log('Showing checkout section');
    }
    
    // Update checkout items
    updateCheckoutUI();
    
    // Scroll to checkout smoothly
    setTimeout(() => {
        if (checkoutSection) {
            checkoutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// Update checkout UI
function updateCheckoutUI() {
    console.log('Updating checkout UI...');
    
    const checkoutItems = document.getElementById('checkout-items');
    const checkoutTotal = document.getElementById('checkout-total');
    
    if (!checkoutItems || !checkoutTotal) {
        console.log('Checkout elements not found');
        return;
    }
    
    let checkoutHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        checkoutHTML += `
            <div class="checkout-item" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                <div>
                    <div style="font-weight: bold;">${item.name}</div>
                    <div style="color: #666; font-size: 0.9rem;">₹${item.price} × ${item.quantity}</div>
                </div>
                <div style="font-weight: bold; color: #28a745;">₹${itemTotal}</div>
            </div>
        `;
    });
    
    checkoutItems.innerHTML = checkoutHTML;
    checkoutTotal.textContent = total;
    
    console.log('Checkout UI updated with total:', total);
}

// Back to cart
function backToCart() {
    console.log('Going back to cart...');
    
    // Hide checkout section, show cart section
    const cartSection = document.getElementById('cart');
    const checkoutSection = document.getElementById('checkout');
    
    if (checkoutSection) {
        checkoutSection.style.display = 'none';
        console.log('Hidden checkout section');
    }
    
    if (cartSection) {
        cartSection.style.display = 'block';
        console.log('Showing cart section');
    }
    
    // Scroll to cart
    setTimeout(() => {
        if (cartSection) {
            cartSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// Update quantity
function updateQuantity(index, change) {
    console.log('Updating quantity for index:', index, 'change:', change);
    
    if (cart[index]) {
        cart[index].quantity += change;
        
        if (cart[index].quantity <= 0) {
            // Remove item if quantity is 0 or less
            removeItem(index);
        } else if (cart[index].quantity > 99) {
            // Limit maximum quantity to 99
            cart[index].quantity = 99;
            showNotification('Maximum quantity is 99');
        } else {
            // Save and update display
            localStorage.setItem('apothecaryCart', JSON.stringify(cart));
            updateCartCounter();
            updateCartDisplay();
            showNotification(`Quantity updated to ${cart[index].quantity}`);
        }
    }
}

// Set quantity directly from input
function setQuantity(index, newQuantity) {
    console.log('Setting quantity for index:', index, 'newQuantity:', newQuantity);
    
    const quantity = parseInt(newQuantity);
    
    if (cart[index] && quantity > 0 && quantity <= 99) {
        cart[index].quantity = quantity;
        localStorage.setItem('apothecaryCart', JSON.stringify(cart));
        updateCartCounter();
        updateCartDisplay();
        showNotification(`Quantity set to ${quantity}`);
    } else if (quantity <= 0) {
        showNotification('Quantity must be at least 1');
        updateCartDisplay(); // Reset the display
    } else if (quantity > 99) {
        showNotification('Maximum quantity is 99');
        cart[index].quantity = 99;
        localStorage.setItem('apothecaryCart', JSON.stringify(cart));
        updateCartCounter();
        updateCartDisplay();
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
window.setQuantity = setQuantity;
window.proceedToCheckout = proceedToCheckout;
window.backToCart = backToCart;
window.validateCustomerDetails = validateCustomerDetails;
window.updateAddToCartButtons = updateAddToCartButtons;
window.payViaWhatsApp = payViaWhatsApp;
window.payViaRazorpay = payViaRazorpay;
window.processWhatsAppPayment = processWhatsAppPayment;
window.processRazorpayPayment = processRazorpayPayment;

// Payment functions
function payViaWhatsApp() {
    console.log('payViaWhatsApp called');
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Check if we're already on checkout page
    const checkoutSection = document.getElementById('checkout');
    if (!checkoutSection || checkoutSection.style.display === 'none') {
        // Redirect to checkout first
        proceedToCheckout();
        showNotification('Please fill in your details below to complete the order');
    } else {
        // We're already on checkout, just show message
        showNotification('Please fill in your details below to complete the order');
    }
}

function payViaRazorpay() {
    console.log('payViaRazorpay called');
    if (cart.length === 0) {
        showNotification('Your cart is empty!');
        return;
    }
    
    // Check if we're already on checkout page
    const checkoutSection = document.getElementById('checkout');
    if (!checkoutSection || checkoutSection.style.display === 'none') {
        // Redirect to checkout first
        proceedToCheckout();
        showNotification('Please fill in your details below to proceed with payment');
    } else {
        // We're already on checkout, just show message
        showNotification('Please fill in your details below to proceed with payment');
    }
}

// Validate customer details
function validateCustomerDetails() {
    const customerName = document.getElementById('customer-name').value.trim();
    const customerEmail = document.getElementById('customer-email').value.trim();
    const customerPincode = document.getElementById('customer-pincode').value.trim();
    const customerAddress = document.getElementById('customer-address').value.trim();
    
    // Get phone number with country code
    const phoneInput = document.getElementById('customer-phone');
    let customerPhone = '';
    let selectedCountry = '';
    
    if (window.phoneInputInstance) {
        customerPhone = window.phoneInputInstance.getNumber();
        selectedCountry = window.phoneInputInstance.getSelectedCountryData().name;
        console.log('Phone with country code:', customerPhone);
        console.log('Selected country:', selectedCountry);
    } else {
        customerPhone = phoneInput.value.trim();
    }
    
    // Get address details from Google Places if available
    const addressInput = document.getElementById('customer-address');
    const placeId = addressInput.dataset.placeId || '';
    const formattedAddress = addressInput.dataset.formattedAddress || customerAddress;
    
    console.log('Validating customer details:', { 
        customerName, 
        customerEmail, 
        customerPhone, 
        selectedCountry,
        customerPincode, 
        customerAddress,
        placeId,
        formattedAddress 
    });
    
    // Validate name (minimum 3 characters)
    if (!customerName || customerName.length < 3) {
        showNotification('Please enter a valid name (minimum 3 characters)');
        document.getElementById('customer-name').focus();
        return false;
    }
    
    // Validate email (must contain @ and .)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail || !emailRegex.test(customerEmail)) {
        showNotification('Please enter a valid email address (must contain @ and .)');
        document.getElementById('customer-email').focus();
        return false;
    }
    
    // Validate phone number with international format
    if (!customerPhone || customerPhone.length < 7) {
        showNotification('Please enter a valid phone number with country code');
        document.getElementById('customer-phone').focus();
        return false;
    }
    
    // Validate pincode (exactly 6 digits)
    const pincodeRegex = /^[0-9]{6}$/;
    if (!customerPincode || !pincodeRegex.test(customerPincode)) {
        showNotification('Please enter a valid 6-digit pincode');
        document.getElementById('customer-pincode').focus();
        return false;
    }
    
    // Validate address (minimum 10 characters or Google Places selected)
    if ((!customerAddress || customerAddress.length < 10) && !placeId) {
        showNotification('Please enter a complete delivery address (minimum 10 characters) or select from suggestions');
        document.getElementById('customer-address').focus();
        return false;
    }
    
    return {
        customerName,
        customerEmail,
        customerPhone,
        selectedCountry,
        customerPincode,
        customerAddress: formattedAddress,
        placeId
    };
}

// Process WhatsApp payment after form is filled
function processWhatsAppPayment() {
    console.log('Processing WhatsApp payment...');
    
    // Validate customer details
    const customerDetails = validateCustomerDetails();
    if (!customerDetails) {
        return; // Validation failed, error message already shown
    }
    
    console.log('Customer details validated:', customerDetails);
    
    // Create order message
    let orderMessage = `🕯️ *New Order - Apothecary Candles*%0A%0A`;
    orderMessage += `*Customer Details:*%0A`;
    orderMessage += `• Name: ${customerDetails.customerName}%0A`;
    orderMessage += `• Email: ${customerDetails.customerEmail}%0A`;
    orderMessage += `• Phone: ${customerDetails.customerPhone}%0A`;
    orderMessage += `• Country: ${customerDetails.selectedCountry || 'Not specified'}%0A`;
    orderMessage += `• Pincode: ${customerDetails.customerPincode}%0A`;
    orderMessage += `• Address: ${customerDetails.customerAddress}%0A%0A`;
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

// Process Razorpay payment after form is filled
function processRazorpayPayment() {
    console.log('Processing Razorpay payment...');
    
    // Validate customer details
    const customerDetails = validateCustomerDetails();
    if (!customerDetails) {
        return; // Validation failed, error message already shown
    }
    
    console.log('Customer details validated:', customerDetails);
    
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
            confirmationMessage += `• Name: ${customerDetails.customerName}%0A`;
            confirmationMessage += `• Email: ${customerDetails.customerEmail}%0A`;
            confirmationMessage += `• Phone: ${customerDetails.customerPhone}%0A`;
            confirmationMessage += `• Country: ${customerDetails.selectedCountry || 'Not specified'}%0A`;
            confirmationMessage += `• Pincode: ${customerDetails.customerPincode}%0A`;
            confirmationMessage += `• Address: ${customerDetails.customerAddress}%0A%0A`;
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
            name: customerDetails.customerName,
            email: customerDetails.customerEmail,
            contact: customerDetails.customerPhone
        },
        notes: {
            customer_name: customerDetails.customerName,
            customer_email: customerDetails.customerEmail,
            customer_phone: customerDetails.customerPhone,
            customer_country: customerDetails.selectedCountry || 'Not specified',
            customer_pincode: customerDetails.customerPincode,
            customer_address: customerDetails.customerAddress,
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
