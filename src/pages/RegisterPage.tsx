import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { registerUser } from "@/store/authStore";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = registerUser({ email, password, name });
      if (result.ok) {
        navigate("/");
      } else {
        setError(result.error);
      }
      setLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] font-golos flex flex-col">
      <header className="px-6 h-16 flex items-center">
        <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[#1A1A1A] rounded-sm flex items-center justify-center transition-transform group-hover:scale-105">
            <span className="text-white font-cormorant font-semibold text-lg leading-none select-none">М</span>
          </div>
          <span className="font-cormorant font-semibold text-xl text-[#1A1A1A] tracking-tight">Медиум</span>
        </button>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 pb-20">
        <div className="w-full max-w-sm animate-fade-in">
          <h1 className="font-cormorant text-4xl font-semibold text-[#1A1A1A] mb-2">Создайте аккаунт</h1>
          <p className="text-sm text-[#9A9690] mb-10">Бесплатно. Без подписок.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                Имя
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как вас зовут?"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#7A7670] uppercase tracking-widest mb-2">
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                className="w-full text-sm text-[#1A1A1A] bg-transparent border-b border-[#E8E4DC] pb-2 outline-none focus:border-[#1A1A1A] transition-colors placeholder:text-[#C8C4BC]"
                autoComplete="new-password"
                minLength={6}
                required
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 border border-red-100 px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1A1A1A] text-white text-sm font-medium px-5 py-3 rounded-full hover:bg-[#333] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Icon name="Loader" size={14} className="animate-spin" />}
              Создать аккаунт
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#E8E4DC] text-sm text-center text-[#9A9690]">
            Уже есть аккаунт?{" "}
            <Link to="/login" className="text-[#1A1A1A] underline underline-offset-2 hover:no-underline">
              Войти
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
