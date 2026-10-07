import { ArrowUpRight, Check, Flame, Plus, X } from "lucide-react";
import { useState, type CSSProperties } from "react";
import { SECTIONS, rub, type Product } from "../../shared/shop";
import { useCart } from "./cart-context";
import { Modal } from "./modal";
import { useShop } from "../queries/shop";
export function Packshot({ p, small = false }: { p: Product; small?: boolean }) {
  const s = SECTIONS[p.section];
  const color =
    p.section === "bundles"
      ? p.country === "Китай"
        ? "#9C302D"
        : p.country === "Корея"
          ? "#263E5C"
          : "#645078"
      : s.accent;
  if (p.image)
    return (
      <img
        src={p.image}
        alt={p.name}
        className="h-full w-full object-contain p-4"
        loading="lazy"
        onError={(e) => {
          e.currentTarget.alt = "Изображение недоступно";
        }}
      />
    );
  return (
    <div
      className="art h-full w-full"
      style={{ "--art-bg": s.bg, "--art-color": color, "--art-side": s.secondary } as CSSProperties}
    >
      <div className={`art-pack ${p.section === "bundles" ? "art-bundle" : ""}`}>
        <span
          className={`absolute inset-0 flex items-center justify-center font-cjk ${small ? "text-xl" : "text-4xl sm:text-5xl"}`}
        >
          {p.section === "bundles" ? "箱" : s.glyph}
        </span>
      </div>
    </div>
  );
}
export function ProductCard({ p }: { p: Product }) {
  const cart = useCart();
  const [added, setAdded] = useState(false);
  const [details, setDetails] = useState(false);
  const s = SECTIONS[p.section];
  const add = () => {
    cart.add(p.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1000);
  };
  return (
    <>
      <article
        className="card flex h-full flex-col"
        style={{ "--accent": s.secondary } as CSSProperties}
      >
        <button
          className="relative aspect-[1.12] w-full text-left"
          onClick={() => setDetails(true)}
          aria-label={`Подробнее: ${p.name}`}
        >
          <Packshot p={p} />
          {p.featured && (
            <span className="absolute left-3 top-3 border border-white/60 bg-white/90 px-2 py-1 text-sm font-medium text-[#6d5c3d]">
              ВЫБОР ASIA BASA
            </span>
          )}
          {p.badge && (
            <span className="absolute right-3 top-3 bg-white px-2 py-1 text-sm font-medium">{p.badge}</span>
          )}
        </button>
        <div className="flex flex-1 flex-col p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-1 text-sm font-medium uppercase tracking-wide text-muted">
            <span>{p.section === "bundles" ? p.country : p.brand}</span>
            <span>{p.weight}</span>
          </div>
          <button
            className="mb-2 text-left text-base font-semibold leading-snug hover:text-gold"
            onClick={() => setDetails(true)}
          >
            {p.name}
          </button>
          <p className="mb-4 text-sm leading-6 text-muted">{p.sub}</p>
          <div className="mt-auto flex items-end justify-between gap-2">
            <div>
              {p.oldPrice && (
                <span className="block text-sm text-muted line-through">{rub(p.oldPrice)}</span>
              )}
              <span className="text-sm font-bold">{rub(p.price)}</span>
              {p.spice > 0 && (
                <span className="mt-1 flex items-center gap-1 text-sm text-[#9c302d]">
                  <Flame size={10} />
                  {p.spice}/5
                </span>
              )}
            </div>
            <button
              onClick={add}
              className="flex h-9 w-9 items-center justify-center border border-[#dbdfd5] bg-white text-[#263c31] transition hover:border-[#263c31] hover:bg-[#263c31] hover:text-white"
              aria-label={`В корзину: ${p.name}`}
            >
              {added ? <Check size={15} /> : <Plus size={15} />}
            </button>
          </div>
        </div>
      </article>
      {details && <ProductDetails p={p} onClose={() => setDetails(false)} />}
    </>
  );
}
function ProductDetails({ p, onClose }: { p: Product; onClose: () => void }) {
  const shop = useShop();
  const cart = useCart();
  return (
    <Modal onClose={onClose} label={p.name}>
      <div className="modal-panel grid md:grid-cols-2" style={{ zIndex: 81 }}>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center bg-white"
          aria-label="Закрыть"
        >
          <X size={18} />
        </button>
        <div className="min-h-[260px]">
          <Packshot p={p} />
        </div>
        <div className="p-7">
          <p className="eyebrow">
            {p.country} · {p.id}
          </p>
          <h3 className="serif mt-3 text-3xl">{p.name}</h3>
          <p className="mt-3 text-sm leading-6 text-muted">{p.description || p.sub}</p>
          <p className="mt-3 text-sm">
            {p.weight}
            {p.people && ` · На ${p.people} чел.`}
            {p.spice > 0 && ` · Острота ${p.spice}/5`}
          </p>
          {p.contents.length > 0 && (
            <>
              <h4 className="mt-5 text-sm font-semibold">Внутри набора</h4>
              <ul className="mt-2 space-y-2 text-sm leading-6 text-muted">
                {p.contents.map((c) => (
                  <li key={c.productId}>
                    {shop.data?.products.find((x) => x.id === c.productId)?.name || c.productId} ×
                    {c.qty}
                  </li>
                ))}
              </ul>
            </>
          )}
          {p.extras && <p className="mt-3 text-sm text-muted">Докупить: {p.extras}</p>}
          <div className="mt-6 flex items-center justify-between">
            <b>{rub(p.price)}</b>
            <button
              className="btn"
              onClick={() => {
                cart.add(p.id);
                onClose();
              }}
            >
              В корзину <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
