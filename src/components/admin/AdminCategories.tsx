import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  useCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  CATEGORY_ICON_OPTIONS,
  CATEGORY_COLOR_OPTIONS,
  type Category,
} from "@/store/categoriesStore";
import { useArticles } from "@/store/articlesStore";

interface EditState {
  id?: string;
  name: string;
  color: string;
  icon: string;
  description: string;
}

const EMPTY: EditState = {
  name: "",
  color: CATEGORY_COLOR_OPTIONS[0],
  icon: CATEGORY_ICON_OPTIONS[0],
  description: "",
};

export default function AdminCategories() {
  const categories = useCategories();
  const articles = useArticles();
  const [editor, setEditor] = useState<EditState | null>(null);
  const [error, setError] = useState("");

  const countByCat = (name: string) => articles.filter((a) => a.category === name).length;

  const openCreate = () => {
    setError("");
    setEditor({ ...EMPTY });
  };

  const openEdit = (cat: Category) => {
    setError("");
    setEditor({
      id: cat.id,
      name: cat.name,
      color: cat.color,
      icon: cat.icon,
      description: cat.description || "",
    });
  };

  const handleSave = () => {
    if (!editor) return;
    if (!editor.name.trim()) {
      setError("Введите название категории");
      return;
    }
    if (editor.id) {
      updateCategory(editor.id, {
        name: editor.name.trim(),
        color: editor.color,
        icon: editor.icon,
        description: editor.description.trim() || undefined,
      });
      setEditor(null);
    } else {
      const result = addCategory({
        name: editor.name,
        color: editor.color,
        icon: editor.icon,
        description: editor.description,
      });
      if (!result) {
        setError("Категория с таким названием уже существует");
        return;
      }
      setEditor(null);
    }
  };

  const handleDelete = (cat: Category) => {
    const count = countByCat(cat.name);
    const msg = count > 0
      ? `В категории «${cat.name}» уже есть ${count} статей. Они останутся с прежним названием категории. Удалить?`
      : `Удалить категорию «${cat.name}»?`;
    if (confirm(msg)) deleteCategory(cat.id);
  };

  const move = (id: string, dir: -1 | 1) => {
    const ids = categories.map((c) => c.id);
    const idx = ids.indexOf(id);
    if (idx < 0) return;
    const next = idx + dir;
    if (next < 0 || next >= ids.length) return;
    [ids[idx], ids[next]] = [ids[next], ids[idx]];
    reorderCategories(ids);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-6">
        <div className="flex items-baseline gap-3">
          <h2 className="font-cormorant text-3xl font-semibold text-[#1A1A1A]">Категории</h2>
          <span className="text-sm text-[#9A9690]">{categories.length} разделов</span>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#1A1A1A] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#333] transition-colors"
        >
          <Icon name="Plus" size={14} />
          Добавить
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {categories.map((cat, i) => {
          const count = countByCat(cat.name);
          return (
            <div
              key={cat.id}
              className="rounded-2xl p-5 flex items-start gap-4 group transition-all hover:shadow-md"
              style={{ background: cat.color }}
            >
              <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
                <Icon name={cat.icon} fallback="Folder" size={18} className="text-[#1A1A1A]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">{cat.name}</p>
                <p className="text-xs text-[#4A4A48]">
                  {count} {count === 1 ? "статья" : "статей"}
                </p>
                {cat.description && (
                  <p className="text-xs text-[#4A4A48] mt-1 line-clamp-2 opacity-80">{cat.description}</p>
                )}
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => move(cat.id, -1)}
                  disabled={i === 0}
                  className="text-[#4A4A48] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  title="Вверх"
                >
                  <Icon name="ChevronUp" size={14} />
                </button>
                <button
                  onClick={() => move(cat.id, 1)}
                  disabled={i === categories.length - 1}
                  className="text-[#4A4A48] hover:text-[#1A1A1A] disabled:opacity-30 disabled:cursor-not-allowed p-1"
                  title="Вниз"
                >
                  <Icon name="ChevronDown" size={14} />
                </button>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => openEdit(cat)}
                  className="text-[#4A4A48] hover:text-[#1A1A1A] transition-colors p-1.5 rounded-lg hover:bg-white/40"
                  title="Редактировать"
                >
                  <Icon name="PenLine" size={14} />
                </button>
                <button
                  onClick={() => handleDelete(cat)}
                  className="text-[#4A4A48] hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-white/40"
                  title="Удалить"
                >
                  <Icon name="Trash2" size={14} />
                </button>
              </div>
            </div>
          );
        })}
        {categories.length === 0 && (
          <div className="col-span-2 text-center py-20 text-[#9A9690] bg-white border border-[#E8E4DC] rounded-2xl">
            <Icon name="FolderX" size={32} className="mx-auto mb-3 opacity-40" />
            <p className="font-cormorant text-xl text-[#4A4A48] mb-1">Категорий пока нет</p>
            <p className="text-sm">Добавьте первую категорию</p>
          </div>
        )}
      </div>

      {editor && (
        <CategoryModal
          state={editor}
          setState={setEditor}
          error={error}
          isEdit={!!editor.id}
          onCancel={() => { setEditor(null); setError(""); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function CategoryModal({
  state,
  setState,
  error,
  isEdit,
  onCancel,
  onSave,
}: {
  state: EditState;
  setState: (s: EditState) => void;
  error: string;
  isEdit: boolean;
  onCancel: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg border border-[#E8E4DC] overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E8E4DC] flex items-center justify-between">
          <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">
            {isEdit ? "Редактировать категорию" : "Новая категория"}
          </p>
          <button onClick={onCancel} className="text-[#9A9690] hover:text-[#1A1A1A]">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Preview */}
          <div
            className="rounded-2xl p-5 flex items-center gap-4"
            style={{ background: state.color }}
          >
            <div className="w-11 h-11 rounded-xl bg-white/60 flex items-center justify-center shrink-0">
              <Icon name={state.icon} fallback="Folder" size={18} className="text-[#1A1A1A]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-cormorant text-xl font-semibold text-[#1A1A1A]">
                {state.name || "Название"}
              </p>
              {state.description && (
                <p className="text-xs text-[#4A4A48] opacity-80 line-clamp-1">{state.description}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
              Название
            </label>
            <input
              value={state.name}
              onChange={(e) => setState({ ...state, name: e.target.value })}
              placeholder="Например, Архитектура"
              className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-1.5">
              Описание (необязательно)
            </label>
            <input
              value={state.description}
              onChange={(e) => setState({ ...state, description: e.target.value })}
              placeholder="О чём эта категория"
              className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2.5">
              Цвет
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  onClick={() => setState({ ...state, color: c })}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    state.color === c ? "ring-2 ring-offset-2 ring-[#1A1A1A] scale-110" : "hover:scale-105"
                  }`}
                  style={{ background: c }}
                />
              ))}
              <label className="w-8 h-8 rounded-lg border-2 border-dashed border-[#C8C4BC] flex items-center justify-center cursor-pointer hover:border-[#1A1A1A] transition-colors">
                <Icon name="Pipette" size={12} className="text-[#9A9690]" />
                <input
                  type="color"
                  value={state.color}
                  onChange={(e) => setState({ ...state, color: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2.5">
              Иконка
            </label>
            <div className="grid grid-cols-8 gap-2">
              {CATEGORY_ICON_OPTIONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setState({ ...state, icon: ic })}
                  className={`aspect-square rounded-lg flex items-center justify-center transition-all ${
                    state.icon === ic
                      ? "bg-[#1A1A1A] text-white"
                      : "bg-[#F5F3EF] text-[#4A4A48] hover:bg-[#E8E4DC]"
                  }`}
                  title={ic}
                >
                  <Icon name={ic} fallback="Folder" size={15} />
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-[#E8E4DC] flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="text-sm text-[#6A6660] hover:text-[#1A1A1A] px-4 py-2 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onSave}
            className="bg-[#1A1A1A] text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-[#333] transition-colors flex items-center gap-2"
          >
            <Icon name="Check" size={14} />
            {isEdit ? "Сохранить" : "Создать"}
          </button>
        </div>
      </div>
    </div>
  );
}
