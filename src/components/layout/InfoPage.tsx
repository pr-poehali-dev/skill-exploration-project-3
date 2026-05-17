import Icon from "@/components/ui/icon";

interface Props {
  icon: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function InfoPage({ icon, title, subtitle, children }: Props) {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-md bg-[#EDE9E2] flex items-center justify-center">
          <Icon name={icon} size={18} className="text-[#1A1A1A]" />
        </div>
        <h1 className="font-cormorant text-4xl font-semibold text-[#1A1A1A] tracking-tight">
          {title}
        </h1>
      </div>
      {subtitle && (
        <p className="text-[#7A7670] text-base mb-8 ml-13 pl-1">{subtitle}</p>
      )}
      <div className="prose-content text-[#2A2A28] text-[15px] leading-[1.75] space-y-5">
        {children}
      </div>
    </main>
  );
}
