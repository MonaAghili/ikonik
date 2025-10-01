import { useState } from 'react';
import { Home, Heart, Star } from './icons';
import './App.css';

function App() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const cards = [
    {
      id: 'home',
      Icon: Home,
      title: 'Home',
      description: 'Your personal space where comfort meets style. Navigate to your dashboard.',
      color: '#3b82f6',
      bgGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
    {
      id: 'heart',
      Icon: Heart,
      title: 'Favorites',
      description: 'Save and organize the things you love. Keep track of your preferences.',
      color: '#ef4444',
      bgGradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    },
    {
      id: 'star',
      Icon: Star,
      title: 'Premium',
      description: 'Unlock exclusive features and premium content. Elevate your experience.',
      color: '#f59e0b',
      bgGradient: 'linear-gradient(135deg, #fad961 0%, #f76b1c 100%)',
    },
  ];

  return (
    <div className="app">
      <header className="header">
        <h1>Icon Showcase</h1>
        <p>Explore our beautifully crafted icon components</p>
      </header>

      <div className="cards-container">
        {cards.map((card) => (
          <div
            key={card.id}
            className={`card ${hoveredCard === card.id ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              borderColor: hoveredCard === card.id ? card.color : 'transparent',
            }}
          >
            <div
              className="card-icon-wrapper"
              style={{
                background: hoveredCard === card.id ? card.bgGradient : '#f1f5f9',
              }}
            >
              <card.Icon
                size={48}
                strokeWidth={2}
                style={{
                  color: hoveredCard === card.id ? 'white' : card.color,
                }}
              />
            </div>

            <h2 className="card-title">{card.title}</h2>
            <p className="card-description">{card.description}</p>

            <button
              className="card-button"
              style={{
                background: hoveredCard === card.id ? card.bgGradient : 'transparent',
                color: hoveredCard === card.id ? 'white' : card.color,
                borderColor: card.color,
              }}
            >
              Learn More
            </button>
          </div>
        ))}
      </div>

      <div className="info-section">
        <h2>Generated with Ikonik</h2>
        <p>These icons are React components generated from SVG files</p>
        <div className="code-block">
          <code>
            npx ikonik --src ./public/icons --out ./src/icons
          </code>
        </div>
      </div>
    </div>
  );
}

export default App;