import Icon from "@/components/ui/icon";
import { updateSiteSettings, resetSiteSettings, type SiteSettings } from "@/store/siteSettingsStore";
import { AdminField, flashSaved } from "./AdminShared";

interface Props {
  site: SiteSettings;
  siteSaved: boolean;
  setSiteSaved: (v: boolean) => void;
}

export default function AdminSEO({ site, siteSaved, setSiteSaved }: Props) {
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="flex items-baseline justify-between mb-8">
        <div>
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">SEO и сайт</h2>
          <p className="text-sm text-[#9A9690] mt-1">Глобальные метаданные для всех страниц</p>
        </div>
        <button
          onClick={() => {
            if (confirm("Сбросить все настройки сайта к значениям по умолчанию?")) {
              resetSiteSettings();
            }
          }}
          className="text-xs text-[#9A9690] hover:text-red-500 transition-colors"
        >
          Сбросить
        </button>
      </div>

      <div className="space-y-6 bg-white border border-[#E8E4DC] rounded-2xl p-6">
        <AdminField
          label="Название сайта"
          value={site.siteName}
          onChange={(v) => { updateSiteSettings({ siteName: v }); flashSaved(setSiteSaved); }}
        />
        <AdminField
          label="Слоган"
          value={site.tagline}
          hint="Короткая фраза-описание. Показывается после названия в title главной"
          onChange={(v) => { updateSiteSettings({ tagline: v }); flashSaved(setSiteSaved); }}
        />
        <AdminField
          label="Описание сайта"
          value={site.description}
          hint="Meta-описание для главной. 150–160 символов"
          textarea
          max={160}
          onChange={(v) => { updateSiteSettings({ description: v }); flashSaved(setSiteSaved); }}
        />
        <AdminField
          label="Ключевые слова"
          value={site.keywords}
          hint="Через запятую"
          onChange={(v) => { updateSiteSettings({ keywords: v }); flashSaved(setSiteSaved); }}
        />
        <AdminField
          label="OG-изображение по умолчанию (URL)"
          value={site.ogImage}
          hint="Будет использоваться, если у статьи нет своего"
          onChange={(v) => { updateSiteSettings({ ogImage: v }); flashSaved(setSiteSaved); }}
        />
        <div className="grid grid-cols-2 gap-4">
          <AdminField
            label="Twitter @handle"
            value={site.twitterHandle}
            onChange={(v) => { updateSiteSettings({ twitterHandle: v }); flashSaved(setSiteSaved); }}
            placeholder="@medium"
          />
          <AdminField
            label="Язык"
            value={site.language}
            onChange={(v) => { updateSiteSettings({ language: v }); flashSaved(setSiteSaved); }}
            placeholder="ru"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <AdminField
            label="Robots"
            value={site.robots}
            hint="Например: index, follow"
            onChange={(v) => { updateSiteSettings({ robots: v }); flashSaved(setSiteSaved); }}
          />
          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
              Цвет темы
            </label>
            <div className="flex items-center gap-3 border-b border-[#E8E4DC] pb-2">
              <input
                type="color"
                value={site.themeColor}
                onChange={(e) => { updateSiteSettings({ themeColor: e.target.value }); flashSaved(setSiteSaved); }}
                className="w-10 h-7 border border-[#E8E4DC] rounded cursor-pointer"
              />
              <input
                value={site.themeColor}
                onChange={(e) => { updateSiteSettings({ themeColor: e.target.value }); flashSaved(setSiteSaved); }}
                className="flex-1 text-sm text-[#1A1A1A] bg-transparent outline-none"
              />
            </div>
            <p className="text-[11px] text-[#B8B4AC] mt-1">Цвет адресной строки в мобильных браузерах</p>
          </div>
        </div>

        {siteSaved && (
          <div className="text-xs text-[#3a7c2a] flex items-center gap-2 animate-fade-in">
            <Icon name="Check" size={13} />
            Сохранено
          </div>
        )}
      </div>

      {/* Preview */}
      <div className="mt-8">
        <p className="text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-3">Превью в выдаче</p>
        <div className="border border-[#E8E4DC] rounded-2xl p-5 bg-white">
          <p className="text-xs text-[#3a7c2a] mb-1">https://medium.example/</p>
          <p className="text-[18px] text-[#1a0dab] leading-snug mb-1">
            {site.siteName} · {site.tagline}
          </p>
          <p className="text-sm text-[#4d5156] line-clamp-3">{site.description}</p>
        </div>
      </div>
    </div>
  );
}
