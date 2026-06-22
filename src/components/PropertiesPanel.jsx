import { useState, useCallback, useRef } from 'react';
import { useBuilder } from '../store/BuilderStore';

/* ── tiny shared input atoms ── */
function Label({ children }) {
  return <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">{children}</label>;
}
function Input({ value, onChange, type = 'text', ...rest }) {
  return (
    <input
      type={type}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors"
      {...rest}
    />
  );
}
function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Label>{label}</Label>
      <div className="ml-auto flex items-center gap-1.5">
        <input type="color" value={value || '#ffffff'} onChange={e => onChange(e.target.value)}
          className="w-7 h-7 rounded cursor-pointer border border-[var(--border)] bg-transparent p-0.5" />
        <input type="text" value={value || ''} onChange={e => onChange(e.target.value)}
          className="w-20 bg-[var(--bg-deep)] border border-[var(--border)] rounded px-2 py-1 text-xs text-[var(--text-primary)] outline-none focus:border-[var(--accent)]" />
      </div>
    </div>
  );
}
function Select({ value, onChange, options }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)]">
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}
function Textarea({ value, onChange, rows = 3 }) {
  return (
    <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} rows={rows}
      className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-2.5 py-1.5 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none transition-colors" />
  );
}
function Section({ title, children }) {
  return (
    <div className="border-b border-[var(--border)] pb-4 mb-4 last:border-0 last:mb-0">
      <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-faint)] mb-3">{title}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/* ── Background Image Section (universal — appears on every block) ── */
function BgImageSection({ block, dispatch }) {
  const p = block.props;
  const fileRef = useRef();
  const set = (key, val) => dispatch({ type: 'UPDATE_BLOCK_PROP', id: block.id, key, value: val });
  const hasBg = !!p.bgImage;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('bgImage', ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  return (
    <Section title="Background Image">
      {/* Toggle */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <div
          onClick={() => { if (hasBg) { set('bgImage', ''); } }}
          className={`w-8 h-4 rounded-full transition-colors relative ${hasBg ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`}
        >
          <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${hasBg ? 'translate-x-4' : 'translate-x-0.5'}`} />
        </div>
        <span className="text-xs text-[var(--text-muted)]">{hasBg ? 'Enabled' : 'Disabled'}</span>
      </label>

      {/* URL input */}
      <div>
        <Label>Image URL</Label>
        <Input
          value={p.bgImage?.startsWith('data:') ? '' : (p.bgImage || '')}
          onChange={v => set('bgImage', v)}
          placeholder="https://example.com/photo.jpg"
        />
      </div>

      {/* Upload */}
      <div>
        <Label>Or Upload File</Label>
        <button
          onClick={() => fileRef.current?.click()}
          className="w-full py-2 border border-dashed border-[var(--border)] rounded-md text-xs text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors flex items-center justify-center gap-2"
        >
          <span>📁</span>
          {p.bgImage?.startsWith('data:') ? '✓ File loaded — click to change' : 'Click to upload image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      </div>

      {/* Preview thumbnail */}
      {hasBg && (
        <div className="relative rounded-md overflow-hidden h-16 border border-[var(--border)]">
          <img
            src={p.bgImage}
            alt="bg preview"
            className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }}
          />
          <button
            onClick={() => set('bgImage', '')}
            className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded text-white text-[10px] hover:bg-[var(--danger)] transition-colors flex items-center justify-center"
            title="Remove background image"
          >✕</button>
        </div>
      )}

      {/* Only show these when bg is set */}
      {hasBg && (
        <>
          {/* Overlay color */}
          <ColorRow
            label="Overlay Color"
            value={p.overlayColor || '#000000'}
            onChange={v => set('overlayColor', v)}
          />

          {/* Overlay opacity */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label>Overlay Opacity</Label>
              <span className="text-xs text-[var(--text-faint)]">{Math.round((p.overlayOpacity ?? 0.4) * 100)}%</span>
            </div>
            <input
              type="range" min="0" max="1" step="0.05"
              value={p.overlayOpacity ?? 0.4}
              onChange={e => set('overlayOpacity', parseFloat(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
            <div className="flex justify-between text-[10px] text-[var(--text-faint)] mt-0.5">
              <span>Transparent</span><span>Solid</span>
            </div>
          </div>

          {/* Bg size */}
          <div>
            <Label>Image Size</Label>
            <Select
              value={p.bgImageSize || 'cover'}
              onChange={v => set('bgImageSize', v)}
              options={[
                { value: 'cover', label: 'Cover (fill block)' },
                { value: 'contain', label: 'Contain (fit inside)' },
                { value: '100% auto', label: 'Full width' },
                { value: 'auto 100%', label: 'Full height' },
                { value: 'auto', label: 'Original size' },
              ]}
            />
          </div>

          {/* Bg position */}
          <div>
            <Label>Image Position</Label>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[
                ['top left','↖'],['top center','↑'],['top right','↗'],
                ['center left','←'],['center','⊙'],['center right','→'],
                ['bottom left','↙'],['bottom center','↓'],['bottom right','↘'],
              ].map(([val, icon]) => (
                <button
                  key={val}
                  onClick={() => set('bgImagePos', val)}
                  title={val}
                  className={`py-1.5 rounded text-sm transition-all ${(p.bgImagePos || 'center') === val ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'}`}
                >{icon}</button>
              ))}
            </div>
          </div>
        </>
      )}
    </Section>
  );
}

