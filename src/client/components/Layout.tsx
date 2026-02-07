import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  title: string;
  subtitle?: string;
  currentPath?: string;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
  title,
  subtitle,
  currentPath,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-white text-slate-900">
      <Navbar currentPath={currentPath} />

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6">
        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 text-sm text-slate-600 sm:text-base">{subtitle}</p>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          {children}
        </section>
      </main>
    </div>
  );
};

export default Layout;
