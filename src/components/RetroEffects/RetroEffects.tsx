/** biome-ignore-all lint/a11y/noSvgWithoutTitle: svg filters only */
import styles from './RetroEffects.module.css';

const CrtEffects: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <>
      {/* Background Layers */}
      <div className={styles.bg} />
      <div className={styles.noise} />
      <div className={styles.dot} />
      <div className={styles.scanlines} />
      <div className={styles.flicker} />
      <div className={styles.chromaticAberration} />
      <div className={styles.sepia} />
      <div className={styles.vignette} />

      <svg width={0} height={0}>
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.3"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="1" />
        </filter>
      </svg>
      <svg width={0} height={0}>
        <filter id="chromaticAberration">
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <feOffset dx="-1" dy="0" result="red" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0"
          />
          <feOffset dx="0" dy="0" result="green" />
          <feColorMatrix
            in="SourceGraphic"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0"
          />
          <feOffset dx="1" dy="0" result="blue" />

          <feComposite in="red" operator="lighter" />
          <feComposite in="green" operator="lighter" />
        </filter>
      </svg>
    </>
  );
};

export default CrtEffects;
