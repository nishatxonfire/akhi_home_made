import { useState, useEffect, FormEvent } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit, 
  ArrowLeft, 
  ShoppingBag, 
  Save, 
  X,
  Star,
  LayoutDashboard,
  Utensils,
  ClipboardList,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  AlertCircle,
  LogOut,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc,
  updateDoc 
} from 'firebase/firestore';
import { FoodItem, Order } from '../types';
import { Link } from 'react-router-dom';

type Tab = 'dashboard' | 'menu' | 'orders';

export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const foodsUnsubscribe = onSnapshot(collection(db, "foods"), (snapshot) => {
      const foodsData = snapshot.docs.map(doc => ({
        id: doc.data().id,
        ...doc.data()
      })) as FoodItem[];
      setFoods(foodsData);
    });

    const ordersUnsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        ...doc.data()
      })) as Order[];
      // Sort by date descending
      ordersData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setOrders(ordersData);
      setLoading(false);
    });

    return () => {
      foodsUnsubscribe();
      ordersUnsubscribe();
    };
  }, []);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { // Simple password
      setIsLoggedIn(true);
    } else {
      alert("Wrong password!");
    }
  };

  const handleAddOrEditFood = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;
    const price = parseInt(formData.get('price') as string);
    const description = formData.get('description') as string;
    const image = formData.get('image') as string;
    const category = formData.get('category') as string;

    const foodData: FoodItem = {
      id: editingFood ? editingFood.id : Date.now(),
      name,
      price,
      description,
      image,
      category,
      reviews: editingFood ? editingFood.reviews : []
    };

    try {
      await setDoc(doc(db, "foods", foodData.id.toString()), foodData);
      setIsAddModalOpen(false);
      setEditingFood(null);
      e.currentTarget.reset();
    } catch (error) {
      console.error("Error saving food:", error);
    }
  };

  const handleDeleteFood = async (id: number) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteDoc(doc(db, "foods", id.toString()));
      } catch (error) {
        console.error("Error deleting food:", error);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status });
    } catch (error) {
      console.error("Error updating order:", error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-stone-100"
        >
          <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-8 shadow-lg shadow-orange-500/20">
            <Lock size={32} />
          </div>
          <h2 className="text-3xl font-bold text-center mb-2">Admin Login</h2>
          <p className="text-stone-400 text-center mb-8">Enter password to access dashboard</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
            />
            <button className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-all shadow-xl shadow-stone-900/20">
              Login
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 font-sans flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-72 bg-white border-r border-stone-200 flex flex-col sticky top-0 h-auto md:h-screen z-40">
        <div className="p-8 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <ShoppingBag size={20} />
            </div>
            <h1 className="text-xl font-bold text-stone-900">Admin Panel</h1>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          {[
            { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: 'menu', icon: <Utensils size={20} />, label: 'Menu Items' },
            { id: 'orders', icon: <ClipboardList size={20} />, label: 'Orders' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as Tab)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${
                activeTab === item.id 
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20' 
                  : 'text-stone-400 hover:bg-stone-50 hover:text-stone-900'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-stone-100">
          <button 
            onClick={() => setIsLoggedIn(false)}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-stone-400 hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-bold text-stone-900 mb-2 capitalize">{activeTab}</h2>
            <p className="text-stone-400">Manage your business operations</p>
          </div>
          {activeTab === 'menu' && (
            <button 
              onClick={() => {
                setEditingFood(null);
                setIsAddModalOpen(true);
              }}
              className="bg-stone-900 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-stone-900/10"
            >
              <Plus size={20} /> Add New Food
            </button>
          )}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Total Revenue', value: `৳${orders.reduce((acc, o) => acc + o.total, 0)}`, icon: <TrendingUp className="text-green-500" />, bg: 'bg-green-50' },
                { label: 'Total Orders', value: orders.length, icon: <ClipboardList className="text-blue-500" />, bg: 'bg-blue-50' },
                { label: 'Menu Items', value: foods.length, icon: <Utensils className="text-orange-500" />, bg: 'bg-orange-50' },
                { label: 'Total Reviews', value: foods.reduce((acc, f) => acc + f.reviews.length, 0), icon: <Star className="text-yellow-500" />, bg: 'bg-yellow-50' }
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-sm">
                  <div className={`w-14 h-14 ${stat.bg} rounded-2xl flex items-center justify-center mb-6`}>
                    {stat.icon}
                  </div>
                  <p className="text-stone-400 font-bold text-sm uppercase tracking-wider mb-2">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-stone-900">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Recent Orders Preview */}
            <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-stone-50 flex justify-between items-center">
                <h3 className="text-2xl font-bold">Recent Orders</h3>
                <button onClick={() => setActiveTab('orders')} className="text-orange-500 font-bold hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-stone-50 text-stone-400 text-xs font-bold uppercase tracking-widest">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Total</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-6 font-bold text-stone-900">{order.id}</td>
                        <td className="px-8 py-6">
                          <div className="font-bold">{order.customer_name}</div>
                          <div className="text-xs text-stone-400">{order.phone}</div>
                        </td>
                        <td className="px-8 py-6 font-bold">৳{order.total}</td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            order.status === 'completed' ? 'bg-green-100 text-green-600' :
                            order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                            'bg-orange-100 text-orange-600'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {foods.map((food) => (
              <div key={food.id} className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden group">
                <div className="h-56 relative overflow-hidden">
                  <img src={food.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => { setEditingFood(food); setIsAddModalOpen(true); }} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-stone-900 hover:bg-orange-500 hover:text-white transition-all shadow-lg">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDeleteFood(food.id)} className="p-3 bg-white/90 backdrop-blur-md rounded-xl text-stone-900 hover:bg-red-500 hover:text-white transition-all shadow-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-500 mb-1 block">{food.category}</span>
                      <h3 className="text-xl font-bold">{food.name}</h3>
                    </div>
                    <div className="text-xl font-bold text-stone-900">৳{food.price}</div>
                  </div>
                  <p className="text-stone-400 text-sm line-clamp-2 mb-6">{food.description}</p>
                  <div className="flex items-center gap-2 text-orange-500 font-bold text-sm">
                    <Star size={16} className="fill-orange-500" />
                    {food.reviews.length > 0 
                      ? (food.reviews.reduce((acc, r) => acc + r.rating, 0) / food.reviews.length).toFixed(1)
                      : "0.0"}
                    <span className="text-stone-300 font-normal ml-1">({food.reviews.length} reviews)</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-stone-50 text-stone-400 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Order Details</th>
                    <th className="px-8 py-4">Items</th>
                    <th className="px-8 py-4">Total</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-8 py-8">
                        <div className="font-bold text-stone-900 mb-1">{order.id}</div>
                        <div className="text-sm font-bold">{order.customer_name}</div>
                        <div className="text-xs text-stone-400">{order.phone}</div>
                        <div className="text-xs text-stone-400 mt-1 flex items-center gap-1">
                          <Clock size={12} /> {new Date(order.date).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="space-y-1">
                          {order.items.map((item, i) => (
                            <div key={i} className="text-sm text-stone-600">
                              <span className="font-bold">{item.quantity}x</span> {item.name}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-8 py-8 font-bold text-stone-900">৳{order.total}</td>
                      <td className="px-8 py-8">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'completed' ? 'bg-green-100 text-green-600' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                          'bg-orange-100 text-orange-600'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'completed')}
                            className="p-3 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all"
                            title="Complete"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button 
                            onClick={() => updateOrderStatus(order.id, 'cancelled')}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all"
                            title="Cancel"
                          >
                            <AlertCircle size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Add/Edit Food Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddModalOpen(false); setEditingFood(null); }}
              className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
            ></motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-xl rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10 p-10"
            >
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-bold">{editingFood ? "Edit Food" : "New Food"}</h3>
                <button onClick={() => { setIsAddModalOpen(false); setEditingFood(null); }} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddOrEditFood} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Name</label>
                    <input name="name" required defaultValue={editingFood?.name || ""} className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Price</label>
                    <input name="price" type="number" required defaultValue={editingFood?.price || ""} className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Category</label>
                  <select name="category" required defaultValue={editingFood?.category || "Main Course"} className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none transition-all bg-white">
                    <option value="Main Course">Main Course</option>
                    <option value="Side Dish">Side Dish</option>
                    <option value="Dessert">Dessert</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Image URL</label>
                  <input name="image" required defaultValue={editingFood?.image || ""} className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Description</label>
                  <textarea name="description" required rows={3} defaultValue={editingFood?.description || ""} className="w-full px-6 py-4 rounded-2xl border border-stone-200 focus:border-orange-500 outline-none transition-all"></textarea>
                </div>
                <button type="submit" className="w-full bg-stone-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-orange-500 transition-all shadow-xl shadow-stone-900/20 flex items-center justify-center gap-2">
                  <Save size={20} /> {editingFood ? "Update Food" : "Save Food"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
