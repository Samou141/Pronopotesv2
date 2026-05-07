const React = require('react');
const { View } = require('react-native');

function BlurView({ children, style, intensity = 20, tint = 'dark', ...props }) {
  const blurStyle = {
    backgroundColor: tint === 'dark' ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.6)',
    backdropFilter: `blur(${Math.max(8, intensity)}px)`,
    WebkitBackdropFilter: `blur(${Math.max(8, intensity)}px)`,
  };
  return React.createElement(View, { style: [style, blurStyle], ...props }, children);
}

module.exports = { BlurView };
