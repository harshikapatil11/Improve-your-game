export const defaultProfile = {
  name: 'friend',
  relationshipStatus: 'talking to someone',
  interactionStyle: 'goes all in when they like someone',
  tone: 'bro',
};

export const demoStory = {
  title: 'She said she was not ready',
  profile: { name: 'Alex', relationshipStatus: 'moving on', interactionStyle: 'go all in when you like someone', tone: 'bro' },
  events: ['You liked them', 'You started talking often', 'You became emotionally invested', 'You shared how you felt', 'They said they were not ready', 'You respected the decision', 'Communication decreased', 'They started dating someone else'],
  facts: ['Communication decreased after the conversation', 'You respected the boundary', 'Their later relationship does not explain their earlier behavior'],
  pattern: 'Declining reciprocity',
};

export const modeChoices = [
  { id: 'happened', icon: '💔', title: 'Something happened', description: 'I need help understanding it.' },
  { id: 'confused', icon: '👀', title: "I'm confused", description: "I can't tell what this situation means." },
  { id: 'decide', icon: '🧭', title: 'I need to decide', description: "I don't know what I should do next." },
  { id: 'demo', icon: '🕵️', title: 'Just curious', description: 'Show me a demo story.' },
];

export function getGreeting(profile) {
  const name = profile?.name && profile.name !== 'friend' ? profile.name : 'bro';
  if (profile?.relationshipStatus === 'moving on') return `Hey, ${name}. 👋 Still trying to make sense of what happened?`;
  if (profile?.relationshipStatus === 'complicated') return `Hey, ${name}. 👋 Yeah... complicated situations usually have a story behind them.`;
  if (profile?.relationshipStatus === 'talking to someone') return `Hey, ${name}. 👋 Still figuring things out with them?`;
  return `Hey, ${name}. 👋 Okay... what is happening?`;
}

export function buildTimeline(features, profile) {
  const events = ['You noticed the situation', features.approach_method ? `You met through ${features.approach_method.toLowerCase()}` : 'You started talking'];
  if (features.initial_yes === 'YES') events.push('The interest felt mutual at first');
  if (features.days_talking) events.push(`You talked for about ${features.days_talking} days`);
  if (features.reply_change && features.reply_change !== 'Consistent') events.push('Their communication changed');
  if (features.his_investment === 'High' || features.his_investment === 'WAY TOO MUCH') events.push('You increased your effort');
  if (features.reciprocity === 'Equal') events.push('Effort stayed fairly mutual');
  else if (features.reciprocity) events.push('Effort became uneven');
  if (profile?.interactionStyle) events.push(`You ${profile.interactionStyle}`);
  return events;
}

export function deriveBroAnalysis(features, profile) {
  const concernSignals = [features.reply_change && features.reply_change !== 'Consistent', features.reciprocity && features.reciprocity !== 'Equal', features.mixed_signals === 'YES', features.he_increased_pursuit === 'Yes'];
  const concernCount = concernSignals.filter(Boolean).length;
  const healthy = features.reply_change === 'Consistent' && features.reciprocity === 'Equal' && features.mixed_signals === 'NO';
  const pattern = healthy ? 'Steady reciprocal communication' : features.reply_change === 'Randomly disappears' && features.initial_yes === 'YES' ? 'Initial interest followed by distance' : features.reciprocity !== 'Equal' ? 'Effort increased while reciprocity decreased' : 'Communication needs more clarity';
  const signals = [];
  if (features.reply_change && features.reply_change !== 'Consistent') signals.push('communication declined or became inconsistent');
  if (features.reciprocity && features.reciprocity !== 'Equal') signals.push('effort became uneven');
  if (features.meetings === 0) signals.push('the connection is still mostly online');
  if (features.relationship_status === 'Dating someone' || features.relationship_status === "It's complicated") signals.push('availability is unclear');
  if (!signals.length) signals.push('communication has stayed consistent');
  return {
    pattern,
    signals,
    tone: profile?.tone || 'bro',
    concernCount,
    healthy,
    facts: signals.map((signal) => signal[0].toUpperCase() + signal.slice(1) + '.'),
    interpretation: healthy ? 'The current evidence looks more reciprocal than concerning.' : 'The current evidence suggests a mismatch in effort, but it cannot tell us what the other person privately feels.',
    unknowns: ['their private feelings', 'their motivations', 'whether their behavior will change'],
    scorecard: { Clarity: features.mixed_signals === 'YES' ? 45 : 72, Reciprocity: features.reciprocity === 'Equal' ? 82 : 38, Communication: features.reply_change === 'Consistent' ? 84 : 42, Boundaries: features.he_increased_pursuit === 'No' ? 76 : 48, 'Emotional readiness': features.his_investment === 'WAY TOO MUCH' ? 44 : 68 },
  };
}

