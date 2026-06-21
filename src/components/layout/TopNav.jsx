export function TopNav() {
  return (
    <nav className="top-nav" aria-label="Main navigation">
      <a className="brand-mark" href="#top" aria-label="WorthCheck home">
        <span>W</span>
        WorthCheck
      </a>
      <div className="nav-links">
        <a href="#calculator">Calculator</a>
        <a href="#history">History</a>
      </div>
    </nav>
  )
}
