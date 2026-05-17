import { useEffect, useState } from "react";

export type InfoPageKey = "rules" | "copyright" | "about" | "help";

export interface InfoPage {
  key: InfoPageKey;
  icon: string;
  title: string;
  subtitle?: string;
  /** Markdown-like контент. Заголовки — ## , списки — *, абзацы — обычный текст */
  content: string;
  updatedAt: number;
}

const KEY = "info_pages_v1";
const EVENT = "info-pages-updated";

const DEFAULTS: Record<InfoPageKey, InfoPage> = {
  rules: {
    key: "rules",
    icon: "ScrollText",
    title: "Правила сообщества",
    subtitle: "Кодекс уважительного общения и публикаций",
    updatedAt: 0,
    content: `## 1. Общие принципы
Медиум — пространство для вдумчивых текстов и спокойных дискуссий. Мы ценим уважение, любопытство и честность.

## 2. Что запрещено
* Оскорбления, травля и язык вражды.
* Плагиат и публикация чужих текстов без согласия автора.
* Реклама без указания и спам в комментариях.
* Дезинформация и контент, нарушающий закон.

## 3. Публикации
Перед публикацией убедитесь, что текст вычитан, источники указаны, а изображения используются законно.

## 4. Жалобы
Если вы заметили нарушение — сообщите модераторам через раздел «Помощь». Каждое обращение рассматривается в течение 72 часов.`,
  },
  copyright: {
    key: "copyright",
    icon: "Copyright",
    title: "Копирайт и лицензии",
    subtitle: "Кому принадлежат тексты и как их можно использовать",
    updatedAt: 0,
    content: `Все материалы, опубликованные на Медиуме, принадлежат их авторам. Платформа выступает посредником и не претендует на права на тексты, иллюстрации и фотографии.

## Цитирование
Цитирование разрешено в объёме, оправданном целью цитирования, с обязательной активной ссылкой на оригинал и указанием имени автора.

## Перепубликация
Полная или частичная перепубликация без письменного согласия автора запрещена.

## Нарушение прав
Если вы считаете, что ваши права нарушены публикацией на платформе — напишите нам в раздел «Помощь».`,
  },
  about: {
    key: "about",
    icon: "Info",
    title: "О проекте",
    subtitle: "Журнал для тех, кто любит читать длинные тексты",
    updatedAt: 0,
    content: `Медиум — независимый онлайн-журнал и сообщество авторов. Мы собираем тексты о культуре, технологиях, обществе и человеке — без шумной ленты и кликбейта.

Здесь нет алгоритма, который решает, что вам читать. Только редакторы, авторы и читатели, у которых есть общее любопытство.

## Команда
Над проектом работает небольшая команда редакторов, дизайнеров и разработчиков. Мы открыты к новым авторам и предложениям сотрудничества.

## Контакты
По всем вопросам — пишите на hi@medium.local`,
  },
  help: {
    key: "help",
    icon: "LifeBuoy",
    title: "Помощь",
    subtitle: "Ответы на частые вопросы и связь с командой",
    updatedAt: 0,
    content: `## Как опубликовать статью?
Войдите в аккаунт, нажмите «Написать» в шапке и заполните форму. Перед публикацией материал проходит модерацию.

## Как стать автором?
Зарегистрируйтесь, заполните профиль и напишите редакции через эту страницу — мы рассмотрим вашу заявку.

## Где найти свои закладки?
Закладки доступны в меню профиля. Чтобы сохранить статью — нажмите иконку закладки на странице материала.

## Как написать другому пользователю?
Откройте профиль автора или статью и нажмите «Написать». Все диалоги сохраняются в разделе «Сообщения».

## Как пожаловаться на нарушение?
Напишите на help@medium.local с указанием ссылки на материал и сути нарушения.`,
  },
};

function load(): Record<InfoPageKey, InfoPage> {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<InfoPageKey, InfoPage>;
      // merge with defaults — добавим новые ключи если появятся
      return { ...DEFAULTS, ...parsed };
    }
  } catch (e) {
    console.warn(e);
  }
  return { ...DEFAULTS };
}

function save(items: Record<InfoPageKey, InfoPage>) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

let _items = load();

export const INFO_PAGE_KEYS: InfoPageKey[] = ["rules", "copyright", "about", "help"];

export function getInfoPages(): Record<InfoPageKey, InfoPage> {
  return _items;
}

export function getInfoPage(key: InfoPageKey): InfoPage {
  return _items[key];
}

export function updateInfoPage(key: InfoPageKey, patch: Partial<InfoPage>) {
  _items = {
    ..._items,
    [key]: { ..._items[key], ...patch, key, updatedAt: Date.now() },
  };
  save(_items);
}

export function resetInfoPage(key: InfoPageKey) {
  _items = { ..._items, [key]: { ...DEFAULTS[key], updatedAt: Date.now() } };
  save(_items);
}

export function useInfoPage(key: InfoPageKey): InfoPage {
  const [page, setPage] = useState<InfoPage>(_items[key]);
  useEffect(() => {
    const h = () => setPage(_items[key]);
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, [key]);
  return page;
}

export function useAllInfoPages(): Record<InfoPageKey, InfoPage> {
  const [all, setAll] = useState<Record<InfoPageKey, InfoPage>>(_items);
  useEffect(() => {
    const h = () => setAll({ ..._items });
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);
  return all;
}

/** Простой markdown → JSX-friendly блоки */
export interface RenderedBlock {
  type: "h2" | "p" | "ul";
  text?: string;
  items?: string[];
}

export function parseInfoContent(md: string): RenderedBlock[] {
  const lines = md.split("\n");
  const blocks: RenderedBlock[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushPara = () => {
    if (paragraph.length) {
      blocks.push({ type: "p", text: paragraph.join(" ").trim() });
      paragraph = [];
    }
  };
  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "ul", items: [...list] });
      list = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      flushList();
      continue;
    }
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push({ type: "h2", text: line.slice(3).trim() });
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2).trim());
    } else {
      flushList();
      paragraph.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}
