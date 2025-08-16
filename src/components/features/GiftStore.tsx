import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingBag, Star, Filter, Search, ArrowLeft } from "lucide-react";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { Input } from "@/components/ui/input";

interface GiftItem {
  id: string;
  name: string;
  price: number;
  category: "flowers" | "chocolates" | "jewelry" | "experiences" | "personalized";
  rating: number;
  image: string;
  popular?: boolean;
  description: string;
}

interface GiftStoreProps {
  onBack: () => void;
}

export const GiftStore = ({ onBack }: GiftStoreProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const gifts: GiftItem[] = [
    {
      id: "1",
      name: "Red Rose Bouquet",
      price: 45,
      category: "flowers",
      rating: 4.9,
      image: "🌹",
      popular: true,
      description: "Beautiful dozen red roses with baby's breath"
    },
    {
      id: "2",
      name: "Artisan Chocolate Box",
      price: 35,
      category: "chocolates",
      rating: 4.8,
      image: "🍫",
      description: "Premium Belgian chocolates assortment"
    },
    {
      id: "3",
      name: "Heart Necklace",
      price: 120,
      category: "jewelry",
      rating: 4.7,
      image: "💎",
      description: "Sterling silver heart pendant necklace"
    },
    {
      id: "4",
      name: "Couples Spa Day",
      price: 200,
      category: "experiences",
      rating: 5.0,
      image: "🧘‍♀️",
      popular: true,
      description: "Relaxing spa experience for two"
    },
    {
      id: "5",
      name: "Custom Photo Album",
      price: 55,
      category: "personalized",
      rating: 4.9,
      image: "📸",
      description: "Personalized photo book with your memories"
    },
    {
      id: "6",
      name: "Sunset Dinner Cruise",
      price: 150,
      category: "experiences",
      rating: 4.8,
      image: "🌅",
      description: "Romantic dinner cruise at sunset"
    }
  ];

  const categories = [
    { value: "all", label: "All", icon: "💝" },
    { value: "flowers", label: "Flowers", icon: "🌸" },
    { value: "chocolates", label: "Chocolates", icon: "🍫" },
    { value: "jewelry", label: "Jewelry", icon: "💎" },
    { value: "experiences", label: "Experiences", icon: "✨" },
    { value: "personalized", label: "Personal", icon: "🎨" }
  ];

  const filteredGifts = gifts.filter(gift => {
    const matchesSearch = gift.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || gift.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBuyGift = (gift: GiftItem) => {
    // Simulate gift purchase
    console.log("Purchasing:", gift.name);
  };

  return (
    <MobileContainer>
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex items-center justify-between p-6 pt-12">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-gradient">Gift Store</h1>
          <Button variant="ghost" size="icon">
            <ShoppingBag className="w-5 h-5" />
          </Button>
        </div>

        {/* Search */}
        <div className="px-6 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for the perfect gift..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="px-6 mb-6">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map(category => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "romantic" : "soft"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="flex-shrink-0"
              >
                <span className="mr-1">{category.icon}</span>
                {category.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Special Banner */}
        <div className="px-6 mb-6">
          <Card className="romantic-gradient text-white border-0">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">💕 Surprise Sale</h3>
                  <p className="text-sm opacity-90">15% off all orders today!</p>
                </div>
                <Heart className="w-8 h-8 animate-heart-beat" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gift Grid */}
        <div className="flex-1 px-6 pb-20">
          <div className="grid grid-cols-2 gap-4">
            {filteredGifts.map(gift => (
              <Card key={gift.id} className="glass-effect border-white/20 hover:scale-105 transition-smooth">
                <CardHeader className="pb-2">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{gift.image}</div>
                    {gift.popular && (
                      <Badge variant="secondary" className="text-xs mb-2">
                        Popular
                      </Badge>
                    )}
                    <CardTitle className="text-sm font-semibold leading-tight">
                      {gift.name}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                    {gift.description}
                  </p>
                  
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-xs font-medium">{gift.rating}</span>
                    </div>
                    <span className="font-bold text-primary">${gift.price}</span>
                  </div>
                  
                  <Button
                    onClick={() => handleBuyGift(gift)}
                    variant="romantic"
                    size="sm"
                    className="w-full text-xs"
                  >
                    <Heart className="w-3 h-3 mr-1" />
                    Send Gift
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredGifts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                No gifts found
              </h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search or category filter
              </p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="fixed bottom-6 right-6 space-y-3">
          <Button variant="romantic" size="icon" className="w-12 h-12 rounded-full shadow-romantic">
            <Heart className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </MobileContainer>
  );
};