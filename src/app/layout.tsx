import "./globals.css";
import LayoutSidebar from "@/components/LayoutSidebar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex h-screen">
        <LayoutSidebar />
        <main className="flex-1 p-6 overflow-y-auto bg-gray-100 text-gray-900">
          <div className="bg-white rounded-lg shadow p-6 text-black">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
