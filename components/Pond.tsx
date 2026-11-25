"use client";

import { useEffect, useRef } from "react";
import { drawFish, makeFish, type Fish } from "@/lib/koi/fish";

const FISH_ALPHA = 0.68; // fish are kept soft so the name stays in front

export default function Pond() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const hero = canvas?.parentElement;
    if (!canvas || !hero) return;
    const main = canvas.getContext("2d");
    // fish are drawn on their own layer, then laid over the pond at partial opacity
    const layer = document.createElement("canvas");
    const fx = layer.getContext("2d");
    if (!main || !fx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0;
    let H = 0;
    let S = 1;
    let raf = 0;
    let fish: Fish | null = null;

    function render(t: number) {
      if (!main || !fx || !fish) return;
      main.clearRect(0, 0, W, H);

      // drifting light on the water
      main.globalCompositeOperation = "lighter";
      for (let k = 0; k < 6; k++) {
        const lx = W * (0.5 + 0.45 * Math.sin(t * 0.0002 * (k + 1) + k * 2));
        const ly = H * (0.5 + 0.4 * Math.cos(t * 0.00017 * (k + 2) + k));
        const lr = 150 + k * 35;
        const lg = main.createRadialGradient(lx, ly, 0, lx, ly, lr);
        lg.addColorStop(0, "rgba(130,210,255,.07)");
        lg.addColorStop(1, "rgba(130,210,255,0)");
        main.fillStyle = lg;
        main.fillRect(lx - lr, ly - lr, lr * 2, lr * 2);
      }
      main.globalCompositeOperation = "source-over";

      fx.clearRect(0, 0, W, H);
      drawFish(fx, fish, t, S);
      main.globalAlpha = FISH_ALPHA;
      main.drawImage(layer, 0, 0, W, H);
      main.globalAlpha = 1;
    }

    function size() {
      if (!canvas || !hero || !main || !fx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = hero.clientWidth;
      H = hero.clientHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      layer.width = canvas.width;
      layer.height = canvas.height;
      main.setTransform(dpr, 0, 0, dpr, 0, 0);
      fx.setTransform(dpr, 0, 0, dpr, 0, 0);
      S = W < 600 ? 0.62 : 1;
      // one kohaku, resting low on the left, so the whole body is easy to see
      fish = makeFish(0, W * 0.32, H * 0.72, -0.35, S);
      if (reduce) render(0);
    }

    function tick(t: number) {
      if (fish) {
        // the fish does not swim yet (commit 6): only the tail and fins move
        fish.ph += 0.04 + fish.sp * 0.05;
        fish.pf += 0.03 + fish.sp * 0.03;
      }
      render(t);
      raf = requestAnimationFrame(tick);
    }

    size();
    const observer = new ResizeObserver(size);
    observer.observe(hero);
    if (!reduce) raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}