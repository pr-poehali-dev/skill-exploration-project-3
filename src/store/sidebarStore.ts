import { useEffect, useState } from "react";

const KEY = "app_sidebar_collapsed";
const EVENT = "sidebar-updated";

function load(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw !== null) return raw === "1";
  } catch (e) {
    console.warn(e);
  }
  return false;
}

let _collapsed = load();

export function getSidebarCollapsed(): boolean {
  return _collapsed;
}

export function setSidebarCollapsed(v: boolean) {
  _collapsed = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch (e) {
    console.warn(e);
  }
  window.dispatchEvent(new Event(EVENT));
}

export function toggleSidebar() {
  setSidebarCollapsed(!_collapsed);
}

export function useSidebarCollapsed(): [boolean, (v: boolean) => void] {
  const [v, setV] = useState<boolean>(_collapsed);
  useEffect(() => {
    const h = () => setV(_collapsed);
    window.addEventListener(EVENT, h);
    return () => window.removeEventListener(EVENT, h);
  }, []);
  return [v, setSidebarCollapsed];
}
