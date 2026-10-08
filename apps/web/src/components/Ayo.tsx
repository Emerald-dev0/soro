import { useEffect, useRef, useState, type ReactNode } from 'react';

export const AYO_POSES = {
  welcome: { src: '/ayo/welcome.jpg', alt: 'Ayo waving hello', caption: 'Ayo greets every customer the same way.' },
  listening: { src: '/ayo/listening.jpg', alt: 'Ayo listening attentively', caption: 'Ayo listens first.' },
  speaking: { src: '/ayo/speaking.jpg', alt: 'Ayo speaking confidently', caption: '…and speaks your language.' },
  presenting: { src: '/ayo/presenting.jpg', alt: 'Ayo presenting', caption: 'Meet Ayo, your conversational financial assistant.' },
  security: { src: '/ayo/security.jpg', alt: 'Ayo explaining a secure step', caption: 'Sensitive steps stay protected.' },
  success: { src: '/ayo/success.jpg', alt: 'Ayo confirming success', caption: 'Confirmed by the provider — never assumed.' },
  walking: { src: '/ayo/walking.jpg', alt: 'Ayo on the move', caption: 'Banking that moves with you.' },
} as const;

export type AyoPose = keyof typeof AYO_POSES;

export function Ayo({ pose, eager = false }: { pose: AyoPose; eager?: boolean }) {
  const meta = AYO_POSES[pose];
  return (
    <figure className="soro-ayo-frame" style={{ margin: 0 }}>
      <img src={meta.src} alt={meta.alt} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      <figcaption>{meta.caption}</figcaption>
    </figure>
  );
}

export function Reveal({ children, as: Tag = 'div', className = '' }: { children: ReactNode; as?: 'div' | 'section'; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(true); return; }
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) { setShown(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <Tag ref={ref as never} className={`soro-reveal ${shown ? 'shown' : ''} ${className}`}>{children}</Tag>;
}
