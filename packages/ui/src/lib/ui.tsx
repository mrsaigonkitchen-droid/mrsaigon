import styles from './ui.module.css';

import { motion } from 'framer-motion';
import { tokens } from '@app/shared';

export function Ui() {
  return (
    <div className={styles['container']} style={{ background: tokens.color.background, color: tokens.color.text }}>
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: tokens.motion.duration.md, ease: tokens.motion.ease.outExpo }}
      >
        Welcome to Ui!
      </motion.h1>
    </div>
  );
}

export default Ui;
