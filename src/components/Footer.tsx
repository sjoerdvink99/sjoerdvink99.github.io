export default function Footer() {
  return (
    <footer className="py-6 text-center text-xs text-gray-400">
      <p>
        © {new Date().getFullYear()} Sjoerd Vink · Design inspiration from{" "}
        <a
          href="https://faculty.washington.edu/msaveski/"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 transition-colors hover:text-gray-600"
        >
          Martin Saveski
        </a>
      </p>
    </footer>
  );
}
