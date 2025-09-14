import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Hello World</h1>
      <p>Couples Relationship Mobile App</p>
      <p>Connected to Supabase project: luvo</p>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}