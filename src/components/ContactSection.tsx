import Image from "next/image";

export default function ContactSection() {
  return (
    <section id="contact" className="py-10 border-b-2">
      <h2 className="text-2xl mb-6">Contact</h2>

      <div className="space-y-4 text-gray-700 text-base">
        <p>
          I&apos;m always happy to connect. Feel free to reach out via email or
          follow me on my other platforms:
        </p>

        <ul className="space-y-3">
          <li className="flex items-center space-x-3">
            <Image src="/images/icons/mail.svg" width={20} height={20} alt="email" className="h-5 w-5 flex-shrink-0" />
            <a href="mailto:sjoerdvink@icloud.com" className="hover:underline text-blue-600 break-all">
              sjoerdvink@icloud.com
            </a>
          </li>
          <li className="flex items-center space-x-3">
            <Image src="/images/icons/github.svg" width={20} height={20} alt="GitHub" className="h-5 w-5 flex-shrink-0" />
            <a href="https://github.com/sjoerdvink99" target="_blank" rel="noreferrer" className="hover:underline text-blue-600 break-all">
              github.com/sjoerdvink99
            </a>
          </li>
          <li className="flex items-center space-x-3">
            <Image src="/images/icons/linkedin.svg" width={20} height={20} alt="LinkedIn" className="h-5 w-5 flex-shrink-0" />
            <a href="https://www.linkedin.com/in/sjoerdvink/" target="_blank" rel="noreferrer" className="hover:underline text-blue-600 break-all">
              linkedin.com/in/sjoerdvink
            </a>
          </li>
          <li className="flex items-center space-x-3">
            <Image src="/images/icons/medium.svg" width={20} height={20} alt="Medium" className="h-5 w-5 flex-shrink-0" />
            <a href="https://sjoerdvink.medium.com/" target="_blank" rel="noreferrer" className="hover:underline text-blue-600 break-all">
              sjoerdvink.medium.com
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}
