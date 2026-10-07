import { Check, Minus, Plus, ShoppingBag, Trash2, X, Truck } from "lucide-react";
import { useEffect, useRef } from "react";
import { useShop } from "../queries/shop";
import { rub } from "../../shared/shop";
import { useCart } from "./cart-context";
import { Packshot } from "./product-card";
export function CartDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const c = useCart();
  const q = useShop();
  const threshold = q.data?.settings.freeShipping || 0;
  const left = Math.max(0, threshold - c.total);
  const fee = c.total && left > 0 ? q.data?.settings.deliveryFee || 0 : 0;
  useEffect(() => {
    if (c.open && !ref.current?.open) ref.current?.showModal();
    else if (!c.open && ref.current?.open) ref.current?.close();
  }, [c.open]);
  useEffect(() => {
    if (c.open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [c.open]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") c.setOpen(false);
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [c]);
  return (
    <>
      <dialog
        ref={ref}
        className="drawer"
        aria-label="Корзина"
        onCancel={(e) => {
          e.preventDefault();
          c.setOpen(false);
        }}
      >
        <div className="flex items-center justify-between border-b border-[#e5e6dc] p-6">
          <h3 className="serif text-3xl">
            Ваша коллекция <span className="font-sans text-sm text-muted">({c.count})</span>
          </h3>
          <button onClick={() => c.setOpen(false)} aria-label="Закрыть корзину">
            <X size={20} />
          </button>
        </div>
        <div className="border-b border-[#e5e6dc] px-6 py-4">
          <div className="mb-3 flex gap-2 text-sm">
            <Truck size={15} />
            {left > 0 ? `До бесплатной доставки ${rub(left)}` : "Доставка бесплатно"}
          </div>
          <div className="h-1 bg-[#e8eadd]">
            <div
              className="h-full bg-[#a4884a] transition-all"
              style={{ width: `${threshold ? Math.min(100, (c.total / threshold) * 100) : 100}%` }}
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {!c.lines.length ? (
            <div className="py-20 text-center">
              <ShoppingBag className="mx-auto text-gold" size={32} />
              <p className="serif mt-4 text-3xl">Начните путешествие</p>
              <p className="my-3 text-sm text-muted">Выберите первый вкус из нашей коллекции.</p>
              <button className="btn mt-3" onClick={() => c.setOpen(false)}>
                Вернуться в магазин
              </button>
            </div>
          ) : (
            c.lines.map(({ product: p, qty }) => (
              <div className="mb-4 flex gap-3 border-b border-[#eee] pb-4" key={p.id}>
                <div className="h-20 w-20 shrink-0">
                  <Packshot p={p} small />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between gap-3">
                    <span className="text-sm font-semibold">{p.name}</span>
                    <button
                      aria-label="Удалить товар"
                      onClick={() => c.remove(p.id)}
                      className="text-muted"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-muted">{p.weight}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center border border-[#ddd]">
                      <button
                        aria-label="Уменьшить количество"
                        className="p-2"
                        onClick={() => c.dec(p.id)}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 text-sm">{qty}</span>
                      <button
                        aria-label="Увеличить количество"
                        className="p-2"
                        onClick={() => c.add(p.id)}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <b className="text-sm">{rub(p.price * qty)}</b>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {c.lines.length > 0 && (
          <div className="border-t border-[#e5e6dc] bg-[#f9faf6] p-6">
            <div className="flex justify-between text-sm text-muted">
              <span>Доставка</span>
              <span>{fee ? rub(fee) : "Бесплатно"}</span>
            </div>
            <div className="my-4 flex justify-between text-lg font-bold">
              <span>Итого</span>
              <span>{rub(c.total + fee)}</span>
            </div>
            <p className="mb-4 text-sm leading-6 text-muted">
              Приём заказов и онлайн-оплата пока не подключены. Корзина сохраняется — свяжитесь с
              магазином для уточнения наличия и заказа.
            </p>
            {q.data?.settings.phone ? (
              <a
                className="btn w-full"
                href={`tel:${q.data.settings.phone.replace(/[^+\d]/g, "")}`}
              >
                Заказать по телефону
              </a>
            ) : q.data?.settings.telegram ? (
              <a
                target="_blank"
                rel="noreferrer"
                className="btn w-full"
                href={q.data.settings.telegram}
              >
                Связаться в Telegram
              </a>
            ) : (
              <button className="btn w-full" disabled>
                Контакты магазина скоро
              </button>
            )}
          </div>
        )}
      </dialog>
    </>
  );
}
export function Toast() {
  const c = useCart();
  return c.toast ? (
    <button
      className="fixed bottom-6 left-1/2 z-[90] flex -translate-x-1/2 items-center gap-3 border border-[#d7ddcc] bg-white px-5 py-4 text-sm shadow-xl"
      onClick={() => {
        c.setOpen(true);
        c.setToast("");
      }}
    >
      <Check size={16} color="#a4884a" />
      <span className="whitespace-nowrap">{c.toast}</span>
    </button>
  ) : null;
}
