import { NavLink, Route, Routes } from 'react-router-dom';
import { Overview } from './pages/Overview.js';
import { Calls } from './pages/Calls.js';
import { CallDetail } from './pages/CallDetail.js';
import { Customers } from './pages/Customers.js';
import { CustomerDetail } from './pages/CustomerDetail.js';
import { AccountDetail } from './pages/AccountDetail.js';
import { Transactions } from './pages/Transactions.js';
import { Support } from './pages/Support.js';
import { Events } from './pages/Events.js';
import { Emails } from './pages/Emails.js';
import { Settings } from './pages/Settings.js';

const NAV = [
  ['/command', 'Overview', true],
  ['/command/calls', 'Calls', false],
  ['/command/customers', 'Customers', false],
  ['/command/transactions', 'Transactions', false],
  ['/command/support', 'Support', false],
  ['/command/events', 'Events', false],
  ['/command/emails', 'Emails', false],
  ['/command/settings', 'Settings', false],
] as const;

export function App() {
  return (
    <>
      <header className="soro-topbar">
        <div className="soro-brand">Soro <small>Command Center · DEMO MODE</small></div>
        <nav className="soro-nav" aria-label="Command Center">
          {NAV.map(([to, label, exact]) => (
            <NavLink key={to} to={to} end={exact} className={({ isActive }) => (isActive ? 'active' : '')}>{label}</NavLink>
          ))}
        </nav>
      </header>
      <main className="soro-page">
        <Routes>
          <Route path="/command" element={<Overview />} />
          <Route path="/command/calls" element={<Calls />} />
          <Route path="/command/calls/:id" element={<CallDetail />} />
          <Route path="/command/customers" element={<Customers />} />
          <Route path="/command/customers/:id" element={<CustomerDetail />} />
          <Route path="/command/accounts/:accountNumber" element={<AccountDetail />} />
          <Route path="/command/transactions" element={<Transactions />} />
          <Route path="/command/support" element={<Support />} />
          <Route path="/command/events" element={<Events />} />
          <Route path="/command/emails" element={<Emails />} />
          <Route path="/command/settings" element={<Settings />} />
          <Route path="*" element={<Overview />} />
        </Routes>
      </main>
    </>
  );
}
