import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ChevronLeft, RotateCcw, Send, Sparkles } from 'lucide-react';
import { analyzeSituation } from './services/api';
import { PixelDecor } from './components/PixelDecor';
import { chooseNext, emptyFeatures, getContextNote, getOpeningChoice, getSuggestion, inferFromText, makeReaction } from './engine/conversationEngine';

const starters = ["They suddenly became distant", 'They liked me at first, then changed', "I'm putting in more effort", "Their behavior is confusing", 'They keep giving mixed signals', "We're stuck in a situationship", "I don't know what this is anymore", 'Let me explain...'];
const patternNames = { ghosting_after_yes: 'Ghosting after initial interest', mixed_signals: 'Mixed signals', one_sided_effort: 'One-sided effort', hot_and_cold: 'Hot and cold', breadcrumbing: 'Breadcrumbing' };
const outcomeNames = { ghosted: 'Ghosted', rejected: 'Rejected', not_available: 'Not available' };

const introStages = [
  ['💭', 'CONFUSED', 'what even is going on?'],
  ['💔', 'HURT', 'then it hurt.'],
  ['🥲', 'STILL TRYING', 'but you kept trying.'],
  ['👀', 'STARTING TO NOTICE', 'then you started noticing.'],
  ['✨', 'GETTING CLARITY', 'maybe you just need to see the pattern.'],
];

function Avatar({ mood = 'neutral' }) { return <div className={`pixel-avatar ${mood}`} aria-hidden="true">{mood === 'positive' ? '💚' : mood === 'concern' ? '🚩' : mood === 'ghost' ? '👻' : mood === 'thinking' ? '💭' : '❤️'}</div>; }
function rememberedSummary(features) {
  const parts = [];
  if (features.initial_yes === 'YES') parts.push('strong interest');
  if (features.days_talking) parts.push(`${features.days_talking} days of talking`);
  if (features.reply_change === 'Dry AF') parts.push('replies getting dry');
  else if (features.reply_change === 'Randomly disappears') parts.push('them disappearing');
  else if (features.reply_change === 'Getting slower') parts.push('replies slowing down');
  if (features.reciprocity === 'Mostly me') parts.push('you trying harder');
  return parts.length >= 2 ? `Okay... you have already given me a lot to work with. ${parts.join(' → ')}. Yeah, I can see why that is confusing.` : 'Okay, you have already given me a useful piece of the picture. I will keep it in mind.';
}
function TypingIndicator() { return <motion.div className="typing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Avatar mood="thinking" /><span>bestie is typing <i /> <i /> <i /></span></motion.div>; }
function Bubble({ message, assistant, mood }) { return <motion.div className={`message-row ${assistant ? 'assistant-row' : 'user-row'}`} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25 }}><div className="message-wrap">{assistant && <Avatar mood={mood} />}<div className={`bubble ${assistant ? 'assistant-bubble' : 'user-bubble'}`}>{message}</div></div></motion.div>; }

function EmotionalIntro({ onDone }) {
  const [stage, setStage] = useState(0);
  useEffect(() => { const timer = window.setTimeout(() => stage === introStages.length - 1 ? onDone() : setStage((value) => value + 1), 1050); return () => window.clearTimeout(timer); }, [stage, onDone]);
  const [icon, label, copy] = introStages[stage];
  return <main className="emotional-intro"><motion.div className="intro-heart" key={icon} initial={{ scale: .6, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ duration: .5 }}>{icon}</motion.div><motion.span key={label} className="intro-label" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>{label}</motion.span><motion.h1 key={copy} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{copy}</motion.h1><div className="intro-dots">{introStages.map((item, index) => <span className={index <= stage ? 'active' : ''} key={item[1]} />)}</div><button className="intro-skip" onClick={onDone}>skip intro</button></main>;
}

