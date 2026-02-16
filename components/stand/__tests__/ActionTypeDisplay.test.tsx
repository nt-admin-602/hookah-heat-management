import { render, screen } from '@testing-library/react';
import { ActionTypeDisplay } from '../ActionTypeDisplay';

describe('ActionTypeDisplay', () => {
  describe('with showLabel=true', () => {
    it('should display ash icon and label', () => {
      render(<ActionTypeDisplay actionType="ash" showLabel />);
      expect(screen.getByText('すす捨て')).toBeInTheDocument();
    });

    it('should display coal icon and label', () => {
      render(<ActionTypeDisplay actionType="coal" showLabel />);
      expect(screen.getByText('炭交換')).toBeInTheDocument();
    });

    it('should display adjust icon and label', () => {
      render(<ActionTypeDisplay actionType="adjust" showLabel />);
      expect(screen.getByText('調整')).toBeInTheDocument();
    });

    it('should display create label only (no icon)', () => {
      render(<ActionTypeDisplay actionType="create" showLabel />);
      expect(screen.getByText('新規追加')).toBeInTheDocument();
    });

    it('should display note label', () => {
      render(<ActionTypeDisplay actionType="note" showLabel />);
      expect(screen.getByText('メモ')).toBeInTheDocument();
    });

    it('should display end label', () => {
      render(<ActionTypeDisplay actionType="end" showLabel />);
      expect(screen.getByText('セッション終了')).toBeInTheDocument();
    });
  });

  describe('with showLabel=false', () => {
    it('should not display label for ash', () => {
      render(<ActionTypeDisplay actionType="ash" showLabel={false} />);
      expect(screen.queryByText('すす捨て')).not.toBeInTheDocument();
    });

    it('should not display label for coal', () => {
      render(<ActionTypeDisplay actionType="coal" showLabel={false} />);
      expect(screen.queryByText('炭交換')).not.toBeInTheDocument();
    });

    it('should not display label for adjust', () => {
      render(<ActionTypeDisplay actionType="adjust" showLabel={false} />);
      expect(screen.queryByText('調整')).not.toBeInTheDocument();
    });

    it('should return null for create without label', () => {
      const { container } = render(<ActionTypeDisplay actionType="create" showLabel={false} />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });

  describe('edge cases', () => {
    it('should return null for null actionType', () => {
      const { container } = render(<ActionTypeDisplay actionType={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <ActionTypeDisplay actionType="ash" showLabel className="custom-class" />
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should have inline-flex layout', () => {
      const { container } = render(<ActionTypeDisplay actionType="ash" showLabel />);
      expect(container.firstChild).toHaveClass('inline-flex');
      expect(container.firstChild).toHaveClass('items-center');
      expect(container.firstChild).toHaveClass('gap-1');
    });
  });

  describe('icon sizes', () => {
    it('should use default size of 14', () => {
      const { container } = render(<ActionTypeDisplay actionType="ash" showLabel />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '14');
      expect(svg).toHaveAttribute('height', '14');
    });

    it('should use custom size', () => {
      const { container } = render(<ActionTypeDisplay actionType="ash" showLabel size={24} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('width', '24');
      expect(svg).toHaveAttribute('height', '24');
    });
  });
});
