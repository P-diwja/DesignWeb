import { getBgWrapperStyle, getOverlayStyle } from '../utils/bgImage';

// Renders the content inside a Row column (simplified — no BgWrapper, no section padding)
function ColRenderer({ col }) {
  const p = col.props || {};
  switch (col.type) {
    case 'button': {
      const sizeMap = { sm: '8px 20px', md: '12px 28px', lg: '16px 36px' };
      const fontMap = { sm: 13, md: 15, lg: 18 };
      const btnStyle = p.style === 'outline'
        ? { background: 'transparent', border: `2px solid ${p.btnColor}`, color: p.btnColor }
        : p.style === 'ghost'
        ? { background: 'transparent', border: 'none', color: p.btnColor, textDecoration: 'underline' }
        : { background: p.btnColor, border: 'none', color: p.textColor };
      return (
        <div style={{ textAlign: p.align || 'center' }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ display: 'inline-block', padding: sizeMap[p.size || 'md'], borderRadius: `${p.radius || 8}px`, fontSize: fontMap[p.size || 'md'], fontWeight: 600, textDecoration: 'none', ...btnStyle }}>
            {p.label || 'Button'}
          </a>
        </div>
      );
    }
    case 'text':
      return <p style={{ fontSize: Number(p.fontSize) || 16, color: p.color || '#333', lineHeight: 1.7, margin: 0, textAlign: p.align || 'left' }}>{p.content || 'Text'}</p>;
    case 'image':
      return <img src={p.src} alt={p.alt || ''} style={{ width: '100%', height: Number(p.height) || 200, objectFit: p.objectFit || 'cover', borderRadius: 8, display: 'block' }} onError={e => { e.target.src = 'https://placehold.co/400x200?text=Image'; }} />;
    default:
      return <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8, textAlign: 'center', color: '#888', fontSize: 13 }}>{col.type || 'Empty column'}</div>;
  }
}

/**
 * Wraps block content with bg-image + overlay if set.
 * Children must use position:relative + zIndex:2 to sit above overlay.
 */
function BgWrapper({ props, children, tag: Tag = 'div', style = {}, ...rest }) {
  const hasBg = !!props.bgImage;
  const wrapperStyle = {
    ...getBgWrapperStyle(props),
    ...style,
  };

  return (
    <Tag style={wrapperStyle} {...rest}>
      {hasBg && <div style={getOverlayStyle(props)} />}
      <div style={hasBg ? { position: 'relative', zIndex: 2 } : undefined}>
        {children}
      </div>
    </Tag>
  );
}

