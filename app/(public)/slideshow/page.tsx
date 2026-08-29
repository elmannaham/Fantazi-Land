import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fantazi-Land - Slideshow Premium',
  description: 'Découvrez nos 8 hôtesses d\'exception',
};

export default function SlideshowPage() {
  return (
    <div style={{ margin: 0, padding: 0, width: '100%', height: '100vh' }}>
      <iframe
        src="/slideshow-premium-30s.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        title="Fantazi-Land Premium Slideshow"
      />
    </div>
  );
}
