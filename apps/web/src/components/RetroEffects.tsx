/** biome-ignore-all lint/a11y/noSvgWithoutTitle: svg filters only */
import styles from './RetroEffects.module.css';

const CrtEffects: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {/* Background Layers */}
      <div className={styles.bg}></div>

      {children}

      <div className={styles.liftBlack} />
      <div className={styles.dot} />
      <div className={styles.vignette} />
    </>
  );
};

export default CrtEffects;
