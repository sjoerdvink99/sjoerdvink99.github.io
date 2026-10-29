import Footer from "./Footer";
import Navbar from "./Navbar";

export default function SubpageLayout({
  children,
  showNavbar = true,
}: {
  children: React.ReactNode;
  showNavbar?: boolean;
}) {
  return (
    <div className="mx-auto flex min-h-screen w-full flex-col px-4 md:px-8 lg:w-3/4 xl:w-3/5">
      {showNavbar && <Navbar />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
