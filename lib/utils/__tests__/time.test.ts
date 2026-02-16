import {
  calculateElapsedMinutes,
  formatElapsedTime,
  formatDuration,
  getElapsedTimeColorClass,
  formatTime,
} from '../time';

describe('time utilities', () => {
  describe('calculateElapsedMinutes', () => {
    it('should return 1 for 1 second elapsed', () => {
      const now = Date.now();
      const past = now - 1000; // 1秒前
      expect(calculateElapsedMinutes(past, now)).toBe(1);
    });

    it('should return 1 for 59 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 59000; // 59秒前
      expect(calculateElapsedMinutes(past, now)).toBe(1);
    });

    it('should return 1 for 60 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 60000; // 60秒前
      expect(calculateElapsedMinutes(past, now)).toBe(1);
    });

    it('should return 2 for 61 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 61000; // 61秒前
      expect(calculateElapsedMinutes(past, now)).toBe(2);
    });

    it('should return 15 for 15 minutes elapsed', () => {
      const now = Date.now();
      const past = now - 15 * 60000;
      expect(calculateElapsedMinutes(past, now)).toBe(15);
    });

    it('should return 0 for same timestamp', () => {
      const now = Date.now();
      expect(calculateElapsedMinutes(now, now)).toBe(0);
    });
  });

  describe('formatElapsedTime', () => {
    it('should return "1分前" for 0 minutes', () => {
      expect(formatElapsedTime(0)).toBe('1分前');
    });

    it('should return "1分前" for 1 minute', () => {
      expect(formatElapsedTime(1)).toBe('1分前');
    });

    it('should return "2分前" for 2 minutes', () => {
      expect(formatElapsedTime(2)).toBe('2分前');
    });

    it('should return "10分前" for 10 minutes', () => {
      expect(formatElapsedTime(10)).toBe('10分前');
    });

    it('should return "100分前" for 100 minutes', () => {
      expect(formatElapsedTime(100)).toBe('100分前');
    });
  });

  describe('formatDuration', () => {
    it('should return "1分" for 0 minutes', () => {
      expect(formatDuration(0)).toBe('1分');
    });

    it('should return "1分" for 1 minute', () => {
      expect(formatDuration(1)).toBe('1分');
    });

    it('should return "30分" for 30 minutes', () => {
      expect(formatDuration(30)).toBe('30分');
    });

    it('should return "120分" for 120 minutes', () => {
      expect(formatDuration(120)).toBe('120分');
    });
  });

  describe('getElapsedTimeColorClass', () => {
    it('should return empty string for 0 minutes', () => {
      expect(getElapsedTimeColorClass(0)).toBe('');
    });

    it('should return empty string for 9 minutes', () => {
      expect(getElapsedTimeColorClass(9)).toBe('');
    });

    it('should return empty string for exactly 10 minutes', () => {
      expect(getElapsedTimeColorClass(10)).toBe('');
    });

    it('should return yellow class for 11 minutes', () => {
      expect(getElapsedTimeColorClass(11)).toBe('text-yellow-400 font-semibold');
    });

    it('should return yellow class for 14 minutes', () => {
      expect(getElapsedTimeColorClass(14)).toBe('text-yellow-400 font-semibold');
    });

    it('should return yellow class for exactly 15 minutes', () => {
      expect(getElapsedTimeColorClass(15)).toBe('text-yellow-400 font-semibold');
    });

    it('should return red class for 16 minutes', () => {
      expect(getElapsedTimeColorClass(16)).toBe('text-red-400 font-semibold');
    });

    it('should return red class for 100 minutes', () => {
      expect(getElapsedTimeColorClass(100)).toBe('text-red-400 font-semibold');
    });
  });

  describe('formatTime', () => {
    it('should return "記録なし" for undefined', () => {
      expect(formatTime(undefined)).toBe('記録なし');
    });

    it('should format timestamp as HH:MM', () => {
      const timestamp = new Date('2024-01-01T14:30:00').getTime();
      const result = formatTime(timestamp);
      expect(result).toMatch(/\d{2}:\d{2}/);
      expect(result).toBe('14:30');
    });

    it('should format midnight correctly', () => {
      const timestamp = new Date('2024-01-01T00:00:00').getTime();
      const result = formatTime(timestamp);
      expect(result).toBe('00:00');
    });

    it('should format single digit hours with leading zero', () => {
      const timestamp = new Date('2024-01-01T09:05:00').getTime();
      const result = formatTime(timestamp);
      expect(result).toBe('09:05');
    });
  });
});
