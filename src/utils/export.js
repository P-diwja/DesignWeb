import { getBgWrapperStyleStr, getOverlayStyleStr } from './bgImage';

function bgWrap(tag, p, innerStyle, content, closeTag) {
  const hasBg = !!p.bgImage;
  const bgStyle = hasBg ? getBgWrapperStyleStr(p) : '';
  const overlay = hasBg ? `<div style="${getOverlayStyleStr(p)}"></div>` : '';
  const innerWrap = hasBg
    ? `<div style="position:relative;z-index:2">${content}</div>`
    : content;
  const baseStyle = hasBg ? innerStyle.replace(/background:[^;]+;/, '') : innerStyle;
  return `<${tag} style="${baseStyle}${bgStyle}">${overlay}${innerWrap}</${closeTag || tag}>`;
}

export function renderBlockToHTML(block) {
  const p = block.props;
  switch (block.type) {
    case 'header':
      return bgWrap('header', p,
        `background:${p.bgColor};padding:16px 40px;display:flex;align-items:center;justify-content:space-between;${p.sticky ? 'position:sticky;top:0;z-index:100;' : ''}`,
        `<div style="font-size:22px;font-weight:700;color:${p.textColor}">${p.logo}</div>
  <nav style="display:flex;gap:24px">
    ${(p.links || []).map(l => `<a href="#" style="color:${p.textColor};text-decoration:none;font-size:15px;opacity:0.85">${l}</a>`).join('')}
  </nav>`);

    case 'navbar':
      return bgWrap('nav', p,
        `background:${p.bgColor};padding:14px 40px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 1px 8px rgba(0,0,0,0.08);`,
        `<div style="font-size:20px;font-weight:700;color:${p.textColor}">${p.brand}</div>
  <div style="display:flex;gap:24px;align-items:center">
    ${(p.links || []).map(l => `<a href="#" style="color:${p.textColor};text-decoration:none;font-size:14px">${l}</a>`).join('')}
    <a href="#" style="background:${p.ctaColor};color:#fff;padding:8px 18px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600">${p.ctaLabel}</a>
  </div>`);

    case 'hero':
      return bgWrap('section', p,
        `background:${p.bgColor};padding:100px 40px;text-align:${p.align};`,
        `<h1 style="font-size:clamp(36px,5vw,64px);font-weight:800;color:${p.textColor};margin:0 0 20px;line-height:1.15">${p.headline}</h1>
  <p style="font-size:18px;color:${p.textColor};opacity:0.75;max-width:600px;margin:0 ${p.align === 'center' ? 'auto' : '0'} 36px">${p.subtext}</p>
  <a href="${p.ctaLink}" style="display:inline-block;background:${p.ctaColor};color:#fff;padding:14px 36px;border-radius:8px;text-decoration:none;font-size:16px;font-weight:600">${p.ctaLabel}</a>`);

    case 'text':
      return bgWrap('section', p,
        `background:${p.bgColor};padding:${p.padding}px 40px;`,
        `<div style="max-width:800px;margin:0 auto">
    <p style="font-size:${p.fontSize}px;color:${p.color};line-height:1.75;text-align:${p.align};margin:0">${p.content}</p>
  </div>`);

    case 'image':
      return bgWrap('section', p,
        `background:${p.bgColor};padding:0;`,
        `<img src="${p.src}" alt="${p.alt}" style="width:100%;height:${p.height}px;object-fit:${p.objectFit};display:block">
  ${p.caption ? `<p style="text-align:center;font-size:13px;color:#888;padding:10px 20px;margin:0">${p.caption}</p>` : ''}`);

    case 'cards':
      return bgWrap('section', p,
        `background:${p.bgColor};padding:80px 40px;`,
        `<div style="display:grid;grid-template-columns:repeat(${p.columns},1fr);gap:24px;max-width:1100px;margin:0 auto">
    ${(p.cards || []).map(c => `
    <div style="background:${p.cardBg};border-radius:12px;padding:32px;box-shadow:0 2px 12px rgba(0,0,0,0.07)">
      <div style="font-size:32px;margin-bottom:16px">${c.icon}</div>
      <h3 style="font-size:18px;font-weight:700;color:${p.headingColor};margin:0 0 10px">${c.title}</h3>
      <p style="font-size:14px;color:${p.textColor};margin:0;line-height:1.6">${c.text}</p>
    </div>`).join('')}
  </div>`);

    case 'testimonial':
      return bgWrap('section', p,
        `background:${p.bgColor};padding:80px 40px;text-align:center;`,
        `<blockquote style="max-width:680px;margin:0 auto">
    <p style="font-size:22px;font-style:italic;color:${p.textColor};line-height:1.6;margin:0 0 32px">"${p.quote}"</p>
    <div style="display:flex;align-items:center;justify-content:center;gap:14px">
      <div style="width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.25);display:flex;align-items:center;justify-content:center;font-weight:700;color:${p.textColor};font-size:14px">${p.avatar}</div>
      <div style="text-align:left">
        <div style="font-weight:700;color:${p.textColor}">${p.author}</div>
        <div style="font-size:13px;color:${p.textColor};opacity:0.75">${p.role}</div>
      </div>
    </div>
  </blockquote>`, 'section');

    case 'form':
      return bgWrap('section', p,
        `background:${p.bgColor};padding:80px 40px;`,
        `<div style="max-width:560px;margin:0 auto">
    <h2 style="font-size:28px;font-weight:700;color:${p.labelColor};margin:0 0 8px">${p.title}</h2>
    <p style="color:#777;margin:0 0 32px">${p.subtitle}</p>
    <form style="display:flex;flex-direction:column;gap:16px">
      <input type="text" placeholder="Your Name" style="padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:15px;outline:none">
      <input type="email" placeholder="Email Address" style="padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:15px;outline:none">
      <textarea placeholder="Your message..." rows="5" style="padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:15px;outline:none;resize:vertical"></textarea>
      <button type="submit" style="background:${p.buttonColor};color:#fff;padding:13px;border:none;border-radius:8px;font-size:16px;font-weight:600;cursor:pointer">${p.buttonLabel}</button>
    </form>
  </div>`);

    case 'row': {
      const colsHTML = (p.cols || []).map(col => {
        const cp = col.props || {};
        let inner = '';
        if (col.type === 'button') {
          const sizeMap = { sm: '8px 20px', md: '12px 28px', lg: '16px 36px' };
          const fontMap = { sm: 13, md: 15, lg: 18 };
          const btnStyle = cp.style === 'outline' ? `background:transparent;border:2px solid ${cp.btnColor};color:${cp.btnColor};`
            : cp.style === 'ghost' ? `background:transparent;border:none;color:${cp.btnColor};text-decoration:underline;`
            : `background:${cp.btnColor};border:none;color:${cp.textColor};`;
          inner = `<div style="text-align:${cp.align||'center'}"><a href="${cp.link||'#'}" style="display:inline-block;padding:${sizeMap[cp.size||'md']};border-radius:${cp.radius||8}px;font-size:${fontMap[cp.size||'md']}px;font-weight:600;text-decoration:none;${btnStyle}">${cp.label||'Button'}</a></div>`;
        } else if (col.type === 'text') {
          inner = `<p style="font-size:${cp.fontSize||16}px;color:${cp.color||'#333'};line-height:1.7;margin:0;text-align:${cp.align||'left'}">${cp.content||''}</p>`;
        } else if (col.type === 'image') {
          inner = `<img src="${cp.src}" alt="${cp.alt||''}" style="width:100%;height:${cp.height||200}px;object-fit:${cp.objectFit||'cover'};border-radius:8px;display:block">`;
        }
        return `<div style="min-width:0">${inner}</div>`;
      }).join('');
      return bgWrap('section', p, `background:${p.bgColor};padding:${p.padding}px 40px;`,
        `<div style="display:grid;grid-template-columns:repeat(${p.columns||2},1fr);gap:${p.gap||16}px;align-items:center">${colsHTML}</div>`);
    }

    case 'button': {
      const sizeMap = { sm: '10px 24px', md: '13px 32px', lg: '17px 44px' };
      const fontMap = { sm: 14, md: 16, lg: 19 };
      const btnStyle = p.style === 'outline'
        ? `background:transparent;border:2px solid ${p.btnColor};color:${p.btnColor};`
        : p.style === 'ghost'
        ? `background:transparent;border:none;color:${p.btnColor};text-decoration:underline;`
        : `background:${p.btnColor};border:none;color:${p.textColor};`;
      return bgWrap('section', p, `background:${p.bgColor};padding:${p.padding}px 40px;text-align:${p.align};`,
        `<a href="${p.link}" style="display:inline-block;padding:${sizeMap[p.size||'md']};border-radius:${p.radius}px;font-size:${fontMap[p.size||'md']}px;font-weight:600;text-decoration:none;${btnStyle}">${p.label}</a>`);
    }

    case 'divider':
      return bgWrap('div', p,
        `background:${p.bgColor};padding:${p.margin}px 40px;`,
        `<hr style="border:none;border-top:${p.height}px ${p.style === 'dashed' ? 'dashed' : p.style === 'dotted' ? 'dotted' : 'solid'} ${p.color};margin:0">`);

    case 'footer':
      return bgWrap('footer', p,
        `background:${p.bgColor};padding:48px 40px 32px;`,
        `<div style="max-width:1100px;margin:0 auto">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:24px;margin-bottom:40px">
      <div>
        <div style="font-size:20px;font-weight:700;color:#ffffff;margin-bottom:8px">${p.brand}</div>
        <div style="font-size:14px;color:${p.textColor}">${p.tagline}</div>
      </div>
      <div style="display:flex;gap:24px">
        ${(p.links || []).map(l => `<a href="#" style="color:${p.textColor};text-decoration:none;font-size:14px">${l}</a>`).join('')}
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:24px;font-size:13px;color:${p.textColor}">${p.copyright}</div>
  </div>`);

    default:
      return '';
  }
}

export function exportToHTML(blocks, frame) {
  const patternCSS = frame.pattern === 'dots'
    ? `background-color:${frame.bg};background-image:radial-gradient(circle,#ccc 1px,transparent 1px);background-size:24px 24px;`
    : frame.pattern === 'grid'
    ? `background-color:${frame.bg};background-image:linear-gradient(#e0e0e0 1px,transparent 1px),linear-gradient(90deg,#e0e0e0 1px,transparent 1px);background-size:40px 40px;`
    : frame.pattern === 'lines'
    ? `background-color:${frame.bg};background-image:repeating-linear-gradient(0deg,transparent,transparent 38px,#e0e0e0 38px,#e0e0e0 39px);`
    : `background:${frame.bg};`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Page — Built with Blockwise</title>
  <style>
    *,*::before,*::after{box-sizing:border-box}
    body{margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;${patternCSS}}
    img{max-width:100%}
    @media(max-width:768px){
      header,nav{flex-direction:column;gap:16px;text-align:center}
    }
  </style>
</head>
<body>
  <div style="border-radius:${frame.radius}px;overflow:hidden">
${blocks.map(b => renderBlockToHTML(b)).join('\n')}
  </div>
</body>
</html>`;
}
