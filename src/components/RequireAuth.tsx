import { Navigate, useLocation } from "react-router-dom";
import { useAuth, type Role } from "@/store/authStore";

interface Props {
  children: React.ReactNode;
  roles?: Role[];
}

export default function RequireAuth({ children, roles }: Props) {
  const user = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] font-golos flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <p className="font-cormorant text-3xl text-[#1A1A1A] mb-2">Доступ ограничен</p>
          <p className="text-sm text-[#9A9690] mb-6">
            Этот раздел доступен только для ролей: {roles.join(", ")}.
          </p>
          <a href="/" className="text-sm text-[#1A1A1A] border border-[#E8E4DC] px-5 py-2 rounded-full hover:border-[#C8C4BC] transition-colors inline-block">
            На главную
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
