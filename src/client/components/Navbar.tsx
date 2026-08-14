import React from "react";

interface NavItem {
  href: string;
  label: string;
}

interface NavbarProps {
  currentPath?: string;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/ahmet", label: "Todos" },
];

const isActivePath = (
  currentPath: string | undefined,
  href: string,
): boolean => {
  if (!currentPath) {
    return false;
  }

  if (href === "/") {
    return currentPath === "/";
  }

  return currentPath === href || currentPath.startsWith(`${href}/`);
};

const Navbar: React.FC<NavbarProps> = ({ currentPath }) => {
  return (
    <header className="border-b border-slate-200 bg-white/85 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <a
          className="text-lg font-semibold tracking-tight text-slate-900"
          href="/"
        >
          React SSR
        </a>

        <ul className="flex items-center gap-2 sm:gap-3">
          {navItems.map((item) => {
            const active = isActivePath(currentPath, item.href);

            return (
              <li key={item.href}>
                <a
                  className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                  href={item.href}
                >
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};

export default Navbar;
