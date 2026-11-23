import { Reveal } from '@/components/ui/Reveal';
import { ToolIllustration } from '@/components/home/ToolIllustration';
import { TOOLS } from '@/lib/tools';

export function ToolsShowcase() {
  return (
    <section className="bg-[#faf9f6] py-16 lg:py-20" aria-labelledby="tools-heading">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 id="tools-heading" className="text-center text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Unlimited access to all our tools
          </h2>
        </Reveal>

        <div className="mx-auto mt-9 grid max-w-3xl grid-cols-3 gap-3 sm:gap-5 lg:gap-6">
          {TOOLS.map((tool, index) => (
            <Reveal key={tool.slug} delay={Math.min(index % 3, 2) * 80}>
              <a
                href={`#/tools/${tool.slug}`}
                className="group flex h-full min-w-0 flex-col rounded-2xl bg-white p-2.5 shadow-[0_7px_18px_-10px_rgba(15,23,42,0.3)] ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:shadow-[0_16px_30px_-12px_rgba(15,23,42,0.28)] sm:p-3.5"
              >
                <h3 className="flex min-h-[2.5rem] items-center justify-center break-words px-1 text-center text-[10px] font-bold leading-tight text-slate-900 sm:min-h-[2.75rem] sm:text-sm">
                  {tool.title}
                </h3>
                <div className="mt-2 sm:mt-3">
                  <ToolIllustration tool={tool} />
                </div>
                {tool.unavailableReason && (
                  <span className="mt-2 text-center text-[8px] font-bold uppercase leading-tight tracking-wide text-slate-500 sm:text-[10px]">
                    Not yet available
                  </span>
                )}
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