function Home({ onStart }) {
  return <main className="home-page"><section className="home-hero"><div><span className="kicker">PATTERN RECOGNITION WITH PERSONALITY</span><h1>IS IT A <em>RED FLAG</em><br />OR ARE YOU JUST<br /><span>DELULU?</span></h1><p className="home-lede">Your friends have opinions.<br /><strong>We have historical data.</strong></p><p className="home-detail">Tell us what happened. We will connect the dots with situations that look suspiciously familiar.</p><button className="button button-primary" onClick={onStart}>Analyze My Situation <ArrowRight size={18} /></button></div><div className="home-art"><div className="home-heart">♥</div><span>the plot<br />thickens</span><b>🚩</b></div></section><section className="home-how"><span className="kicker">THE VIBE CHECK</span><h2>From <em>situationship</em><br />to situation report.</h2><div className="home-steps"><div><b>01</b><strong>Tell us the lore.</strong><span>No names. No screenshots. Just context.</span></div><div><b>02</b><strong>We connect the dots.</strong><span>Deterministic rules plus historical patterns.</span></div><div><b>03</b><strong>Get the receipts.</strong><span>Perspective, not a prediction.</span></div></div></section></main>;
}

function Opening({ onStart }) {
  const [custom, setCustom] = useState('');
  return <main className="chat-page opening-page"><div className="chat-shell"><div className="chat-top"><span className="brand"><span className="brand-heart">♥</span> DON'T REPEAT</span><span className="online"><span /> listening mode</span></div><div className="opening-content"><div className="opening-avatar"><Avatar /></div><span className="kicker">THE LORE DESK · PRIVATE CHAT</span><h1>Okay, I'm listening.<br /><em>Tell me the lore.</em></h1><p>No names needed. Just tell me what happened.</p><div className="starter-list">{starters.map((starter) => <button key={starter} onClick={() => onStart(starter)}>{starter}<ArrowRight size={15} /></button>)}</div><div className="free-input"><input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && custom.trim() && onStart(custom)} placeholder="Tell me what happened..." /><button aria-label="Send your story" onClick={() => custom.trim() && onStart(custom)}><Send size={17} /></button></div><small>We listen, remember the pattern, and do not judge.</small></div></div></main>;
}

function Chat({ onDone, onCancel, initialFeatures, openingMessage }) {
  const [features, setFeatures] = useState({ ...initialFeatures });
  const [messages, setMessages] = useState([{ assistant: true, message: 'Okay babe, spill. What is going on?', mood: 'neutral' }, ...(openingMessage ? [{ assistant: false, message: openingMessage }] : []), { assistant: true, message: openingMessage ? rememberedSummary(initialFeatures) : 'Start wherever makes sense. I am listening, and I will remember the lore.', mood: 'neutral' }]);
  const [question, setQuestion] = useState(chooseNext(initialFeatures));
  const [typing, setTyping] = useState(false); const [custom, setCustom] = useState(''); const [history, setHistory] = useState([]); const endRef = useRef(null);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages, typing, question]);
  const ask = (value, label = value) => { const inferred = inferFromText(label); const nextFeatures = { ...features, ...inferred, [question.key]: value }; setFeatures(nextFeatures); setHistory((items) => [...items, question.key]); setMessages((items) => [...items, { assistant: false, message: label }]); setQuestion(null); setCustom(''); setTyping(true); const next = chooseNext(nextFeatures, history); const reaction = makeReaction(value, nextFeatures, question, history.length); const note = getContextNote(nextFeatures); window.setTimeout(() => { setTyping(false); setMessages((items) => [...items, { assistant: true, message: reaction, mood: nextFeatures.reply_change === 'Consistent' ? 'positive' : nextFeatures.reply_change === 'Randomly disappears' ? 'ghost' : 'neutral' }, ...(note ? [{ assistant: true, message: note, mood: 'concern' }] : [])]); if (next) window.setTimeout(() => setQuestion(next), 220); else window.setTimeout(() => onDone(nextFeatures), 520); }, 520); };
  const sendCustom = () => { if (!custom.trim() || !question) return; const inferred = inferFromText(custom); ask(inferred[question.key] || custom, custom); };
  return <main className="chat-page"><div className="chat-shell conversation-shell"><div className="chat-top"><button className="back-button" onClick={onCancel}><ChevronLeft size={16} /> leave chat</button><div className="chat-status"><Avatar mood={typing ? 'thinking' : 'neutral'} /><span><strong>your emotionally intelligent bestie</strong><small>{typing ? 'thinking...' : 'online · remembering the lore'}</small></span></div><span className="progress-copy">{history.length < 4 ? 'getting the picture...' : history.length < 8 ? 'connecting the dots...' : 'almost enough tea ☕'}</span></div><div className="conversation"><AnimatePresence>{messages.map((item, index) => <Bubble key={`${index}-${item.message}`} message={item.message} assistant={item.assistant} mood={item.mood} />)}</AnimatePresence>{typing && <TypingIndicator />}<div ref={endRef} /></div>{question && !typing && <motion.div className="reply-dock" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} key={question.key}><div className="question-line"><span className="kicker">ONE THING</span><strong>{question.text}</strong></div><div className="quick-replies">{question.options.map(([label, value]) => <button key={label} onClick={() => ask(value, label)}>{label}</button>)}</div><div className="free-input compact"><input value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && sendCustom()} placeholder="Something else? add to the lore..." /><button onClick={sendCustom} aria-label="Send response"><Send size={16} /></button></div></motion.div>}</div></main>;
}

