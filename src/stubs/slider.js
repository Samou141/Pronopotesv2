const React = require('react');
const { View, PanResponder } = require('react-native');

function Slider({
  value = 0,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  minimumTrackTintColor = '#22d3ee',
  maximumTrackTintColor = 'rgba(255,255,255,0.1)',
  thumbTintColor = '#22d3ee',
}) {
  const v = Array.isArray(value) ? value[0] : value;
  const range = maximumValue - minimumValue;
  const pct = range > 0 ? ((v - minimumValue) / range) * 100 : 0;

  const handleChange = (e) => {
    const target = e.nativeEvent?.target ?? e.target;
    const newVal = parseFloat(target?.value ?? v);
    onValueChange?.(newVal);
  };

  // Use HTML <input type="range"> on web
  return React.createElement('input', {
    type: 'range',
    min: minimumValue,
    max: maximumValue,
    step: step,
    value: v,
    onChange: handleChange,
    style: {
      width: '100%',
      height: 32,
      accentColor: minimumTrackTintColor,
      cursor: 'pointer',
    },
  });
}

module.exports = { default: Slider, Slider };
module.exports.default = Slider;
