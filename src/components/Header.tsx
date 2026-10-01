import Image from "next/image";

export default function Header() {
  return (
    <section className="py-6 md:py-10 flex flex-col sm:flex-row items-center sm:items-start">
      <Image
        src="/images/sjoerd.jpg"
        width={160}
        height={160}
        className="h-32 md:h-40 w-auto mb-4 sm:mb-0 object-cover"
        alt="Sjoerd Vink"
        priority
      />
      <div className="flex flex-col sm:ml-4 text-center sm:text-left">
        <h1 className="text-3xl md:text-4xl font-light">Sjoerd Vink</h1>
        <span className="font-light">
          PhD Student in CS at Utrecht University & Tufts University
        </span>
        <span className="font-light">sjoerdvink@icloud.com</span>
        <div className="mt-3 flex justify-center sm:justify-start">
          <a
            href="https://github.com/sjoerdvink99"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/images/icons/github.svg"
              width={24}
              height={24}
              className="mr-1 hover:-translate-y-1 transition-all duration-150 ease-in-out"
              alt="GitHub profile"
            />
          </a>
          <a
            href="https://www.linkedin.com/in/sjoerdvink/"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/images/icons/linkedin.svg"
              width={24}
              height={24}
              className="mr-1 hover:-translate-y-1 transition-all duration-150 ease-in-out"
              alt="LinkedIn profile"
            />
          </a>
          <a
            href="https://sjoerdvink.medium.com/"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/images/icons/medium.svg"
              width={24}
              height={24}
              className="mr-1 hover:-translate-y-1 transition-all duration-150 ease-in-out"
              alt="Medium"
            />
          </a>
          <a
            href="mailto:sjoerdvink@icloud.com"
            target="_blank"
            rel="noreferrer"
          >
            <Image
              src="/images/icons/mail.svg"
              width={24}
              height={24}
              className="hover:-translate-y-1 transition-all duration-150 ease-in-out"
              alt="Email"
            />
          </a>
        </div>
        {/* Hidden for now.
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center border border-gray-300 px-3 py-1.5 text-sm font-light leading-none transition-colors hover:border-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Resume
          </a>
          <a
            href="/research-statement.pdf"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center border border-gray-300 px-3 py-1.5 text-sm font-light leading-none transition-colors hover:border-gray-900 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2"
          >
            Research Statement
          </a>
        </div>
        */}
      </div>
    </section>
  );
}
