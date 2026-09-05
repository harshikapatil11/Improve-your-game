export const emptyFeatures = {
  approach_method: null,
  conversation_stage: null,
  initial_yes: null,
  reply_change: null,
  reciprocity: null,
  mixed_signals: null,
  relationship_status: null,
  his_investment: null,
  days_talking: null,
  meetings: null,
  he_increased_pursuit: null,
};

export const emptyContext = {
  conversationHistory: [],
  collectedFeatures: { ...emptyFeatures },
  currentStage: 'opening',
  userAnswers: [],
  detectedSignals: [],
};

const questions = {
  approach_method: {
    key: 'approach_method',
    text: 'How did this whole thing start?',
    options: [
      ['Instagram', 'Instagram'], ['Dating app', 'Dating App'], ['School or college', 'College'],
      ['Work', 'Work'], ['Through friends', 'Friend'], ['A party or event', 'Party'], ['Somewhere else', 'Other'],
    ],
  },
  conversation_stage: {
    key: 'conversation_stage', text: 'Where are things sitting right now?',
    options: [['Just started talking', 'Just started talking'], ['Talking regularly', 'Talking regularly'], ['Situationship territory', 'Situationship'], ['Dating', 'Dating'], ['Friends', 'Friends'], ['Almost a relationship', 'Almost relationship']],
  },
  initial_yes: {
    key: 'initial_yes', text: 'At the beginning, did they seem genuinely interested?',
    options: [['Absolutely', 'YES'], ['Not really', 'NO'], ['Kinda? It was confusing', 'Kinda...?']],
  },
  reply_change: {
    key: 'reply_change', text: 'How are the replies behaving lately?',
    options: [['Still consistent 💚', 'Consistent'], ['A little slower', 'Getting slower'], ['Dry texting 😭', 'Dry AF'], ['Left on delivered', 'Left on delivered'], ['Random disappearances 👻', 'Randomly disappears'], ['Hot and cold', 'Hot & cold']],
  },
  reciprocity: {
    key: 'reciprocity', text: 'When you zoom out, who is carrying the conversation?',
    options: [['Pretty equal', 'Equal'], ['Mostly me', 'Mostly me'], ['Mostly them', 'Mostly them'], ['Barely anyone, honestly', 'Barely any']],
  },
  mixed_signals: {
    key: 'mixed_signals', text: 'Are the signals matching, or are we in mystery novel territory?',
    options: [['They make sense', 'NO'], ['Mixed signals, babe', 'YES'], ["I can't even explain it 💀", "I DON'T EVEN KNOW ANYMORE"]],
  },
  relationship_status: {
    key: 'relationship_status', text: 'What is their availability looking like?',
    options: [['Single / available', 'Single'], ['They are dating someone', 'Dating someone'], ["It's complicated", "It's complicated"], ['Honestly, unknown', 'Unknown']],
  },
  his_investment: {
    key: 'his_investment', text: 'How much effort are you putting in right now?',
    options: [['Keeping it chill', 'Low'], ['A normal amount', 'Medium'], ['A lot, if I am honest', 'High'], ['Way too much 😭', 'WAY TOO MUCH']],
  },
  days_talking: {
    key: 'days_talking', text: 'Roughly how long has this lore been developing?',
    options: [['Less than a week', 5], ['A couple of weeks', 15], ['About a month', 30], ['A few months', 90]],
  },
  meetings: {
    key: 'meetings', text: 'Have you actually met in real life yet?',
    options: [['Not yet', 0], ['Once', 1], ['A couple of times', 2], ['Five or more times', 5]],
  },
  he_increased_pursuit: {
    key: 'he_increased_pursuit', text: 'When they got distant, what happened on your side?',
    options: [['I tried harder', 'Yes'], ['I gave them space', 'No'], ['I asked what was wrong', 'Yes'], ['I matched their energy', 'No'], ['I panicked a little 😭', 'Yes']],
  },
  withdrawal_context: { key: 'withdrawal_context', text: 'When their replies changed, did anything specific happen?', options: [['Not that I noticed', 'Nothing obvious'], ['We met', 'We met'], ['We had a disagreement', 'We had an argument'], ['I asked where this was going', 'I asked them out'], ['They got busy', 'They got busy'], ['Honestly, no idea', 'I do not know']] },
  hot_cold_detail: { key: 'hot_cold_detail', text: 'When they are distant, what does that usually look like?', options: [['They stop replying', 'Stops replying'], ['They reply but seem cold', 'Replies coldly'], ['They cancel plans', 'Cancels plans'], ['They flirt but avoid commitment', 'Avoids commitment'], ['They act normal again later', 'Returns to normal']] },
  initiation: { key: 'initiation', text: 'Who usually starts the conversation or makes the plans?', options: [['Mostly me', 'Mostly me'], ['Mostly them', 'Mostly them'], ['Pretty equal', 'Equal'], ['It changes', 'Changes']] },
  stopped_initiating: { key: 'stopped_initiating', text: 'When you stop initiating, what happens?', options: [['They reach out', 'They reach out'], ['Nothing happens', 'Nothing happens'], ['They eventually text', 'They eventually text'], ['They ask why I am distant', 'They ask why I am distant']] },
  progression: { key: 'progression', text: 'Do you both seem equally interested in moving things forward?', options: [['Yes, it is progressing', 'Progressing'], ['Not really', 'Stalled'], ['We have not defined it', 'Undefined'], ['It is mostly online', 'Online']] },
  response_after_reach: { key: 'response_after_reach', text: 'After you reached out, did they eventually respond?', options: [['Yes, and it felt normal', 'Yes'], ['Yes, but only briefly', 'Briefly'], ['No', 'No'], ['I have not reached out again', 'Not again']] },
};

