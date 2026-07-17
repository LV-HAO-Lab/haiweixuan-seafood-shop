import fs from 'fs'
import path from 'path'
import Script from 'next/script'

export async function getStaticProps() {
  const raw = fs.readFileSync(path.join(process.cwd(), 'source.html'), 'utf-8')
  // 提取 body 内容（从 <body 到 </body>，不含 body 标签本身）
  const m = raw.match(/<body[^>]*>([\s\S]*)<\/body>/)
  let bodyHTML = m ? m[1] : raw
  // 提取末尾 script 标签内容，从 bodyHTML 中移除
  let scripts = ''
  const sm = bodyHTML.match(/<script>([\s\S]*)<\/script>/)
  if (sm) {
    scripts = sm[1]
    bodyHTML = bodyHTML.replace(/<script>[\s\S]*<\/script>/, '')
  }
  return { props: { bodyHTML, scripts } }
}

export default function Home({ bodyHTML, scripts }) {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyHTML }} />
      <Script id="page-logic" strategy="afterInteractive">{scripts}</Script>
    </>
  )
}
