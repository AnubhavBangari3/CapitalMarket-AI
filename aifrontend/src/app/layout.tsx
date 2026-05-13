import "./globals.css";
import Sidebar from "../components/layout/Sidebar";

export const metadata = {
  title: "Capital Market AI",
  description: "AI Settlement Failure Resolution System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-slate-100 flex">
          <Sidebar />

          <section className="flex-1 p-6 md:p-10">
            {children}
          </section>
        </main>
      </body>
    </html>
  );
}