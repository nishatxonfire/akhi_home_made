export interface Review {
  id: number;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface FoodItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  reviews: Review[];
}

export interface CartItem extends FoodItem {
  cartQuantity: number;
}

export interface Order {
  id: string;
  customer_name: string;
  address: string;
  phone: string;
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  date: string;
}
