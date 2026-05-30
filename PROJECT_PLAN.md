# 海味轩 海鲜电商项目文档

## 项目概述
精品海鲜电商网站，面向中国国内市场，销售海参、鲍鱼、佛跳墙、花胶、水饺、定制六大品类。

## 技术架构
- 前端: Next.js 14 App Router + Tailwind CSS
- 后端: Next.js API Routes
- 数据库: PostgreSQL + Prisma ORM
- 认证: NextAuth.js v5 (JWT)
- 部署: Vercel + Railway

## 数据库 ER 图
8 个核心表: User, Address, Product, ProductSKU, Order, OrderItem, Review, Account

## API 接口
- 公开: GET /api/products (列表/详情/评价)
- 用户: 地址 CRUD, 订单创建/查询, 支付, 取消
- 管理: 商品 CRUD, 订单管理, 发货

## 页面路由
- 用户端: 首页, 商品列表/详情, 购物车, 结算, 订单, 个人中心
- 管理端: 仪表盘, 商品管理, 订单管理

## 业务规则
- 下单时事务化库存扣减
- 购物车纯前端，下单一次性提交
- 订单状态流: PENDING→PAID→SHIPPED→COMPLETED
- 取消订单自动回滚库存
- OrderItem 做数据快照防止历史订单被修改
