import Footer from "./Footer";
import Navbar from "./Navbar";
import { hasBlog } from "@/lib/blog";

export default function SubpageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const showBlog = hasBlog();

  return (
    <div className="flex flex-col min-h-screen w-full px-4 md:px-8 lg:w-3/4 xl:w-2/4 mx-auto">
      <Navbar showBlog={showBlog} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
