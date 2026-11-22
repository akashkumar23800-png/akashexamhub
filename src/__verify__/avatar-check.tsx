import { createRoot } from 'react-dom/client';
import { Avatar } from '@/components/ui/Avatar';

// Test fixture only: a plain colour square, not a person's photo.
const FIXTURE_PHOTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96"><rect width="96" height="96" fill="#7c3aed"/></svg>',
  );

function Harness() {
  return (
    <div style={{ padding: 24, display: 'grid', gap: 16 }}>
      <div id="with-photo">
        <Avatar name="Akash Kumar" src={FIXTURE_PHOTO} size="lg" />
      </div>
      <div id="no-photo">
        <Avatar name="Ravi Sharma" size="lg" />
      </div>
      <div id="broken-photo">
        <Avatar name="Neha Gupta" src="https://example.invalid/missing-avatar.png" size="lg" />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root') as HTMLElement).render(<Harness />);
