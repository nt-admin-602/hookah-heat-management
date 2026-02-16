import { render, screen } from '@testing-library/react';
import { ElapsedTimeDisplay } from '../ElapsedTimeDisplay';

describe('ElapsedTimeDisplay', () => {
  const now = Date.now();

  describe('variant: ago', () => {
    it('should display "1分前" for 30 seconds elapsed', () => {
      const timestamp = now - 30000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
        />
      );
      expect(screen.getByText('1分前')).toBeInTheDocument();
    });

    it('should display "1分前" for 60 seconds elapsed', () => {
      const timestamp = now - 60000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
        />
      );
      expect(screen.getByText('1分前')).toBeInTheDocument();
    });

    it('should display "2分前" for 61 seconds elapsed', () => {
      const timestamp = now - 61000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
        />
      );
      expect(screen.getByText('2分前')).toBeInTheDocument();
    });

    it('should display "10分前" for 10 minutes elapsed', () => {
      const timestamp = now - 10 * 60000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
        />
      );
      expect(screen.getByText('10分前')).toBeInTheDocument();
    });
  });

  describe('variant: duration', () => {
    it('should display "1分" for 30 seconds elapsed', () => {
      const timestamp = now - 30000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="duration"
        />
      );
      expect(screen.getByText('1分')).toBeInTheDocument();
    });

    it('should display "15分" for 15 minutes elapsed', () => {
      const timestamp = now - 15 * 60000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="duration"
        />
      );
      expect(screen.getByText('15分')).toBeInTheDocument();
    });

    it('should display "120分" for 2 hours elapsed', () => {
      const timestamp = now - 120 * 60000;
      render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="duration"
        />
      );
      expect(screen.getByText('120分')).toBeInTheDocument();
    });
  });

  describe('warning colors', () => {
    it('should not apply warning color without showWarning prop', () => {
      const timestamp = now - 11 * 60000;
      const { container } = render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
        />
      );
      expect(container.firstChild).not.toHaveClass('text-yellow-400');
    });

    it('should apply yellow warning color for 11 minutes', () => {
      const timestamp = now - 11 * 60000;
      const { container } = render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
          showWarning
        />
      );
      expect(container.firstChild).toHaveClass('text-yellow-400');
      expect(container.firstChild).toHaveClass('font-semibold');
    });

    it('should apply red critical color for 16 minutes', () => {
      const timestamp = now - 16 * 60000;
      const { container } = render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
          showWarning
        />
      );
      expect(container.firstChild).toHaveClass('text-red-400');
      expect(container.firstChild).toHaveClass('font-semibold');
    });

    it('should not apply warning color for 10 minutes (boundary)', () => {
      const timestamp = now - 10 * 60000;
      const { container } = render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
          showWarning
        />
      );
      expect(container.firstChild).not.toHaveClass('text-yellow-400');
      expect(container.firstChild).not.toHaveClass('text-red-400');
    });

    it('should apply yellow for 15 minutes (boundary)', () => {
      const timestamp = now - 15 * 60000;
      const { container } = render(
        <ElapsedTimeDisplay
          timestamp={timestamp}
          currentTime={now}
          variant="ago"
          showWarning
        />
      );
      expect(container.firstChild).toHaveClass('text-yellow-400');
    });
  });
});
