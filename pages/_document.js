import { Html, Head, Main, NextScript } from 'next/document'

const TAILWIND_CDN = 'https://cdn.tailwindcss.com'
const TAILWIND_CONFIG = `tailwind.config = { theme: { extend: { colors: { b: { DEFAULT:'#0d0d12', card:'#131319', cell:'#18181f', line:'#22222b' }, g: { DEFAULT:'#e8a840', light:'#f0c060', dim:'#b08030', bg:'rgba(232,168,64,0.06)', line:'rgba(232,168,64,0.10)' }, t: { h:'#f1f1f3', body:'#c5c5cc', mute:'#888899', faint:'#555566' } } } } }`

const STYLES = `* { -webkit-tap-highlight-color: transparent; margin:0; padding:0; box-sizing:border-box; }
html { scroll-behavior: smooth; -webkit-overflow-scrolling: touch; }
body { font-family: -apple-system,BlinkMacSystemFont,"PingFang SC","Helvetica Neue","Microsoft YaHei",sans-serif; background: #0d0d12; color: #c5c5cc; min-height: 100vh; overflow-x: hidden; -webkit-font-smoothing: antialiased; }
.tr { display:flex; align-items:center; padding:10px 14px; border-bottom:1px solid rgba(255,255,255,.04); }
.tr:last-child { border-bottom:0; }
@media (min-width:768px) { .tr { padding:12px 18px; } }
.tag-hot  { font-size:10px; padding:1px 7px; color:#f07050; background:rgba(240,112,80,.10); border-radius:2px; }
.tag-rec  { font-size:10px; padding:1px 7px; color:#e8a840; background:rgba(232,168,64,.10); border-radius:2px; }
.tag-new  { font-size:10px; padding:2px 8px; color:#e8a840; background:rgba(232,168,64,.12); border-radius:2px; }
.tag-top  { font-size:10px; padding:2px 8px; color:#fff; background:linear-gradient(135deg,#e8a840,#c08020); border-radius:2px; }
.carousel-track { display:flex; transition:transform .4s ease; will-change:transform; }
.carousel-dot { width:5px; height:5px; border-radius:50%; background:rgba(255,255,255,.2); transition:all .3s; cursor:pointer; border:0; }
.carousel-dot.on { width:18px; border-radius:3px; background:rgba(232,168,64,.7); }
.carousel-btn { position:absolute; top:50%; transform:translateY(-50%); z-index:20; width:40px; height:40px; border-radius:50%; background:rgba(0,0,0,.5); border:1px solid rgba(255,255,255,.1); color:rgba(255,255,255,.6); display:none; align-items:center; justify-content:center; cursor:pointer; transition:all .2s; }
.carousel-btn:hover { background:rgba(0,0,0,.7); color:#fff; }
@media (min-width:768px) { .carousel-btn { display:flex; } }
.detail-overlay { position:fixed; inset:0; z-index:100; background:#0d0d12; transform:translateY(100%); transition:transform .35s cubic-bezier(.4,0,.2,1); overflow-y:auto; -webkit-overflow-scrolling:touch; }
.detail-overlay.open { transform:translateY(0); }
@media (min-width:768px) { .detail-overlay { transform:translateY(100%); background:rgba(0,0,0,.85); backdrop-filter:blur(8px); display:flex; align-items:flex-start; justify-content:center; padding:40px 20px; } .detail-overlay.open { transform:translateY(0); } .detail-inner { width:100%; max-width:800px; max-height:85vh; overflow-y:auto; background:#131319; border-radius:16px; border:1px solid rgba(232,168,64,.10); } }
#backTop { position:fixed; right:18px; bottom:80px; z-index:99; width:38px; height:38px; border-radius:50%; background:rgba(19,19,25,.92); border:1px solid rgba(255,255,255,.08); display:flex; align-items:center; justify-content:center; color:rgba(232,168,64,.5); transition:all .3s; cursor:pointer; opacity:0; pointer-events:none; }
#backTop.show { opacity:1; pointer-events:auto; }
#backTop:hover { background:rgba(232,168,64,.12); color:#e8a840; }
@media (min-width:768px) { #backTop { right:28px; bottom:60px; width:44px; height:44px; } }
@keyframes glow-pulse { 0%,100% { box-shadow: 0 0 0 1px rgba(232,168,64,.15); } 50% { box-shadow: 0 0 0 2px rgba(232,168,64,.28), 0 0 20px rgba(232,168,64,.07); } }
.glow-pulse { animation: glow-pulse 2.5s ease-in-out infinite; }
::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#222; border-radius:2px; }
.game-card { cursor:pointer; transition: all .3s; border:1px solid rgba(255,255,255,.05); }
.game-card:hover { border-color:rgba(232,168,64,.18); }
.game-card:active { transform:scale(.98); }
@media (min-width:768px) { .game-card:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(0,0,0,.4); } }`

export default function Document() {
  return (
    <Html lang="zh-CN">
      <Head>
        <meta charSet="UTF-8" />
        <meta name="format-detection" content="telephone=yes" />
        <script src={TAILWIND_CDN} />
        <script dangerouslySetInnerHTML={{ __html: TAILWIND_CONFIG }} />
        <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
