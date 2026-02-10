# Apothecary Candles Website

A minimalist, elegant website for Apothecary Candles - handcrafted candles made with love.

## Features

- **Minimalist Design**: Clean, modern aesthetic with focus on products
- **Responsive Layout**: Works perfectly on desktop, tablet, and mobile devices
- **Product Showcase**: Beautiful grid layout for candle products with pricing
- **Founder Story**: Personal touch with founder photo and story
- **Contact Integration**: Multiple contact methods and payment options
- **Smooth Animations**: Subtle scroll effects and hover states
- **WhatsApp Integration**: Direct ordering via WhatsApp

## Files Structure

```
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
├── README.md           # This file
├── logo.png            # Your brand logo (to be added)
├── founder.jpg         # Your founder photo (to be added)
├── hero-bg.jpg         # Hero background image (to be added)
├── candle1.jpg         # Product images (to be added)
├── candle2.jpg
├── candle3.jpg
├── candle4.jpg
├── candle5.jpg
└── candle6.jpg
```

## Setup Instructions

### 1. Add Your Images

You need to add the following images to the same directory as your HTML file:

- **logo.png** - Your brand logo
- **founder.jpg** - Your photo as founder
- **hero-bg.jpg** - Background image for hero section
- **candle1.jpg** through **candle6.jpg** - Your candle product photos

### 2. Customize Contact Information

Edit the contact details in `index.html`:

```html
<!-- Update these details in the contact section -->
<p>hello@apothecarycandles.com</p>
<p>+91 98765 43210</p>
```

### 3. Update WhatsApp Number

In `script.js`, update the WhatsApp number:

```javascript
const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
```

Replace `919876543210` with your actual WhatsApp number (without + or spaces).

### 4. Customize Products

Edit the product information in `index.html`:

- Update candle names
- Update descriptions
- Update prices (currently set in INR)
- Add/remove product cards as needed

## Product Details

Current products included:

1. **Lavender Dreams** - ₹450
2. **Sandalwood Serenity** - ₹550
3. **Rose Garden** - ₹500
4. **Citrus Burst** - ₹400
5. **Vanilla Bean** - ₹475
6. **Eucalyptus Mint** - ₹425

## Payment Methods

The website mentions acceptance of:
- UPI
- Credit/Debit Cards
- Net Banking
- Cash on Delivery

Update these in the contact section as needed.

## Customization Tips

### Colors
The main brand color is `#8b7355` (warm brown). You can update this in `styles.css`:

```css
:root {
    --primary-color: #8b7355;
    --secondary-color: #6d5a44;
}
```

### Fonts
The website uses:
- **Playfair Display** for headings (elegant serif)
- **Montserrat** for body text (clean sans-serif)

### Responsive Design
The website is fully responsive and includes:
- Mobile-first approach
- Tablet layouts
- Desktop optimizations

## Launch

To launch your website:

1. Place all files in a web server directory
2. Add your images
3. Update contact information
4. Test all links and buttons
5. Deploy to your hosting service

## Support

For any issues or customizations, ensure all image files are properly named and placed in the correct directory.
