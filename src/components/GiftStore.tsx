import React, { useState, useEffect } from 'react';
import { Search, Filter, Heart, Star, ShoppingCart, Gift, ArrowLeft, Plus, Minus, Share, MapPin, Truck, Shield, Users } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { projectId } from '../utils/supabase/info';

interface GiftStoreProps {
  user: any;
  partner: any;
  session: any;
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon_url: string;
  sort_order: number;
  is_active: boolean;
}

interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price_cents: number;
  currency: string;
  image_urls: string[];
  vendor: string;
  rating: number;
  review_count: number;
  is_active: boolean;
  category: {
    name: string;
    icon_url: string;
  };
}

export default function GiftStore({ user, partner, session }: GiftStoreProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'categories' | 'products' | 'product-detail' | 'cart'>('products');
  const [sortBy, setSortBy] = useState<'popular' | 'price-low' | 'price-high' | 'rating'>('popular');

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/gifts/categories`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      } else {
        // Fallback demo categories
        const demoCategories = [
          { id: 'cat-1', name: 'Luxury', description: 'Premium luxury gifts', icon_url: '', sort_order: 1, is_active: true },
          { id: 'cat-2', name: 'Jewelry', description: 'Beautiful jewelry pieces', icon_url: '', sort_order: 2, is_active: true },
          { id: 'cat-3', name: 'Flowers', description: 'Fresh flower arrangements', icon_url: '', sort_order: 3, is_active: true },
          { id: 'cat-4', name: 'Sweets', description: 'Delicious chocolates & treats', icon_url: '', sort_order: 4, is_active: true },
          { id: 'cat-5', name: 'Fragrance', description: 'Exquisite perfumes', icon_url: '', sort_order: 5, is_active: true },
        ];
        setCategories(demoCategories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Fallback demo categories
      const demoCategories = [
        { id: 'cat-1', name: 'Luxury', description: 'Premium luxury gifts', icon_url: '', sort_order: 1, is_active: true },
        { id: 'cat-2', name: 'Jewelry', description: 'Beautiful jewelry pieces', icon_url: '', sort_order: 2, is_active: true },
        { id: 'cat-3', name: 'Flowers', description: 'Fresh flower arrangements', icon_url: '', sort_order: 3, is_active: true },
        { id: 'cat-4', name: 'Sweets', description: 'Delicious chocolates & treats', icon_url: '', sort_order: 4, is_active: true },
        { id: 'cat-5', name: 'Fragrance', description: 'Exquisite perfumes', icon_url: '', sort_order: 5, is_active: true },
      ];
      setCategories(demoCategories);
    }
  };

  const loadProducts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/gifts/products`,
        {
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        // Fallback to demo products if backend fails
        const demoProducts = [
          {
            id: 'gift-1',
            category_id: 'cat-1',
            name: 'Luxury Gift Box',
            description: 'Beautiful handcrafted gift box perfect for special occasions',
            price_cents: 2999,
            currency: 'INR',
            image_urls: ['https://images.unsplash.com/photo-1700142678566-601b048b39db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc1NzgwOTM4MHww&ixlib=rb-4.1.0&q=80&w=1080'],
            vendor: 'LuxeGifts',
            rating: 4.8,
            review_count: 124,
            is_active: true,
            category: { name: 'Luxury', icon_url: '' }
          },
          {
            id: 'gift-2',
            category_id: 'cat-2',
            name: 'Romantic Jewelry Set',
            description: 'Elegant necklace and earring set for your special someone',
            price_cents: 4999,
            currency: 'INR',
            image_urls: ['https://images.unsplash.com/photo-1707466982048-f06e0ced30cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwcm9tYW50aWMlMjBnaWZ0fGVufDF8fHx8MTc1NzgwOTM4NHww&ixlib=rb-4.1.0&q=80&w=1080'],
            vendor: 'JewelCraft',
            rating: 4.9,
            review_count: 89,
            is_active: true,
            category: { name: 'Jewelry', icon_url: '' }
          },
          {
            id: 'gift-3',
            category_id: 'cat-3',
            name: 'Pink Rose Bouquet',
            description: 'Fresh pink roses arranged in a beautiful bouquet',
            price_cents: 1599,
            currency: 'INR',
            image_urls: ['https://images.unsplash.com/photo-1707486142706-d2749b04459a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXJzJTIwYm91cXVldCUyMHBpbmt8ZW58MXx8fHwxNzU3ODA5Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080'],
            vendor: 'FlowerBoutique',
            rating: 4.7,
            review_count: 156,
            is_active: true,
            category: { name: 'Flowers', icon_url: '' }
          },
          {
            id: 'gift-4',
            category_id: 'cat-4',
            name: 'Valentine Chocolates',
            description: 'Premium assorted chocolates in heart-shaped box',
            price_cents: 899,
            currency: 'INR',
            image_urls: ['https://images.unsplash.com/photo-1656821991451-cc43cb996235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGVzJTIwdmFsZW50aW5lJTIwZ2lmdHxlbnwxfHx8fDE3NTc4MDkzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
            vendor: 'SweetDelights',
            rating: 4.6,
            review_count: 203,
            is_active: true,
            category: { name: 'Sweets', icon_url: '' }
          },
          {
            id: 'gift-5',
            category_id: 'cat-5',
            name: 'Luxury Perfume',
            description: 'Exquisite fragrance in an elegant crystal bottle',
            price_cents: 7999,
            currency: 'INR',
            image_urls: ['https://images.unsplash.com/photo-1757313192889-6d25a0e30f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwbHV4dXJ5JTIwYm90dGxlfGVufDF8fHx8MTc1NzgwOTM5OHww&ixlib=rb-4.1.0&q=80&w=1080'],
            vendor: 'FragranceHouse',
            rating: 4.8,
            review_count: 97,
            is_active: true,
            category: { name: 'Fragrance', icon_url: '' }
          }
        ];
        setProducts(demoProducts);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      // Use demo products as fallback
      const demoProducts = [
        {
          id: 'gift-1',
          category_id: 'cat-1',
          name: 'Luxury Gift Box',
          description: 'Beautiful handcrafted gift box perfect for special occasions',
          price_cents: 2999,
          currency: 'INR',
          image_urls: ['https://images.unsplash.com/photo-1700142678566-601b048b39db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBnaWZ0JTIwYm94fGVufDF8fHx8MTc1NzgwOTM4MHww&ixlib=rb-4.1.0&q=80&w=1080'],
          vendor: 'LuxeGifts',
          rating: 4.8,
          review_count: 124,
          is_active: true,
          category: { name: 'Luxury', icon_url: '' }
        },
        {
          id: 'gift-2',
          category_id: 'cat-2',
          name: 'Romantic Jewelry Set',
          description: 'Elegant necklace and earring set for your special someone',
          price_cents: 4999,
          currency: 'INR',
          image_urls: ['https://images.unsplash.com/photo-1707466982048-f06e0ced30cc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxqZXdlbHJ5JTIwcm9tYW50aWMlMjBnaWZ0fGVufDF8fHx8MTc1NzgwOTM4NHww&ixlib=rb-4.1.0&q=80&w=1080'],
          vendor: 'JewelCraft',
          rating: 4.9,
          review_count: 89,
          is_active: true,
          category: { name: 'Jewelry', icon_url: '' }
        },
        {
          id: 'gift-3',
          category_id: 'cat-3',
          name: 'Pink Rose Bouquet',
          description: 'Fresh pink roses arranged in a beautiful bouquet',
          price_cents: 1599,
          currency: 'INR',
          image_urls: ['https://images.unsplash.com/photo-1707486142706-d2749b04459a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmbG93ZXJzJTIwYm91cXVldCUyMHBpbmt8ZW58MXx8fHwxNzU3ODA5Mzg4fDA&ixlib=rb-4.1.0&q=80&w=1080'],
          vendor: 'FlowerBoutique',
          rating: 4.7,
          review_count: 156,
          is_active: true,
          category: { name: 'Flowers', icon_url: '' }
        },
        {
          id: 'gift-4',
          category_id: 'cat-4',
          name: 'Valentine Chocolates',
          description: 'Premium assorted chocolates in heart-shaped box',
          price_cents: 899,
          currency: 'INR',
          image_urls: ['https://images.unsplash.com/photo-1656821991451-cc43cb996235?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaG9jb2xhdGVzJTIwdmFsZW50aW5lJTIwZ2lmdHxlbnwxfHx8fDE3NTc4MDkzOTN8MA&ixlib=rb-4.1.0&q=80&w=1080'],
          vendor: 'SweetDelights',
          rating: 4.6,
          review_count: 203,
          is_active: true,
          category: { name: 'Sweets', icon_url: '' }
        },
        {
          id: 'gift-5',
          category_id: 'cat-5',
          name: 'Luxury Perfume',
          description: 'Exquisite fragrance in an elegant crystal bottle',
          price_cents: 7999,
          currency: 'INR',
          image_urls: ['https://images.unsplash.com/photo-1757313192889-6d25a0e30f6a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwZXJmdW1lJTIwbHV4dXJ5JTIwYm90dGxlfGVufDF8fHx8MTc1NzgwOTM5OHww&ixlib=rb-4.1.0&q=80&w=1080'],
          vendor: 'FragranceHouse',
          rating: 4.8,
          review_count: 97,
          is_active: true,
          category: { name: 'Fragrance', icon_url: '' }
        }
      ];
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category_id === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        categories.find(cat => cat.id === p.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort products
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price_cents - b.price_cents);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price_cents - a.price_cents);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        filtered.sort((a, b) => b.review_count - a.review_count);
        break;
    }

    setFilteredProducts(filtered);
  };

  const formatPrice = (cents: number) => {
    return `₹${(cents / 100).toLocaleString('en-IN')}`;
  };

  const addToCart = (productId: string, quantity: number = 1) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + quantity
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const newCart = { ...prev };
      if (newCart[productId] > 1) {
        newCart[productId]--;
      } else {
        delete newCart[productId];
      }
      return newCart;
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = products.find(p => p.id === productId);
      return total + (product ? product.price_cents * quantity : 0);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, quantity) => sum + quantity, 0);
  };

  const handlePurchase = async (product: Product) => {
    if (!partner) {
      alert('You need a partner to send gifts!');
      return;
    }

    if (!user) {
      alert('User information not available. Please refresh and try again.');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-46bfb162/gifts/purchase`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            personalMessage: `A special gift from ${user.name || user.username || 'Someone special'} with love 💕`,
            deliveryAddress: 'Default address',
            surpriseDelivery: true,
          }),
        }
      );

      if (response.ok) {
        alert(`Gift "${product.name}" sent to ${partner.name || partner.username || 'your partner'}! 🎁`);
        // Remove from cart after purchase
        setCart(prev => {
          const newCart = { ...prev };
          delete newCart[product.id];
          return newCart;
        });
      } else {
        const errorData = await response.json();
        alert(`Failed to send gift: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error purchasing gift:', error);
      alert('Error sending gift. Please try again.');
    }
  };

  const renderCategories = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-medium text-gray-800">Gift Categories</h2>
          <p className="text-sm text-gray-600">Find the perfect gift for every occasion</p>
        </div>
        <Button
          onClick={() => setView('products')}
          variant="outline"
          className="border-pink-200 text-pink-600 hover:bg-pink-50"
        >
          View All
        </Button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search gifts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-white border-pink-200 focus:border-pink-300"
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className="p-4 hover:shadow-md transition-shadow cursor-pointer border-pink-100 hover:border-pink-200"
            onClick={() => {
              setSelectedCategory(category.id);
              setView('products');
            }}
          >
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Gift className="w-6 h-6 text-pink-500" />
              </div>
              <h3 className="font-medium text-gray-800 text-sm mb-1">{category.name}</h3>
              <p className="text-xs text-gray-500">{category.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <Card className="p-4 bg-gradient-to-r from-pink-100 to-purple-100 border-pink-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-gray-800">Popular This Week</h3>
            <p className="text-sm text-gray-600">Trending gifts loved by couples</p>
          </div>
          <Button
            size="sm"
            className="bg-pink-500 hover:bg-pink-600"
            onClick={() => {
              setSortBy('popular');
              setView('products');
            }}
          >
            Explore
          </Button>
        </div>
      </Card>

      {/* Solo Mode Notice */}
      {!partner && (
        <Card className="p-4 bg-yellow-50 border-yellow-200">
          <div className="text-center">
            <Users className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h3 className="font-medium text-gray-800 mb-2">Browse & Wishlist</h3>
            <p className="text-sm text-gray-600 mb-3">
              Explore gifts and add them to your wishlist. Connect with your partner to send gifts!
            </p>
            <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700 hover:bg-yellow-100">
              Connect Partner
            </Button>
          </div>
        </Card>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <h2 className="text-xl font-medium text-gray-800">Gift Store</h2>
          <p className="text-sm text-gray-600">{filteredProducts.length} gifts available</p>
        </div>
        
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search gifts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-pink-200 focus:border-pink-300 text-sm"
          />
        </div>
        
        <Button
          onClick={() => setView('cart')}
          variant="outline"
          size="sm"
          className="relative"
        >
          <ShoppingCart className="w-4 h-4" />
          {getCartItemCount() > 0 && (
            <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
              {getCartItemCount()}
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Filters - Horizontal Scroll */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        <Button
          size="sm"
          variant={selectedCategory === '' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('')}
          className="whitespace-nowrap flex-shrink-0 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white data-[state=selected]:from-pink-600 data-[state=selected]:to-purple-600"
        >
          <Gift className="w-4 h-4 mr-1" />
          All Gifts
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            size="sm"
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            className={`whitespace-nowrap flex-shrink-0 ${
              selectedCategory === category.id 
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white' 
                : 'border-pink-200 text-pink-600 hover:bg-pink-50'
            }`}
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-200 rounded-md px-2 py-1 bg-white"
          >
            <option value="popular">Most Popular</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
        
        {/* Solo Mode Notice */}
        {!partner && (
          <Badge variant="outline" className="text-yellow-600 border-yellow-300 bg-yellow-50">
            <Users className="w-3 h-3 mr-1" />
            Browse Mode
          </Badge>
        )}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className="p-3 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              setSelectedProduct(product);
              setView('product-detail');
            }}
          >
            <div className="relative">
              <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                <img
                  src={product.image_urls[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product.id);
                }}
                className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                  wishlist.includes(product.id)
                    ? 'bg-red-500 text-white'
                    : 'bg-white/80 text-gray-600'
                } backdrop-blur-sm`}
              >
                <Heart className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-gray-800 text-sm line-clamp-2">{product.name}</h3>
              
              <div className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-gray-600">{product.rating}</span>
                <span className="text-xs text-gray-400">({product.review_count})</span>
              </div>
              
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium text-gray-800">{formatPrice(product.price_cents)}</p>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    addToCart(product.id);
                  }}
                  className="bg-pink-500 hover:bg-pink-600 text-xs"
                >
                  Add
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600">No products found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );

  const renderProductDetail = () => {
    if (!selectedProduct) return null;

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setView('products')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-medium text-gray-800 flex-1">Product Details</h2>
          <Button
            onClick={() => toggleWishlist(selectedProduct.id)}
            variant="ghost"
            size="sm"
            className={wishlist.includes(selectedProduct.id) ? 'text-red-500' : 'text-gray-500'}
          >
            <Heart className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500"
          >
            <Share className="w-4 h-4" />
          </Button>
        </div>

        {/* Product Image */}
        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
          <img
            src={selectedProduct.image_urls[0]}
            alt={selectedProduct.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-medium text-gray-800 mb-2">{selectedProduct.name}</h1>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{selectedProduct.rating}</span>
                <span className="text-sm text-gray-500">({selectedProduct.review_count} reviews)</span>
              </div>
              <Badge variant="secondary">{categories.find(cat => cat.id === selectedProduct.category_id)?.name || 'Gift'}</Badge>
            </div>
            <p className="text-gray-600 text-sm">{selectedProduct.description}</p>
          </div>

          {/* Price */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl font-medium text-gray-800">{formatPrice(selectedProduct.price_cents)}</span>
              <span className="text-sm text-gray-500">Free shipping</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                <span>2-3 days delivery</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4" />
                <span>Secure payment</span>
              </div>
            </div>
          </div>

          {/* Quantity & Add to Cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Quantity:</span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => removeFromCart(selectedProduct.id)}
                  disabled={!cart[selectedProduct.id]}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="w-8 text-center text-sm">{cart[selectedProduct.id] || 0}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addToCart(selectedProduct.id)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => addToCart(selectedProduct.id)}
                variant="outline"
                className="border-pink-200 text-pink-600 hover:bg-pink-50"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
              <Button
                onClick={() => handlePurchase(selectedProduct)}
                disabled={!partner}
                className="bg-pink-500 hover:bg-pink-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                {partner ? 'Send Gift' : 'Need Partner'}
              </Button>
            </div>
          </div>

          {/* Vendor Info */}
          <div className="border-t pt-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{selectedProduct.vendor}</p>
                <p className="text-xs text-gray-500">Trusted seller</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCart = () => {
    const cartItems = Object.entries(cart).map(([productId, quantity]) => ({
      product: products.find(p => p.id === productId)!,
      quantity
    })).filter(item => item.product);

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setView('products')}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-lg font-medium text-gray-800 flex-1">Shopping Cart</h2>
          <span className="text-sm text-gray-600">{getCartItemCount()} items</span>
        </div>

        {/* Cart Items */}
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">Your cart is empty</p>
            <Button
              onClick={() => setView('products')}
              className="mt-4 bg-pink-500 hover:bg-pink-600"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {cartItems.map(({ product, quantity }) => (
                <Card key={product.id} className="p-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={product.image_urls[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800 text-sm mb-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{formatPrice(product.price_cents)}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(product.id)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm">{quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => addToCart(product.id)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-800">{formatPrice(product.price_cents * quantity)}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Cart Summary */}
            <Card className="p-4 bg-gray-50">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="text-gray-800">{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping:</span>
                  <span className="text-green-600">Free</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-800">Total:</span>
                    <span className="text-gray-800">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Checkout Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => {
                  if (partner) {
                    cartItems.forEach(({ product }) => handlePurchase(product));
                  } else {
                    alert('You need a partner to send gifts!');
                  }
                }}
                disabled={!partner}
                className="w-full bg-pink-500 hover:bg-pink-600"
              >
                <Gift className="w-4 h-4 mr-2" />
                {partner ? `Send All Gifts to ${partner.name || partner.username || 'your partner'}` : 'Connect Partner to Send Gifts'}
              </Button>
              
              {!partner && (
                <p className="text-center text-sm text-gray-500">
                  Connect with your partner to send these beautiful gifts!
                </p>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
        <div className="text-center">
          <Gift className="w-8 h-8 text-pink-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading gift store...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="p-4">
        {view === 'categories' && renderCategories()}
        {view === 'products' && renderProducts()}
        {view === 'product-detail' && renderProductDetail()}
        {view === 'cart' && renderCart()}
      </div>
    </div>
  );
}