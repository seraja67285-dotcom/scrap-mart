import { prisma } from "@/lib/prisma";
export const dynamic="force-dynamic";
export default async function Home(){
 const [products,settings]=await Promise.all([
   prisma.product.findMany({where:{available:true},include:{category:true},orderBy:{createdAt:"desc"}}),
   prisma.siteSettings.findUnique({where:{id:"main"}})
 ]);
 return <main><section className="hero"><div className="container"><h1>ScrapMart</h1><p className="muted">Apna scrap dekho, details samjho aur seedha WhatsApp par baat karo.</p><div className="row"><a className="btn green" href="#scrap">View Scrap</a><a className="btn dark" href="/sell">Sell Your Scrap</a></div></div></section>
 <section id="scrap" className="container"><h2>Available Scrap</h2><div className="grid">{products.map(p=><article className="card" key={p.id}><div className="pic">{p.imageUrl?<img src={p.imageUrl} alt={p.name} style={{width:"100%",height:"100%",objectFit:"cover"}}/>:"Scrap Photo"}</div><div className="body"><h3>{p.name}</h3><p className="muted">{p.category.name}</p><p>{p.description}</p>{p.price&&<strong>{p.price}{p.unit?` / ${p.unit}`:""}</strong>}<br/><a className="btn green" style={{marginTop:12}} href={`/buy/${p.slug}`}>Buy on WhatsApp</a></div></article>)}</div>{products.length===0&&<p className="muted">Products will appear here after the admin adds them.</p>}</section></main>
}
