import { motion } from 'framer-motion';

const particles = [
  ['✦', 'particle-one'], ['♡', 'particle-two'], ['✧', 'particle-three'],
  ['♥', 'particle-four'], ['✦', 'particle-five'], ['·', 'particle-six'],
];

export function PixelDecor() {
  return <div className="pixel-decor" aria-hidden="true">{particles.map(([icon, className]) => <motion.span key={className} className={className} animate={{ y: [0, -18, 0], rotate: [0, 8, -4, 0] }} transition={{ duration: 6, repeat: Infinity, delay: Math.random() * 2 }}>{icon}</motion.span>)}</div>;
}
