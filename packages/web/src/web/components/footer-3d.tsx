import { useEffect, useRef, useState, lazy, Suspense } from "react";
import { Link } from "wouter";
import { Logo } from "./header";
import { SECTIONS } from "../../shared/catalog-display";
import type { SectionId } from "../../shared/shop";
import { useShop } from "../queries/shop";
const Sculptures = lazy(() => import("./footer-sculptures"));
function DeferredSculptures() {
  const ref = useRef<HTMLDivElement>(null), [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!ref.current || matchMedia("(prefers-reduced-motion: reduce)").matches || matchMedia("(max-width: 767px)").matches || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2)) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } }, { rootMargin: "150px" });
    observer.observe(ref.current); return () => observer.disconnect();
  }, []);
  return <div ref={ref} className="absolute inset-0" aria-hidden>{visible && <Suspense fallback={null}><Sculptures /></Suspense>}</div>;
}
export function Footer3D() {
  const q = useShop();
  const s = q.data?.settings;
  return (
    <footer className="relative overflow-hidden border-t border-[#dedfd3] bg-[#f5f3ed]">
      <DeferredSculptures />
      <div className="absolute inset-0 bg-white/60" />
      <div className="container relative py-12 md:py-16">
        <div className="mb-12 flex flex-col justify-between gap-5 border-b border-[#d7d8c9] pb-10 md:flex-row md:items-end">
          <div>
            <p className="eyebrow mb-3">{s?.tagline}</p>
            <h3 className="serif text-4xl">Вкус — это тоже путешествие.</h3>
          </div>
          <a className="btn btn-outline" href="/collections/bundles">
            Выбрать свой набор ↗
          </a>
        </div>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-6 text-muted">{s?.about}</p>
          </div>
          <div>
            <h4 className="eyebrow text-ink">Коллекции</h4>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {(Object.keys(SECTIONS) as SectionId[]).map((id) => (
                <li key={id}>
                  <a href={`/collections/${id}`} className="hover:text-gold">
                    {SECTIONS[id].title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 id="info" className="eyebrow text-ink">Информация</h4>
            <ul className="mt-5 space-y-3 text-sm text-muted">
              {[
                ["delivery", "Доставка"],
                ["payment", "Оплата"],
                ["returns", "Возврат"],
                ["privacy", "Конфиденциальность"],
                ["offer", "Публичная оферта"],
              ].map(([id, t]) => (
                <li key={id}>
                  <Link href={`/info/${id}`} className="hover:text-gold">
                    {t}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="eyebrow text-ink">На связи</h4>
            <div className="mt-5 space-y-3 text-sm text-muted">
              {s?.phone && (
                <a className="block" href={`tel:${s.phone.replace(/[^+\d]/g, "")}`}>
                  {s.phone}
                </a>
              )}
              {s?.email && (
                <a className="block" href={`mailto:${s.email}`}>
                  {s.email}
                </a>
              )}
              {s?.address && <p>{s.address}</p>}
              {s?.hours && <p>{s.hours}</p>}
              {!s?.phone && !s?.email && <p>Контакты скоро появятся</p>}
              <div className="flex flex-wrap gap-3">
                {[
                  [s?.telegram, "Telegram"],
                  [s?.vk, "VK"],
                  [s?.avito, "Авито"],
                ].map(([url, t]) =>
                  url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      key={t}
                      className="border-b border-gold text-gold"
                    >
                      {t} ↗
                    </a>
                  ) : null,
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col justify-between gap-3 border-t border-[#d7d8c9] pt-5 text-sm leading-6 text-muted md:flex-row">
          <div>
            © {new Date().getFullYear()} {s?.name} {s?.company && ` · ${s.company}`}
            {s?.inn && ` · ИНН ${s.inn}`}
            {s?.ogrn && ` · ОГРН ${s.ogrn}`}
          </div>
          <Link href="/admin" className="hover:text-gold">
            Управление магазином ↗
          </Link>
        </div>
      </div>
    </footer>
  );
}
