import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

/**
 * SIMPLE TEST PAGE for BlogImageThumbnail hover debugging
 * 
 * Navigate to this page to test if hover works with:
 * - Pure HTML/CSS test (no React)
 * - React component test
 * - ReactMarkdown rendering
 */

const TEST_IMAGE_URL = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800';

function BlogImageThumbnail({ src, alt, onClick }: { src?: string; alt?: string; onClick?: () => void }) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div 
      onMouseEnter={() => {
        console.log('✅ HOVER: Mouse Enter');
        setIsHovered(true);
      }}
      onMouseLeave={() => {
        console.log('❌ HOVER: Mouse Leave');
        setIsHovered(false);
      }}
      onClick={() => {
        console.log('🖱️ CLICK: Image clicked');
        onClick?.();
      }}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '800px',
        height: '200px',
        margin: '32px auto',
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: 'pointer',
        border: isHovered 
          ? '3px solid rgba(255, 215, 0, 0.9)' 
          : '2px solid rgba(255,255,255,0.2)',
        boxShadow: isHovered
          ? '0 0 40px rgba(255, 215, 0, 0.6), 0 8px 32px rgba(0,0,0,0.4)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        transition: 'all 0.3s ease',
        background: isHovered ? 'rgba(255, 215, 0, 0.05)' : 'transparent'
      }}
    >
      {/* Image layer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url(${src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 0.5s ease',
          pointerEvents: 'none'
        }}
      />
      
      {/* Overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: isHovered 
          ? 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.3))' 
          : 'linear-gradient(to bottom, rgba(0,0,0,0), rgba(0,0,0,0.2))',
        zIndex: 1,
        transition: 'all 0.3s ease'
      }} />
      
      {/* Zoom icon */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: `translate(-50%, -50%) scale(${isHovered ? 1 : 0.8})`,
        opacity: isHovered ? 1 : 0,
        zIndex: 10,
        background: 'rgba(0,0,0,0.8)',
        border: '2px solid rgba(255, 215, 0, 0.6)',
        borderRadius: '50%',
        width: '72px',
        height: '72px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
        fontSize: '32px',
      }}>
        🔍
      </div>
      
      {/* Hint badge */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255, 215, 0, 0.5)',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: '13px',
        color: 'white',
        zIndex: 10,
        opacity: isHovered ? 1 : 0,
        transform: isHovered ? 'translateY(0)' : 'translateY(10px)',
        transition: 'all 0.3s ease',
        pointerEvents: 'none',
      }}>
        🔍 Click để xem full
      </div>
      
      {/* DEBUG badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        background: isHovered ? 'rgba(0, 255, 0, 0.9)' : 'rgba(255, 0, 0, 0.9)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: 'bold',
        zIndex: 100,
        pointerEvents: 'none'
      }}>
        HOVER: {isHovered ? 'TRUE ✅' : 'FALSE ❌'}
      </div>
    </div>
  );
}

const TEST_MARKDOWN = `
# Image Hover Test

This is a paragraph before the image.

![Test Image](${TEST_IMAGE_URL})

This is a paragraph after the image.

The image above should have:
- Golden glow border on hover
- Zoom icon appearing
- "Click để xem full" badge
- Debug badge turning GREEN
`;

export function ImageHoverTest() {
  const [lightbox, setLightbox] = useState<string | null>(null);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0b0c0f',
      color: 'white',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ textAlign: 'center', color: '#F5D393', marginBottom: '40px' }}>
          🧪 Image Hover Test Page
        </h1>
        
        <div style={{
          background: 'rgba(18,18,22,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '40px'
        }}>
          <h2 style={{ color: '#F5D393', marginTop: 0 }}>Test 1: Direct Component</h2>
          <p style={{ color: '#A1A1AA' }}>
            This is the BlogImageThumbnail component rendered directly.
            Hover should work immediately.
          </p>
          <BlogImageThumbnail 
            src={TEST_IMAGE_URL}
            alt="Test Direct Component"
            onClick={() => {
              console.log('Direct component clicked');
              setLightbox(TEST_IMAGE_URL);
            }}
          />
        </div>

        <div style={{
          background: 'rgba(18,18,22,0.92)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '24px'
        }}>
          <h2 style={{ color: '#F5D393', marginTop: 0 }}>Test 2: ReactMarkdown</h2>
          <p style={{ color: '#A1A1AA' }}>
            This uses ReactMarkdown to render the image component.
            Same hover behavior should work.
          </p>
          <ReactMarkdown
            components={{
              img: ({ node, ...props }) => (
                <BlogImageThumbnail 
                  src={props.src as string}
                  alt={props.alt as string}
                  onClick={() => {
                    console.log('Markdown image clicked');
                    setLightbox(props.src as string);
                  }}
                />
              ),
              h1: ({ node, ...props }) => (
                <h1 style={{ color: '#F5D393' }} {...props} />
              ),
              p: ({ node, ...props }) => (
                <p style={{ color: '#e4e4e7', lineHeight: 1.7 }} {...props} />
              ),
            }}
          >
            {TEST_MARKDOWN}
          </ReactMarkdown>
        </div>

        {/* Instructions */}
        <div style={{
          marginTop: '40px',
          padding: '20px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '8px',
          color: '#93c5fd'
        }}>
          <h3 style={{ marginTop: 0 }}>📋 Instructions</h3>
          <ul>
            <li>Open browser DevTools console (F12)</li>
            <li>Hover over the images above</li>
            <li>Watch for console logs</li>
            <li>Debug badge should turn GREEN</li>
            <li>Click should log to console</li>
          </ul>
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            onClick={() => setLightbox(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.95)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
              cursor: 'pointer'
            }}
          >
            <img 
              src={lightbox} 
              alt="Lightbox" 
              style={{ 
                maxWidth: '90%', 
                maxHeight: '90%',
                borderRadius: '8px',
                boxShadow: '0 0 50px rgba(255, 215, 0, 0.3)'
              }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

