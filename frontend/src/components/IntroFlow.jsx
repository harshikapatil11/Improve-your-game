import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';

const profileQuestions = [
  { key: 'relationshipStatus', eyebrow: 'CHAPTER ONE', title: 'What chapter are you in right now?', options: [['💗', "I'm in love", 'in love'], ['💬', "I'm talking to someone", 'talking to someone'], ['💔', 'Something ended', 'ended'], ['🦋', "I'm moving on", 'moving on'], ['👀', "It's complicated", 'complicated'], ['🌙', 'Just curious', 'curious']] },
  { key: 'interactionStyle', eyebrow: 'CHAPTER TWO', title: 'When you like someone, what sounds most like you?', options: [['❤️', 'I show it', 'show your feelings'], ['👀', 'I look for signs', 'look for signs'], ['🤐', 'I keep it to myself', 'keep feelings private'], ['🔥', 'I go all in', 'go all in'], ['🧊', 'I stay detached', 'try to stay detached']] },
  { key: 'priorities', eyebrow: 'CHAPTER THREE', title: 'What matters most to you?', multi: true, options: [['💬', 'Communication'], ['🤝', 'Effort'], ['🔐', 'Trust'], ['❤️', 'Affection'], ['🧭', 'Clarity'], ['🌱', 'Consistency']] },
  { key: 'currentGoal', eyebrow: 'CHAPTER FOUR', title: 'What are you looking for right now?', options: [['💗', 'Something serious', 'something serious'], ['🌱', 'Something meaningful', 'something meaningful'], ['👀', 'Seeing where it goes', 'seeing where it goes'], ['🧘', 'Understanding what happened', 'understanding what happened'], ['🦋', 'Moving forward', 'moving forward']] },
];

function Heart({ state = 'heart' }) {
  return <motion.div className={`intro-heart ${state}`} animate={{ scale: [1, 1.06, 1], filter: ['drop-shadow(0 0 8px #ff6cab55)', 'drop-shadow(0 0 28px #ff6cabbb)', 'drop-shadow(0 0 8px #ff6cab55)'] }} transition={{ duration: 2.2, repeat: Infinity }}>{state === 'healing' ? '❤️‍🩹' : state === 'broken' ? '💔' : state === 'confused' ? '💓' : state === 'moving' ? '🦋' : state === 'connection' ? '💗' : '🤍'}</motion.div>;
}

function Intro({ onContinue }) {
  const [line, setLine] = useState(0);
  const lines = ['Everyone has a story.', 'Some stories are easy to understand.', "Some aren't.", 'Sometimes you do not need another opinion.', 'You need to see the pattern.'];
  useEffect(() => { const timer = window.setInterval(() => setLine((value) => Math.min(value + 1, lines.length - 1)), 1150); return () => window.clearInterval(timer); }, []);
  return <main className="cinematic-intro"><div className="intro-stars" aria-hidden="true"><span>✦</span><span>·</span><span>✧</span><span>♡</span></div><Heart state={line === 1 ? 'connection' : line === 2 ? 'confused' : line === 3 ? 'broken' : line === 4 ? 'healing' : 'heart'} /><AnimatePresence mode="wait"><motion.p key={line} className="intro-line" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>{lines[line]}</motion.p></AnimatePresence><motion.div className="intro-brand" initial={{ opacity: 0 }} animate={{ opacity: line === 4 ? 1 : 0 }} transition={{ delay: .35 }}><span className="brand-heart">♥</span><strong>PATTERN</strong><small>Tell us what happened. We'll help you make sense of it.</small></motion.div><button className="intro-begin" onClick={onContinue}>{line === 4 ? 'BEGIN' : 'skip intro'} <ArrowRight size={16} /></button></main>;
}

