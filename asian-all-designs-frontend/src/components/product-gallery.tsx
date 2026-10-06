"use client";

import { ChevronLeft, ChevronRight, Search, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { ProductImage } from "@/lib/types";

export function ProductGallery({ images, productName }: { images: ProductImage[]; productName: string }) {
  const gallery = images.slice(0, 3);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const image = gallery[selected];
  const move = (step: number) => { setSelected((current) => (current + step + gallery.length) % gallery.length); setZoomed(false); };
  useEffect(() => {
    if (!open) return;
    const key = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); if (event.key === "ArrowLeft") move(-1); if (event.key === "ArrowRight") move(1); };
    document.addEventListener("keydown", key); return () => document.removeEventListener("keydown", key);
  }, [open, gallery.length]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!image) return <div className="product-gallery product-gallery-empty">Sin imágenes disponibles</div>;

  return <div className="gallery-layout">
    {gallery.length > 1 && <div className="gallery-thumbnails" aria-label="Imágenes del producto">{gallery.map((item, index) => <button key={`${item.url}-${index}`} className={selected === index ? "active" : ""} onClick={() => setSelected(index)} aria-label={`Ver imagen ${index + 1}`}><Image src={item.url} alt="" fill sizes="84px" /></button>)}</div>}
    <button className="product-gallery" onClick={() => setOpen(true)} aria-label="Ampliar imagen"><Image src={image.url} alt={image.alt_text || productName} fill priority sizes="(max-width: 850px) 100vw, 54vw" /><span className="gallery-zoom"><Search size={17} />Ampliar</span><span className="gallery-index">{String(selected + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span></button>
    {open && <div className="gallery-modal" role="dialog" aria-modal="true" aria-label={`Vista ampliada de ${productName}`}><button className="gallery-close" onClick={() => setOpen(false)} aria-label="Cerrar"><X /></button>{gallery.length > 1 && <button className="gallery-arrow previous" onClick={() => move(-1)} aria-label="Imagen anterior"><ChevronLeft /></button>}<button className={`gallery-modal-image ${zoomed ? "zoomed" : ""}`} onClick={() => setZoomed((value) => !value)} aria-label={zoomed ? "Reducir imagen" : "Aumentar imagen"}><Image src={image.url} alt={image.alt_text || productName} fill sizes="95vw" quality={95} /></button>{gallery.length > 1 && <button className="gallery-arrow next" onClick={() => move(1)} aria-label="Imagen siguiente"><ChevronRight /></button>}<p>{selected + 1} / {gallery.length} · Haz clic sobre la imagen para {zoomed ? "reducir" : "acercar"}</p></div>}
  </div>;
}