function Loading({ onComplete, features }) {
  const lines = ['opening the group chat archives...', 'jk 😭 checking the historical data', 'matching the patterns...', 'looking for similar situations...', 'okay... I found something 👀']; const [line, setLine] = useState(0);
  useEffect(() => { const interval = window.setInterval(() => setLine((value) => value + 1), 620); const timeout = window.setTimeout(() => onComplete(features), 3100); return () => { window.clearInterval(interval); window.clearTimeout(timeout); }; }, [features, onComplete]);
  return <main className="loading-page"><Avatar mood="thinking" /><span className="kicker">RECEIPTS IN PROGRESS</span><h2>{lines[Math.min(line, lines.length - 1)]}</h2><div className="loading-bar"><motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 3 }} /></div><p>People are not algorithms. We are looking for context, not a prophecy.</p></main>;
}

function Results({ result, features, onReset }) {
  const warning = result.warning || 'MEDIUM'; const high = warning === 'HIGH'; const low = warning === 'LOW'; const intro = high ? "Okay babe... I'm seeing the pattern. 👀" : low ? 'Wait... consistent replies, equal effort, no major mixed signals?' : "Okayyy... I'm not screaming red flag, but I am raising one eyebrow. 👀";
  const advice = getSuggestion(features);
  return <main className="results-page"><div className="results-intro"><span className="kicker">THE RECEIPTS ARE IN</span><h1>{intro}</h1><p>{low ? 'Bestie, I fear we may have found basic healthy communication. Revolutionary. 😭💚' : 'Several situations that looked similar followed this pattern. That is context, not a prediction.'}</p></div><section className={`result-hero ${warning.toLowerCase()}`}><div className="result-icon"><Avatar mood={low ? 'positive' : high ? 'ghost' : 'concern'} /></div><div><span className="result-label">{high ? '🚩 PATTERN WORTH NOTICING' : low ? '💚 HEALTHY PATTERN DETECTED' : '⚠️ MIXED SIGNALS DETECTED'}</span><h2>{result.negative_cases} of {result.total_similar_cases} closest situations ended negatively.</h2><p>The biggest recurring pattern? <strong>{patternNames[result.common_pattern] || result.common_pattern}</strong></p></div></section><div className="result-columns"><section className="result-card score-card"><span className="kicker">SIMILARITY CHECK</span><strong className="big-score">{Math.round(result.similar_cases?.[0]?.similarity || 0)}<small>%</small></strong><p>shares details with the historical cases we matched. Familiar does not mean inevitable.</p><div className="ratio"><span style={{ width: `${(result.negative_ratio || 0) * 100}%` }} /></div><small>{result.negative_cases} negative outcomes in the closest {result.total_similar_cases} matches</small></section><section className="result-card advice-card"><Sparkles size={20} /><span className="kicker">MY BESTIE TAKE</span><h2>{advice}</h2><p>Watch the pattern without making it your entire storyline. Your life is bigger than this one situation. 💅</p></section></div><section className="pattern-story result-card"><span className="kicker">THE PATTERN</span><h2>What showed up in the receipts</h2><div className="pattern-steps"><span>Initial connection</span><b>↓</b><span>Strong interest</span><b>↓</b><span>Communication changes</span><b>↓</b><span>One person increases effort</span><b>↓</b><span>Connection feels increasingly one-sided</span></div><p>This does not mean your story has to end the same way. People are not predictable. But the pattern is worth knowing.</p></section><section className="alone-section"><span className="kicker">A LITTLE PERSPECTIVE</span><h2>You are not the only one.</h2><p>A lot of people end up in situations where the connection starts strong, something changes, and they keep trying to get the original energy back.</p><p>You are not weird for caring. You are not stupid for hoping. You are not alone.</p><strong>The important part is noticing what happens next.</strong></section><section className="similar-cases"><div><span className="kicker">THE RECEIPTS</span><h2>Cases that look suspiciously similar.</h2></div>{result.similar_cases?.map((item) => <div className="case-row" key={item.case_id}><span>CASE #{item.case_id.replace('G', '')}</span><strong>{patternNames[item.pattern] || item.pattern}</strong><b>{item.similarity}%</b><em>{outcomeNames[item.outcome] || item.outcome}</em></div>)}</section><p className="disclaimer">These are similarities to previous situations, not predictions of what someone will do. People are not algorithms. 💗</p><button className="button button-primary result-reset" onClick={onReset}><RotateCcw size={16} /> Start another story</button></main>;
}

function App() {
  const [view, setView] = useState('intro'); const [features, setFeatures] = useState(null); const [openingMessage, setOpeningMessage] = useState(''); const [result, setResult] = useState(null);
  const start = (choice) => { setView(choice ? 'chat' : 'opening'); if (choice) { const opening = getOpeningChoice(choice); setFeatures({ ...emptyFeatures, ...opening.inferred }); setOpeningMessage(choice); } window.scrollTo(0, 0); };
  const finishChat = (data) => { setFeatures(data); setView('ready'); };
  const runAnalysis = async () => { setView('loading'); const [analysis] = await Promise.all([analyzeSituation(features), new Promise((resolve) => window.setTimeout(resolve, 3100))]); setResult(analysis); setView('results'); window.scrollTo(0, 0); };
  if (view === 'intro') return <><PixelDecor /><EmotionalIntro onDone={() => setView('home')} /></>;
  if (view === 'home') return <><PixelDecor /><header className="site-nav"><span className="brand"><span className="brand-heart">♥</span> DON'T REPEAT</span><button onClick={() => start()}>Analyze My Situation <ArrowRight size={15} /></button></header><Home onStart={start} /></>;
  if (view === 'opening') return <><PixelDecor /><Opening onStart={start} /></>;
  if (view === 'chat') return <><PixelDecor /><Chat initialFeatures={features || emptyFeatures} openingMessage={openingMessage} onDone={finishChat} onCancel={() => setView('home')} /></>;
  if (view === 'ready') return <><PixelDecor /><main className="ready-page"><Avatar mood="neutral" /><span className="kicker">I THINK I HAVE THE PICTURE</span><h1>Okay babe... one last pause before we run the receipts.</h1><p>I will compare the pattern you described with historical situations. No destiny claims, no dramatic courtroom music.</p><button className="button button-primary" onClick={runAnalysis}>RUN THE RECEIPTS <ArrowRight size={17} /></button><button className="text-button" onClick={() => setView('chat')}>Wait, I forgot something</button></main></>;
  if (view === 'loading') return <Loading features={features} onComplete={() => {}} />;
  return <Results result={result} features={features || emptyFeatures} onReset={() => { setResult(null); setFeatures(null); setView('home'); }} />;
}

export default App;
