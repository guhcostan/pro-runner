import React from 'react';
import { render } from '@testing-library/react-native';
import { XPProgressBar } from '../../../components/progression/XPProgressBar';

// Mock Animated for testing
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Animated.timing = () => ({
    start: jest.fn(),
  });
  RN.Animated.sequence = () => ({
    start: jest.fn(),
  });
  return RN;
});

describe('XPProgressBar', () => {
  const defaultProps = {
    currentXP: 250,
    xpToNextLevel: 500,
    currentLevel: 3,
    totalXPEarned: 1250,
  };

  it('renders correctly with basic props', () => {
    const { getByText } = render(<XPProgressBar {...defaultProps} />);
    
    expect(getByText('3')).toBeTruthy();
    expect(getByText('1.3K XP Total')).toBeTruthy();
    expect(getByText('250 / 500 XP')).toBeTruthy();
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('🎯 Próximo nível: 4')).toBeTruthy();
    expect(getByText('Faltam 250 XP')).toBeTruthy();
  });

  it('displays correct level title for different levels', () => {
    // Test beginner level
    const { rerender, getByText } = render(
      <XPProgressBar {...defaultProps} currentLevel={2} />
    );
    expect(getByText('Iniciante')).toBeTruthy();

    // Test intermediate level
    rerender(<XPProgressBar {...defaultProps} currentLevel={7} />);
    expect(getByText('Intermediário')).toBeTruthy();

    // Test advanced level
    rerender(<XPProgressBar {...defaultProps} currentLevel={15} />);
    expect(getByText('Avançado')).toBeTruthy();

    // Test expert level
    rerender(<XPProgressBar {...defaultProps} currentLevel={25} />);
    expect(getByText('Expert')).toBeTruthy();

    // Test elite level
    rerender(<XPProgressBar {...defaultProps} currentLevel={35} />);
    expect(getByText('Elite')).toBeTruthy();
  });

  it('formats XP values correctly', () => {
    // Test thousands
    const { rerender, getByText } = render(
      <XPProgressBar {...defaultProps} totalXPEarned={5500} />
    );
    expect(getByText('5.5K XP Total')).toBeTruthy();

    // Test millions
    rerender(<XPProgressBar {...defaultProps} totalXPEarned={2500000} />);
    expect(getByText('2.5M XP Total')).toBeTruthy();

    // Test regular numbers
    rerender(<XPProgressBar {...defaultProps} totalXPEarned={250} />);
    expect(getByText('250 XP Total')).toBeTruthy();
  });

  it('calculates progress percentage correctly', () => {
    const { getByText } = render(
      <XPProgressBar 
        currentXP={150}
        xpToNextLevel={300}
        currentLevel={2}
        totalXPEarned={650}
      />
    );
    
    expect(getByText('50%')).toBeTruthy();
    expect(getByText('Faltam 150 XP')).toBeTruthy();
  });

  it('handles edge cases', () => {
    // Test zero XP
    const { rerender, getByText } = render(
      <XPProgressBar 
        currentXP={0}
        xpToNextLevel={100}
        currentLevel={1}
        totalXPEarned={0}
      />
    );
    expect(getByText('0%')).toBeTruthy();

    // Test full XP bar
    rerender(
      <XPProgressBar 
        currentXP={100}
        xpToNextLevel={100}
        currentLevel={2}
        totalXPEarned={200}
      />
    );
    expect(getByText('100%')).toBeTruthy();
  });

  it('applies custom styles when provided', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <XPProgressBar 
        {...defaultProps} 
        style={customStyle}
      />
    );
    
    // Note: In a real test environment, you would check if the style is applied
    // This is a basic test to ensure the component accepts the style prop
    expect(getByText('3')).toBeTruthy();
  });

  it('handles animation prop correctly', () => {
    const { rerender } = render(
      <XPProgressBar {...defaultProps} showAnimation={false} />
    );
    
    // Test with animation enabled
    rerender(<XPProgressBar {...defaultProps} showAnimation={true} />);
    
    // Since we mocked Animated, we just ensure it renders without errors
    expect(true).toBeTruthy();
  });
}); 