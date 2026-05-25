export default function Footer() {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-green-200 py-1.5 text-center text-sm text-green-600">
      <p>
        PRINGMONI developed by{" "}
        <a
          href="https://docs.google.com/spreadsheets/d/1CWA9wqlNK_9h5IZ47gv2VodoFT1ebXhi7HICnJ1obyg/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-green-700 hover:text-green-500 transition-colors"
        >
          Quarta Code
        </a>{" "}
        supported by{" "}
        <a
          href="https://poliwangi.ac.id/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-green-700 hover:text-green-500 transition-colors"
        >
          POLIWANGI
        </a>
      </p>
    </footer>
  );
}
