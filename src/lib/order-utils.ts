export type InvoiceOrder = {
  id?: string;
  created_at?: string;
  customer?: any;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  customer_address?: string;
  items?: any[];
  subtotal?: number;
  shipping_fee?: number;
  shipping?: number;
  discount?: number;
  total?: number;
  payment_method?: string;
  payment_status?: string;
  order_status?: string;
  status?: string;
  tracking_code?: string;
  tracking_number?: string;
};

export function money(value: unknown) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
}

export function getCustomerName(order: InvoiceOrder) {
  return order.customer_name || [order.customer?.first_name, order.customer?.last_name].filter(Boolean).join(' ') || order.customer?.name || 'Customer';
}

export function getCustomerEmail(order: InvoiceOrder) {
  return order.customer_email || order.customer?.email || '';
}

export function getCustomerPhone(order: InvoiceOrder) {
  return order.customer_phone || order.customer?.phone || '';
}

export function getCustomerAddress(order: InvoiceOrder) {
  if (order.customer_address) return order.customer_address;
  const c = order.customer || {};
  const parts = [c.address, c.street, c.city, c.province, c.region, c.zip, c.postal_code].filter(Boolean);
  return parts.length ? parts.join(', ') : 'No address saved';
}

export function orderSubtotal(order: InvoiceOrder) {
  if (typeof order.subtotal === 'number') return order.subtotal;
  return (Array.isArray(order.items) ? order.items : []).reduce((sum, item) => {
    const qty = Number(item.quantity || item.qty || 1);
    const price = Number(item.unit_price || item.price || item.line_total || item.total || 0);
    return sum + price * qty;
  }, 0);
}

export function orderShipping(order: InvoiceOrder) {
  return Number(order.shipping_fee || order.shipping || 0);
}

export function orderDiscount(order: InvoiceOrder) {
  return Number(order.discount || 0);
}

export function orderTotal(order: InvoiceOrder) {
  return Number(order.total || Math.max(0, orderSubtotal(order) + orderShipping(order) - orderDiscount(order)));
}

export function invoiceNumber(order: InvoiceOrder) {
  const source = order.tracking_code || order.id || String(Date.now());
  return `EXO-${source.slice(0, 10).toUpperCase()}`;
}

export function notificationTemplates(order: InvoiceOrder) {
  const name = getCustomerName(order);
  const code = order.tracking_code || order.id || '';
  const tracking = order.tracking_number ? ` Tracking number: ${order.tracking_number}.` : '';
  const total = money(orderTotal(order));
  return {
    orderPlaced: `Hi ${name}! Your Exousia & Co. order has been received. Order code: ${code}. Total: ${total}. We will verify your payment and update you soon. Thank you!`,
    paymentApproved: `Hi ${name}! Your payment for Exousia & Co. order ${code} has been approved. We are now preparing your perfume order. Thank you!`,
    shipped: `Hi ${name}! Your Exousia & Co. order ${code} has been shipped.${tracking} Thank you for shopping with us!`,
    delivered: `Hi ${name}! Your Exousia & Co. order ${code} has been delivered. We hope you enjoy your fragrance. You may leave a review on our website. Thank you!`,
  };
}
