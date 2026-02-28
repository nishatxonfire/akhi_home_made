import { useState, useEffect, FormEvent } from 'react';
import { 
  Menu as MenuIcon, 
  X, 
  ShoppingBag, 
  Phone, 
  Facebook, 
  Instagram, 
  MapPin, 
  User, 
  Hash,
  ArrowRight,
  CheckCircle2,
  Home,
  UtensilsCrossed,
  Search,
  Star,
  MessageSquare,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  doc,
  setDoc
} from 'firebase/firestore';

// Types
interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

interface FoodItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  reviews: Review[];
}

interface CartItem extends FoodItem {
  cartQuantity: number;
}

const WHATSAPP_NUMBER = "8801761757330"; // Updated number

export default function App() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const filteredFood = foods.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "foods"), (snapshot) => {
      const foodsData = snapshot.docs.map(doc => ({
        id: doc.data().id,
        ...doc.data()
      })) as FoodItem[];
      
      // If database is empty, seed it with initial data
      if (foodsData.length === 0) {
        seedDatabase();
      } else {
        setFoods(foodsData);
      }
    });

    return () => unsubscribe();
  }, []);

  const seedDatabase = async () => {
    const initialFoods = [
      {
        id: 1,
        name: "Chicken Biryani",
        price: 250,
        description: "সুগন্ধি বাসমতি চাল ও দেশি মুরগির মাংসের পারফেক্ট কম্বিনেশন।",
        image: "https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800&auto=format&fit=crop",
        category: "Main Course",
        reviews: []
      },
      {
        id: 2,
        name: "Beef Tehari",
        price: 220,
        description: "সরিষার তেলের খাঁটি স্বাদ ও নরম গরুর মাংসের তেহারি।",
        image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=800&auto=format&fit=crop",
        category: "Main Course",
        reviews: []
      },
      {
        id: 3,
        name: "Homemade Cake",
        price: 450,
        description: "পুরোপুরি স্বাস্থ্যকর উপায়ে তৈরি ভ্যানিলা স্পঞ্জ কেক।",
        image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=800&auto=format&fit=crop",
        category: "Dessert",
        reviews: []
      },
      {
        id: 4,
        name: "Fried Rice",
        price: 180,
        description: "সবজি ও ডিম দিয়ে তৈরি চাইনিজ স্টাইল ফ্রাইড রাইস।",
        image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=800&auto=format&fit=crop",
        category: "Main Course",
        reviews: []
      },
      {
        id: 5,
        name: "Chicken Roast",
        price: 150,
        description: "বিয়ে বাড়ির স্বাদে তৈরি স্পেশাল চিকেন রোস্ট।",
        image: "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?q=80&w=800&auto=format&fit=crop",
        category: "Side Dish",
        reviews: []
      },
      {
        id: 6,
        name: "Kacchi Biryani",
        price: 350,
        description: "খাসির মাংস ও আলু দিয়ে তৈরি ঐতিহ্যবাহী কাচ্চি বিরিয়ানি।",
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=800&auto=format&fit=crop",
        category: "Main Course",
        reviews: []
      },
      {
        id: 7,
        name: "Morog Polao",
        price: 280,
        description: "দেশি মুরগি ও সুগন্ধি চালের স্পেশাল মোরগ পোলাও।",
        image: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?q=80&w=800&auto=format&fit=crop",
        category: "Main Course",
        reviews: []
      },
      {
        id: 8,
        name: "Shami Kabab",
        price: 60,
        description: "গরুর মাংস ও ডাল দিয়ে তৈরি সুস্বাদু শামি কাবাব (প্রতি পিস)।",
        image: "https://images.unsplash.com/photo-1606491956689-2ea8c5119c85?q=80&w=800&auto=format&fit=crop",
        category: "Side Dish",
        reviews: []
      }
    ];

    for (const food of initialFoods) {
      await setDoc(doc(db, "foods", food.id.toString()), food);
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (food: FoodItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === food.id);
      if (existingItem) {
        return prevCart.map(item => 
          item.id === food.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prevCart, { ...food, cartQuantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prevCart => prevCart.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.cartQuantity + delta);
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);

  const handleOrderClick = (food: FoodItem | null = null) => {
    setSelectedFood(food);
    setIsOrderModalOpen(true);
    setIsDetailModalOpen(false);
  };

  const handleDetailClick = (food: FoodItem) => {
    setSelectedFood(food);
    setIsDetailModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsOrderModalOpen(false);
    setSelectedFood(null);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFood(null);
  };

  const handleReviewSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFood) return;

    const formData = new FormData(e.currentTarget);
    const user_name = formData.get('userName') as string;
    const rating = parseInt(formData.get('rating') as string);
    const comment = formData.get('comment') as string;

    const newReview: Review = {
      id: Date.now(),
      user_name,
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    try {
      const foodRef = doc(db, "foods", selectedFood.id.toString());
      const updatedReviews = [newReview, ...selectedFood.reviews];
      
      await setDoc(foodRef, { reviews: updatedReviews }, { merge: true });

      // Update local state is handled by onSnapshot
      setSelectedFood({ ...selectedFood, reviews: updatedReviews });
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error submitting review to Firestore:", error);
    }
  };

  const calculateAverageRating = (reviews: Review[]) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const handleFormSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name');
    const address = formData.get('address');
    const phone = formData.get('phone');
    const foodName = formData.get('foodName');
    const quantity = formData.get('quantity');

    const message = `Name: ${name}\nAddress: ${address}\nPhone: ${phone}\nFood: ${foodName}\nQuantity: ${quantity}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    closeOrderModal();
    setShowToast(true);
  };

  return (
    <div className="min-h-screen font-sans pb-20 md:pb-0">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'}`}>
        <div className="container mx-auto px-4 md:px-6 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
              <ShoppingBag size={20} />
            </div>
            <span className={`text-xl font-bold tracking-tight ${scrolled ? 'text-stone-900' : 'text-white md:text-stone-900'} font-bengali`}>
              আঁখি হোম <span className="text-orange-500">মেইড</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            {['Home', 'Menu', 'Order', 'Contact'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className={`text-sm font-medium hover:text-orange-500 transition-colors ${scrolled ? 'text-stone-600' : 'text-stone-800'}`}
              >
                {item}
              </a>
            ))}
            
            {/* Cart Icon */}
            <div className="relative">
              <button 
                onClick={() => setIsCartOpen(!isCartOpen)}
                className={`p-2 rounded-full transition-all relative ${scrolled ? 'text-stone-800 hover:bg-stone-100' : 'text-stone-800 hover:bg-white/20'}`}
              >
                <ShoppingBag size={22} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            <button 
              onClick={() => handleOrderClick()}
              className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-md hover:shadow-lg"
            >
              Order Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-2 rounded-lg ${scrolled ? 'text-stone-900' : 'text-white md:text-stone-900'}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-full left-0 right-0 bg-white shadow-xl border-t border-stone-100 p-6 flex flex-col gap-4 md:hidden"
            >
              {['Home', 'Menu', 'Order', 'Contact'].map((item) => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="text-lg font-medium text-stone-800 hover:text-orange-500"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <button 
                onClick={() => {
                  handleOrderClick();
                  setIsMenuOpen(false);
                }}
                className="bg-orange-500 text-white py-3 rounded-xl font-bold mt-2"
              >
                Order Now
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white/80 backdrop-blur-lg border-t border-stone-100 px-6 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center max-w-md mx-auto">
          <a href="#home" className="flex flex-col items-center gap-1 text-stone-400 hover:text-orange-500 transition-colors">
            <Home size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
          </a>
          <a href="#menu" className="flex flex-col items-center gap-1 text-stone-400 hover:text-orange-500 transition-colors">
            <UtensilsCrossed size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Menu</span>
          </a>
          <div className="relative">
            <button 
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="flex flex-col items-center gap-1 -mt-8 bg-orange-500 text-white p-4 rounded-full shadow-lg shadow-orange-500/40 active:scale-95 transition-all relative"
            >
              <ShoppingBag size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-white text-orange-500 text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-orange-500">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
          <a href="#contact" className="flex flex-col items-center gap-1 text-stone-400 hover:text-orange-500 transition-colors">
            <Phone size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Contact</span>
          </a>
          <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="flex flex-col items-center gap-1 text-stone-400 hover:text-orange-500 transition-colors">
            <Facebook size={20} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Social</span>
          </a>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-white"
          >
            <span className="inline-block bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4">
              খাঁটি ও স্বাস্থ্যকর
            </span>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 font-bengali">
              সুস্বাদু ঘরে তৈরি <br />
              <span className="text-orange-400">খাবার</span>
            </h1>
            <p className="text-lg md:text-xl text-stone-200 mb-8 max-w-lg">
              আমরা আপনার জন্য নিয়ে এসেছি মায়ের হাতের রান্নার সেই চিরচেনা স্বাদ। সম্পূর্ণ স্বাস্থ্যকর পরিবেশে তৈরি আমাদের প্রতিটি খাবার।
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => handleOrderClick()}
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-2 group shadow-xl"
              >
                Order Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              <a 
                href="#menu"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg transition-all"
              >
                View Menu
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-white border-b border-stone-100">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "স্বাস্থ্যকর", desc: "সেরা মানের উপকরণ ব্যবহার করা হয়", icon: <CheckCircle2 className="text-orange-500" /> },
              { title: "হোম ডেলিভারি", desc: "গরম গরম খাবার পৌঁছে যাবে আপনার ঠিকানায়", icon: <CheckCircle2 className="text-orange-500" /> },
              { title: "সাশ্রয়ী মূল্য", desc: "বাজেটের মধ্যেই সেরা স্বাদের নিশ্চয়তা", icon: <CheckCircle2 className="text-orange-500" /> }
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-stone-50 transition-colors">
                <div className="mt-1">{feature.icon}</div>
                <div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-stone-500 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-20 bg-stone-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-bengali">আমাদের স্পেশাল মেনু</h2>
            <div className="w-20 h-1 bg-orange-500 mx-auto mb-8"></div>
            
            {/* Search Bar */}
            <div className="relative max-w-md mx-auto mb-10">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-stone-400">
                <Search size={20} />
              </div>
              <input 
                type="text" 
                placeholder="খাবার খুঁজুন (যেমন: Biryani...)" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm"
              />
            </div>

            <p className="text-stone-600">
              প্রতিটি খাবার আমরা যত্ন সহকারে তৈরি করি যাতে আপনি পান সেরা স্বাদ ও পুষ্টি।
            </p>
          </div>

          {filteredFood.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredFood.map((food) => (
                <motion.div 
                  key={food.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => handleDetailClick(food)}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 group cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={food.image} 
                      alt={food.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-orange-600 shadow-sm">
                      ৳{food.price}
                    </div>
                    <div className="absolute top-4 left-4 bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      {food.category}
                    </div>
                    {food.reviews.length > 0 && (
                      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-800 flex items-center gap-1 shadow-sm">
                        <Star size={12} className="text-orange-500 fill-orange-500" />
                        {calculateAverageRating(food.reviews)} ({food.reviews.length})
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-orange-500 transition-colors">{food.name}</h3>
                    <p className="text-stone-500 text-sm mb-6 line-clamp-2">
                      {food.description}
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(food);
                        }}
                        className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        Add to Cart <Plus size={16} />
                      </button>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOrderClick(food);
                        }}
                        className="flex-1 bg-stone-900 hover:bg-orange-500 text-white py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                      >
                        Order Now <ShoppingBag size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-400">
                <Search size={40} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">দুঃখিত, কোনো খাবার পাওয়া যায়নি!</h3>
              <p className="text-stone-500">অন্য কোনো নাম দিয়ে চেষ্টা করুন।</p>
              <button 
                onClick={() => setSearchQuery("")}
                className="mt-6 text-orange-500 font-bold hover:underline"
              >
                সব খাবার দেখুন
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-stone-900 rounded-[3rem] p-8 md:p-16 text-white flex flex-col md:flex-row items-center gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
            
            <div className="flex-1 relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold mb-6 font-bengali">যোগাযোগ করুন</h2>
              <p className="text-stone-400 mb-8 text-lg">
                আপনার কোনো জিজ্ঞাসা থাকলে বা বড় কোনো অর্ডারের জন্য সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <Phone size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Call Us</p>
                    <p className="text-xl font-bold">+880 1761 757330</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                    <MapPin size={20} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500 uppercase font-bold tracking-wider">Location</p>
                    <p className="text-xl font-bold">আশুগঞ্জ, ব্রাহ্মণবাড়িয়া</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full relative z-10">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl mb-8">
                <h3 className="text-2xl font-bold mb-6">আমাদের লোকেশন</h3>
                <div className="w-full h-64 rounded-2xl overflow-hidden border border-white/10">
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14594.24836647185!2d90.9984631!3d24.0354153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3754096000000001%3A0x7080808080808080!2sAshuganj!5e0!3m2!1sen!2sbd!4v1709123456789!5m2!1sen!2sbd" 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                </div>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 p-8 rounded-3xl">
                <h3 className="text-2xl font-bold mb-6">Send a Message</h3>
                <form className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Your Name" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  />
                  <textarea 
                    placeholder="Your Message" 
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500 transition-colors"
                  ></textarea>
                  <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold transition-all">
                    Send Message
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-50 py-12 border-t border-stone-200">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white">
                <ShoppingBag size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-stone-900 font-bengali">
                আঁখি হোম <span className="text-orange-500">মেইড</span>
              </span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all">
                <Instagram size={20} />
              </a>
              <a href={`https://wa.me/${WHATSAPP_NUMBER}`} className="w-10 h-10 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-600 hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-all">
                <Phone size={20} />
              </a>
            </div>
          </div>
          
          <div className="text-center text-stone-500 text-sm">
            <p>&copy; {new Date().getFullYear()} Home Made Food. All rights reserved.</p>
            <p className="mt-2">Made with ❤️ for healthy food lovers.</p>
          </div>
        </div>
      </footer>

      {/* Order Modal */}
      <AnimatePresence>
        {isOrderModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeOrderModal}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
            >
              <div className="p-8 md:p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold font-bengali">অর্ডার ফর্ম</h2>
                  <button 
                    onClick={closeOrderModal}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-2">
                      <User size={14} /> Customer Name
                    </label>
                    <input 
                      required
                      name="name"
                      type="text" 
                      placeholder="আপনার নাম লিখুন" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-2">
                      <MapPin size={14} /> Address
                    </label>
                    <input 
                      required
                      name="address"
                      type="text" 
                      placeholder="আপনার ঠিকানা লিখুন" 
                      className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-2">
                        <Phone size={14} /> Phone Number
                      </label>
                      <input 
                        required
                        name="phone"
                        type="tel" 
                        placeholder="আপনার ফোন নাম্বার" 
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-2">
                        <Hash size={14} /> Quantity
                      </label>
                      <input 
                        required
                        name="quantity"
                        type="number" 
                        min="1"
                        defaultValue="1"
                        className="w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-stone-400 ml-1 flex items-center gap-2">
                      <ShoppingBag size={14} /> Food Name
                    </label>
                    <input 
                      required
                      name="foodName"
                      type="text" 
                      readOnly={!!selectedFood}
                      defaultValue={selectedFood?.name || ""}
                      placeholder="খাবারের নাম" 
                      className={`w-full bg-stone-50 border border-stone-200 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-orange-500 transition-all ${selectedFood ? 'opacity-70 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg mt-4 shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Confirm Order via WhatsApp
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Cart Modal / Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center md:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="bg-white w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col max-h-[85vh]"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold">আপনার ব্যাগ</h3>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                    <X size={24} />
                  </button>
                </div>

                {cart.length > 0 ? (
                  <>
                    <div className="space-y-6 overflow-y-auto mb-8 pr-2 max-h-[40vh]">
                      {cart.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          <img 
                            src={item.image} 
                            className="w-20 h-20 rounded-2xl object-cover cursor-pointer" 
                            onClick={() => {
                              handleDetailClick(item);
                              setIsCartOpen(false);
                            }}
                          />
                          <div className="flex-1">
                            <h4 className="font-bold mb-1 cursor-pointer hover:text-orange-500 transition-colors" onClick={() => {
                              handleDetailClick(item);
                              setIsCartOpen(false);
                            }}>
                              {item.name}
                            </h4>
                            <p className="text-sm text-stone-500 mb-3">৳{item.price} x {item.cartQuantity}</p>
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-4 bg-stone-100 px-3 py-1 rounded-lg">
                                <button 
                                  onClick={() => updateCartQuantity(item.id, -1)}
                                  className="text-stone-600 hover:text-orange-500 transition-colors"
                                >
                                  <Minus size={16} />
                                </button>
                                <span className="font-bold min-w-[20px] text-center">{item.cartQuantity}</span>
                                <button 
                                  onClick={() => updateCartQuantity(item.id, 1)}
                                  className="text-stone-600 hover:text-orange-500 transition-colors"
                                >
                                  <Plus size={16} />
                                </button>
                              </div>
                              <button 
                                onClick={() => removeFromCart(item.id)}
                                className="ml-auto text-stone-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-stone-100 pt-6">
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-stone-500 font-medium">মোট পরিমাণ</span>
                        <span className="text-2xl font-bold text-orange-500">৳{cartTotal}</span>
                      </div>
                      <button 
                        onClick={() => {
                          handleOrderClick();
                          setIsCartOpen(false);
                        }}
                        className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-all shadow-lg shadow-stone-900/20"
                      >
                        অর্ডার কনফার্ম করুন
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-200">
                      <ShoppingBag size={40} />
                    </div>
                    <p className="text-stone-500 font-medium">আপনার ব্যাগটি খালি!</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-6 text-orange-500 font-bold hover:underline"
                    >
                      মেনু থেকে খাবার যোগ করুন
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Food Detail Modal */}
      <AnimatePresence>
        {isDetailModalOpen && selectedFood && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeDetailModal}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 flex flex-col md:flex-row"
            >
              <div className="w-full md:w-1/2 h-64 md:h-auto relative">
                <img 
                  src={selectedFood.image} 
                  alt={selectedFood.name} 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={closeDetailModal}
                  className="absolute top-4 left-4 p-2 bg-white/90 backdrop-blur-sm rounded-full md:hidden"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="w-full md:w-1/2 p-8 md:p-10 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-orange-500 mb-2 block">{selectedFood.category}</span>
                    <h2 className="text-3xl font-bold font-bengali">{selectedFood.name}</h2>
                  </div>
                  <button 
                    onClick={closeDetailModal}
                    className="p-2 hover:bg-stone-100 rounded-full transition-colors hidden md:block"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-2xl font-bold text-stone-900">৳{selectedFood.price}</div>
                  {selectedFood.reviews.length > 0 && (
                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                      <Star size={18} className="fill-orange-500" />
                      {calculateAverageRating(selectedFood.reviews)}
                      <span className="text-stone-400 font-normal text-sm ml-1">({selectedFood.reviews.length} reviews)</span>
                    </div>
                  )}
                </div>
                
                <p className="text-stone-600 mb-8 leading-relaxed">
                  {selectedFood.description}
                </p>
                
                <div className="flex gap-4 mb-10">
                  <button 
                    onClick={() => addToCart(selectedFood)}
                    className="flex-1 bg-stone-100 hover:bg-stone-200 text-stone-800 py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2"
                  >
                    Add to Cart <Plus size={20} />
                  </button>
                  <button 
                    onClick={() => handleOrderClick(selectedFood)}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2"
                  >
                    Order Now <ShoppingBag size={20} />
                  </button>
                </div>
                
                <div className="border-t border-stone-100 pt-8">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MessageSquare size={20} className="text-orange-500" /> Reviews
                  </h3>
                  
                  {/* Review Form */}
                  <form onSubmit={handleReviewSubmit} className="bg-stone-50 p-6 rounded-2xl mb-8 space-y-4">
                    <h4 className="font-bold text-sm">Write a Review</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input 
                        required
                        name="userName"
                        placeholder="Your Name"
                        className="bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                      />
                      <select 
                        name="rating"
                        className="bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                      >
                        <option value="5">5 Stars</option>
                        <option value="4">4 Stars</option>
                        <option value="3">3 Stars</option>
                        <option value="2">2 Stars</option>
                        <option value="1">1 Star</option>
                      </select>
                    </div>
                    <textarea 
                      required
                      name="comment"
                      placeholder="Share your experience..."
                      rows={3}
                      className="w-full bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-orange-500"
                    ></textarea>
                    <button className="w-full bg-stone-900 text-white py-2 rounded-xl text-sm font-bold hover:bg-orange-500 transition-colors">
                      Submit Review
                    </button>
                  </form>
                  
                  {/* Review List */}
                  <div className="space-y-6">
                    {selectedFood.reviews.length > 0 ? (
                      selectedFood.reviews.map((review) => (
                        <div key={review.id} className="border-b border-stone-100 pb-6 last:border-0">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold">{review.user_name}</div>
                            <div className="text-xs text-stone-400">{review.date}</div>
                          </div>
                          <div className="flex gap-0.5 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                size={12} 
                                className={i < review.rating ? "text-orange-500 fill-orange-500" : "text-stone-200"} 
                              />
                            ))}
                          </div>
                          <p className="text-sm text-stone-600 italic">"{review.comment}"</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-stone-400 text-sm text-center py-4">No reviews yet. Be the first to review!</p>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 md:bottom-10 left-1/2 z-[110] bg-stone-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[320px] border border-white/10"
          >
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shrink-0">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p className="font-bold text-sm font-bengali">অর্ডার সফলভাবে পাঠানো হয়েছে!</p>
              <p className="text-xs text-stone-400">ধন্যবাদ, আমরা শীঘ্রই আপনার সাথে যোগাযোগ করবো।</p>
            </div>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
