export function AuthFooter() {
  return (
    <footer className="pointer-events-none fixed bottom-6 hidden w-full justify-center px-4 text-center opacity-40 md:flex">
      <p className="font-auth-label text-auth-label-sm text-auth-on-surface-variant">
        © {new Date().getFullYear()} NextLevel Knowledge. Intelligence Platform.
      </p>
    </footer>
  );
}
