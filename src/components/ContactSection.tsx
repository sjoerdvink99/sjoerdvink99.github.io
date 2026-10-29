import Image from "next/image";

const CHANNELS = [
  {
    href: "mailto:sjoerdvink@icloud.com",
    icon: "/images/icons/mail.svg",
    label: "Email",
    text: "sjoerdvink@icloud.com",
  },
  {
    href: "https://github.com/sjoerdvink99",
    icon: "/images/icons/github.svg",
    label: "GitHub",
    text: "github.com/sjoerdvink99",
  },
  {
    href: "https://www.linkedin.com/in/sjoerdvink/",
    icon: "/images/icons/linkedin.svg",
    label: "LinkedIn",
    text: "linkedin.com/in/sjoerdvink",
  },
];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="scroll-mt-20 border-b-2 border-gray-200 py-10"
    >
      <h2 className="mb-6 text-2xl font-light">Contact</h2>
      <p className="leading-relaxed">
        I&apos;m always happy to connect. Feel free to reach out by email or
        find me on the platforms below.
      </p>
      <ul className="mt-4 space-y-3">
        {CHANNELS.map((channel) => (
          <li key={channel.label} className="flex items-center gap-3">
            <Image
              src={channel.icon}
              width={20}
              height={20}
              alt={channel.label}
              className="h-5 w-5 shrink-0"
            />
            <a
              href={channel.href}
              {...(channel.href.startsWith("http")
                ? { target: "_blank", rel: "noreferrer" }
                : {})}
              className="link break-all"
            >
              {channel.text}
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
