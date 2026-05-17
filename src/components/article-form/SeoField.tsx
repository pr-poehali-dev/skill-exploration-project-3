export default function SeoField({
  label,
  hint,
  value,
  onChange,
  placeholder,
  max,
  textarea,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  max?: number;
  textarea?: boolean;
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
