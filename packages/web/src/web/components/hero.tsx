import { ArrowDown, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { useShop } from "../queries/shop";
export function Hero() {
  const shop = useShop();
  const s = shop.data?.settings;
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  return (
    <section className="bg-[#f6f3eb] paper">
      <div className="container grid gap-8 py-10 md:grid-cols-[1fr_1fr] md:py-16 lg:py-20">
        <div className="reveal flex flex-col items-start justify-center">
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-gold" />
            ВКУСЫ АЗИИ ДЛЯ ДОМА И ПОДАРКОВ
          </p>
          <h1 className="serif whitespace-pre-line text-[56px] leading-[.95] tracking-[-.03em] lg:text-[84px]">
            {s?.heroTitle}
          </h1>
          <p className="mt-7 max-w-[560px] text-base leading-7 text-[#5f645a]">
            {s?.heroText}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <a href="#bundles" className="btn">
              Открыть коллекцию <ArrowUpRight size={17} />
            </a>
            <a href="#china" className="flex items-center gap-2 text-sm font-semibold">
              Выбрать страну <ArrowDown size={13} />
            </a>
          </div>
        </div>
        <div
          className="relative min-h-[360px] md:min-h-[450px]"
          onMouseMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            setTilt({
              x: (e.clientX - r.left) / r.width - 0.5,
              y: (e.clientY - r.top) / r.height - 0.5,
            });
          }}
          onMouseLeave={() => setTilt({ x: 0, y: 0 })}
        >
          <div className="absolute inset-2 rounded-full border border-[#ddd8c9]" />
          <div className="absolute inset-[12%] rounded-full border border-[#e3dfd4]" />
          <div
            className="hero-art absolute inset-0"
            style={{ transform: `rotateY(${tilt.x * 9}deg) rotateX(${-tilt.y * 9}deg)` }}
          >
            {/* Editorial still life, intentionally illustrative */}
            <div
              className="absolute bottom-[13%] left-[10%] h-[36%] w-[73%] rounded-[50%] bg-[#b7cbbd] shadow-[0_18px_20px_#3139271c]"
              style={{ transform: "rotate(-15deg)" }}
            >
              <div className="absolute inset-[8%] rounded-[50%] border border-[#99b29e]" />
              <div className="absolute inset-[18%] rounded-[50%] border border-[#96b19c]/60" />
            </div>
            <div
              className="floating absolute left-[27%] top-[17%] h-[56%] w-[48%]"
              style={{ animationDelay: ".5s" }}
            >
              <div
                className="absolute inset-0 bg-[#8e3430] shadow-[14px_15px_0_0_#6f2928,23px_28px_30px_#42352235]"
                style={{ transform: "rotate(-13deg)" }}
              >
                <div className="absolute inset-3 border border-[#c6a571]" />
                <div className="absolute bottom-0 left-[43%] top-0 w-[14%] bg-[#b89a63]/30" />
                <div className="relative flex h-full flex-col items-center justify-center text-[#ddc798]">
                </div>
              </div>
            </div>
            <div className="absolute bottom-[15%] left-[9%] h-[25%] w-[25%] rounded-full bg-[#e7ded0] shadow-[5px_8px_12px_#2222]">
              <div className="absolute inset-[13%] rounded-full bg-[#afbb83] shadow-[inset_2px_3px_4px_#55643a44]" />
              <div className="absolute inset-[21%] rounded-full border border-[#c5d099]/70" />
            </div>
            <div
              className="absolute bottom-[13%] right-[13%] h-[4px] w-[46%] rounded-full bg-[#263029] shadow-[0_9px_0_#263029]"
              style={{ transform: "rotate(-27deg)" }}
            />
            <div className="absolute right-[8%] top-[8%] flex h-24 w-24 rotate-[12deg] flex-col items-center justify-center rounded-full border border-[#a4884a] bg-[#f6f3eb]/80 text-[#8f7747]">
              <span className="font-display text-3xl">3</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
