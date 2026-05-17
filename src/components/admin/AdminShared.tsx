import Icon from "@/components/ui/icon";

export function flashSaved(setter: (v: boolean) => void) {
  setter(true);
  setTimeout(() => setter(false), 1500);
}

export function AdminField({
  label,
  value,
  onChange,
  hint,
  placeholder,
  textarea,
  max,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
  placeholder?: string;
  textarea?: boolean;
  max?: number;
}) {
  const overLimit = max ? value.length > max : false;
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{label}</label>
        {max && (
          <span className={`text-[10px] ${overLimit ? "text-red-400" : "text-[#B8B4AC]"}`}>
            {value.length} / {max}
          </span>
        )}
      </div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC] resize-none leading-relaxed"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
        />
      )}
      {hint && <p className="text-[11px] text-[#B8B4AC] mt-1">{hint}</p>}
    </div>
  );
}

export function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border border-[#E8E4DC] rounded-2xl p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{label}</span>
        <Icon name={icon} size={16} className="text-[#C8C4BC]" />
      </div>
      <p className="font-cormorant text-4xl font-semibold text-[#1A1A1A]">{value}</p>
    </div>
  );
}

export function ShortcutCard({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="text-left bg-white border border-[#E8E4DC] rounded-2xl p-6 hover:border-[#1A1A1A] hover:shadow-sm transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-xl bg-[#F5F3EF] flex items-center justify-center group-hover:bg-[#1A1A1A] transition-colors">
          <Icon name={icon} size={18} className="text-[#4A4A48] group-hover:text-white transition-colors" />
        </div>
        <div className="flex-1">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A] mb-1">{title}</p>
          <p className="text-sm text-[#7A7670]">{description}</p>
        </div>
        <Icon name="ArrowRight" size={16} className="text-[#C8C4BC] group-hover:text-[#1A1A1A] transition-colors mt-3" />
      </div>
    </button>
  );
}
