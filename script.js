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
    
    // Setup pincode to state auto-detection
    setupPincodeStateDetection();
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
    
    // Comprehensive Indian addresses database
    const sampleAddresses = [
        // Delhi NCR
        { name: 'Vaishno Silver Bells', address: 'Vaishno Silver Bells, Sector 12, Dwarka, Delhi, 110075', pincode: '110075' },
        { name: 'Vaishno Silver Bells Apartment', address: 'Vaishno Silver Bells Apartment, Plot 12, Dwarka Sector 12, New Delhi, Delhi 110075', pincode: '110075' },
        { name: 'Connaught Place', address: 'Connaught Place, New Delhi, Delhi, 110001', pincode: '110001' },
        { name: 'CP', address: 'Connaught Place, New Delhi, Delhi, 110001', pincode: '110001' },
        { name: 'Nehru Place', address: 'Nehru Place, New Delhi, Delhi, 110019', pincode: '110019' },
        { name: 'Rajouri Garden', address: 'Rajouri Garden, New Delhi, Delhi, 110027', pincode: '110027' },
        { name: 'Karol Bagh', address: 'Karol Bagh, New Delhi, Delhi, 110005', pincode: '110005' },
        { name: 'Lajpat Nagar', address: 'Lajpat Nagar, New Delhi, Delhi, 110024', pincode: '110024' },
        { name: 'South Extension', address: 'South Extension, New Delhi, Delhi, 110049', pincode: '110049' },
        { name: 'South Ex', address: 'South Extension, New Delhi, Delhi, 110049', pincode: '110049' },
        { name: 'Dwarka', address: 'Dwarka, New Delhi, Delhi, 110075', pincode: '110075' },
        { name: 'Sector 12 Dwarka', address: 'Sector 12, Dwarka, New Delhi, Delhi, 110075', pincode: '110075' },
        { name: 'Janakpuri', address: 'Janakpuri, New Delhi, Delhi, 110058', pincode: '110058' },
        { name: 'Pitampura', address: 'Pitampura, New Delhi, Delhi, 110034', pincode: '110034' },
        { name: 'Rohini', address: 'Rohini, New Delhi, Delhi, 110085', pincode: '110085' },
        { name: 'Vasant Kunj', address: 'Vasant Kunj, New Delhi, Delhi, 110070', pincode: '110070' },
        { name: 'Saket', address: 'Saket, New Delhi, Delhi, 110017', pincode: '110017' },
        { name: 'Hauz Khas', address: 'Hauz Khas, New Delhi, Delhi, 110016', pincode: '110016' },
        { name: 'Greater Kailash', address: 'Greater Kailash, New Delhi, Delhi, 110048', pincode: '110048' },
        { name: 'GK', address: 'Greater Kailash, New Delhi, Delhi, 110048', pincode: '110048' },
        { name: 'Defence Colony', address: 'Defence Colony, New Delhi, Delhi, 110024', pincode: '110024' },
        { name: 'Khan Market', address: 'Khan Market, New Delhi, Delhi, 110003', pincode: '110003' },
        { name: 'Chandni Chowk', address: 'Chandni Chowk, New Delhi, Delhi, 110006', pincode: '110006' },
        { name: 'Daryaganj', address: 'Daryaganj, New Delhi, Delhi, 110002', pincode: '110002' },
        { name: 'Paharganj', address: 'Paharganj, New Delhi, Delhi, 110055', pincode: '110055' },
        
        // Gurgaon
        { name: 'DLF Phase 1', address: 'DLF Phase 1, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'DLF Phase 2', address: 'DLF Phase 2, Gurgaon, Haryana, 122002', pincode: '122002' },
        { name: 'DLF Phase 3', address: 'DLF Phase 3, Gurgaon, Haryana, 122003', pincode: '122003' },
        { name: 'DLF Phase 4', address: 'DLF Phase 4, Gurgaon, Haryana, 122004', pincode: '122004' },
        { name: 'DLF Phase 5', address: 'DLF Phase 5, Gurgaon, Haryana, 122005', pincode: '122005' },
        { name: 'DLF', address: 'DLF Phase 1, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Gurgaon', address: 'Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Gurugram', address: 'Gurugram, Haryana, 122001', pincode: '122001' },
        { name: 'MGF Metropolitan', address: 'MGF Metropolitan, MG Road, Gurgaon, Haryana, 122002', pincode: '122002' },
        { name: 'Ambience Mall', address: 'Ambience Mall, NH-48, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 14 Gurgaon', address: 'Sector 14, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 15 Gurgaon', address: 'Sector 15, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 17 Gurgaon', address: 'Sector 17, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 18 Gurgaon', address: 'Sector 18, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 22 Gurgaon', address: 'Sector 22, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 23 Gurgaon', address: 'Sector 23, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 29 Gurgaon', address: 'Sector 29, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 31 Gurgaon', address: 'Sector 31, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 32 Gurgaon', address: 'Sector 32, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 40 Gurgaon', address: 'Sector 40, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 43 Gurgaon', address: 'Sector 43, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 44 Gurgaon', address: 'Sector 44, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 45 Gurgaon', address: 'Sector 45, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 46 Gurgaon', address: 'Sector 46, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 47 Gurgaon', address: 'Sector 47, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 48 Gurgaon', address: 'Sector 48, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 49 Gurgaon', address: 'Sector 49, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 56 Gurgaon', address: 'Sector 56, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sector 57 Gurgaon', address: 'Sector 57, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Sohna Road', address: 'Sohna Road, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Golf Course Road', address: 'Golf Course Road, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Cyber City', address: 'Cyber City, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Udyog Vihar', address: 'Udyog Vihar, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'Plaza Mall', address: 'Plaza Mall, MG Road, Gurgaon, Haryana, 122002', pincode: '122002' },
        
        // Noida
        { name: 'Sector 18 Noida', address: 'Sector 18, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Sector 15 Noida', address: 'Sector 15, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Sector 62 Noida', address: 'Sector 62, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Sector 63 Noida', address: 'Sector 63, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Sector 64 Noida', address: 'Sector 64, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Atta Market', address: 'Atta Market, Sector 18, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Great India Place', address: 'Great India Place, Sector 18, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'GIP', address: 'Great India Place, Sector 18, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Noida', address: 'Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Logix City Center', address: 'Logix City Center, Sector 32, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        
        // Mumbai
        { name: 'Bandra', address: 'Bandra, Mumbai, Maharashtra, 400050', pincode: '400050' },
        { name: 'Bandra West', address: 'Bandra West, Mumbai, Maharashtra, 400050', pincode: '400050' },
        { name: 'Andheri', address: 'Andheri, Mumbai, Maharashtra, 400058', pincode: '400058' },
        { name: 'Andheri West', address: 'Andheri West, Mumbai, Maharashtra, 400058', pincode: '400058' },
        { name: 'Andheri East', address: 'Andheri East, Mumbai, Maharashtra, 400069', pincode: '400069' },
        { name: 'Juhu', address: 'Juhu, Mumbai, Maharashtra, 400049', pincode: '400049' },
        { name: 'Versova', address: 'Versova, Mumbai, Maharashtra, 400061', pincode: '400061' },
        { name: 'Worli', address: 'Worli, Mumbai, Maharashtra, 400018', pincode: '400018' },
        { name: 'Lower Parel', address: 'Lower Parel, Mumbai, Maharashtra, 400013', pincode: '400013' },
        { name: 'Bandra Kurla Complex', address: 'Bandra Kurla Complex, Mumbai, Maharashtra, 400051', pincode: '400051' },
        { name: 'BKC', address: 'Bandra Kurla Complex, Mumbai, Maharashtra, 400051', pincode: '400051' },
        { name: 'Colaba', address: 'Colaba, Mumbai, Maharashtra, 400005', pincode: '400005' },
        { name: 'Marine Drive', address: 'Marine Drive, Mumbai, Maharashtra, 400020', pincode: '400020' },
        { name: 'Marine Lines', address: 'Marine Lines, Mumbai, Maharashtra, 400020', pincode: '400020' },
        { name: 'Churchgate', address: 'Churchgate, Mumbai, Maharashtra, 400020', pincode: '400020' },
        { name: 'CST', address: 'Chhatrapati Shivaji Terminus, Mumbai, Maharashtra, 400001', pincode: '400001' },
        { name: 'Dadar', address: 'Dadar, Mumbai, Maharashtra, 400028', pincode: '400028' },
        { name: 'Sion', address: 'Sion, Mumbai, Maharashtra, 400022', pincode: '400022' },
        { name: 'Kurla', address: 'Kurla, Mumbai, Maharashtra, 400070', pincode: '400070' },
        { name: 'Ghatkopar', address: 'Ghatkopar, Mumbai, Maharashtra, 400077', pincode: '400077' },
        { name: 'Powai', address: 'Powai, Mumbai, Maharashtra, 400076', pincode: '400076' },
        { name: 'Hiranandani', address: 'Hiranandani Gardens, Powai, Mumbai, Maharashtra, 400076', pincode: '400076' },
        
        // Bangalore
        { name: 'Indiranagar', address: 'Indiranagar, Bangalore, Karnataka, 560038', pincode: '560038' },
        { name: 'Koramangala', address: 'Koramangala, Bangalore, Karnataka, 560034', pincode: '560034' },
        { name: 'Koramangala 1st Block', address: 'Koramangala 1st Block, Bangalore, Karnataka, 560034', pincode: '560034' },
        { name: 'Koramangala 4th Block', address: 'Koramangala 4th Block, Bangalore, Karnataka, 560034', pincode: '560034' },
        { name: 'MG Road', address: 'MG Road, Bangalore, Karnataka, 560001', pincode: '560001' },
        { name: 'Brigade Road', address: 'Brigade Road, Bangalore, Karnataka, 560001', pincode: '560001' },
        { name: 'Commercial Street', address: 'Commercial Street, Bangalore, Karnataka, 560001', pincode: '560001' },
        { name: 'Whitefield', address: 'Whitefield, Bangalore, Karnataka, 560066', pincode: '560066' },
        { name: 'Electronic City', address: 'Electronic City, Bangalore, Karnataka, 560100', pincode: '560100' },
        { name: 'HSR Layout', address: 'HSR Layout, Bangalore, Karnataka, 560102', pincode: '560102' },
        { name: 'Jayanagar', address: 'Jayanagar, Bangalore, Karnataka, 560041', pincode: '560041' },
        { name: 'JP Nagar', address: 'JP Nagar, Bangalore, Karnataka, 560078', pincode: '560078' },
        { name: 'BTM Layout', address: 'BTM Layout, Bangalore, Karnataka, 560076', pincode: '560076' },
        { name: 'Marathahalli', address: 'Marathahalli, Bangalore, Karnataka, 560037', pincode: '560037' },
        { name: 'Bellandur', address: 'Bellandur, Bangalore, Karnataka, 560103', pincode: '560103' },
        { name: 'Bannerghatta Road', address: 'Bannerghatta Road, Bangalore, Karnataka, 560076', pincode: '560076' },
        
        // Hyderabad
        { name: 'Banjara Hills', address: 'Banjara Hills, Hyderabad, Telangana, 500034', pincode: '500034' },
        { name: 'Jubilee Hills', address: 'Jubilee Hills, Hyderabad, Telangana, 500033', pincode: '500033' },
        { name: 'Gachibowli', address: 'Gachibowli, Hyderabad, Telangana, 500032', pincode: '500032' },
        { name: 'Hitech City', address: 'Hitech City, Hyderabad, Telangana, 500081', pincode: '500081' },
        { name: 'Madhapur', address: 'Madhapur, Hyderabad, Telangana, 500081', pincode: '500081' },
        { name: 'Kondapur', address: 'Kondapur, Hyderabad, Telangana, 500084', pincode: '500084' },
        { name: 'Secunderabad', address: 'Secunderabad, Telangana, 500003', pincode: '500003' },
        { name: 'Begumpet', address: 'Begumpet, Hyderabad, Telangana, 500016', pincode: '500016' },
        { name: 'Somajiguda', address: 'Somajiguda, Hyderabad, Telangana, 500082', pincode: '500082' },
        
        // Chennai
        { name: 'T Nagar', address: 'T Nagar, Chennai, Tamil Nadu, 600017', pincode: '600017' },
        { name: 'Thyagaraya Nagar', address: 'Thyagaraya Nagar, Chennai, Tamil Nadu, 600017', pincode: '600017' },
        { name: 'Anna Nagar', address: 'Anna Nagar, Chennai, Tamil Nadu, 600040', pincode: '600040' },
        { name: 'Adyar', address: 'Adyar, Chennai, Tamil Nadu, 600020', pincode: '600020' },
        { name: 'Besant Nagar', address: 'Besant Nagar, Chennai, Tamil Nadu, 600090', pincode: '600090' },
        { name: 'Velachery', address: 'Velachery, Chennai, Tamil Nadu, 600042', pincode: '600042' },
        { name: 'OMR', address: 'Old Mahabalipuram Road, Chennai, Tamil Nadu, 600119', pincode: '600119' },
        { name: 'Old Mahabalipuram Road', address: 'Old Mahabalipuram Road, Chennai, Tamil Nadu, 600119', pincode: '600119' },
        { name: 'Mount Road', address: 'Mount Road, Chennai, Tamil Nadu, 600002', pincode: '600002' },
        { name: 'Anna Salai', address: 'Anna Salai, Chennai, Tamil Nadu, 600002', pincode: '600002' },
        
        // Kolkata
        { name: 'Park Street', address: 'Park Street, Kolkata, West Bengal, 700016', pincode: '700016' },
        { name: 'Salt Lake', address: 'Salt Lake, Kolkata, West Bengal, 700064', pincode: '700064' },
        { name: 'Sector 5 Salt Lake', address: 'Sector 5, Salt Lake, Kolkata, West Bengal, 700091', pincode: '700091' },
        { name: 'New Town', address: 'New Town, Kolkata, West Bengal, 700156', pincode: '700156' },
        { name: 'Rajarhat', address: 'Rajarhat, Kolkata, West Bengal, 700156', pincode: '700156' },
        { name: 'Gariahat', address: 'Gariahat, Kolkata, West Bengal, 700029', pincode: '700029' },
        { name: 'Dum Dum', address: 'Dum Dum, Kolkata, West Bengal, 700028', pincode: '700028' },
        { name: 'Howrah', address: 'Howrah, West Bengal, 711101', pincode: '711101' },
        
        // Pune
        { name: 'Koregaon Park', address: 'Koregaon Park, Pune, Maharashtra, 411001', pincode: '411001' },
        { name: 'KP', address: 'Koregaon Park, Pune, Maharashtra, 411001', pincode: '411001' },
        { name: 'Camp', address: 'Camp, Pune, Maharashtra, 411001', pincode: '411001' },
        { name: 'FC Road', address: 'Fergusson College Road, Pune, Maharashtra, 411004', pincode: '411004' },
        { name: 'JM Road', address: 'Jangli Maharaj Road, Pune, Maharashtra, 411005', pincode: '411005' },
        { name: 'Hinjewadi', address: 'Hinjewadi, Pune, Maharashtra, 411057', pincode: '411057' },
        { name: 'Magarpatta', address: 'Magarpatta City, Pune, Maharashtra, 411028', pincode: '411028' },
        { name: 'Kalyani Nagar', address: 'Kalyani Nagar, Pune, Maharashtra, 411014', pincode: '411014' },
        { name: 'Viman Nagar', address: 'Viman Nagar, Pune, Maharashtra, 411014', pincode: '411014' },
        { name: 'Baner', address: 'Baner, Pune, Maharashtra, 411045', pincode: '411045' },
        { name: 'Aundh', address: 'Aundh, Pune, Maharashtra, 411007', pincode: '411007' },
        
        // Ahmedabad
        { name: 'CG Road', address: 'C G Road, Ahmedabad, Gujarat, 380006', pincode: '380006' },
        { name: 'SG Highway', address: 'Sarkhej Gandhinagar Highway, Ahmedabad, Gujarat, 380051', pincode: '380051' },
        { name: 'Bodakdev', address: 'Bodakdev, Ahmedabad, Gujarat, 380054', pincode: '380054' },
        { name: 'Vastrapur', address: 'Vastrapur, Ahmedabad, Gujarat, 380026', pincode: '380026' },
        { name: 'Satellite', address: 'Satellite, Ahmedabad, Gujarat, 380015', pincode: '380015' },
        { name: 'Maninagar', address: 'Maninagar, Ahmedabad, Gujarat, 380008', pincode: '380008' },
        
        // Jaipur
        { name: 'MI Road', address: 'MI Road, Jaipur, Rajasthan, 302001', pincode: '302001' },
        { name: 'Tonk Road', address: 'Tonk Road, Jaipur, Rajasthan, 302018', pincode: '302018' },
        { name: 'Vaishali Nagar', address: 'Vaishali Nagar, Jaipur, Rajasthan, 302021', pincode: '302021' },
        { name: 'Malviya Nagar', address: 'Malviya Nagar, Jaipur, Rajasthan, 302017', pincode: '302017' },
        { name: 'Ajmer Road', address: 'Ajmer Road, Jaipur, Rajasthan, 302006', pincode: '302006' },
        
        // Popular Malls and Landmarks
        { name: 'Select Citywalk', address: 'Select Citywalk Mall, Saket, New Delhi, Delhi, 110017', pincode: '110017' },
        { name: 'Ambience Mall Delhi', address: 'Ambience Mall, NH-8, New Delhi, Delhi, 110037', pincode: '110037' },
        { name: 'Pacific Mall', address: 'Pacific Mall, Tagore Garden, New Delhi, Delhi, 110027', pincode: '110027' },
        { name: 'Phoenix Marketcity', address: 'Phoenix Marketcity, Kurla West, Mumbai, Maharashtra, 400070', pincode: '400070' },
        { name: 'Phoenix Marketcity Bangalore', address: 'Phoenix Marketcity, Whitefield, Bangalore, Karnataka, 560066', pincode: '560066' },
        { name: 'Orion Mall', address: 'Orion Mall, Rajajinagar, Bangalore, Karnataka, 560055', pincode: '560055' },
        { name: 'Forum Mall', address: 'Forum Mall, Koramangala, Bangalore, Karnataka, 560034', pincode: '560034' },
        { name: 'Inorbit Mall', address: 'Inorbit Mall, Hitech City, Hyderabad, Telangana, 500081', pincode: '500081' },
        { name: 'Phoenix Marketcity Chennai', address: 'Phoenix Marketcity, Velachery, Chennai, Tamil Nadu, 600042', pincode: '600042' },
        { name: 'Mantri Square', address: 'Mantri Square, Malleswaram, Bangalore, Karnataka, 560055', pincode: '560055' },
        { name: 'Elante Mall', address: 'Elante Mall, Industrial Area, Chandigarh, 160002', pincode: '160002' },
        { name: 'DLF Mall of India', address: 'DLF Mall of India, Sector 18, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Great India Place Noida', address: 'Great India Place, Sector 18, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Spice Mall', address: 'Spice Mall, Sector 25, Noida, Uttar Pradesh, 201301', pincode: '201301' },
        { name: 'Ansal Plaza', address: 'Ansal Plaza, Khel Gaon Marg, New Delhi, Delhi, 110017', pincode: '110017' },
        { name: 'DT City Center', address: 'DT City Center, MG Road, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'MGF Metropolitan Mall', address: 'MGF Metropolitan Mall, MG Road, Gurgaon, Haryana, 122002', pincode: '122002' },
        { name: 'Omaxe Mall', address: 'Omaxe Mall, Sohna Road, Gurgaon, Haryana, 122001', pincode: '122001' },
        { name: 'SRS Mall', address: 'SRS Mall, Sector 31, Faridabad, Haryana, 121001', pincode: '121001' },
        { name: 'Crown Interiorz', address: 'Crown Interiorz Mall, Faridabad, Haryana, 121001', pincode: '121001' },
        { name: 'Fun City Mall', address: 'Fun City Mall, Sector 28, Faridabad, Haryana, 121001', pincode: '121001' },
        { name: 'Era Mall', address: 'Era Mall, Mathura Road, Faridabad, Haryana, 121001', pincode: '121001' },
        { name: 'Parsvnath Mall', address: 'Parsvnath Mall, Sector 14, Faridabad, Haryana, 121001', pincode: '121001' },
        { name: 'AlphaOne Mall', address: 'AlphaOne Mall, Amritsar, Punjab, 143001', pincode: '143001' },
        { name: 'Westside Mall', address: 'Westside Mall, Amritsar, Punjab, 143001', pincode: '143001' },
        { name: 'Trident Mall', address: 'Trident Mall, Amritsar, Punjab, 143001', pincode: '143001' },
        { name: 'Mall of Amritsar', address: 'Mall of Amritsar, Mall Road, Amritsar, Punjab, 143001', pincode: '143001' },
        { name: 'Celebration Mall', address: 'Celebration Mall, Jalandhar, Punjab, 144001', pincode: '144001' },
        { name: 'MBD Mall', address: 'MBD Mall, Jalandhar, Punjab, 144001', pincode: '144001' },
        { name: 'Viva Collage Mall', address: 'Viva Collage Mall, Jalandhar, Punjab, 144001', pincode: '144001' },
        { name: 'Stadium Market', address: 'Stadium Market, Jalandhar, Punjab, 144001', pincode: '144001' },
        { name: 'Wave Mall', address: 'Wave Mall, Ludhiana, Punjab, 141001', pincode: '141001' },
        { name: 'Pavilion Mall', address: 'Pavilion Mall, Ludhiana, Punjab, 141001', pincode: '141001' },
        { name: 'Westend Mall', address: 'Westend Mall, Ludhiana, Punjab, 141001', pincode: '141001' },
        { name: 'Silver Arc Mall', address: 'Silver Arc Mall, Ludhiana, Punjab, 141001', pincode: '141001' },
        { name: 'Mall of Ludhiana', address: 'Mall of Ludhiana, Ludhiana, Punjab, 141001', pincode: '141001' }
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
            
            // Filter addresses with more flexible matching
            const matches = sampleAddresses.filter(addr => {
                const nameMatch = addr.name.toLowerCase().includes(query);
                const addressMatch = addr.address.toLowerCase().includes(query);
                const words = query.split(' ');
                const partialMatch = words.some(word => 
                    word.length > 1 && addr.name.toLowerCase().includes(word)
                );
                
                const isMatch = nameMatch || addressMatch || partialMatch;
                if (isMatch) {
                    console.log('Match found:', addr.name, 'for query:', query);
                }
                return isMatch;
            });
            
            console.log('Found matches:', matches.length);
            console.log('All matches:', matches.map(m => m.name));
            
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
                console.log('No matches found for:', query);
                console.log('Available addresses:', sampleAddresses.map(a => a.name));
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

// Setup pincode to state auto-detection
function setupPincodeStateDetection() {
    console.log('Setting up pincode to state detection...');
    
    const pincodeInput = document.getElementById('customer-pincode');
    const stateInput = document.getElementById('customer-state');
    
    if (!pincodeInput || !stateInput) {
        console.log('Pincode or state input not found');
        return;
    }
    
    // Comprehensive pincode to state mapping (first 2-3 digits determine state)
    const pincodeStateMap = {
        // Delhi (11)
        '110': 'Delhi',
        '11': 'Delhi',
        
        // Haryana (12-13)
        '121': 'Haryana', // Faridabad
        '122': 'Haryana', // Gurgaon, Palwal
        '123': 'Haryana', // Rewari
        '124': 'Haryana', // Rohtak, Jhajjar
        '125': 'Haryana', // Sonipat, Panipat
        '126': 'Haryana', // Karnal
        '127': 'Haryana', // Kurukshetra
        '128': 'Haryana', // Kaithal
        '129': 'Haryana', // Jind
        '130': 'Haryana', // Hisar
        '131': 'Haryana', // Hansi
        '132': 'Haryana', // Sirsa
        '133': 'Haryana', // Fatehabad
        '134': 'Haryana', // Bhiwani
        '135': 'Haryana', // Mahendragarh
        '136': 'Haryana', // Narnaul
        '13': 'Haryana',
        
        // Uttar Pradesh (20-28)
        '201': 'Uttar Pradesh', // Noida, Ghaziabad
        '202': 'Uttar Pradesh', // Bulandshahr
        '203': 'Uttar Pradesh', // Aligarh
        '204': 'Uttar Pradesh', // Mathura
        '205': 'Uttar Pradesh', // Agra
        '206': 'Uttar Pradesh', // Firozabad
        '207': 'Uttar Pradesh', // Mainpuri
        '208': 'Uttar Pradesh', // Etawah
        '209': 'Uttar Pradesh', // Auraiya
        '210': 'Uttar Pradesh', // Kanpur
        '211': 'Uttar Pradesh', // Unnao
        '212': 'Uttar Pradesh', // Kannauj
        '213': 'Uttar Pradesh', // Farrukhabad
        '214': 'Uttar Pradesh', // Hardoi
        '215': 'Uttar Pradesh', // Sitapur
        '216': 'Uttar Pradesh', // Lakhimpur Kheri
        '217': 'Uttar Pradesh', // Pilibhit
        '218': 'Uttar Pradesh', // Shahjahanpur
        '219': 'Uttar Pradesh', // Bareilly
        '220': 'Uttar Pradesh', // Badaun
        '221': 'Uttar Pradesh', // Rampur
        '222': 'Uttar Pradesh', // Moradabad
        '223': 'Uttar Pradesh', // Sambhal
        '224': 'Uttar Pradesh', // Amroha
        '225': 'Uttar Pradesh', // Meerut
        '226': 'Uttar Pradesh', // Baghpat
        '227': 'Uttar Pradesh', // Muzaffarnagar
        '228': 'Uttar Pradesh', // Saharanpur
        '229': 'Uttar Pradesh', // Shamli
        '230': 'Uttar Pradesh', // Lucknow
        '231': 'Uttar Pradesh', // Barabanki
        '232': 'Uttar Pradesh', // Faizabad
        '233': 'Uttar Pradesh', // Ambedkar Nagar
        '234': 'Uttar Pradesh', // Sultanpur
        '235': 'Uttar Pradesh', // Pratapgarh
        '236': 'Uttar Pradesh', // Allahabad
        '237': 'Uttar Pradesh', // Kaushambi
        '238': 'Uttar Pradesh', // Chitrakoot
        '239': 'Uttar Pradesh', // Banda
        '240': 'Uttar Pradesh', // Hamirpur
        '241': 'Uttar Pradesh', // Mahoba
        '242': 'Uttar Pradesh', // Jalaun
        '243': 'Uttar Pradesh', // Jhansi
        '244': 'Uttar Pradesh', // Lalitpur
        '245': 'Uttar Pradesh', // Azamgarh
        '246': 'Uttar Pradesh', // Mau
        '247': 'Uttar Pradesh', // Ballia
        '248': 'Uttar Pradesh', // Ghazipur
        '249': 'Uttar Pradesh', // Chandauli
        '250': 'Uttar Pradesh', // Varanasi
        '251': 'Uttar Pradesh', // Jaunpur
        '252': 'Uttar Pradesh', // Ghazipur
        '253': 'Uttar Pradesh', // Sant Ravidas Nagar
        '254': 'Uttar Pradesh', // Mirzapur
        '255': 'Uttar Pradesh', // Sonbhadra
        '256': 'Uttar Pradesh', // Basti
        '257': 'Uttar Pradesh', // Siddharthnagar
        '258': 'Uttar Pradesh', // Sant Kabir Nagar
        '259': 'Uttar Pradesh', // Maharajganj
        '260': 'Uttar Pradesh', // Gorakhpur
        '261': 'Uttar Pradesh', // Kushinagar
        '262': 'Uttar Pradesh', // Deoria
        '263': 'Uttar Pradesh', // Gonda
        '264': 'Uttar Pradesh', // Bahraich
        '265': 'Uttar Pradesh', // Shrawasti
        '266': 'Uttar Pradesh', // Balrampur
        '267': 'Uttar Pradesh', // Gonda
        '268': 'Uttar Pradesh', // Bahraich
        '269': 'Uttar Pradesh', // Shravasti
        '270': 'Uttar Pradesh', // Bareilly
        '271': 'Uttar Pradesh', // Pilibhit
        '272': 'Uttar Pradesh', // Shahjahanpur
        '273': 'Uttar Pradesh', // Kheri
        '274': 'Uttar Pradesh', // Lakhimpur
        '275': 'Uttar Pradesh', // Sitapur
        '276': 'Uttar Pradesh', // Hardoi
        '277': 'Uttar Pradesh', // Unnao
        '278': 'Uttar Pradesh', // Kanpur Rural
        '279': 'Uttar Pradesh', // Kanpur Nagar
        '280': 'Uttar Pradesh', // Kanpur
        '281': 'Uttar Pradesh', // Kanpur Dehat
        '282': 'Uttar Pradesh', // Jalaun
        '283': 'Uttar Pradesh', // Jhansi
        '284': 'Uttar Pradesh', // Lalitpur
        '285': 'Uttar Pradesh', // Hamirpur
        '286': 'Uttar Pradesh', // Mahoba
        '287': 'Uttar Pradesh', // Banda
        '288': 'Uttar Pradesh', // Chitrakoot
        '289': 'Uttar Pradesh', // Kaushambi
        '290': 'Uttar Pradesh', // Allahabad
        '291': 'Uttar Pradesh', // Fatehpur
        '292': 'Uttar Pradesh', // Pratapgarh
        '293': 'Uttar Pradesh', // Kaushambi
        '294': 'Uttar Pradesh', // Sultanpur
        '295': 'Uttar Pradesh', // Ambedkar Nagar
        '296': 'Uttar Pradesh', // Bahraich
        '297': 'Uttar Pradesh', // Shrawasti
        '298': 'Uttar Pradesh', // Balrampur
        '299': 'Uttar Pradesh', // Gonda
        '2': 'Uttar Pradesh',
        
        // Maharashtra (40-44)
        '400': 'Maharashtra', // Mumbai
        '401': 'Maharashtra', // Mumbai suburban
        '402': 'Maharashtra', // Raigad
        '403': 'Maharashtra', // Thane
        '404': 'Maharashtra', // Raigad
        '405': 'Maharashtra', // Pune
        '410': 'Maharashtra', // Pune
        '411': 'Maharashtra', // Pune
        '412': 'Maharashtra', // Pune
        '413': 'Maharashtra', // Pune
        '414': 'Maharashtra', // Pune
        '415': 'Maharashtra', // Satara
        '416': 'Maharashtra', // Sangli
        '417': 'Maharashtra', // Kolhapur
        '418': 'Maharashtra', // Ratnagiri
        '419': 'Maharashtra', // Sindhudurg
        '420': 'Maharashtra', // Nashik
        '421': 'Maharashtra', // Nashik
        '422': 'Maharashtra', // Ahmednagar
        '423': 'Maharashtra', // Aurangabad
        '424': 'Maharashtra', // Jalna
        '425': 'Maharashtra', // Parbhani
        '426': 'Maharashtra', // Beed
        '427': 'Maharashtra', // Nanded
        '428': 'Maharashtra', // Latur
        '429': 'Maharashtra', // Osmanabad
        '430': 'Maharashtra', // Solapur
        '431': 'Maharashtra', // Solapur
        '432': 'Maharashtra', // Sangli
        '433': 'Maharashtra', // Kolhapur
        '434': 'Maharashtra', // Ratnagiri
        '435': 'Maharashtra', // Sindhudurg
        '436': 'Maharashtra', // Thane
        '437': 'Maharashtra', // Mumbai
        '438': 'Maharashtra', // Mumbai
        '439': 'Maharashtra', // Mumbai
        '440': 'Maharashtra', // Nagpur
        '441': 'Maharashtra', // Nagpur
        '442': 'Maharashtra', // Wardha
        '443': 'Maharashtra', // Amravati
        '444': 'Maharashtra', // Akola
        '445': 'Maharashtra', // Buldhana
        '446': 'Maharashtra', // Jalgaon
        '447': 'Maharashtra', // Dhule
        '448': 'Maharashtra', // Nandurbar
        '449': 'Maharashtra', // Nashik
        '4': 'Maharashtra',
        
        // Karnataka (56-59)
        '560': 'Karnataka', // Bangalore
        '561': 'Karnataka', // Bangalore Rural
        '562': 'Karnataka', // Bangalore Rural
        '563': 'Karnataka', // Bangalore Rural
        '571': 'Karnataka', // Chikballapur
        '572': 'Karnataka', // Tumkur
        '573': 'Karnataka', // Mandya
        '574': 'Karnataka', // Mysore
        '575': 'Karnataka', // Hassan
        '576': 'Karnataka', // Chikmagalur
        '577': 'Karnataka', // Shimoga
        '578': 'Karnataka', // Davangere
        '579': 'Karnataka', // Bellary
        '580': 'Karnataka', // Raichur
        '581': 'Karnataka', // Dharwad
        '582': 'Karnataka', // Gadag
        '583': 'Karnataka', // Belgaum
        '584': 'Karnataka', // Bijapur
        '585': 'Karnataka', // Bagalkot
        '586': 'Karnataka', // Gulbarga
        '587': 'Karnataka', // Bidar
        '588': 'Karnataka', // Raichur
        '589': 'Karnataka', // Koppal
        '590': 'Karnataka', // Uttar Kannada
        '591': 'Karnataka', // Dharwad
        '592': 'Karnataka', // Belgaum
        '593': 'Karnataka', // Bijapur
        '594': 'Karnataka', // Bagalkot
        '595': 'Karnataka', // Gulbarga
        '596': 'Karnataka', // Bidar
        '597': 'Karnataka', // Raichur
        '598': 'Karnataka', // Koppal
        '599': 'Karnataka', // Bellary
        '5': 'Karnataka',
        
        // Tamil Nadu (60-64)
        '600': 'Tamil Nadu', // Chennai
        '601': 'Tamil Nadu', // Chennai
        '602': 'Tamil Nadu', // Chennai
        '603': 'Tamil Nadu', // Chennai
        '604': 'Tamil Nadu', // Chennai
        '605': 'Tamil Nadu', // Chennai
        '606': 'Tamil Nadu', // Chennai
        '607': 'Tamil Nadu', // Chennai
        '608': 'Tamil Nadu', // Chennai
        '609': 'Tamil Nadu', // Chennai
        '610': 'Tamil Nadu', // Chennai
        '611': 'Tamil Nadu', // Chennai
        '612': 'Tamil Nadu', // Chennai
        '613': 'Tamil Nadu', // Chennai
        '614': 'Tamil Nadu', // Chennai
        '615': 'Tamil Nadu', // Chennai
        '616': 'Tamil Nadu', // Chennai
        '617': 'Tamil Nadu', // Chennai
        '618': 'Tamil Nadu', // Chennai
        '619': 'Tamil Nadu', // Chennai
        '620': 'Tamil Nadu', // Chennai
        '621': 'Tamil Nadu', // Chennai
        '622': 'Tamil Nadu', // Chennai
        '623': 'Tamil Nadu', // Chennai
        '624': 'Tamil Nadu', // Chennai
        '625': 'Tamil Nadu', // Chennai
        '626': 'Tamil Nadu', // Chennai
        '627': 'Tamil Nadu', // Chennai
        '628': 'Tamil Nadu', // Chennai
        '629': 'Tamil Nadu', // Chennai
        '630': 'Tamil Nadu', // Chennai
        '631': 'Tamil Nadu', // Chennai
        '632': 'Tamil Nadu', // Chennai
        '633': 'Tamil Nadu', // Chennai
        '634': 'Tamil Nadu', // Chennai
        '635': 'Tamil Nadu', // Chennai
        '636': 'Tamil Nadu', // Chennai
        '637': 'Tamil Nadu', // Chennai
        '638': 'Tamil Nadu', // Chennai
        '639': 'Tamil Nadu', // Chennai
        '640': 'Tamil Nadu', // Chennai
        '641': 'Tamil Nadu', // Chennai
        '642': 'Tamil Nadu', // Chennai
        '643': 'Tamil Nadu', // Chennai
        '644': 'Tamil Nadu', // Chennai
        '645': 'Tamil Nadu', // Chennai
        '646': 'Tamil Nadu', // Chennai
        '647': 'Tamil Nadu', // Chennai
        '648': 'Tamil Nadu', // Chennai
        '649': 'Tamil Nadu', // Chennai
        '650': 'Tamil Nadu', // Chennai
        '651': 'Tamil Nadu', // Chennai
        '652': 'Tamil Nadu', // Chennai
        '653': 'Tamil Nadu', // Chennai
        '654': 'Tamil Nadu', // Chennai
        '655': 'Tamil Nadu', // Chennai
        '656': 'Tamil Nadu', // Chennai
        '657': 'Tamil Nadu', // Chennai
        '658': 'Tamil Nadu', // Chennai
        '659': 'Tamil Nadu', // Chennai
        '6': 'Tamil Nadu',
        
        // West Bengal (70-74)
        '700': 'West Bengal', // Kolkata
        '701': 'West Bengal', // Kolkata
        '702': 'West Bengal', // Kolkata
        '703': 'West Bengal', // Kolkata
        '704': 'West Bengal', // Kolkata
        '705': 'West Bengal', // Kolkata
        '706': 'West Bengal', // Kolkata
        '707': 'West Bengal', // Kolkata
        '708': 'West Bengal', // Kolkata
        '709': 'West Bengal', // Kolkata
        '710': 'West Bengal', // Kolkata
        '711': 'West Bengal', // Howrah
        '712': 'West Bengal', // Hooghly
        '713': 'West Bengal', // Burdwan
        '714': 'West Bengal', // Birbhum
        '715': 'West Bengal', // Murshidabad
        '716': 'West Bengal', // Nadia
        '717': 'West Bengal', // North 24 Parganas
        '718': 'West Bengal', // South 24 Parganas
        '719': 'West Bengal', // Kolkata
        '720': 'West Bengal', // Purulia
        '721': 'West Bengal', // Bankura
        '722': 'West Bengal', // Midnapore
        '723': 'West Bengal', // Midnapore
        '724': 'West Bengal', // Midnapore
        '725': 'West Bengal', // Midnapore
        '726': 'West Bengal', // Midnapore
        '727': 'West Bengal', // Midnapore
        '728': 'West Bengal', // Midnapore
        '729': 'West Bengal', // Midnapore
        '730': 'West Bengal', // Midnapore
        '731': 'West Bengal', // Midnapore
        '732': 'West Bengal', // Midnapore
        '733': 'West Bengal', // Midnapore
        '734': 'West Bengal', // Midnapore
        '735': 'West Bengal', // Midnapore
        '736': 'West Bengal', // Midnapore
        '737': 'West Bengal', // Midnapore
        '738': 'West Bengal', // Midnapore
        '739': 'West Bengal', // Midnapore
        '740': 'West Bengal', // Midnapore
        '741': 'West Bengal', // Midnapore
        '742': 'West Bengal', // Midnapore
        '743': 'West Bengal', // Midnapore
        '744': 'West Bengal', // Midnapore
        '745': 'West Bengal', // Midnapore
        '746': 'West Bengal', // Midnapore
        '747': 'West Bengal', // Midnapore
        '748': 'West Bengal', // Midnapore
        '749': 'West Bengal', // Midnapore
        '7': 'West Bengal',
        
        // Gujarat (38-39)
        '380': 'Gujarat', // Ahmedabad
        '381': 'Gujarat', // Ahmedabad
        '382': 'Gujarat', // Ahmedabad
        '383': 'Gujarat', // Ahmedabad
        '384': 'Gujarat', // Ahmedabad
        '385': 'Gujarat', // Ahmedabad
        '386': 'Gujarat', // Ahmedabad
        '387': 'Gujarat', // Ahmedabad
        '388': 'Gujarat', // Ahmedabad
        '389': 'Gujarat', // Ahmedabad
        '390': 'Gujarat', // Vadodara
        '391': 'Gujarat', // Vadodara
        '392': 'Gujarat', // Vadodara
        '393': 'Gujarat', // Vadodara
        '394': 'Gujarat', // Vadodara
        '395': 'Gujarat', // Vadodara
        '396': 'Gujarat', // Rajkot
        '397': 'Gujarat', // Rajkot
        '398': 'Gujarat', // Rajkot
        '399': 'Gujarat', // Rajkot
        '3': 'Gujarat',
        
        // Rajasthan (30-34)
        '300': 'Rajasthan', // Jaipur
        '301': 'Rajasthan', // Jaipur
        '302': 'Rajasthan', // Jaipur
        '303': 'Rajasthan', // Jaipur
        '304': 'Rajasthan', // Jaipur
        '305': 'Rajasthan', // Jaipur
        '306': 'Rajasthan', // Jaipur
        '307': 'Rajasthan', // Jaipur
        '308': 'Rajasthan', // Jaipur
        '309': 'Rajasthan', // Jaipur
        '310': 'Rajasthan', // Jaipur
        '311': 'Rajasthan', // Jaipur
        '312': 'Rajasthan', // Jaipur
        '313': 'Rajasthan', // Jaipur
        '314': 'Rajasthan', // Jaipur
        '315': 'Rajasthan', // Jaipur
        '316': 'Rajasthan', // Jaipur
        '317': 'Rajasthan', // Jaipur
        '318': 'Rajasthan', // Jaipur
        '319': 'Rajasthan', // Jaipur
        '320': 'Rajasthan', // Jaipur
        '321': 'Rajasthan', // Jaipur
        '322': 'Rajasthan', // Jaipur
        '323': 'Rajasthan', // Jaipur
        '324': 'Rajasthan', // Jaipur
        '325': 'Rajasthan', // Jaipur
        '326': 'Rajasthan', // Jaipur
        '327': 'Rajasthan', // Jaipur
        '328': 'Rajasthan', // Jaipur
        '329': 'Rajasthan', // Jaipur
        '330': 'Rajasthan', // Jaipur
        '331': 'Rajasthan', // Jaipur
        '332': 'Rajasthan', // Jaipur
        '333': 'Rajasthan', // Jaipur
        '334': 'Rajasthan', // Jaipur
        '335': 'Rajasthan', // Jaipur
        '336': 'Rajasthan', // Jaipur
        '337': 'Rajasthan', // Jaipur
        '338': 'Rajasthan', // Jaipur
        '339': 'Rajasthan', // Jaipur
        '340': 'Rajasthan', // Jaipur
        '341': 'Rajasthan', // Jaipur
        '342': 'Rajasthan', // Jaipur
        '343': 'Rajasthan', // Jaipur
        '344': 'Rajasthan', // Jaipur
        '345': 'Rajasthan', // Jaipur
        '346': 'Rajasthan', // Jaipur
        '347': 'Rajasthan', // Jaipur
        '348': 'Rajasthan', // Jaipur
        '349': 'Rajasthan', // Jaipur
        '3': 'Rajasthan',
        
        // Punjab (14-16)
        '140': 'Punjab', // Amritsar
        '141': 'Punjab', // Amritsar
        '142': 'Punjab', // Amritsar
        '143': 'Punjab', // Amritsar
        '144': 'Punjab', // Jalandhar
        '145': 'Punjab', // Jalandhar
        '146': 'Punjab', // Jalandhar
        '147': 'Punjab', // Jalandhar
        '148': 'Punjab', // Ludhiana
        '149': 'Punjab', // Ludhiana
        '150': 'Punjab', // Ludhiana
        '151': 'Punjab', // Ludhiana
        '152': 'Punjab', // Ludhiana
        '153': 'Punjab', // Ludhiana
        '154': 'Punjab', // Ludhiana
        '155': 'Punjab', // Ludhiana
        '156': 'Punjab', // Ludhiana
        '157': 'Punjab', // Ludhiana
        '158': 'Punjab', // Ludhiana
        '159': 'Punjab', // Ludhiana
        '160': 'Punjab', // Chandigarh
        '161': 'Punjab', // Chandigarh
        '162': 'Punjab', // Chandigarh
        '163': 'Punjab', // Chandigarh
        '164': 'Punjab', // Chandigarh
        '165': 'Punjab', // Chandigarh
        '166': 'Punjab', // Chandigarh
        '167': 'Punjab', // Chandigarh
        '168': 'Punjab', // Chandigarh
        '169': 'Punjab', // Chandigarh
        '1': 'Punjab',
        
        // Telangana (50)
        '500': 'Telangana', // Hyderabad
        '501': 'Telangana', // Hyderabad
        '502': 'Telangana', // Hyderabad
        '503': 'Telangana', // Hyderabad
        '504': 'Telangana', // Hyderabad
        '505': 'Telangana', // Hyderabad
        '506': 'Telangana', // Hyderabad
        '507': 'Telangana', // Hyderabad
        '508': 'Telangana', // Hyderabad
        '509': 'Telangana', // Hyderabad
        '5': 'Telangana'
    };
    
    // Function to detect state from pincode
    function detectStateFromPincode(pincode) {
        if (!pincode || pincode.length !== 6) {
            return '';
        }
        
        // Try exact 3-digit match first
        const first3 = pincode.substring(0, 3);
        if (pincodeStateMap[first3]) {
            return pincodeStateMap[first3];
        }
        
        // Try exact 2-digit match
        const first2 = pincode.substring(0, 2);
        if (pincodeStateMap[first2]) {
            return pincodeStateMap[first2];
        }
        
        // Try 1-digit match
        const first1 = pincode.substring(0, 1);
        if (pincodeStateMap[first1]) {
            return pincodeStateMap[first1];
        }
        
        return '';
    }
    
    // Add input event listener to pincode field
    pincodeInput.addEventListener('input', function() {
        const pincode = this.value.trim();
        
        if (pincode.length === 6) {
            const detectedState = detectStateFromPincode(pincode);
            
            if (detectedState) {
                stateInput.value = detectedState;
                stateInput.style.borderColor = '#28a745';
                stateInput.style.backgroundColor = '#d4edda';
                console.log('State detected:', detectedState, 'for pincode:', pincode);
                showNotification(`State detected: ${detectedState}`);
            } else {
                stateInput.value = 'Unknown State';
                stateInput.style.borderColor = '#dc3545';
                stateInput.style.backgroundColor = '#f8d7da';
                console.log('State not detected for pincode:', pincode);
                showNotification('State not found for this pincode');
            }
        } else {
            // Clear state if pincode is not 6 digits
            stateInput.value = '';
            stateInput.style.borderColor = '#ddd';
            stateInput.style.backgroundColor = '#f8f9fa';
        }
    });
    
    // Also update state when address is selected from autocomplete
    const originalSelectAddress = window.selectAddress;
    window.selectAddress = function(address, pincode) {
        // Call original function
        if (originalSelectAddress) {
            originalSelectAddress(address, pincode);
        }
        
        // Update state based on pincode
        if (pincode) {
            const detectedState = detectStateFromPincode(pincode);
            if (detectedState) {
                stateInput.value = detectedState;
                stateInput.style.borderColor = '#28a745';
                stateInput.style.backgroundColor = '#d4edda';
                console.log('State auto-updated:', detectedState, 'for pincode:', pincode);
            }
        }
    };
    
    console.log('Pincode to state detection setup complete');
}

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
    const customerState = document.getElementById('customer-state').value.trim();
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
        customerState,
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
    
    // Validate state (must be auto-detected)
    if (!customerState || customerState === 'Unknown State') {
        showNotification('Please enter a valid Indian pincode to auto-detect state');
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
        customerState,
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
    orderMessage += `• State: ${customerDetails.customerState}%0A`;
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
            confirmationMessage += `• State: ${customerDetails.customerState}%0A`;
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
            customer_state: customerDetails.customerState,
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
