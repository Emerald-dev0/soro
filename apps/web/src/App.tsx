import { Link, NavLink, Route, Routes } from 'react-router-dom';
import { Landing } from './pages/Landing.js';
import { Call } from './pages/Call.js';
import { Authorize } from './pages/Authorize.js';

export function App() {
  return (
    <>
      <header className="soro-topbar">
        <Link to="/" className="soro-brand" style={{ textDecoration: 'none' }}>Soro <small>conversational banking</small></Link>
        <nav className="soro-nav" aria-label="Primary">
          <NavLink to="/call" className={({ isActive }) => (isActive ? 'active' : '')}>Talk to Ayo</NavLink>
          <a href="/command" target="_blank" rel="noreferrer">Command Center</a>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/call" element={<Call />} />
        <Route path="/authorize/:callId" element={<Authorize />} />
        <Route path="*" element={<Landing />} />
      </Routes>
    </>
  );
}