/* ── per-block editors ── */
function LinksEditor({ links, onChange }) {
  const add = () => onChange([...(links || []), 'New Link']);
  const remove = i => onChange((links || []).filter((_, j) => j !== i));
  const update = (i, v) => onChange((links || []).map((l, j) => j === i ? v : l));
  return (
    <div className="space-y-1.5">
      {(links || []).map((l, i) => (
        <div key={i} className="flex gap-1.5">
          <Input value={l} onChange={v => update(i, v)} />
          <button onClick={() => remove(i)} className="text-[var(--text-faint)] hover:text-[var(--danger)] text-sm px-1.5 flex-shrink-0 transition-colors">✕</button>
        </div>
      ))}
      <button onClick={add} className="text-xs text-[var(--accent)] hover:text-[var(--accent-light)] mt-1 transition-colors">+ Add link</button>
    </div>
  );
}

function CardsEditor({ cards, onChange }) {
  const updateCard = (i, key, val) => onChange(cards.map((c, j) => j === i ? { ...c, [key]: val } : c));
  const add = () => onChange([...(cards || []), { title: 'New Card', icon: '✨', text: 'Card description.' }]);
  const remove = i => onChange((cards || []).filter((_, j) => j !== i));
  return (
    <div className="space-y-3">
      {(cards || []).map((c, i) => (
        <div key={i} className="bg-[var(--bg-deep)] rounded-lg p-2.5 space-y-2 border border-[var(--border)]">
          <div className="flex gap-1.5">
            <Input value={c.icon} onChange={v => updateCard(i, 'icon', v)} placeholder="Icon" />
            <button onClick={() => remove(i)} className="text-[var(--text-faint)] hover:text-[var(--danger)] text-sm px-1.5 transition-colors">✕</button>
          </div>
          <Input value={c.title} onChange={v => updateCard(i, 'title', v)} placeholder="Title" />
          <Textarea value={c.text} onChange={v => updateCard(i, 'text', v)} rows={2} />
        </div>
      ))}
      <button onClick={add} className="text-xs text-[var(--accent)] hover:text-[var(--accent-light)] transition-colors">+ Add card</button>
    </div>
  );
}

