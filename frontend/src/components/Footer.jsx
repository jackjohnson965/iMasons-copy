import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-brand-dark border-t border-white/[0.06] py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <p className="text-white/20 text-sm">
              iMasons Foundation
            </p>
            <span className="hidden sm:inline text-white/10">·</span>
            <p className="text-white/15 text-xs">
              Shaping the Digital Future for All
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/30">
            <Link
              to="/about"
              className="hover:text-white/60 transition-colors"
            >
              About the Team
            </Link>
            <a
              href="https://imasons.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              iMasons Foundation
            </a>
            <a
              href="https://www.linkedin.com/company/infrastructure-masons/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              LinkedIn
            </a>
            <a
              href="https://imasons.org/privacy-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white/60 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
