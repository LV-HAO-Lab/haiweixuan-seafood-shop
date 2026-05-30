# 海味轩 — 部署指南

## 前置准备

- GitHub 账号
- Vercel 账号 (https://vercel.com)
- Railway 账号 (https://railway.app) 或 Supabase 账号

## 本地开发

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd shopping-site-v2

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入真实的 DATABASE_URL

# 4. 启动 PostgreSQL (使用 Docker)
docker-compose up -d db

# 5. 初始化数据库
npx prisma db push
npm run db:seed

# 6. 启动开发服务器
npm run dev
# 访问 http://localhost:3000
```

## 部署到 Vercel

### 1. 推送代码到 GitHub
```bash
git remote add origin <your-repo-url>
git push -u origin master
```

### 2. 在 Vercel 中导入项目
- 登录 Vercel → New Project → Import GitHub repo
- Framework: Next.js
- Root Directory: ./
- Build Command: npx prisma generate && next build
- Install Command: npm install

### 3. 配置环境变量
在 Vercel 项目 Settings → Environment Variables 中添加：
- DATABASE_URL: Railway/Supabase 的 PostgreSQL 连接地址
- NEXTAUTH_SECRET: 生成一个随机字符串 (openssl rand -base64 32)
- NEXTAUTH_URL: https://your-domain.vercel.app

### 4. 部署
点击 Deploy，Vercel 自动构建并部署。

## 数据库部署 (Railway)

### 1. 创建 PostgreSQL
- Railway → New Project → Provision PostgreSQL
- 获取 Connection URL

### 2. 运行迁移和种子数据
```bash
# 本地连接到远程数据库
DATABASE_URL="railway-postgres-url" npx prisma db push
DATABASE_URL="railway-postgres-url" npm run db:seed
```

## 数据库部署 (Supabase 备选)

### 1. 创建项目
- Supabase → New Project → 设置密码

### 2. 获取连接信息
- Settings → Database → Connection String → URI
- 替换 .env.local 中的 DATABASE_URL

## 自定义域名和 HTTPS
- Vercel: Settings → Domains → 添加域名 → 配置 DNS → 自动 SSL
- 国内域名需要备案

## 国内部署注意事项
- Vercel 在国内访问可能较慢，建议使用 CDN
- 后续可迁移到阿里云/腾讯云
- 需要 ICP 备案才能使用国内服务器
- 数据库也可迁移到国内云数据库

## Docker 部署

```bash
# 构建并启动
docker-compose up -d

# 运行数据库迁移
docker-compose exec app npx prisma db push
docker-compose exec app npm run db:seed

# 查看日志
docker-compose logs -f
```

## 默认账户
- 管理员: admin@haiweixuan.com / admin123
- 测试用户: user@test.com / 123456