function BlockPropsEditor({ block, dispatch }) {
  const p = block.props;
  const set = (key, val) => dispatch({ type: 'UPDATE_BLOCK_PROP', id: block.id, key, value: val });

  const bgSection = <BgImageSection block={block} dispatch={dispatch} />;

  // Universal layout controls: width, opacity, z-index, alignment
  const layoutSection = (
    <Section title="Layout & Stacking">
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Block Width</Label>
          <span className="text-xs text-[var(--accent)]">{p._width || 100}%</span>
        </div>
        <input type="range" min="20" max="100" step="5" value={p._width || 100}
          onChange={e => set('_width', Number(e.target.value))} className="w-full accent-[var(--accent)]" />
        <div className="flex justify-between text-[9px] text-[var(--text-faint)] mt-0.5"><span>20%</span><span>100%</span></div>
      </div>
      {(p._width || 100) < 100 && (
        <div>
          <Label>Horizontal Align</Label>
          <div className="grid grid-cols-3 gap-1 mt-1">
            {[['left','←'],['center','↔'],['right','→']].map(([v,icon]) => (
              <button key={v} onClick={() => set('_align', v)}
                className={`py-1.5 rounded text-xs transition-all ${(p._align||'center')===v ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'}`}>
                {icon} {v}
              </button>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Opacity</Label>
          <span className="text-xs text-[var(--accent)]">{Math.round((p._opacity ?? 1) * 100)}%</span>
        </div>
        <input type="range" min="0" max="1" step="0.05" value={p._opacity ?? 1}
          onChange={e => set('_opacity', parseFloat(e.target.value))} className="w-full accent-[var(--accent)]" />
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label>Layer (Z-Index)</Label>
          <div className="flex items-center gap-1">
            <button onClick={() => set('_zIndex', (p._zIndex || 0) - 1)} className="w-5 h-5 bg-[var(--bg-deep)] border border-[var(--border)] rounded text-xs text-[var(--text-muted)] hover:text-white">−</button>
            <span className="text-xs text-[var(--accent)] w-5 text-center">{p._zIndex || 0}</span>
            <button onClick={() => set('_zIndex', (p._zIndex || 0) + 1)} className="w-5 h-5 bg-[var(--bg-deep)] border border-[var(--border)] rounded text-xs text-[var(--text-muted)] hover:text-white">+</button>
          </div>
        </div>
        <p className="text-[10px] text-[var(--text-faint)] mt-1">Higher = appears on top of other blocks</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1">
          <Label>Overlap Previous Block</Label>
          <span className="text-xs text-[var(--accent)]">{p._overlap || 0}px</span>
        </div>
        <input type="range" min="0" max="300" step="10" value={p._overlap || 0}
          onChange={e => set('_overlap', Number(e.target.value))} className="w-full accent-[var(--accent)]" />
        <p className="text-[10px] text-[var(--text-faint)] mt-1">Pulls block up to overlap the block above it. Use with Z-Index to layer text over images.</p>
      </div>
    </Section>
  );

  switch (block.type) {
    case 'header':
      return <>
        <Section title="Content">
          <div><Label>Logo Text</Label><Input value={p.logo} onChange={v => set('logo', v)} /></div>
          <div><Label>Nav Links</Label><LinksEditor links={p.links} onChange={v => set('links', v)} /></div>
          <label className="flex items-center gap-2 text-sm text-[var(--text-muted)] cursor-pointer">
            <input type="checkbox" checked={!!p.sticky} onChange={e => set('sticky', e.target.checked)} className="accent-[var(--accent)]" />
            Sticky header
          </label>
        </Section>
        <Section title="Colors">
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Text" value={p.textColor} onChange={v => set('textColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'navbar':
      return <>
        <Section title="Content">
          <div><Label>Brand Name</Label><Input value={p.brand} onChange={v => set('brand', v)} /></div>
          <div><Label>Nav Links</Label><LinksEditor links={p.links} onChange={v => set('links', v)} /></div>
          <div><Label>CTA Button</Label><Input value={p.ctaLabel} onChange={v => set('ctaLabel', v)} /></div>
        </Section>
        <Section title="Colors">
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Text" value={p.textColor} onChange={v => set('textColor', v)} />
          <ColorRow label="CTA Color" value={p.ctaColor} onChange={v => set('ctaColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'hero':
      return <>
        <Section title="Content">
          <div><Label>Headline</Label><Textarea value={p.headline} onChange={v => set('headline', v)} rows={2} /></div>
          <div><Label>Subtext</Label><Textarea value={p.subtext} onChange={v => set('subtext', v)} /></div>
          <div><Label>Button Label</Label><Input value={p.ctaLabel} onChange={v => set('ctaLabel', v)} /></div>
          <div><Label>Button Link</Label><Input value={p.ctaLink} onChange={v => set('ctaLink', v)} /></div>
        </Section>
        <Section title="Style">
          <div><Label>Alignment</Label>
            <Select value={p.align} onChange={v => set('align', v)} options={[{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}]} />
          </div>
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Text" value={p.textColor} onChange={v => set('textColor', v)} />
          <ColorRow label="Button" value={p.ctaColor} onChange={v => set('ctaColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'text':
      return <>
        <Section title="Content">
          <div><Label>Text Content</Label><Textarea value={p.content} onChange={v => set('content', v)} rows={6} /></div>
        </Section>
        <Section title="Style">
          <div><Label>Font Size (px)</Label><Input type="number" value={p.fontSize} onChange={v => set('fontSize', v)} /></div>
          <div><Label>Alignment</Label>
            <Select value={p.align} onChange={v => set('align', v)} options={[{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'},{value:'justify',label:'Justify'}]} />
          </div>
          <div><Label>Padding (px)</Label><Input type="number" value={p.padding} onChange={v => set('padding', v)} /></div>
          <ColorRow label="Text" value={p.color} onChange={v => set('color', v)} />
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'image':
      return <>
        <Section title="Content">
          <div><Label>Image URL</Label><Input value={p.src} onChange={v => set('src', v)} /></div>
          <div><Label>Alt Text</Label><Input value={p.alt} onChange={v => set('alt', v)} /></div>
          <div><Label>Caption</Label><Input value={p.caption} onChange={v => set('caption', v)} /></div>
        </Section>
        <Section title="Style">
          <div><Label>Height (px)</Label><Input type="number" value={p.height} onChange={v => set('height', v)} /></div>
          <div><Label>Object Fit</Label>
            <Select value={p.objectFit} onChange={v => set('objectFit', v)} options={[{value:'cover',label:'Cover'},{value:'contain',label:'Contain'},{value:'fill',label:'Fill'}]} />
          </div>
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'cards':
      return <>
        <Section title="Cards">
          <div><Label>Columns</Label>
            <Select value={String(p.columns)} onChange={v => set('columns', Number(v))} options={[{value:'1',label:'1 Column'},{value:'2',label:'2 Columns'},{value:'3',label:'3 Columns'}]} />
          </div>
          <CardsEditor cards={p.cards} onChange={v => set('cards', v)} />
        </Section>
        <Section title="Colors">
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Card Bg" value={p.cardBg} onChange={v => set('cardBg', v)} />
          <ColorRow label="Heading" value={p.headingColor} onChange={v => set('headingColor', v)} />
          <ColorRow label="Text" value={p.textColor} onChange={v => set('textColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'testimonial':
      return <>
        <Section title="Content">
          <div><Label>Quote</Label><Textarea value={p.quote} onChange={v => set('quote', v)} rows={4} /></div>
          <div><Label>Author</Label><Input value={p.author} onChange={v => set('author', v)} /></div>
          <div><Label>Role / Company</Label><Input value={p.role} onChange={v => set('role', v)} /></div>
          <div><Label>Avatar Initials</Label><Input value={p.avatar} onChange={v => set('avatar', v)} /></div>
        </Section>
        <Section title="Colors">
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Text" value={p.textColor} onChange={v => set('textColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'form':
      return <>
        <Section title="Content">
          <div><Label>Title</Label><Input value={p.title} onChange={v => set('title', v)} /></div>
          <div><Label>Subtitle</Label><Input value={p.subtitle} onChange={v => set('subtitle', v)} /></div>
          <div><Label>Button Label</Label><Input value={p.buttonLabel} onChange={v => set('buttonLabel', v)} /></div>
        </Section>
        <Section title="Colors">
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Labels" value={p.labelColor} onChange={v => set('labelColor', v)} />
          <ColorRow label="Button" value={p.buttonColor} onChange={v => set('buttonColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'divider':
      return <>
        <Section title="Style">
          <div><Label>Line Style</Label>
            <Select value={p.style} onChange={v => set('style', v)} options={[{value:'solid',label:'Solid'},{value:'dashed',label:'Dashed'},{value:'dotted',label:'Dotted'}]} />
          </div>
          <div><Label>Thickness (px)</Label><Input type="number" value={p.height} onChange={v => set('height', v)} /></div>
          <div><Label>Margin (px)</Label><Input type="number" value={p.margin} onChange={v => set('margin', v)} /></div>
          <ColorRow label="Line Color" value={p.color} onChange={v => set('color', v)} />
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'footer':
      return <>
        <Section title="Content">
          <div><Label>Brand</Label><Input value={p.brand} onChange={v => set('brand', v)} /></div>
          <div><Label>Tagline</Label><Input value={p.tagline} onChange={v => set('tagline', v)} /></div>
          <div><Label>Links</Label><LinksEditor links={p.links} onChange={v => set('links', v)} /></div>
          <div><Label>Copyright</Label><Input value={p.copyright} onChange={v => set('copyright', v)} /></div>
        </Section>
        <Section title="Colors">
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
          <ColorRow label="Text" value={p.textColor} onChange={v => set('textColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    case 'row': {
      const updateCol = (i, key, val) => {
        const cols = (p.cols || []).map((c, j) => j === i ? { ...c, props: { ...c.props, [key]: val } } : c);
        set('cols', cols);
      };
      const setColType = (i, type) => {
        const defaultPropsByType = {
          button: { label: 'Button', link: '#', btnColor: '#7c6af7', textColor: '#ffffff', size: 'md', style: 'filled', align: 'center', radius: '8' },
          text: { content: 'Your text here', fontSize: '16', color: '#333333', align: 'left' },
          image: { src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80', alt: 'Image', height: '200', objectFit: 'cover' },
        };
        const cols = (p.cols || []).map((c, j) => j === i ? { type, props: defaultPropsByType[type] || {} } : c);
        set('cols', cols);
      };
      return <>
        <Section title="Row Layout">
          <div><Label>Columns</Label>
            <Select value={String(p.columns || 2)} onChange={v => {
              const n = Number(v);
              const cols = [...(p.cols || [])];
              while (cols.length < n) cols.push({ type: 'button', props: { label: 'Button', link: '#', btnColor: '#7c6af7', textColor: '#ffffff', size: 'md', style: 'filled', align: 'center', radius: '8' } });
              set('columns', n); set('cols', cols.slice(0, n));
            }} options={[{value:'2',label:'2 Columns'},{value:'3',label:'3 Columns'},{value:'4',label:'4 Columns'}]} />
          </div>
          <div><Label>Gap (px)</Label><Input type="number" value={p.gap || 16} onChange={v => set('gap', Number(v))} /></div>
          <div><Label>Padding (px)</Label><Input type="number" value={p.padding} onChange={v => set('padding', v)} /></div>
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
        </Section>
        {(p.cols || []).map((col, i) => (
          <Section key={i} title={`Column ${i + 1}`}>
            <div><Label>Content Type</Label>
              <Select value={col.type} onChange={v => setColType(i, v)} options={[{value:'button',label:'Button'},{value:'text',label:'Text'},{value:'image',label:'Image'}]} />
            </div>
            {col.type === 'button' && <>
              <div><Label>Label</Label><Input value={col.props.label} onChange={v => updateCol(i, 'label', v)} /></div>
              <div><Label>Link</Label><Input value={col.props.link} onChange={v => updateCol(i, 'link', v)} /></div>
              <div><Label>Style</Label><Select value={col.props.style} onChange={v => updateCol(i, 'style', v)} options={[{value:'filled',label:'Filled'},{value:'outline',label:'Outline'},{value:'ghost',label:'Ghost'}]} /></div>
              <div><Label>Size</Label><Select value={col.props.size} onChange={v => updateCol(i, 'size', v)} options={[{value:'sm',label:'Small'},{value:'md',label:'Medium'},{value:'lg',label:'Large'}]} /></div>
              <ColorRow label="Button Color" value={col.props.btnColor} onChange={v => updateCol(i, 'btnColor', v)} />
              <ColorRow label="Text Color" value={col.props.textColor} onChange={v => updateCol(i, 'textColor', v)} />
            </>}
            {col.type === 'text' && <>
              <div><Label>Content</Label><Textarea value={col.props.content} onChange={v => updateCol(i, 'content', v)} rows={3} /></div>
              <div><Label>Font Size (px)</Label><Input type="number" value={col.props.fontSize} onChange={v => updateCol(i, 'fontSize', v)} /></div>
              <ColorRow label="Text Color" value={col.props.color} onChange={v => updateCol(i, 'color', v)} />
            </>}
            {col.type === 'image' && <>
              <div><Label>Image URL</Label><Input value={col.props.src} onChange={v => updateCol(i, 'src', v)} /></div>
              <div><Label>Height (px)</Label><Input type="number" value={col.props.height} onChange={v => updateCol(i, 'height', v)} /></div>
            </>}
          </Section>
        ))}
        {bgSection}
        {layoutSection}
      </>;
    }

    case 'button':
      return <>
        <Section title="Content">
          <div><Label>Button Label</Label><Input value={p.label} onChange={v => set('label', v)} /></div>
          <div><Label>Link URL</Label><Input value={p.link} onChange={v => set('link', v)} /></div>
        </Section>
        <Section title="Style">
          <div><Label>Style</Label>
            <Select value={p.style} onChange={v => set('style', v)} options={[{value:'filled',label:'Filled'},{value:'outline',label:'Outline'},{value:'ghost',label:'Ghost / Link'}]} />
          </div>
          <div><Label>Size</Label>
            <Select value={p.size} onChange={v => set('size', v)} options={[{value:'sm',label:'Small'},{value:'md',label:'Medium'},{value:'lg',label:'Large'}]} />
          </div>
          <div><Label>Border Radius (px)</Label><Input type="number" value={p.radius} onChange={v => set('radius', v)} /></div>
          <div><Label>Alignment</Label>
            <Select value={p.align} onChange={v => set('align', v)} options={[{value:'left',label:'Left'},{value:'center',label:'Center'},{value:'right',label:'Right'}]} />
          </div>
          <div><Label>Padding (px)</Label><Input type="number" value={p.padding} onChange={v => set('padding', v)} /></div>
          <ColorRow label="Button Color" value={p.btnColor} onChange={v => set('btnColor', v)} />
          <ColorRow label="Text Color" value={p.textColor} onChange={v => set('textColor', v)} />
          <ColorRow label="Background" value={p.bgColor} onChange={v => set('bgColor', v)} />
        </Section>
        {bgSection}
        {layoutSection}
      </>;

    default:
      return <>{bgSection}{layoutSection}</>;
  }
}

/* ── AI Enhance Panel ── */
function AIPanel({ block }) {
  const { dispatch } = useBuilder();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const enhance = useCallback(async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a page builder AI. The user has a "${block.type}" block with these current properties:\n${JSON.stringify(block.props, null, 2)}\n\nUser request: "${prompt}"\n\nReturn ONLY a JSON object with the updated props (same keys). Do not include any explanation or markdown. Just raw JSON.`,
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.find(c => c.type === 'text')?.text || '';
      const clean = text.replace(/```json|```/g, '').trim();
      const newProps = JSON.parse(clean);
      dispatch({ type: 'UPDATE_BLOCK_PROPS', id: block.id, props: newProps });
      setPrompt('');
    } catch (e) {
      setError('AI enhance failed. Check your API key or try again.');
    }
    setLoading(false);
  }, [prompt, block, dispatch]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <span className="text-sm">✦</span>
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent-light)]">AI Enhance</span>
      </div>
      <textarea
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        rows={3}
        placeholder={`e.g. Make the headline catchier for a ${block.type} block`}
        onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) enhance(); }}
        className="w-full bg-[var(--bg-deep)] border border-[var(--accent)] border-opacity-50 rounded-md px-2.5 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-none"
      />
      <button
        onClick={enhance}
        disabled={loading || !prompt.trim()}
        className="w-full bg-[var(--accent)] hover:bg-[var(--accent-light)] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold py-2 rounded-md transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <><span className="animate-spin">◌</span> Enhancing…</>
        ) : (
          <><span>✦</span> Enhance with AI</>
        )}
      </button>
      {error && <p className="text-[var(--danger)] text-xs">{error}</p>}
      <p className="text-[10px] text-[var(--text-faint)]">Ctrl+Enter to run · Rewrites block content with AI</p>
    </div>
  );
}

/* ── Frame Settings ── */
function FramePanel() {
  const { state, dispatch } = useBuilder();
  const { frame } = state;
  const set = (key, val) => dispatch({ type: 'SET_FRAME', frame: { [key]: val } });

  return (
    <div className="space-y-4">
      <Section title="Canvas">
        <ColorRow label="Background" value={frame.bg} onChange={v => set('bg', v)} />
        <div>
          <Label>Pattern</Label>
          <div className="grid grid-cols-4 gap-1.5 mt-1.5">
            {['none', 'dots', 'grid', 'lines'].map(p => (
              <button
                key={p}
                onClick={() => set('pattern', p)}
                className={`py-1.5 rounded text-xs font-medium capitalize transition-all ${frame.pattern === p ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)]'}`}
              >{p}</button>
            ))}
          </div>
        </div>
        <div>
          <Label>Corner Radius (px)</Label>
          <input type="range" min="0" max="32" value={frame.radius} onChange={e => set('radius', Number(e.target.value))}
            className="w-full mt-1.5 accent-[var(--accent)]" />
          <div className="text-xs text-[var(--text-faint)] mt-0.5">{frame.radius}px</div>
        </div>
      </Section>
      <button
        onClick={() => dispatch({ type: 'SET_FRAME', frame: { bg: '#ffffff', pattern: 'none', radius: 0 } })}
        className="text-xs text-[var(--text-faint)] hover:text-[var(--danger)] transition-colors"
      >Reset frame</button>
    </div>
  );
}

const BLOCK_ICONS_MAP = { header:'🔤', navbar:'📌', hero:'🚀', text:'📝', image:'🖼️', cards:'🃏', testimonial:'💬', form:'📬', divider:'➖', footer:'📄' };

/**
 * Nielsen fixes:
 * #1 Visibility — selected block name + icon always shown in panel header
 * #3 User control — clear X button to deselect, escape key works
 * #4 Consistency — tab style matches toolbar, all inputs same height
 * #6 Recognition — tabs labelled fully, not just icons
 * #8 Aesthetic — logical grouping, no-selection state is useful (shows frame panel)
 * #9 Error recovery — AI errors shown inline with retry guidance
 * #10 Help — empty state explains what to do
 */
export default function PropertiesPanel() {
  const { state, dispatch } = useBuilder();
  const { blocks, selectedId } = state;
  const selectedBlock = blocks.find(b => b.id === selectedId);
  const [tab, setTab] = useState('props');

  const TABS = [
    { id: 'props', label: 'Properties', icon: <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4.5v3l2 1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg> },
    { id: 'ai',    label: 'AI Enhance', icon: <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4H13l-3.5 2.5 1.5 4L7 9l-4 2.5 1.5-4L1 5h4.5L7 1z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"/></svg> },
  ];

  return (
    <aside
      className="w-64 flex-shrink-0 border-l border-[var(--border)] bg-[var(--bg-panel)] flex flex-col overflow-hidden"
      aria-label="Properties panel"
    >
      {selectedBlock ? (
        <>
          {/* ── Panel header: selected block identity ── */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] flex items-center justify-center text-base flex-shrink-0">
              {BLOCK_ICONS_MAP[selectedBlock.type] || '🧩'}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold capitalize text-[var(--text-primary)] leading-tight">{selectedBlock.type} Block</div>
              <div className="text-[10px] text-[var(--text-faint)]">Click canvas to deselect</div>
            </div>
            <button
              onClick={() => dispatch({ type: 'DESELECT' })}
              aria-label="Close properties panel"
              title="Deselect block (Esc)"
              className="ml-auto w-6 h-6 flex items-center justify-center rounded-md text-[var(--text-faint)] hover:text-white hover:bg-[var(--bg-hover)] transition-all flex-shrink-0"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 2l6 6M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
          </div>

          {/* ── Tabs ── */}
          <div role="tablist" className="flex border-b border-[var(--border)] flex-shrink-0">
            {TABS.map(t => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all border-b-2 ${
                  tab === t.id
                    ? 'text-[var(--accent)] border-[var(--accent)]'
                    : 'text-[var(--text-faint)] border-transparent hover:text-[var(--text-muted)]'
                }`}
              >
                <span className={tab === t.id ? 'text-[var(--accent)]' : 'text-[var(--text-faint)]'}>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>

          {/* ── Content ── */}
          <div role="tabpanel" className="flex-1 overflow-y-auto p-4">
            {tab === 'props'
              ? <BlockPropsEditor block={selectedBlock} dispatch={dispatch} />
              : <AIPanel block={selectedBlock} />
            }
          </div>
        </>
      ) : (
        <>
          {/* ── No selection: Frame panel + empty state hint ── */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex-shrink-0">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--text-primary)]">Canvas Settings</h2>
            <p className="text-[11px] text-[var(--text-faint)] mt-0.5">Background, pattern, corners</p>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FramePanel />
          </div>
          {/* Empty-state hint at bottom (#10 Help) */}
          <div className="px-4 py-3 border-t border-[var(--border)] flex-shrink-0">
            <div className="flex items-start gap-2.5 bg-[var(--bg-deep)] rounded-lg p-3 border border-[var(--border)]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[var(--accent)] flex-shrink-0 mt-0.5"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/><path d="M7 6v4M7 4.5v.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              <p className="text-[11px] text-[var(--text-faint)] leading-relaxed">
                <strong className="text-[var(--text-muted)]">Click any block</strong> on the canvas to edit its content, colors, and background image.
              </p>
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
