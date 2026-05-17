import Icon from "@/components/ui/icon";
import {
  useTheme,
  updateTheme,
  resetTheme,
  FONT_OPTIONS,
  type ThemeMode,
} from "@/store/themeStore";

const BG_PRESETS_LIGHT = ["#FAFAF8", "#FFFFFF", "#F5F0E8", "#F7F4F0", "#EFF1EE", "#F0F4F7"];
const BG_PRESETS_DARK = ["#0F0F0E", "#121212", "#161410", "#0E1216", "#101410", "#181615"];
const ACCENT_PRESETS = [
  "#1A1A1A", "#3A3A3A", "#5C4B3A", "#7C5E3E", "#3E5E5C", "#4A5C3E",
  "#5C3E4A", "#1A3A5C", "#3A1A1A", "#4A2E5C", "#5C2E2E", "#2E5C4A",
];

export default function AdminTheme() {
  const theme = useTheme();
  const isDark = theme.mode === "dark";

  const setMode = (mode: ThemeMode) => updateTheme({ mode });

  return (
    <div className="animate-fade-in max-w-3xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Тема и кастомизация</h2>
          <p className="text-sm text-[#9A9690] mt-1">Меняется мгновенно для всего сайта</p>
        </div>
        <button
          onClick={() => {
            if (confirm("Сбросить тему к значениям по умолчанию?")) resetTheme();
          }}
          className="text-xs text-[#9A9690] hover:text-red-500 transition-colors"
        >
          Сбросить
        </button>
      </div>

      {/* Mode switcher */}
      <Section title="Режим" hint="Светлая или тёмная тема">
        <div className="grid grid-cols-2 gap-3">
          <ModeCard
            active={!isDark}
            onClick={() => setMode("light")}
            label="Светлая"
            icon="Sun"
            bg={theme.lightBg}
            text={theme.lightText}
          />
          <ModeCard
            active={isDark}
            onClick={() => setMode("dark")}
            label="Тёмная"
            icon="Moon"
            bg={theme.darkBg}
            text={theme.darkText}
          />
        </div>
      </Section>

      {/* Background */}
      <Section
        title="Цвет фона"
        hint={isDark ? "Активна тёмная тема — меняется тёмный фон" : "Активна светлая тема — меняется светлый фон"}
      >
        <ColorRow
          presets={isDark ? BG_PRESETS_DARK : BG_PRESETS_LIGHT}
          value={isDark ? theme.darkBg : theme.lightBg}
          onChange={(v) => updateTheme(isDark ? { darkBg: v } : { lightBg: v })}
        />
        <SubColorPair
          label1="Поверхность (карточки)"
          value1={isDark ? theme.darkSurface : theme.lightSurface}
          on1={(v) => updateTheme(isDark ? { darkSurface: v } : { lightSurface: v })}
          label2="Текст"
          value2={isDark ? theme.darkText : theme.lightText}
          on2={(v) => updateTheme(isDark ? { darkText: v } : { lightText: v })}
        />
        <SubColorPair
          label1="Второстепенный текст"
          value1={isDark ? theme.darkMuted : theme.lightMuted}
          on1={(v) => updateTheme(isDark ? { darkMuted: v } : { lightMuted: v })}
          label2="Граница"
          value2={isDark ? theme.darkBorder : theme.lightBorder}
          on2={(v) => updateTheme(isDark ? { darkBorder: v } : { lightBorder: v })}
        />
      </Section>

      {/* Accent */}
      <Section title="Акцентный цвет" hint="Используется для кнопок и активных элементов">
        <ColorRow
          presets={ACCENT_PRESETS}
          value={theme.accent}
          onChange={(accent) => updateTheme({ accent })}
        />
      </Section>

      {/* Font */}
      <Section title="Шрифты" hint="Заголовки + основной текст">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => updateTheme({ fontId: f.id })}
              className={`text-left p-4 rounded-2xl border transition-all ${
                theme.fontId === f.id
                  ? "border-[#1A1A1A] bg-[#FAFAF8]"
                  : "border-[#E8E4DC] bg-white hover:border-[#C8C4BC]"
              }`}
            >
              <p
                className="text-2xl mb-1 text-[#1A1A1A] leading-tight"
                style={{ fontFamily: `'${f.display}', serif` }}
              >
                {f.display}
              </p>
              <p className="text-sm text-[#6A6660]" style={{ fontFamily: `'${f.body}', sans-serif` }}>
                Aa — {f.body}
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[#9A9690] mt-2">{f.name}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* Radius */}
      <Section title="Скругление углов" hint={`${theme.radius}px`}>
        <input
          type="range"
          min={0}
          max={28}
          step={1}
          value={theme.radius}
          onChange={(e) => updateTheme({ radius: Number(e.target.value) })}
          className="w-full accent-[#1A1A1A]"
        />
        <div className="flex items-center gap-3 mt-3">
          {[0, 8, 16, 24].map((r) => (
            <div
              key={r}
              className="w-12 h-12 bg-[#F5F3EF] border border-[#E8E4DC]"
              style={{ borderRadius: r }}
              title={`${r}px`}
            />
          ))}
        </div>
      </Section>

      {/* Live preview */}
      <Section title="Превью">
        <div
          className="p-6 rounded-2xl border"
          style={{
            background: isDark ? theme.darkBg : theme.lightBg,
            color: isDark ? theme.darkText : theme.lightText,
            borderColor: isDark ? theme.darkBorder : theme.lightBorder,
            borderRadius: theme.radius,
          }}
        >
          <p
            className="text-3xl font-semibold mb-2 leading-tight"
            style={{ fontFamily: `'${FONT_OPTIONS.find((f) => f.id === theme.fontId)?.display}', serif` }}
          >
            Тишина — главный материал
          </p>
          <p
            className="text-sm mb-4 opacity-80"
            style={{ fontFamily: `'${FONT_OPTIONS.find((f) => f.id === theme.fontId)?.body}', sans-serif` }}
          >
            Так выглядит абзац основного текста статьи в выбранной теме.
          </p>
          <button
            className="text-sm font-medium px-5 py-2 rounded-full text-white"
            style={{ background: theme.accent, borderRadius: theme.radius }}
          >
            Кнопка
          </button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="mb-10">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-medium text-[#7A7670] uppercase tracking-widest">{title}</p>
        {hint && <span className="text-[11px] text-[#B8B4AC]">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ModeCard({
  active,
  onClick,
  label,
  icon,
  bg,
  text,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  icon: string;
  bg: string;
  text: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-5 rounded-2xl border-2 flex items-center gap-4 transition-all ${
        active ? "border-[#1A1A1A]" : "border-[#E8E4DC] hover:border-[#C8C4BC]"
      }`}
      style={{ background: bg, color: text }}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: "rgba(127,127,127,0.15)" }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="flex-1 text-left">
        <p className="text-base font-medium">{label}</p>
        <p className="text-xs opacity-60">тема</p>
      </div>
      {active && <Icon name="Check" size={16} />}
    </button>
  );
}

function ColorRow({
  presets,
  value,
  onChange,
}: {
  presets: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {presets.map((c) => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className={`w-9 h-9 rounded-lg transition-all ${
            value.toLowerCase() === c.toLowerCase()
              ? "ring-2 ring-offset-2 ring-[#1A1A1A] scale-110"
              : "hover:scale-105 border border-[#E8E4DC]"
          }`}
          style={{ background: c }}
          title={c}
        />
      ))}
      <label className="w-9 h-9 rounded-lg border-2 border-dashed border-[#C8C4BC] flex items-center justify-center cursor-pointer hover:border-[#1A1A1A] transition-colors">
        <Icon name="Pipette" size={13} className="text-[#9A9690]" />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </label>
      <span className="text-xs text-[#9A9690] ml-2 font-mono">{value.toUpperCase()}</span>
    </div>
  );
}

function SubColorPair({
  label1,
  value1,
  on1,
  label2,
  value2,
  on2,
}: {
  label1: string;
  value1: string;
  on1: (v: string) => void;
  label2: string;
  value2: string;
  on2: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      <SubColorField label={label1} value={value1} onChange={on1} />
      <SubColorField label={label2} value={value2} onChange={on2} />
    </div>
  );
}

function SubColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[11px] text-[#7A7670] uppercase tracking-widest mb-1.5">{label}</p>
      <div className="flex items-center gap-2 border-b border-[#E8E4DC] pb-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-7 border border-[#E8E4DC] rounded cursor-pointer"
        />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 text-sm text-[#1A1A1A] bg-transparent outline-none font-mono"
        />
      </div>
    </div>
  );
}