const reactions = {
  neutral: ['Noted 👀', 'Okay, the lore is lore-ing.', 'Interesting... let me connect a few dots.', 'Yeah, I am starting to see the picture now.'],
  positive: ['Okay, green flag detected.', 'Wait... consistency? We love to see it 💚', 'That is actually reassuring. Revolutionary, apparently.'],
  concern: ['Oop. I am clocking the switch-up 👀', 'Okay, that changes things a little.', 'Wait — that actually matters.', 'I am noticing something, but I want the full picture.'],
};

const pick = (items, seed) => items[Math.abs(seed) % items.length];

export function inferFromText(text) {
  const normalized = text.toLowerCase();
  const found = {};
  if (/instagram|ig|slide/.test(normalized)) found.approach_method = 'Instagram';
  if (/dating app|hinge|tinder|bumble/.test(normalized)) found.approach_method = 'Dating App';
  if (/ghost|disappear|vanish|left me|stopped replying|into the void/.test(normalized)) { found.reply_change = normalized.includes('delivered') ? 'Left on delivered' : 'Randomly disappears'; found.mixed_signals = 'YES'; }
  else if (/slow|dry|less often/.test(normalized)) found.reply_change = normalized.includes('dry') ? 'Dry AF' : 'Getting slower';
  if (/consistent|every day|daily|reply consistently|make plans/.test(normalized)) { found.reciprocity = 'Equal'; found.reply_change = found.reply_change || 'Consistent'; }
  if (/initially|at first|really interested|liked me|liked them|strong interest/.test(normalized)) found.initial_yes = 'YES';
  if (/not interested|never interested/.test(normalized)) found.initial_yes = 'NO';
  if (/mostly me|chasing|trying harder|more effort|doing everything|carry the/.test(normalized)) { found.reciprocity = 'Mostly me'; found.his_investment = 'High'; found.he_increased_pursuit = 'Yes'; }
  if (/equal effort|mutual effort|both make plans/.test(normalized)) found.reciprocity = 'Equal';
  if (/mixed signal|hot.and.cold|affectionate.*distant|flirt.*commitment/.test(normalized)) found.mixed_signals = 'YES';
  if (/situationship|do not know what this is|don't know what this is|undefined/.test(normalized)) found.conversation_stage = 'Situationship';
  if (/single|available/.test(normalized)) found.relationship_status = 'Single';
  if (/partner|dating someone|already involved|boyfriend|girlfriend/.test(normalized)) found.relationship_status = 'Dating someone';
  if (/online|long.distance|haven't met|have not met/.test(normalized)) found.meetings = 0;
  if (/stopped initiating|never contacted|nothing happens/.test(normalized)) { found.reciprocity = 'Mostly me'; found.he_increased_pursuit = 'No'; }
  if (/three weeks|3 weeks/.test(normalized)) found.days_talking = 21;
  const weekMatch = normalized.match(/(\d+)\s*weeks?/); const dayMatch = normalized.match(/(\d+)\s*days?/);
  if (weekMatch) found.days_talking = Number(weekMatch[1]) * 7;
  if (dayMatch) found.days_talking = Number(dayMatch[1]);
  return found;
}

export function getOpeningChoice(choice) {
  const text = choice.toLowerCase();
  const inferred = inferFromText(choice);
  if (text.includes('suddenly texting') || text.includes('distant')) return { message: 'Oop, the switch-up has entered the chat. Tell me the origin story first.', inferred };
  if (text.includes('confused')) return { message: 'Confused about the vibes? Say less. We are opening the receipts folder.', inferred };
  if (text.includes('said yes')) return { message: 'They said yes and then vanished? Okay, so interest was there first. That is important.', inferred: { ...inferred, initial_yes: 'YES', reply_change: 'Randomly disappears', mixed_signals: 'YES' } };
  if (text.includes('more effort')) return { message: 'I hear you, babe. Let us work out whether the effort changed or the whole pattern did.', inferred: { ...inferred, reciprocity: 'Mostly me', his_investment: 'High' } };
  if (text.includes('mixed signals')) return { message: 'Ahhh, hot-and-cold. Yeah, that can really mess with your head. Let us make it specific.', inferred: { ...inferred, mixed_signals: 'YES' } };
  return { message: 'Okay, start wherever makes sense. I am listening, and yes, I will remember the lore.', inferred };
}

export function chooseNext(features, history = []) {
  const healthy = features.reply_change === 'Consistent' && features.reciprocity === 'Equal' && features.mixed_signals === 'NO';
  const knownCount = Object.values(features).filter((value) => value !== null && value !== undefined).length;
  if (knownCount >= 7 && (healthy || (features.reply_change && features.reciprocity && features.days_talking))) return null;
  const ordered = healthy
    ? ['meetings', 'progression', 'relationship_status', 'conversation_stage', 'days_talking']
    : features.reply_change === 'Randomly disappears'
      ? ['days_talking', 'response_after_reach', 'relationship_status', 'meetings', 'approach_method']
      : features.mixed_signals === 'YES'
        ? ['hot_cold_detail', 'conversation_stage', 'relationship_status', 'meetings', 'days_talking']
        : features.initial_yes === 'YES' && features.reply_change
          ? ['withdrawal_context', 'reciprocity', 'initiation', 'days_talking', 'relationship_status', 'meetings', 'approach_method']
          : features.reciprocity === 'Mostly me'
            ? ['initiation', 'stopped_initiating', 'days_talking', 'relationship_status', 'meetings', 'approach_method']
        : ['approach_method', 'days_talking', 'initial_yes', 'reply_change', 'withdrawal_context', 'reciprocity', 'initiation', 'stopped_initiating', 'mixed_signals', 'his_investment', 'he_increased_pursuit', 'relationship_status', 'conversation_stage', 'meetings'];
  const key = ordered.find((item) => features[item] === null || features[item] === undefined);
  if (!key) return null;
  const question = questions[key];
  let text = question.text;
  if (key === 'meetings' && features.approach_method === 'Instagram') text = 'Since this started on Instagram and you have not told me about meeting yet, have you actually met in real life?';
  if (key === 'he_increased_pursuit' && ['Mostly me', 'Barely any'].includes(features.reciprocity)) text = 'Be real with me — when they started pulling away, did you start reaching out more?';
  if (key === 'mixed_signals' && features.reply_change === 'Consistent') text = 'Consistent replies are cute. Any mixed signals hiding underneath, or are we blessed?';
  if (key === 'withdrawal_context' && features.initial_yes === 'YES' && features.reply_change) text = 'You mentioned strong interest before the replies changed. Did anything specific happen around the switch-up?';
  if (key === 'initiation' && features.reciprocity === 'Mostly me') text = 'Okay, let us slow down here. Who usually starts the conversation or makes the plans?';
  if (key === 'stopped_initiating') text = 'If the connection only moves when you move it, that is useful information. What happens when you stop initiating?';
  if (key === 'progression' && features.meetings === 0) text = 'Since you two have not met yet, how does the connection seem to be progressing beyond the online chemistry?';
  return { ...question, text, historyLength: history.length };
}

export function makeReaction(answer, features, previous, seed = 0) {
  if (features.reply_change === 'Consistent' || (features.reciprocity === 'Equal' && features.mixed_signals === 'NO')) return pick(reactions.positive, seed);
  if (previous?.key === 'stopped_initiating' && answer === 'Nothing happens') return 'Okay... that is actually useful information. If it only moves when you move it, that is worth noticing.';
  if (previous?.key === 'he_increased_pursuit' && answer === 'Yes') return 'Yeah... that is a really common reaction. When someone pulls away, we sometimes try to close the gap.';
  if (previous?.key === 'hot_cold_detail') return 'Ahhh, hot-and-cold confirmed. I can see why that would be confusing.';
  if (['Getting slower', 'Dry AF', 'Left on delivered', 'Randomly disappears', 'Hot & cold', 'Mostly me', 'Barely any', 'YES'].includes(answer)) return pick(reactions.concern, seed);
  if (previous?.key === 'approach_method' && answer === 'Instagram') return 'Instagram lore, got it 😭';
  return pick(reactions.neutral, seed);
}

export function getContextNote(features) {
  if (features.his_investment === 'WAY TOO MUCH' && ['Mostly me', 'Barely any'].includes(features.reciprocity)) return 'Tiny observation: you are giving a lot more than you are getting back right now.';
  if (features.relationship_status === 'Dating someone' || features.relationship_status === "It's complicated") return 'Okay, that is a pretty important piece of the lore. Availability may matter more than your approach here.';
  if (features.reply_change === 'Consistent' && features.reciprocity === 'Equal' && features.mixed_signals === 'NO') return 'Wait... consistency and equal effort? We may have found basic healthy communication. Revolutionary. 😭💚';
  if (features.reply_change === 'Randomly disappears' && features.initial_yes === 'YES') return 'So the energy was there first and then the replies changed. I am keeping that receipt.';
  return null;
}

export function shouldFinishConversation(features) {
  const known = Object.values(features).filter((value) => value !== null && value !== undefined).length;
  const healthy = features.reply_change === 'Consistent' && features.reciprocity === 'Equal' && features.mixed_signals === 'NO';
  return known >= 7 && (healthy || Boolean(features.reply_change && features.reciprocity && features.days_talking));
}

export function getSuggestion(features) {
  if (features.reciprocity === 'Mostly me' || features.his_investment === 'WAY TOO MUCH') return 'Match the effort. Do not keep increasing yours to compensate. Give them room to show initiative.';
  if (features.reply_change === 'Randomly disappears') return 'You do not need to keep sending messages into the void. If they want to reconnect, let them make some effort too.';
  if (features.mixed_signals === 'YES') return 'Pay attention to consistency over isolated moments. If you are constantly decoding things, clarity may be worth asking for.';
  if (features.reply_change === 'Consistent' && features.reciprocity === 'Equal') return 'Do not overthink it. Keep communicating, keep your own life moving, and enjoy the connection.';
  return 'Let the situation show you what it is. Notice the pattern without making it your entire storyline.';
}
