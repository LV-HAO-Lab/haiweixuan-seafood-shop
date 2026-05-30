import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(1, '请输入姓名').max(50),
  email: z.string().email('请输入有效邮箱'),
  password: z.string().min(6, '密码至少6位').max(100)
})

export const addressSchema = z.object({
  recipientName: z.string().min(1),
  phone: z.string().min(1),
  province: z.string().min(1),
  city: z.string().min(1),
  district: z.string().min(1),
  detail: z.string().min(1),
  isDefault: z.boolean().optional()
})

export const createOrderSchema = z.object({
  addressId: z.string().min(1),
  items: z.array(z.object({
    productId: z.string(),
    skuId: z.string(),
    quantity: z.number().int().min(1)
  })),
  notes: z.string().optional()
})

export const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['SEA_CUCUMBER','ABALONE','BUDDHA_FEAST','FISH_MAW','DUMPLING','CUSTOM']),
  images: z.array(z.string()).min(1),
  basePrice: z.number().positive(),
  skus: z.array(z.object({
    sku: z.string().min(1),
    price: z.number().positive(),
    stock: z.number().int().min(0),
    image: z.string().optional(),
    isDefault: z.boolean().optional()
  })).min(1)
})
