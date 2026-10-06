import Image from "next/image";
import Link from "next/link";

const featured = [
  { name: "Moda urbana", label: "Polos · Hoodies", image: "/images/category-fashion.png", href: "/catalogo?categoria=ropa" },
  { name: "Regalos kawaii", label: "Tazas · Peluches", image: "/images/category-gifts.png", href: "/catalogo?categoria=regalos" },
];

export default function Home() {
  return (
    <main>
      <section className="hero shell">
        <Image className="hero-image" src="/images/hero-asian-all-designs.png" alt="Ropa, taza y peluche originales de estilo asiático" fill priority sizes="(max-width: 900px) 100vw, 92vw" />
        <div className="hero-overlay" />
        <div className="hero-copy">
          <p className="eyebrow">Nueva colección · 2026</p>
          <h1>Tu lado fan,<br />a tu manera.</h1>
          <p>Moda, accesorios y regalos inspirados en la energía del K-pop y el universo anime.</p>
          <Link className="button button-light" href="/catalogo">Ver toda la colección <span>↗</span></Link>
        </div>
        <span className="hero-note">Diseños originales · Ediciones pequeñas</span>
      </section>

      <section className="category-section shell" aria-labelledby="categories-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow dark">Explora por categoría</p>
            <h2 id="categories-title">Encuentra tu próximo favorito</h2>
          </div>
          <Link className="text-link" href="/catalogo">Ver todo <span>→</span></Link>
        </div>
        <div className="category-grid">
          {featured.map((category, index) => (
            <Link className="category-card" href={category.href} key={category.name}>
              <Image src={category.image} alt="" fill sizes="(max-width: 700px) 100vw, 50vw" />
              <span className="category-number">0{index + 1}</span>
              <div className="category-label"><span>{category.label}</span><strong>{category.name}</strong></div>
              <span className="round-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
