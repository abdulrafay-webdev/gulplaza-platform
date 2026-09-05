from sqlmodel import Session, select
from typing import List, Optional
from src.models.order import Order, OrderItem, OrderStatus
from src.models.product import Product
import logging

logger = logging.getLogger(__name__)

def process_checkout(session: Session, customer_identity: Optional[str], items: List[dict], guest_info: dict = None):
    """
    Process checkout for multiple items.
    Splits into multiple orders by Shop.
    """
    try:
        # 1. Fetch all products
        product_ids = [item['product_id'] for item in items]
        if not product_ids:
            raise ValueError("Cart is empty")
            
        logger.info(f"Processing checkout for products: {product_ids}")
        
        products_list = session.exec(select(Product).where(Product.id.in_(product_ids), Product.is_deleted == False)).all()
        product_map = {p.id: p for p in products_list}
        
        # 2. Group by Shop and Validate Stock
        shop_orders = {} # shop_id -> {total, items: []}
        
        for item in items:
            pid = item['product_id']
            qty = item['quantity']
            product = product_map.get(pid)
            
            if not product:
                raise ValueError(f"Product {pid} not found in database")
            if product.stock_quantity < qty:
                raise ValueError(f"Product '{product.name}' is out of stock")
                
            shop_id = product.shop_id
            if shop_id not in shop_orders:
                shop_orders[shop_id] = {"total": 0.0, "items": []}
                
            # If variant price is provided, use that; otherwise fallback to product.price
            v_price = float(item.get("price")) if item.get("price") is not None and float(item.get("price")) > 0 else float(product.price)
            v_name = item.get("variant_name")
            v_id = item.get("variant_id")

            shop_orders[shop_id]["total"] += v_price * qty
            shop_orders[shop_id]["items"].append({
                "product_id": pid,
                "quantity": qty,
                "price": v_price,
                "variant_name": v_name,
                "variant_id": v_id
            })
            
            # Deduct stock
            product.stock_quantity -= qty
            session.add(product)

        # 3. Create Orders
        created_orders = []
        
        # Determine customer links
        c_clerk_id = None
        c_neon_id = None
        
        if customer_identity:
            if str(customer_identity).isdigit():
                c_neon_id = int(customer_identity)
            else:
                c_clerk_id = customer_identity

        # Extract guest info if available
        g_name = guest_info.get("name") if guest_info else None
        g_email = guest_info.get("email") if guest_info else None
        g_phone = guest_info.get("phone") if guest_info else None
        g_address = guest_info.get("address") if guest_info else None

        for shop_id, data in shop_orders.items():
            order = Order(
                shop_id=shop_id,
                customer_clerk_id=c_clerk_id,
                customer_id=c_neon_id,
                guest_name=g_name.strip() if g_name else None,
                guest_email=g_email.strip() if g_email else None,
                guest_phone=g_phone.strip() if g_phone else None,
                guest_address=g_address.strip() if g_address else None,
                total_amount=float(data["total"]),
                status=OrderStatus.PENDING.value if hasattr(OrderStatus.PENDING, "value") else "pending"
            )
            session.add(order)
            session.flush() # Get ID for order items
            
            for i in data["items"]:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=i["product_id"],
                    variant_name=i.get("variant_name"),
                    variant_id=i.get("variant_id"),
                    quantity=int(i["quantity"]),
                    price_at_purchase=float(i["price"])
                )
                session.add(order_item)
                
            created_orders.append(order)
            
        session.commit()
        logger.info(f"Successfully created {len(created_orders)} orders")
        return created_orders
        
    except Exception as e:
        session.rollback()
        logger.error(f"Checkout service failed: {str(e)}", exc_info=True)
        raise e
