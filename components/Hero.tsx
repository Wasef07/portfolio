export default function Hero() {
  return (
    <header
      id="top"
      className="hero-bg relative flex h-svh min-h-[640px] touch-pan-y items-center justify-center overflow-hidden text-center"
    >
      {/* Commit 5 adds the koi canvas here */}

      <div className="hero-glow pointer-events-none relative z-10 max-w-[1100px] px-6 pt-20">
        <h1
          className="rise text-[clamp(46px,8.6vw,118px)] leading-[1.02] tracking-[-0.015em] text-[#F6FBFF] [text-shadow:0_2px_40px_rgba(3,14,26,0.6)]"
          style={{ animationDelay: ".05s" }}
        >
          Sk Wasef Mostafa
        </h1>

        <p
          className="role-line rise mt-[34px] flex items-center justify-center gap-[clamp(14px,2.2vw,28px)] font-display text-[clamp(12px,1.45vw,17px)] uppercase leading-none tracking-[.42em] text-[#CFE6F4]"
          style={{ animationDelay: ".35s" }}
        >
          <span className="-mr-[.42em]">Software developer</span>
        </p>

        <div
          className="rise mt-[46px] flex flex-wrap justify-center gap-3.5"
          style={{ animationDelay: ".65s" }}
        >
          <a
            href="#projects"
            className="pointer-events-auto inline-flex min-h-[46px] items-center border border-ink bg-ink px-[30px] text-[12.5px] uppercase leading-none tracking-[.16em] text-c0 transition-colors hover:border-[#FF7A2F] hover:bg-[#FF7A2F]"
          >
            See my work
          </a>
          <a
            href="#contact"
            className="pointer-events-auto inline-flex min-h-[46px] items-center border border-[rgba(234,244,250,.55)] px-[30px] text-[12.5px] uppercase leading-none tracking-[.16em] transition-colors hover:border-[#FF7A2F] hover:bg-[#FF7A2F] hover:text-c0"
          >
            Say hi
          </a>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-7 flex flex-col items-center gap-1 px-5 text-[12.5px] text-ink2 sm:flex-row sm:justify-between sm:px-10">
        <span>Click to feed the koi · move to startle them</span>
        <span>Scroll to dive</span>
      </div>
    </header>
  );
}