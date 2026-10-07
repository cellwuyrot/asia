import { Header } from "../components/header";
import { Hero } from "../components/hero";
import { CollectionSection } from "../components/sections";
import { lazy, Suspense } from "react";
const Footer3D = lazy(() =>
  import("../components/footer-3d").then((m) => ({ default: m.Footer3D })),
);
import { CartDrawer, Toast } from "../components/cart-drawer";
import { useShop } from "../queries/shop";
import { Seo } from "../components/seo";
export default function Index() {
  const q = useShop();
  if (q.isPending)
    return (
      <div className="flex min-h-screen items-center justify-center gap-3 text-sm">
        <span className="spinner" />
        Загружаем коллекцию ASIA BASA…
      </div>
    );
  if (q.isError)
    return (
      <div className="container py-24">
        <h1 className="serif text-4xl">Коллекция временно недоступна</h1>
        <button className="btn mt-6" onClick={() => q.refetch()}>
          Повторить
        </button>
      </div>
    );
  return (
    <>
      <Seo
        title={`${q.data?.settings.name || "ASIA BASA"} — азиатские продукты и подарочные наборы`}
        description={q.data?.settings.heroText || undefined}
        settings={q.data?.settings}
        products={q.data?.products}
      />
      <Header />
      <main>
        <Hero />
        <div id="collections"><CollectionSection id="bundles" /></div>
        <CollectionSection id="china" />
        <CollectionSection id="japan" />
        <CollectionSection id="korea" />
      </main>
      <Suspense fallback={<div className="h-40 bg-ivory" />}>
        <Footer3D />
      </Suspense>
      <CartDrawer />
      <Toast />
    </>
  );
}
