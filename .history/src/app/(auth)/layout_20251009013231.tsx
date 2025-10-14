export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-md card">
        {children}
      </div>
    </div>
  );
}


