import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal } from '../ConfirmationModal';

describe('ConfirmationModal', () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnConfirm.mockClear();
  });

  describe('visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={false}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test message"
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test Title"
          message="Test Message"
        />
      );
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Message')).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onConfirm when confirm button is clicked', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );
      fireEvent.click(screen.getByText('終了する'));
      expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should call onClose when cancel button is clicked', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );
      fireEvent.click(screen.getByText('キャンセル'));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe('custom labels', () => {
    it('should use custom confirm label', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          confirmLabel="削除"
        />
      );
      expect(screen.getByText('削除')).toBeInTheDocument();
      expect(screen.queryByText('終了する')).not.toBeInTheDocument();
    });

    it('should use custom cancel label', () => {
      render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          cancelLabel="戻る"
        />
      );
      expect(screen.getByText('戻る')).toBeInTheDocument();
      expect(screen.queryByText('キャンセル')).not.toBeInTheDocument();
    });
  });

  describe('variants', () => {
    it('should apply danger variant styling', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          variant="danger"
        />
      );
      expect(container.querySelector('.border-red-800')).toBeInTheDocument();
    });

    it('should apply warning variant styling', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          variant="warning"
        />
      );
      expect(container.querySelector('.border-yellow-600')).toBeInTheDocument();
    });

    it('should apply info variant styling (default)', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
          variant="info"
        />
      );
      // Info variant uses default styles
      expect(container.querySelector('.bg-slate-800')).toBeInTheDocument();
    });

    it('should default to danger variant', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );
      expect(container.querySelector('.border-red-800')).toBeInTheDocument();
    });
  });

  describe('overlay', () => {
    it('should have dark overlay', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );
      expect(container.querySelector('.bg-black\\/50')).toBeInTheDocument();
    });

    it('should be positioned fixed with z-50', () => {
      const { container } = render(
        <ConfirmationModal
          isOpen={true}
          onClose={mockOnClose}
          onConfirm={mockOnConfirm}
          title="Test"
          message="Test"
        />
      );
      const overlay = container.querySelector('.fixed');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('z-50');
    });
  });
});
