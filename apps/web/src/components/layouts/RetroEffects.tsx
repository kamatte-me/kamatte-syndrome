import styles from './RetroEffects.module.css';

const RetroEffects: React.FC<React.PropsWithChildren> = ({ children }) => {
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

export default RetroEffects;
