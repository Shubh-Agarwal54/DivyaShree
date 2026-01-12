// Shared product data for the entire application
export const products = [
  {
    id: 1,
    name: 'Maroon Banarasi Silk Saree',
    price: 4999,
    originalPrice: 8999,
    category: 'Sarees',
    fabric: 'Banarasi Silk',
    color: 'Maroon',
    rating: 4.8,
    reviews: 124,
    inStock: true,
    onSale: true,
    salePercentage: 44,
    isBestseller: true,
    soldCount: 487,
    dateAdded: '2025-12-15',
    images: [
      'https://placehold.co/600x800/8B0000/FFF?text=Maroon+Banarasi+Silk',
      'https://placehold.co/600x800/8B0000/FFF?text=Detail+View+1',
      'https://placehold.co/600x800/8B0000/FFF?text=Detail+View+2',
      'https://placehold.co/600x800/8B0000/FFF?text=Model+View',
    ],
    description: 'Exquisite Maroon Banarasi Silk Saree with intricate golden zari work. Perfect for weddings and festive occasions.',
    features: [
      'Pure Banarasi Silk fabric',
      'Traditional zari weaving',
      'Length: 6.3 meters with blouse piece',
      'Dry clean only',
      'Comes with unstitched blouse piece',
    ],
    occasion: ['Wedding', 'Festival', 'Party'],
    care: 'Dry clean only. Store in a cool, dry place.',
  },
  {
    id: 2,
    name: 'Royal Blue Designer Lehenga',
    price: 12999,
    originalPrice: 19999,
    category: 'Lehengas',
    fabric: 'Velvet',
    color: 'Royal Blue',
    rating: 4.9,
    reviews: 89,
    inStock: true,
    onSale: true,
    salePercentage: 35,
    isBestseller: true,
    soldCount: 342,
    dateAdded: '2025-11-20',
    images: [
      'https://placehold.co/600x800/000080/FFF?text=Blue+Velvet+Lehenga',
      'https://placehold.co/600x800/000080/FFF?text=Lehenga+Detail',
      'https://placehold.co/600x800/000080/FFF?text=Embroidery+Work',
      'https://placehold.co/600x800/000080/FFF?text=Full+Set',
    ],
    description: 'Stunning Royal Blue Velvet Lehenga with heavy embroidery work. Perfect for bridal and sangeet ceremonies.',
    features: [
      'Velvet lehenga with silk dupatta',
      'Heavy thread and sequin work',
      'Semi-stitched (customizable)',
      'Includes blouse and dupatta',
      'Designer collection',
    ],
    occasion: ['Wedding', 'Sangeet', 'Reception'],
    care: 'Dry clean recommended. Handle with care.',
  },
  {
    id: 3,
    name: 'Emerald Green Anarkali Suit',
    price: 5999,
    originalPrice: 9999,
    category: 'Suits & Sets',
    fabric: 'Georgette',
    color: 'Emerald Green',
    rating: 4.7,
    reviews: 156,
    inStock: true,
    onSale: true,
    salePercentage: 40,
    isBestseller: false,
    soldCount: 156,
    dateAdded: '2026-01-02',
    images: [
      'https://placehold.co/600x800/008000/FFF?text=Green+Anarkali',
      'https://placehold.co/600x800/008000/FFF?text=Side+View',
      'https://placehold.co/600x800/008000/FFF?text=Back+Detail',
      'https://placehold.co/600x800/008000/FFF?text=Dupatta',
    ],
    description: 'Elegant Emerald Green Georgette Anarkali with intricate embroidery. Perfect for parties and festivals.',
    features: [
      'Georgette fabric with silk lining',
      'Floor-length anarkali',
      'Matching dupatta and churidar',
      'Semi-stitched for perfect fit',
      'Available in multiple sizes',
    ],
    occasion: ['Party', 'Festival', 'Reception'],
    care: 'Gentle hand wash or dry clean.',
  },
  {
    id: 4,
    name: 'Pink Floral Print Kurti',
    price: 1999,
    originalPrice: 3499,
    category: 'Kurtis',
    fabric: 'Cotton',
    color: 'Pink',
    rating: 4.5,
    reviews: 234,
    inStock: true,
    onSale: false,
    salePercentage: 0,
    isBestseller: true,
    soldCount: 523,
    dateAdded: '2025-10-15',
    images: [
      'https://placehold.co/600x800/FFC0CB/000?text=Pink+Kurti',
      'https://placehold.co/600x800/FFC0CB/000?text=Pattern+Detail',
      'https://placehold.co/600x800/FFC0CB/000?text=Front+View',
      'https://placehold.co/600x800/FFC0CB/000?text=Back+View',
    ],
    description: 'Comfortable cotton kurti with beautiful floral prints. Perfect for casual and office wear.',
    features: [
      '100% pure cotton fabric',
      'Digital floral print',
      'Knee-length design',
      'Three-quarter sleeves',
      'Machine washable',
    ],
    occasion: ['Casual', 'Office', 'Daily Wear'],
    care: 'Machine wash cold. Do not bleach.',
  },
  {
    id: 5,
    name: 'Gold Sequin Evening Gown',
    price: 8999,
    originalPrice: 14999,
    category: 'Gowns',
    fabric: 'Net',
    color: 'Gold',
    rating: 4.8,
    reviews: 67,
    inStock: true,
    onSale: true,
    salePercentage: 40,
    isBestseller: false,
    soldCount: 89,
    dateAdded: '2025-12-28',
    images: [
      'https://placehold.co/600x800/FFD700/000?text=Gold+Gown',
      'https://placehold.co/600x800/FFD700/000?text=Sequin+Detail',
      'https://placehold.co/600x800/FFD700/000?text=Side+View',
      'https://placehold.co/600x800/FFD700/000?text=Full+Length',
    ],
    description: 'Glamorous gold sequin gown with net overlay. Perfect for cocktail parties and receptions.',
    features: [
      'Net fabric with sequin work',
      'Floor-length designer gown',
      'Back zip closure',
      'Includes inner lining',
      'Indo-western style',
    ],
    occasion: ['Cocktail', 'Reception', 'Party'],
    care: 'Dry clean only. Store flat.',
  },
  {
    id: 6,
    name: 'Traditional Red Bridal Lehenga',
    price: 24999,
    originalPrice: 39999,
    category: 'Lehengas',
    fabric: 'Silk',
    color: 'Red',
    rating: 5.0,
    reviews: 45,
    inStock: true,
    onSale: true,
    salePercentage: 37,
    isBestseller: true,
    soldCount: 278,
    dateAdded: '2025-11-10',
    images: [
      'https://placehold.co/600x800/DC143C/FFF?text=Red+Bridal+Lehenga',
      'https://placehold.co/600x800/DC143C/FFF?text=Zari+Work',
      'https://placehold.co/600x800/DC143C/FFF?text=Bridal+Set',
      'https://placehold.co/600x800/DC143C/FFF?text=Complete+Look',
    ],
    description: 'Exquisite red bridal lehenga with heavy zari and stone work. A timeless choice for your special day.',
    features: [
      'Pure silk with heavy embroidery',
      'Traditional bridal collection',
      'Includes lehenga, blouse, and dupatta',
      'Semi-stitched (can be customized)',
      'Premium quality craftsmanship',
    ],
    occasion: ['Wedding', 'Bridal'],
    care: 'Professional dry clean only.',
  },
];

