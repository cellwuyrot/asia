import { Menu, Search, ShoppingBag, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { SECTIONS, rub } from "../../shared/catalog-display";
import type { SectionId } from "../../shared/shop";
import { useShop } from "../queries/shop";
import { useCart } from "./cart-context";
const nav: SectionId[] = ["bundles", "china", "japan", "korea"];
export function Logo() {
  const q = useShop();
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center border border-[#b79a54] font-cjk text-lg text-[#a4884a]">
        亞
      </span>
      <span className="text-[17px] font-bold tracking-[.12em]">
        {q.data?.settings.name || "ASIA BASA"}
      </span>
    </Link>
  );
}
export function Header() {
  const cart = useCart();
  const q = useShop();
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const matches =
    q.data?.products
      .filter((p) =>
        (p.name + " " + p.brand + " " + p.category).toLowerCase().includes(search.toLowerCase()),
      )
      .slice(0, 8) || [];
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md">
      <div className="bg-[#263c31] py-2.5 text-center text-[12px] font-semibold tracking-[.08em] text-[#ececde]">
        {q.data
          ? `ДОСТАВКА БЕСПЛАТНО ОТ ${rub(q.data.settings.freeShipping)}`
          : "КОЛЛЕКЦИЯ ВКУСОВ АЗИИ"}
        <span className="mx-4">·</span>НАБОРЫ ДЛЯ ОСОБЕННЫХ МОМЕНТОВ
      </div>
      <div className="container flex h-[78px] items-center justify-between gap-5 border-b border-[#eeeee8]">
        <Logo />
        <nav className="hidden gap-7 lg:flex">
          {nav.map((id) => (
            <a href={`/collections/${id}`} key={id} className="text-sm font-medium hover:text-gold">
              {id === "bundles" ? "Подарочные наборы" : SECTIONS[id].title}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button onClick={() => setSearchOpen((v) => !v)} aria-label="Поиск">
            <Search size={18} />
          </button>
          <button
            onClick={() => cart.setOpen(true)}
            className="relative flex items-center gap-2"
            aria-label="Открыть корзину"
          >
            <ShoppingBag size={18} />
            <span className="hidden text-sm font-medium sm:inline">{rub(cart.total)}</span>
            {cart.count > 0 && (
              <span className="absolute -right-3 -top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#a4884a] px-1 text-sm font-bold text-white">
                {cart.count}
              </span>
            )}
          </button>
          <button onClick={() => setMenu((v) => !v)} className="lg:hidden" aria-label="Меню">
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>
      {menu && (
        <nav className="container grid grid-cols-2 gap-4 py-5 text-sm lg:hidden">
          {nav.map((id) => (
            <a onClick={() => setMenu(false)} href={`/collections/${id}`} key={id}>
              {SECTIONS[id].title}
            </a>
          ))}
          <Link href="/admin">Вход администратора</Link>
        </nav>
      )}
      {searchOpen && (
        <div className="absolute left-0 right-0 border-b border-[#ddd] bg-white p-5 shadow-lg">
          <div className="mx-auto max-w-2xl">
            <div className="flex gap-2">
              <input
                className="field"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Найти вкус, бренд или набор"
                aria-label="Поиск товаров"
              />
              <button onClick={() => setSearchOpen(false)} aria-label="Закрыть поиск">
                <X size={18} />
              </button>
            </div>
            {search && (
              <div className="mt-3 max-h-80 overflow-auto">
                {!matches.length && <p className="text-sm text-muted">Ничего не найдено</p>}
                {matches.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between gap-3 border-b border-[#eee] py-3"
                  >
                    <a
                      href={`/#${p.section}`}
                      onClick={() => setSearchOpen(false)}
                      className="text-sm"
                    >
                      {p.name}
                    </a>
                    <button
                      className="flex shrink-0 items-center gap-2 text-sm font-bold"
                      onClick={() => cart.add(p.id)}
                    >
                      {rub(p.price)} <ArrowUpRight size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
