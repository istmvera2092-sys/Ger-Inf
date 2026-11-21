import { useState } from 'react';
import type { FormEvent } from 'react';
import { KeyRound, LogIn, Terminal } from 'lucide-react';
import { isAccessCodeValid } from '../logic/access';
import { GrammarDiagram } from './ui';

export function AccessGate({ onEnter }: { onEnter: () => void }) {
  const [code, setCode] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (checking || !code.trim()) return;
    setChecking(true);
    try {
      if (await isAccessCodeValid(code)) onEnter();
      else setError('That access code is incorrect. Try again.');
    } catch {
      setError('Open the game at its localhost address or over HTTPS to check the code.');
    } finally {
      setChecking(false);
    }
  }

  return <main className="gate-shell">
    <section className="hero access-hero" aria-labelledby="access-title">
      <div className="hero-copy">
        <div className="wordmark access-brand">
          <span className="logo"><Terminal size={22} strokeWidth={2.5}/></span>
          <span>GRAMMAR<span className="brand-os"> OS</span></span>
        </div>
        <h1 id="access-title">Gerunds <span className="amp">&amp;</span><br/><span className="title-accent">Infinitives</span></h1>
        <p>Enter your access code to start practising.</p>
        <form className="access-form" onSubmit={submit}>
          <label htmlFor="access-code">Access code</label>
          <div className="access-field">
            <KeyRound size={19} aria-hidden="true"/>
            <input id="access-code" type="password" value={code} placeholder="Enter code" required readOnly={checking}
              autoComplete="off" autoCapitalize="off" autoCorrect="off" spellCheck={false}
              aria-invalid={Boolean(error)} aria-describedby={error ? 'access-error' : undefined}
              onChange={event => { setCode(event.target.value); setError(''); }}/>
          </div>
          <div id="access-error" className="access-error" aria-live="polite">{error}</div>
          <button className="button primary" type="submit" disabled={checking || !code.trim()}>
            <LogIn size={17} aria-hidden="true"/> {checking ? 'Checking code…' : 'Enter game'}
          </button>
        </form>
      </div>
      <GrammarDiagram/>
    </section>
  </main>;
}
