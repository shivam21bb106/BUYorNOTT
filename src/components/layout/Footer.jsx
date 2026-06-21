export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand">
          <span>W</span>
          <div>
            <strong>WorthCheck</strong>
            <p>Quick gut-checks before money leaves your account.</p>
          </div>
        </div>

        <nav className="footer-links" aria-label="Footer navigation">
          <a href="#calculator">Calculator</a>
          <a href="#history">History</a>
          <a href="#top">Back to top</a>
        </nav>
      </div>

      <div className="footer-bottom">
        <p>Your decisions stay on this device.</p>
        <span>Built for smarter spending.</span>
      </div>
    </footer>
  )
}