export function getDecisionOptions(analysis) {
  if (analysis.healthy) return [{ id: 'enjoy', title: 'Enjoy the good energy', bestWhen: 'the effort is mutual', benefit: 'You get to stay present without inventing a problem.', downside: 'You still need to speak up if the pattern changes.' }, { id: 'clarity', title: 'Have an honest conversation', bestWhen: 'you want to define what this is', benefit: 'You replace guessing with a direct conversation.', downside: 'The answer may be uncomfortable.' }];
  return [{ id: 'clarity', title: 'Have an honest conversation', bestWhen: 'you still do not have clarity', benefit: 'You may get a direct answer instead of guessing.', downside: 'The answer may not be what you want.' }, { id: 'step-back', title: 'Step back', bestWhen: 'you are consistently putting in more effort', benefit: 'You stop carrying the entire interaction.', downside: 'The connection may naturally fade.' }, { id: 'time', title: 'Give it time', bestWhen: 'their actions are still respectful and space was clearly communicated', benefit: 'You leave room for new information.', downside: 'Waiting without boundaries can keep you stuck.' }];
}

export function simulateDecision(id) {
  const paths = {
    clarity: [{ day: 'Today', text: 'You ask directly and keep the message calm.' }, { day: 'Next', text: 'They have to respond to the actual question instead of the vibe around it.' }, { day: 'After', text: 'You get information you can use, even if it is not the answer you hoped for.' }],
    'step-back': [{ day: 'Day 1', text: 'Nothing happens. You resist filling the silence.' }, { day: 'Day 3', text: 'You notice whether they initiate without being prompted.' }, { day: 'Day 7', text: 'You have clearer evidence about the level of reciprocity.' }],
    time: [{ day: 'This week', text: 'You give space while keeping a boundary for yourself.' }, { day: 'Later', text: 'You look for actions, not just reassuring words.' }, { day: 'After', text: 'You decide with more context, not more anxiety.' }],
    enjoy: [{ day: 'Today', text: 'You let a healthy connection be healthy.' }, { day: 'This week', text: 'You keep your own life moving alongside it.' }, { day: 'Later', text: 'You talk when a real pattern, not one anxious moment, appears.' }],
  };
  return paths[id] || paths['step-back'];
}

export function getOverthinkingCheck(features) {
  const hasPattern = features.reply_change && features.reply_change !== 'Consistent' && features.reciprocity && features.reciprocity !== 'Equal';
  return { known: [features.reply_change ? `The replies are ${features.reply_change.toLowerCase()}.` : 'You noticed a change in communication.', features.reciprocity ? `You describe the effort as ${features.reciprocity.toLowerCase()}.` : 'You are tracking how much effort each person gives.'], assuming: ['Their intention', 'What the silence means emotionally'], unknown: ['Whether this is temporary', 'What they would say if asked directly'], conclusion: hasPattern ? 'Your confusion makes sense given the repeated changes you described. That is evidence of a pattern, not proof of a hidden intention.' : 'One event is not enough to establish a pattern. More observable behavior or a direct conversation would help.' };
}

export function saveStory(story) { const existing = JSON.parse(localStorage.getItem('pattern-stories') || '[]'); localStorage.setItem('pattern-stories', JSON.stringify([{ ...story, createdAt: new Date().toISOString() }, ...existing].slice(0, 10))); }
