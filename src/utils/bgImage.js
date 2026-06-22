/**
 * Given a block's props, returns the wrapper style object for bg image + overlay.
 * Used by both BlockRenderer (React) and export.js (HTML string).
 */
export function getBgWrapperStyle(props) {
  const { bgImage, bgImageSize = 'cover', bgImagePos = 'center' } = props;
  if (!bgImage) return {};
  return {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: bgImageSize,
    backgroundPosition: bgImagePos,
    backgroundRepeat: 'no-repeat',
    position: 'relative',
  };
}

/**
 * Returns the overlay div style (absolute, full cover, color + opacity).
 */
export function getOverlayStyle(props) {
  const { overlayColor = '#000000', overlayOpacity = 0.4 } = props;
  // Parse hex → rgba
  const hex = overlayColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  return {
    position: 'absolute',
    inset: 0,
    background: `rgba(${r},${g},${b},${overlayOpacity})`,
    pointerEvents: 'none',
    zIndex: 1,
  };
}

/** Inline style string for HTML export overlay div */
export function getOverlayStyleStr(props) {
  const { overlayColor = '#000000', overlayOpacity = 0.4 } = props;
  const hex = overlayColor.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16) || 0;
  const g = parseInt(hex.slice(2, 4), 16) || 0;
  const b = parseInt(hex.slice(4, 6), 16) || 0;
  return `position:absolute;inset:0;background:rgba(${r},${g},${b},${overlayOpacity});pointer-events:none;z-index:1;`;
}

/** Inline style string for HTML export wrapper */
export function getBgWrapperStyleStr(props) {
  const { bgImage, bgImageSize = 'cover', bgImagePos = 'center' } = props;
  if (!bgImage) return '';
  return `background-image:url(${bgImage});background-size:${bgImageSize};background-position:${bgImagePos};background-repeat:no-repeat;position:relative;`;
}
