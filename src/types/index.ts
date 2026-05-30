export interface CartItem {
  productId: string
  skuId: string
  name: string
  skuLabel: string
  price: number
  image: string
  quantity: number
  stock: number
}

export const CATEGORY_LABELS: Record<string, string> = {
  SEA_CUCUMBER: '海参',
  ABALONE: '鲍鱼',
  BUDDHA_FEAST: '佛跳墙',
  FISH_MAW: '花胶',
  DUMPLING: '水饺',
  CUSTOM: '定制'
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: '待付款',
  PAID: '已付款',
  SHIPPED: '已发货',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
}
