import Header from "@/components/Header";
import Navbar from "@/components/Navbar";
import AboutSection from "@/components/AboutSection";
import PublicationList from "@/components/PublicationList";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-screen w-full flex-col px-4 md:px-8 lg:w-3/4 xl:w-3/5">
      <Header />
      <Navbar />
      <main className="flex-1">
        <AboutSection />
        <PublicationList />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
