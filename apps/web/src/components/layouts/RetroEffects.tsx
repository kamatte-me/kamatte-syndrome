import { PsychedelicBackground } from './PsychedelicBackground';
import styles from './RetroEffects.module.css';

const RetroEffects: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      <PsychedelicBackground />

      <div className={styles.contentLayer}>{children}</div>

      {/* <div className={styles.liftBlack} /> */}
      {/* <div className={styles.dot} /> */}
      {/* <div className={styles.vignette} /> */}
    </>
  );
};

export default RetroEffects;
