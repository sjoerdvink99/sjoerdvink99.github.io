import Footer from "./Footer";
import Navbar from "./Navbar";
import { hasBlog } from "@/lib/blog";

export default function SubpageLayout({
  children,
  showNavbar = true,
}: {
  children: React.ReactNode;
  showNavbar?: boolean;
}) {
  const showBlog = hasBlog();

  return (
    <div className="flex flex-col min-h-screen w-full px-4 md:px-8 lg:w-3/4 xl:w-3/5 mx-auto">
      {showNavbar && <Navbar showBlog={showBlog} />}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
