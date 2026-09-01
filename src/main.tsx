import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// StrictMode is intentionally omitted: its dev-only double-invoke of effects is
// well-documented as incompatible with imperative map libraries (MapLibre/Mapbox GL JS
// among them) — it fires a component's effect setup a second time without an intervening
// cleanup in some cases, leaving two Map instances racing over one DOM container. This is
// a dev-only diagnostic tool with no effect on production builds, so removing it here has
// no runtime/production behavior impact.
createRoot(document.getElementById('root')!).render(<App />);
