import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
  return React.createElement('div', { style: { padding: '20px' } }, [
    React.createElement('h1', { key: 'title' }, 'Hello World'),
    React.createElement('p', { key: 'subtitle' }, 'Couples Relationship Mobile App'),
    React.createElement('p', { key: 'status' }, 'Connected to Supabase project: luvo')
  ]);
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(React.createElement(App));
}