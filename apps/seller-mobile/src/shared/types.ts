export interface ProductImage {
  id: number;
  url: string;
  is_primary?: boolean;
}

export interface Shop {
  id: number;
  name: string;
  description?: string;
  logo_url?: string;
  cover_image_url?: string;
  is_approved: boolean;
  is_active: boolean;
  owner_clerk_id?: string;
  total_sales?: number;
  products_count?: number;
}

export interface ProductVariant {
  id?: number;
  product_id?: number;
  name: string;
  price: number;
  stock_quantity: number;
  is_active?: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  stock_quantity: number;
  short_description?: string;
  long_description?: string;
  image_url?: string;
  images?: ProductImage[];
  shop_id: number;
  shop?: Shop;
  shop_name?: string;
  main_category_id?: number;
  sub_category_id?: number;
  is_active: boolean;
  is_deleted?: boolean;
  has_variants?: boolean;
  min_price?: number;
  max_price?: number;
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  image_url?: string;
  subcategories?: SubCategory[];
}

export interface SubCategory {
  id: number;
  name: string;
  main_category_id: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selected_image?: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  price?: number;
  price_at_purchase?: number;
  total_price?: number;
  variant_name?: string;
  variant_id?: number;
  product?: {
    name?: string;
    image_url?: string;
  };
}

export interface Order {
  id: number;
  shop_id: number;
  shop_name?: string;
  customer_id?: number;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  guest_address?: string;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'completed' | 'cancelled';
  payment_method?: string;
  created_at: string;
  items?: OrderItem[];
}

export interface CustomerUser {
  id: number;
  full_name: string;
  email?: string;
  phone?: string;
  created_at?: string;
}

export interface SellerUser {
  id: string;
  role: string;
  shop_id?: number;
  email?: string;
  full_name?: string;
}

export interface AdminUser {
  id: string;
  role: string;
  email?: string;
}

export interface AIMessage {
  id: number;
  chat_id: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  message_type?: string;
  image_url?: string;
  product_ids_json?: string;
  products?: Product[];
  created_at: string;
}

export interface AIChat {
  id: number;
  title: string;
  user_identity: string;
  user_type: string;
  created_at: string;
  updated_at: string;
  messages_count?: number;
  last_message?: string;
  messages?: AIMessage[];
}

export interface PlatformAnalytics {
  overview: {
    total_revenue: number;
    total_orders: number;
    total_shops: number;
    approved_shops: number;
    pending_shops: number;
    active_shops: number;
    total_products: number;
    low_stock_products: number;
    out_of_stock_products: number;
    total_customers: number;
    total_reviews: number;
  };
  orders_breakdown: Record<string, number>;
  top_shops: Array<{
    id: number;
    name: string;
    logo_url?: string;
    is_approved: boolean;
    is_active: boolean;
    total_sales: number;
    products_count: number;
  }>;
  recent_orders: Array<{
    id: number;
    shop_id: number;
    shop_name: string;
    customer_name: string;
    customer_phone: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_count: number;
  }>;
  trending_ai_demands: Array<{
    id: number;
    query_text: string;
    category_hint: string;
    request_count: number;
    had_direct_match: boolean;
    last_requested_at: string;
  }>;
}

export interface SellerAnalytics {
  shop: {
    id: number;
    name: string;
    is_approved: boolean;
    is_active: boolean;
    logo_url?: string;
  };
  overview: {
    total_sales: number;
    total_orders: number;
    total_products: number;
    low_stock_count: number;
  };
  orders_breakdown: Record<string, number>;
  low_stock_products: Array<{
    id: number;
    name: string;
    stock_quantity: number;
    price: number;
    image_url?: string;
  }>;
  recent_orders: Array<{
    id: number;
    guest_name: string;
    guest_phone: string;
    guest_address: string;
    total_amount: number;
    status: string;
    created_at: string;
    items_count: number;
  }>;
  trending_ai_demands: Array<{
    id: number;
    query_text: string;
    category_hint: string;
    request_count: number;
    had_direct_match: boolean;
    last_requested_at: string;
  }>;
}
