export function Logo() {
  return (
    <a href="#/" className="flex shrink-0 items-center gap-2 sm:gap-2.5" aria-label="Akash Exam Hub home">
      <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-transparent sm:h-[76px] sm:w-[76px]">
        <img
          src="/notes-logo.png"
          alt=""
          width={272}
          height={232}
          decoding="async"
          className="block h-full w-full object-contain object-center"
        />
      </span>
      <span className="flex shrink-0 flex-col justify-center gap-1 leading-none">
        <span className="block text-[15px] font-extrabold tracking-tight text-slate-900">AKASH</span>
        <span className="block text-[11px] font-extrabold tracking-[0.18em] text-orange-600">EXAM HUB</span>
      </span>
    </a>
  );
}
