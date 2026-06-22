export const BLOCK_TYPES = {
  header: {
    type: 'header',
    label: 'Header',
    icon: '🔤',
    description: 'Site logo + navigation',
    defaultProps: {
      logo: 'Blockwise',
      links: ['Home', 'About', 'Work', 'Contact'],
      bgColor: '#1a1a2e',
      textColor: '#ffffff',
      sticky: false,
    },
  },
  hero: {
    type: 'hero',
    label: 'Hero',
    icon: '🚀',
    description: 'Headline + CTA button',
    defaultProps: {
      headline: 'Build beautiful pages, fast.',
      subtext: 'Drag blocks, style everything, export clean HTML — no code needed.',
      ctaLabel: 'Get Started',
      ctaLink: '#',
      ctaColor: '#7c6af7',
      bgColor: '#0f0f1a',
      textColor: '#ffffff',
      align: 'center',
    },
  },
  navbar: {
    type: 'navbar',
    label: 'Navbar',
    icon: '📌',
    description: 'Top navigation bar',
    defaultProps: {
      brand: 'Brand',
      links: ['Home', 'Features', 'Pricing', 'Blog'],
      bgColor: '#ffffff',
      textColor: '#111111',
      ctaLabel: 'Sign Up',
      ctaColor: '#7c6af7',
    },
  },
  text: {
    type: 'text',
    label: 'Text',
    icon: '📝',
    description: 'Paragraph or rich text',
    defaultProps: {
      content: 'Start writing your content here. This is a flexible text block that supports headings, body copy, and formatted paragraphs.',
      fontSize: '16',
      color: '#333333',
      bgColor: '#ffffff',
      align: 'left',
      padding: '40',
    },
  },
  image: {
    type: 'image',
    label: 'Image',
    icon: '🖼️',
    description: 'Picture with caption',
    defaultProps: {
      src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      alt: 'Beautiful landscape',
      caption: 'Photo caption goes here',
      objectFit: 'cover',
      height: '400',
      bgColor: '#f5f5f5',
    },
  },
  cards: {
    type: 'cards',
    label: 'Card Grid',
    icon: '🃏',
    description: '2–3 column card layout',
    defaultProps: {
      columns: 3,
      bgColor: '#f9fafb',
      cardBg: '#ffffff',
      headingColor: '#111111',
      textColor: '#555555',
      accentColor: '#7c6af7',
      cards: [
        { title: 'Fast & Light', icon: '⚡', text: 'Optimized for speed with zero unnecessary bloat.' },
        { title: 'Customizable', icon: '🎨', text: 'Every element is yours to style and personalize.' },
        { title: 'Export Ready', icon: '📦', text: 'One click to export clean, production-ready HTML.' },
      ],
    },
  },
  testimonial: {
    type: 'testimonial',
    label: 'Testimonial',
    icon: '💬',
    description: 'Quote + author',
    defaultProps: {
      quote: 'This is the most intuitive page builder I have ever used. We shipped our landing page in under an hour!',
      author: 'Priya Sharma',
      role: 'Product Designer at Zeta',
      avatar: 'PS',
      bgColor: '#7c6af7',
      textColor: '#ffffff',
    },
  },
  form: {
    type: 'form',
    label: 'Contact Form',
    icon: '📬',
    description: 'Name, email & message',
    defaultProps: {
      title: 'Get in Touch',
      subtitle: 'We\'ll get back to you within 24 hours.',
      buttonLabel: 'Send Message',
      buttonColor: '#7c6af7',
      bgColor: '#f9fafb',
      labelColor: '#333333',
    },
  },
  divider: {
    type: 'divider',
    label: 'Divider',
    icon: '➖',
    description: 'Section separator',
    defaultProps: {
      style: 'line',
      color: '#e5e7eb',
      bgColor: '#ffffff',
      height: '1',
      margin: '40',
    },
  },
  footer: {
    type: 'footer',
    label: 'Footer',
    icon: '📄',
    description: 'Page footer with links',
    defaultProps: {
      brand: 'Blockwise',
      tagline: 'Build pages you\'re proud of.',
      links: ['Privacy', 'Terms', 'Contact'],
      copyright: `© ${new Date().getFullYear()} Blockwise. All rights reserved.`,
      bgColor: '#111111',
      textColor: '#aaaaaa',
    },
  },
  row: {
    type: 'row',
    label: 'Row',
    icon: '⊞',
    description: 'Side-by-side columns',
    defaultProps: {
      columns: 2,
      gap: 16,
      bgColor: '#ffffff',
      padding: '40',
      align: 'center', // vertical align of columns
      // Each column has: type, props (same as any block)
      cols: [
        { type: 'button', props: { label: 'Get Started', link: '#', bgColor: 'transparent', btnColor: '#7c6af7', textColor: '#ffffff', size: 'md', style: 'filled', align: 'center', radius: '8', padding: '0' } },
        { type: 'button', props: { label: 'Learn More', link: '#', bgColor: 'transparent', btnColor: '#7c6af7', textColor: '#7c6af7', size: 'md', style: 'outline', align: 'center', radius: '8', padding: '0' } },
      ],
    },
  },
  button: {
    type: 'button',
    label: 'Button',
    icon: '🔘',
    description: 'CTA button, standalone',
    defaultProps: {
      label: 'Click Me',
      link: '#',
      bgColor: '#ffffff',
      btnColor: '#7c6af7',
      textColor: '#ffffff',
      size: 'md',
      style: 'filled',
      align: 'center',
      radius: '8',
      padding: '40',
    },
  },
};

export const BLOCK_ORDER = ['header', 'navbar', 'hero', 'row', 'button', 'text', 'image', 'cards', 'testimonial', 'form', 'divider', 'footer'];

export function createBlock(type) {
  const def = BLOCK_TYPES[type];
  return {
    id: `${type}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    type,
    props: { ...def.defaultProps, ...(def.defaultProps.cards ? { cards: def.defaultProps.cards.map(c => ({ ...c })) } : {}) },
  };
}
