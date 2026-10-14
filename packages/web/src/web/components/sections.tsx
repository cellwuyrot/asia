import { ArrowRight, Flame } from "lucide-react";
import { useMemo, useState } from "react";
import { SECTIONS } from "../../shared/catalog-display";
import type { SectionId } from "../../shared/shop";
import { useShop } from "../queries/shop";
import { ProductCard } from "./product-card";
export function CollectionSection({ id }: { id: SectionId }) {
  const q = useShop();
  const s = SECTIONS[id];
  const [expanded, setExpanded] = useState(false);
  const [category, setCategory] = useState("");
  const [spice, setSpice] = useState(0);
  const all = useMemo(() => q.data?.products.filter((p) => p.section === id) || [], [q.data, id]);
  const categories = [...new Set(all.map((p) => p.category))];
  const filtered = useMemo(
    () =>
      all
        .filter((p) => (!category || p.category === category) && p.spice >= spice)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.sort - b.sort),
    [all, category, spice],
  );
  const visible = expanded ? filtered : filtered.slice(0, id === "bundles" ? 4 : 8);
  return (
    <section
      id={id}
      className="py-14 md:py-20"
      style={{ background: id === "japan" ? "#fff" : id === "bundles" ? "#fff" : s.bg }}
    >
      <div className="container">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow mb-3" style={{ color: s.secondary }}>
              {s.label}
            </p>
            <h2 className="serif text-[42px] leading-none md:text-[52px]">{s.title}</h2>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{s.desc}</p>
          </div>
          <span
            className="hidden font-cjk text-[60px] leading-none opacity-20 sm:block"
            style={{ color: s.accent }}
          >
            {s.glyph}
          </span>
        </div>
        <div className="mb-7 flex flex-wrap items-center justify-between gap-3 border-y border-[#deded2] py-3">
          <div className="flex flex-wrap gap-2">
            <button
              className={`min-h-10 px-4 py-2 text-sm font-medium ${!category ? "bg-ink text-white" : "text-muted"}`}
              onClick={() => {
                setCategory("");
                setExpanded(false);
              }}
            >
              Вся коллекция
            </button>
            {categories.map((c) => (
              <button
                key={c}
                className={`min-h-10 px-4 py-2 text-sm font-medium ${category === c ? "bg-ink text-white" : "text-muted"}`}
                onClick={() => {
                  setCategory(c);
                  setExpanded(false);
                }}
              >
                {c}
              </button>
            ))}
          </div>
          {id === "china" && (
            <label className="flex items-center gap-2 text-sm text-muted">
              <Flame size={13} color={s.accent} />
              Острота
              <select
                className="border border-[#d9d9cc] bg-transparent px-2 py-1"
                value={spice}
                onChange={(e) => setSpice(Number(e.target.value))}
              >
                {[0, 1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    {n ? `от ${n}/5` : "Любая"}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
        {!filtered.length && (
          <p className="py-10 text-center text-sm text-muted">
            Товаров с такими параметрами пока нет.
          </p>
        )}
        {filtered.length > visible.length && (
          <div className="mt-8 flex justify-center">
            <button className="btn btn-outline" onClick={() => setExpanded(true)}>
              Вся коллекция · {filtered.length} <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
