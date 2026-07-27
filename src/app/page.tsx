import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import NewsSection from "@/components/NewsSection";
import PublicationList from "@/components/PublicationList";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { getAllPosts, BLOG_ENABLED } from "@/lib/blog";

export default function HomePage() {
  const showBlog = BLOG_ENABLED && getAllPosts().length > 0;

  return (
    <div className="flex flex-col min-h-screen w-full px-4 md:px-8 lg:w-3/4 xl:w-2/4 mx-auto">
      <Header />
      <Navbar showBlog={showBlog} />
      <AboutSection />
      <NewsSection />
      <PublicationList />
      <ContactSection />
      <Footer />
    </div>
  );
}
