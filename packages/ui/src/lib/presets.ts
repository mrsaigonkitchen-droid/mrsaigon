import { Variants } from 'framer-motion';
import { tokens } from '@app/shared';

export const fadeInUp: Variants = {
	initial: { opacity: 0, y: 24 },
	animate: {
		opacity: 1,
		y: 0,
		transition: { duration: tokens.motion.duration.md, ease: tokens.motion.ease.outExpo },
	},
};

export const staggerChildren = (stagger = 0.08): Variants => ({
	initial: {},
	animate: {
		transition: { staggerChildren: stagger },
	},
});

export const revealOnScroll: Variants = fadeInUp;

export const parallaxHero = {
	backgroundSpeed: 0.3,
};


