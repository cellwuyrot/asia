import { Route, Switch } from "wouter";
import Index from "./pages/index";
import { lazy, Suspense } from "react";
const ProductPage = lazy(() => import("./pages/product"));
const Admin = lazy(() => import("./pages/admin"));
const Info = lazy(() => import("./pages/info"));
const CollectionPage = lazy(() => import("./pages/collection"));
import { Provider } from "./components/provider";
import { CartProvider } from "./components/cart-context";

function App() {
  return (
    <Provider>
      <CartProvider>
        <Suspense
          fallback={
            <div className="container py-24">
              <span className="spinner" />
            </div>
          }
        >
          <Switch>
            <Route path="/" component={Index} />
            <Route path="/products/:id" component={ProductPage} />
            <Route path="/admin" component={Admin} />
            <Route path="/collections/:slug" component={CollectionPage} />
            <Route path="/info/:slug" component={Info} />
            <Route>
              <div className="container py-24">
                Страница не найдена. <a href="/">Вернуться в магазин</a>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </CartProvider>
    </Provider>
  );
}

export default App;
