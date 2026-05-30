import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Admin user
  const adminHash = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@haiweixuan.com' },
    update: {},
    create: {
      name: '管理员',
      email: 'admin@haiweixuan.com',
      passwordHash: adminHash,
      role: 'ADMIN'
    }
  })
  console.log('Created admin:', admin.email)

  // Test user
  const userHash = await hash('123456', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@test.com' },
    update: {},
    create: {
      name: '测试用户',
      email: 'user@test.com',
      passwordHash: userHash,
      role: 'USER'
    }
  })
  console.log('Created user:', user.email)

  // Create test address for user
  await prisma.address.upsert({
    where: { id: 'addr-test-001' },
    update: {},
    create: {
      id: 'addr-test-001',
      userId: user.id,
      recipientName: '张三',
      phone: '13800138000',
      province: '上海市',
      city: '上海市',
      district: '浦东新区',
      detail: '张江高科技园区 100号',
      isDefault: true
    }
  })

  const products = [
    {
      name: '大连淡干海参 500g',
      category: 'SEA_CUCUMBER' as const,
      basePrice: 388,
      description: '精选大连优质海参，淡干工艺制作，泡发率高，肉质厚实弹牙，营养丰富。适合煲汤、红烧、葱烧等多种烹饪方式。',
      skus: [
        { sku: '250g 简装', price: 198, stock: 50 },
        { sku: '500g 礼盒装', price: 388, stock: 30, isDefault: true },
        { sku: '1kg 家庭装', price: 728, stock: 15 }
      ]
    },
    {
      name: '南日岛鲜冻鲍鱼',
      category: 'ABALONE' as const,
      basePrice: 268,
      description: '福建南日岛直供，鲜活捕捞后急速冷冻，锁住鲜美。肉质细嫩，口感Q弹，是宴请宾客的上等食材。',
      skus: [
        { sku: '10只装 中号', price: 168, stock: 40, isDefault: true },
        { sku: '10只装 大号', price: 268, stock: 25 },
        { sku: '20只装 大号礼盒', price: 498, stock: 10 }
      ]
    },
    {
      name: '闽味佛跳墙礼盒',
      category: 'BUDDHA_FEAST' as const,
      basePrice: 398,
      description: '传统闽菜经典之作，精选鲍鱼、海参、花胶、干贝、鸽蛋等名贵食材，配以浓汤文火熬制八小时以上。汤浓味醇，回味悠长。',
      skus: [
        { sku: '单人份 250g', price: 198, stock: 60, isDefault: true },
        { sku: '双人份 500g', price: 398, stock: 35 },
        { sku: '家宴装 1kg', price: 758, stock: 10 }
      ]
    },
    {
      name: '优质花胶干货',
      category: 'FISH_MAW' as const,
      basePrice: 528,
      description: '精选深海鱼胶，胶原蛋白含量丰富，是女性养颜滋补的首选佳品。泡发后晶莹剔透，炖汤胶质浓郁，口感滑嫩。',
      skus: [
        { sku: '100g 试吃装', price: 128, stock: 45, isDefault: true },
        { sku: '250g 实惠装', price: 288, stock: 30 },
        { sku: '500g 珍藏装', price: 528, stock: 12 }
      ]
    },
    {
      name: '手工海鲜水饺',
      category: 'DUMPLING' as const,
      basePrice: 68,
      description: '传统手工包制，皮薄馅大。选用新鲜虾仁与优质猪肉，搭配秘制调料，每一口都是家的味道。',
      skus: [
        { sku: '虾仁水饺 500g', price: 48, stock: 100, isDefault: true },
        { sku: '鲅鱼水饺 500g', price: 58, stock: 80 },
        { sku: '混合装 1.5kg', price: 128, stock: 50 }
      ]
    },
    {
      name: '定制海鲜礼盒',
      category: 'CUSTOM' as const,
      basePrice: 299,
      description: '根据您的需求定制搭配，适合商务送礼、节日问候、亲友分享。专业搭配师为您精选最优组合，请联系客服沟通具体需求。',
      skus: [
        { sku: '基础礼盒 3件装', price: 299, stock: 999, isDefault: true },
        { sku: '尊享礼盒 6件装', price: 599, stock: 999 },
        { sku: '典藏礼盒 10件装', price: 999, stock: 500 }
      ]
    }
  ]

  for (const p of products) {
    const { skus, ...productData } = p
    const created = await prisma.product.upsert({
      where: { id: `seed-${p.category}` },
      update: {},
      create: {
        id: `seed-${p.category}`,
        ...productData,
        images: [],
        salesCount: Math.floor(Math.random() * 200),
        skus: {
          create: skus.map(s => ({
            sku: s.sku,
            price: s.price,
            stock: s.stock,
            isDefault: s.isDefault || false
          }))
        }
      }
    })
    console.log('Created product:', created.name)
  }

  console.log('✅ Seed complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
