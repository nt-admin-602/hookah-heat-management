import { render, screen } from '@testing-library/react';
import { CoalTypeDisplay } from '../CoalTypeDisplay';

describe('CoalTypeDisplay', () => {
  it('should display flat icon and label', () => {
    render(<CoalTypeDisplay type="flat" showLabel />);
    expect(screen.getByText('フラット')).toBeInTheDocument();
  });

  it('should display cube icon and label', () => {
    render(<CoalTypeDisplay type="cube" showLabel />);
    expect(screen.getByText('キューブ')).toBeInTheDocument();
  });

  it('should display hexa icon and label', () => {
    render(<CoalTypeDisplay type="hexa" showLabel />);
    expect(screen.getByText('ヘキサ')).toBeInTheDocument();
  });

  it('should not display label when showLabel is false', () => {
    render(<CoalTypeDisplay type="flat" showLabel={false} />);
    expect(screen.queryByText('フラット')).not.toBeInTheDocument();
  });

  it('should use default size when size is not provided', () => {
    const { container } = render(<CoalTypeDisplay type="flat" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('should use custom size when provided', () => {
    const { container } = render(<CoalTypeDisplay type="cube" size={24} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });
});