// Helper functions
export const getProductById = (id) => {
  return products.find(product => product.id === parseInt(id));
};

export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

export const getProductsByFabric = (fabric) => {
  return products.filter(product => product.fabric.includes(fabric));
};

export const getRelatedProducts = (productId, limit = 4) => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return products
    .filter(p => p.id !== productId && p.category === product.category)
    .slice(0, limit);
};

// New helper functions for sale, bestseller, and new arrivals
export const getSaleProducts = () => {
  return products.filter(product => product.onSale);
};

export const getBestsellerProducts = () => {
  return products
    .filter(product => product.isBestseller)
    .sort((a, b) => b.soldCount - a.soldCount);
};

export const getNewArrivals = (daysRange = 30) => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysRange);
  
  return products
    .filter(product => new Date(product.dateAdded) >= cutoffDate)
    .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
};

export const getProductsByOccasion = (occasion) => {
  return products.filter(product => 
    product.occasion && product.occasion.includes(occasion)
  );
};

// export const getProductsByFabric = (fabric) => {
//   return products.filter(product => 
//     product.fabric.toLowerCase().includes(fabric.toLowerCase())
//   );
// };

// export const getRelatedProducts = (productId, limit = 4) => {
//   const product = getProductById(productId);
//   if (!product) return [];
  
//   return products
//     .filter(p => p.id !== productId && p.category === product.category)
//     .slice(0, limit);
// };
