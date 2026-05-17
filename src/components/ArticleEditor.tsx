import { useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import EditorJS from "@editorjs/editorjs";
import Header from "@editorjs/header";
import List from "@editorjs/list";
import Quote from "@editorjs/quote";
import Paragraph from "@editorjs/paragraph";
import Marker from "@editorjs/marker";
import Delimiter from "@editorjs/delimiter";
import type { EditorData } from "@/data/articles";

export interface ArticleEditorHandle {
  save: () => Promise<EditorData>;
}

interface Props {
  initialData?: EditorData;
  placeholder?: string;
}

const ArticleEditor = forwardRef<ArticleEditorHandle, Props>(
  ({ initialData, placeholder = "Начните писать..." }, ref) => {
    const holderRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<EditorJS | null>(null);

    useEffect(() => {
      if (!holderRef.current) return;
      if (editorRef.current) return;

      const editor = new EditorJS({
        holder: holderRef.current,
        placeholder,
        data: initialData && initialData.blocks?.length ? initialData : { blocks: [] },
        autofocus: false,
        tools: {
          header: {
            class: Header as never,
            config: {
              placeholder: "Заголовок",
              levels: [2, 3],
              defaultLevel: 2,
            },
            shortcut: "CMD+SHIFT+H",
          },
          paragraph: {
            class: Paragraph as never,
            inlineToolbar: true,
            config: { placeholder: "Напишите абзац..." },
          },
          list: {
            class: List as never,
            inlineToolbar: true,
          },
          quote: {
            class: Quote as never,
            inlineToolbar: true,
            config: { quotePlaceholder: "Цитата", captionPlaceholder: "Автор" },
          },
          marker: { class: Marker as never, shortcut: "CMD+SHIFT+M" },
          delimiter: Delimiter as never,
        },
        i18n: {
          messages: {
            ui: {
              blockTunes: {
                toggler: {
                  "Click to tune": "Настроить",
                  "or drag to move": "или перетащите",
                },
              },
              inlineToolbar: { converter: { "Convert to": "Преобразовать в" } },
              toolbar: { toolbox: { Add: "Добавить" } },
              popover: { Filter: "Поиск", "Nothing found": "Ничего не найдено" },
            },
            toolNames: {
              Text: "Текст",
              Heading: "Заголовок",
              List: "Список",
              Quote: "Цитата",
              Delimiter: "Разделитель",
              Marker: "Маркер",
              Bold: "Жирный",
              Italic: "Курсив",
            },
            tools: {
              quote: {
                "Align Left": "По левому краю",
                "Align Center": "По центру",
              },
              list: { Ordered: "Нумерованный", Unordered: "Маркированный" },
            },
            blockTunes: {
              delete: { Delete: "Удалить", "Click to delete": "Точно удалить?" },
              moveUp: { "Move up": "Переместить вверх" },
              moveDown: { "Move down": "Переместить вниз" },
            },
          },
        },
      });

      editorRef.current = editor;

      return () => {
        try {
          editorRef.current?.destroy?.();
        } catch {
          /* noop */
        }
        editorRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useImperativeHandle(ref, () => ({
      save: async () => {
        if (!editorRef.current) return { blocks: [] };
        const saved = await editorRef.current.save();
        return saved as EditorData;
      },
    }));

    return (
      <div className="article-editor bg-white rounded-2xl border border-[#E8E4DC] p-4 sm:p-6 min-h-[400px]">
        <div ref={holderRef} />
      </div>
    );
  }
);

ArticleEditor.displayName = "ArticleEditor";
export default ArticleEditor;