export default function BlockRenderer({ block }) {
  const p = block.props;

  switch (block.type) {
    case 'header':
      return (
        <BgWrapper props={p} tag="header" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '16px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: p.sticky ? 'sticky' : 'relative', top: 0, zIndex: 10 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: p.textColor }}>{p.logo}</div>
          <nav style={{ display: 'flex', gap: 24 }}>
            {(p.links || []).map((l, i) => (
              <a key={i} href="#" onClick={e => e.preventDefault()} style={{ color: p.textColor, textDecoration: 'none', fontSize: 15, opacity: 0.85 }}>{l}</a>
            ))}
          </nav>
        </BgWrapper>
      );

    case 'navbar':
      return (
        <BgWrapper props={p} tag="nav" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 1px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: p.textColor }}>{p.brand}</div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {(p.links || []).map((l, i) => (
              <a key={i} href="#" onClick={e => e.preventDefault()} style={{ color: p.textColor, textDecoration: 'none', fontSize: 14 }}>{l}</a>
            ))}
            <a href="#" onClick={e => e.preventDefault()} style={{ background: p.ctaColor, color: '#fff', padding: '8px 18px', borderRadius: 6, textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>{p.ctaLabel}</a>
          </div>
        </BgWrapper>
      );

    case 'hero':
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '100px 40px', textAlign: p.align }}>
          <h1 style={{ fontSize: 'clamp(36px,5vw,64px)', fontWeight: 800, color: p.textColor, margin: '0 0 20px', lineHeight: 1.15 }}>{p.headline}</h1>
          <p style={{ fontSize: 18, color: p.textColor, opacity: 0.75, maxWidth: 600, margin: `0 ${p.align === 'center' ? 'auto' : '0'} 36px` }}>{p.subtext}</p>
          <a href="#" onClick={e => e.preventDefault()} style={{ display: 'inline-block', background: p.ctaColor, color: '#fff', padding: '14px 36px', borderRadius: 8, textDecoration: 'none', fontSize: 16, fontWeight: 600 }}>{p.ctaLabel}</a>
        </BgWrapper>
      );

    case 'text':
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: `${p.padding}px 40px` }}>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <p style={{ fontSize: Number(p.fontSize), color: p.color, lineHeight: 1.75, textAlign: p.align, margin: 0 }}>{p.content}</p>
          </div>
        </BgWrapper>
      );

    case 'image':
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: 0 }}>
          <img src={p.src} alt={p.alt} style={{ width: '100%', height: Number(p.height), objectFit: p.objectFit, display: 'block' }} onError={e => { e.target.src = 'https://placehold.co/1200x400?text=Image'; }} />
          {p.caption && <p style={{ textAlign: 'center', fontSize: 13, color: '#888', padding: '10px 20px', margin: 0 }}>{p.caption}</p>}
        </BgWrapper>
      );

    case 'cards':
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '80px 40px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.columns}, 1fr)`, gap: 24, maxWidth: 1100, margin: '0 auto' }}>
            {(p.cards || []).map((c, i) => (
              <div key={i} style={{ background: p.cardBg, borderRadius: 12, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>{c.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: p.headingColor, margin: '0 0 10px' }}>{c.title}</h3>
                <p style={{ fontSize: 14, color: p.textColor, margin: 0, lineHeight: 1.6 }}>{c.text}</p>
              </div>
            ))}
          </div>
        </BgWrapper>
      );

    case 'testimonial':
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '80px 40px', textAlign: 'center' }}>
          <blockquote style={{ maxWidth: 680, margin: '0 auto' }}>
            <p style={{ fontSize: 22, fontStyle: 'italic', color: p.textColor, lineHeight: 1.6, margin: '0 0 32px' }}>"{p.quote}"</p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: p.textColor, fontSize: 14 }}>{p.avatar}</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, color: p.textColor }}>{p.author}</div>
                <div style={{ fontSize: 13, color: p.textColor, opacity: 0.75 }}>{p.role}</div>
              </div>
            </div>
          </blockquote>
        </BgWrapper>
      );

    case 'form':
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '80px 40px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, color: p.labelColor, margin: '0 0 8px' }}>{p.title}</h2>
            <p style={{ color: '#777', margin: '0 0 32px' }}>{p.subtitle}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input type="text" placeholder="Your Name" readOnly style={{ padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, outline: 'none', cursor: 'default' }} />
              <input type="email" placeholder="Email Address" readOnly style={{ padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, outline: 'none', cursor: 'default' }} />
              <textarea placeholder="Your message..." rows={5} readOnly style={{ padding: '12px 16px', border: '1px solid #ddd', borderRadius: 8, fontSize: 15, outline: 'none', resize: 'none', cursor: 'default' }} />
              <button onClick={e => e.preventDefault()} style={{ background: p.buttonColor, color: '#fff', padding: 13, border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: 'default' }}>{p.buttonLabel}</button>
            </div>
          </div>
        </BgWrapper>
      );

    case 'row': {
      const colFlex = { center: 'center', top: 'flex-start', bottom: 'flex-end', stretch: 'stretch' };
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: `${p.padding}px 40px` }}>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${p.columns || 2}, 1fr)`, gap: p.gap || 16, alignItems: colFlex[p.align] || 'center' }}>
            {(p.cols || []).map((col, i) => (
              <div key={i} style={{ minWidth: 0 }}>
                <ColRenderer col={col} />
              </div>
            ))}
          </div>
        </BgWrapper>
      );
    }

    case 'button': {
      const sizeMap = { sm: '10px 24px', md: '13px 32px', lg: '17px 44px' };
      const fontMap = { sm: 14, md: 16, lg: 19 };
      const btnStyle = p.style === 'outline'
        ? { background: 'transparent', border: `2px solid ${p.btnColor}`, color: p.btnColor }
        : p.style === 'ghost'
        ? { background: 'transparent', border: 'none', color: p.btnColor, textDecoration: 'underline' }
        : { background: p.btnColor, border: 'none', color: p.textColor };
      return (
        <BgWrapper props={p} tag="section" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: `${p.padding}px 40px`, textAlign: p.align }}>
          <a href="#" onClick={e => e.preventDefault()} style={{ display: 'inline-block', padding: sizeMap[p.size || 'md'], borderRadius: `${p.radius}px`, fontSize: fontMap[p.size || 'md'], fontWeight: 600, textDecoration: 'none', cursor: 'default', transition: 'opacity 0.2s', ...btnStyle }}>
            {p.label}
          </a>
        </BgWrapper>
      );
    }

    case 'divider':
      return (
        <BgWrapper props={p} tag="div" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: `${p.margin}px 40px` }}>
          <hr style={{ border: 'none', borderTop: `${p.height}px ${p.style === 'dashed' ? 'dashed' : p.style === 'dotted' ? 'dotted' : 'solid'} ${p.color}`, margin: 0 }} />
        </BgWrapper>
      );

    case 'footer':
      return (
        <BgWrapper props={p} tag="footer" style={{ background: p.bgImage ? 'transparent' : p.bgColor, padding: '48px 40px 32px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 24, marginBottom: 40 }}>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#ffffff', marginBottom: 8 }}>{p.brand}</div>
                <div style={{ fontSize: 14, color: p.textColor }}>{p.tagline}</div>
              </div>
              <div style={{ display: 'flex', gap: 24 }}>
                {(p.links || []).map((l, i) => (
                  <a key={i} href="#" onClick={e => e.preventDefault()} style={{ color: p.textColor, textDecoration: 'none', fontSize: 14 }}>{l}</a>
                ))}
              </div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, fontSize: 13, color: p.textColor }}>{p.copyright}</div>
          </div>
        </BgWrapper>
      );

    default:
      return <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Unknown block: {block.type}</div>;
  }
}
