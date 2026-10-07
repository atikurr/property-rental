"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  User,
  ShieldCheck,
} from "lucide-react";

import { authClient } from "@/lib/auth-client";

export default function TenantDashboard() {
  const router = useRouter();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } =
          await authClient.getSession();

        if (error || !data?.user) {
          router.replace("/login");
          return;
        }

        setUser(data.user);
      } catch (error) {
        console.error("Session check failed:", error);
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    try {
      await authClient.signOut();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0b0b0b] text-white">
        Checking your session...
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0b0b0b] px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">
              Tenant Dashboard
            </p>

            <h1 className="mt-1 text-3xl font-semibold">
              Welcome, {user.name}
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-[#151515] px-4 py-2.5 text-sm text-zinc-300 transition hover:border-red-500/30 hover:text-red-400"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">

          <InfoCard
            icon={<User size={20} />}
            title="Name"
            value={user.name || "N/A"}
          />

          <InfoCard
            icon={<ShieldCheck size={20} />}
            title="Role"
            value={user.role || "tenant"}
          />

          <InfoCard
            icon={<User size={20} />}
            title="Email"
            value={user.email || "N/A"}
          />

        </div>
      </div>
    </main>
  );
}

function InfoCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#151515] p-5">
      <div className="mb-4 text-zinc-500">
        {icon}
      </div>

      <p className="text-xs text-zinc-500">
        {title}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}