import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-ocean-800 text-white mt-auto">
      {/* Main columns */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">海味轩</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              高端海产品一站式选购平台。源头直供，品质保证，冷链直达，让您足不出户品尝海洋珍馐。
            </p>
          </div>

          {/* 客户服务 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">客户服务</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>服务热线：400-888-XXXX</li>
              <li>服务时间：9:00-21:00</li>
              <li>电子邮箱：service@haiweixuan.com</li>
            </ul>
          </div>

          {/* 购物指南 */}
          <div>
            <h3 className="text-lg font-bold text-amber-400 mb-3">购物指南</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <Link href="/delivery" className="hover:text-amber-400 transition-colors">
                  配送说明
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-amber-400 transition-colors">
                  退换政策
                </Link>
              </li>
              <li>
                <Link href="/payment" className="hover:text-amber-400 transition-colors">
                  支付方式
                </Link>
              </li>
              <li>ICP备XXXXXXXX号-1</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ocean-700">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <p className="text-center text-xs text-gray-400">
            &copy; {currentYear} 海味轩 Haiweixuan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