function Auth({ existingProfile, onNew, onDemo }) {
  const [emailOpen, setEmailOpen] = useState(false); const [email, setEmail] = useState('');
  const continueReturning = () => onNew(existingProfile);
  return <main className="auth-page"><Heart state="healing" /><span className="kicker">A PRIVATE SPACE FOR YOUR STORY</span><h1>Before we start...</h1><p>I should probably know who's telling the story.</p>{existingProfile ? <button className="auth-primary" onClick={continueReturning}>Continue as {existingProfile.name} <ArrowRight size={16} /></button> : <button className="auth-primary" onClick={() => setEmailOpen(true)}><Mail size={16} /> Continue with Email</button>}<button className="auth-secondary" onClick={() => setEmailOpen(true)}>Continue with Google</button><button className="demo-link" onClick={onDemo}>Just explore a demo <ArrowRight size={14} /></button>{emailOpen && <form className="email-form" onSubmit={(event) => { event.preventDefault(); onNew({ name: email.split('@')[0] || 'friend', relationshipStatus: 'talking to someone', interactionStyle: 'look for signs', priorities: ['Communication', 'Consistency'], currentGoal: 'understanding what happened', tone: 'bro' }); }}><label>Email for this demo account<input autoFocus value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" required /></label><button className="auth-primary" type="submit">Continue <ArrowRight size={16} /></button><small>Prototype mode keeps this profile on this device only.</small></form>}</main>;
}

function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0); const [answers, setAnswers] = useState({ priorities: [] }); const question = profileQuestions[step]; const selected = answers[question.key] || (question.multi ? [] : null);
  const choose = (value) => { const next = question.multi ? (selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]) : value; setAnswers({ ...answers, [question.key]: next }); if (!question.multi) window.setTimeout(() => step === profileQuestions.length - 1 ? onComplete({ ...answers, [question.key]: next, name: answers.name || 'friend', tone: 'bro' }) : setStep(step + 1), 260); };
  const finish = () => onComplete({ ...answers, name: answers.name || 'friend', tone: 'bro' });
  return <main className="onboarding-page"><div className="onboarding-top"><Heart state={step === 0 ? 'heart' : step === 1 ? 'connection' : step === 2 ? 'confused' : 'healing'} /><span className="kicker">GETTING TO KNOW YOU · {step + 1} / {profileQuestions.length}</span></div><motion.section className="onboarding-card" key={question.key} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}><span className="kicker">{question.eyebrow}</span><h1>{question.title}</h1><div className="profile-option-grid">{question.options.map(([icon, label, value]) => <button className={selected === value || selected?.includes?.(value) ? 'selected' : ''} key={label} onClick={() => choose(value)}><span>{icon}</span><strong>{label}</strong></button>)}</div>{question.multi && <button className="auth-primary continue-profile" disabled={!selected.length} onClick={finish}>That feels right <ArrowRight size={16} /></button>}</motion.section></main>;
}

function ProfileReveal({ profile, onContinue }) {
  const style = profile.interactionStyle === 'look for signs' ? 'The Hopeful Observer' : profile.interactionStyle === 'go all in' ? 'The Whole-Hearted One' : profile.interactionStyle === 'try to stay detached' ? 'The Careful Heart' : 'The Honest Seeker';
  const copy = profile.interactionStyle === 'look for signs' ? 'You tend to notice changes in communication and look for meaning in small signals.' : profile.interactionStyle === 'go all in' ? 'You care deeply and bring real energy when something matters to you.' : 'You want to understand what happened without losing yourself in the story.';
  return <main className="profile-reveal"><Heart state="healing" /><span className="kicker">A LITTLE REFLECTION</span><h1>Okay, I think I get you.</h1><section><span className="kicker">YOUR STORY STYLE</span><h2>{style}</h2><p>{copy}</p></section><p>Now let us talk about what actually happened.</p><button className="auth-primary" onClick={onContinue}>Tell me what's going on <ArrowRight size={16} /></button></main>;
}

export function IntroFlow({ existingProfile, onComplete, onDemo }) {
  const [phase, setPhase] = useState('intro'); const [profile, setProfile] = useState(existingProfile);
  if (phase === 'intro') return <Intro onContinue={() => setPhase('auth')} />;
  if (phase === 'auth') return <Auth existingProfile={profile} onNew={(next) => { setProfile(next); setPhase(existingProfile ? 'returning' : 'onboarding'); }} onDemo={onDemo} />;
  if (phase === 'onboarding') return <Onboarding onComplete={(next) => { setProfile(next); setPhase('reveal'); }} />;
  if (phase === 'reveal') return <ProfileReveal profile={profile} onContinue={() => onComplete(profile)} />;
  return <main className="auth-page"><Heart state="healing" /><span className="kicker">WELCOME BACK</span><h1>Hey, {profile?.name || 'friend'}. 👋</h1><p>Good to see you again. Your story is still yours, and I remember the context you chose to share.</p><button className="auth-primary" onClick={() => onComplete(profile)}>What are we figuring out today? <ArrowRight size={16} /></button></main>;
}
