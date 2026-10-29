import Image from "next/image";

const SOCIALS = [
  {
    href: "https://github.com/sjoerdvink99",
    icon: "/images/icons/github.svg",
    label: "GitHub",
  },
  {
    href: "https://www.linkedin.com/in/sjoerdvink/",
    icon: "/images/icons/linkedin.svg",
    label: "LinkedIn",
  },
  {
    href: "mailto:sjoerdvink@icloud.com",
    icon: "/images/icons/mail.svg",
    label: "Email",
  },
];

const BUTTONS = [
  { href: "/images/resume.pdf", label: "CV" },
  {
    href: "https://scholar.google.com/citations?user=kHXpSd0AAAAJ&hl=en",
    label: "Google Scholar",
  },
];

export default function Header() {
  return (
    <header className="flex flex-col items-center gap-4 py-8 sm:flex-row sm:items-center sm:gap-8 md:py-12">
      <Image
        src="/images/sjoerd.jpg"
        width={160}
        height={160}
        className="h-32 w-32 shrink-0 rounded-full object-cover md:h-40 md:w-40"
        alt="Portrait of Sjoerd Vink"
        priority
      />
      <div className="flex flex-col text-center sm:text-left">
        <h1 className="text-3xl font-light tracking-tight md:text-4xl">
          Sjoerd Vink{" "}
          <span className="align-middle text-base font-light text-gray-500">
            /ʃuːrt/
          </span>
        </h1>
        <p className="mt-1 font-light text-gray-600">
          PhD Candidate in Computer Science
          <br />
          Utrecht University &amp; Tufts University
          <br />
          sjoerdvink@icloud.com
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
          {BUTTONS.map((button) => (
            <a
              key={button.label}
              href={button.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center border border-gray-300 px-3 py-1.5 text-sm font-light leading-none transition-colors hover:border-gray-900 hover:bg-gray-50"
            >
              {button.label}
            </a>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-2 sm:justify-start">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              {...(social.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className="opacity-90 transition hover:-translate-y-0.5 hover:opacity-100"
            >
              <Image src={social.icon} width={24} height={24} alt="" />
            </a>
          ))}
        </div>
      </div>
    </header>
  );
}
