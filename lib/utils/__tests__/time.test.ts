import {
  calculateElapsedSeconds,
  calculateElapsedMinutes,
  formatElapsedTime,
  formatDuration,
  getElapsedTimeColorClass,
  formatTime,
} from '../time';

describe('time utilities', () => {
  describe('calculateElapsedSeconds', () => {
    it('should return 0 for same timestamp', () => {
      const now = Date.now();
      expect(calculateElapsedSeconds(now, now)).toBe(0);
    });

    it('should return 1 for 1 second elapsed', () => {
      const now = Date.now();
      const past = now - 1000; // 1秒前
      expect(calculateElapsedSeconds(past, now)).toBe(1);
    });

    it('should return 59 for 59 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 59000; // 59秒前
      expect(calculateElapsedSeconds(past, now)).toBe(59);
    });

    it('should return 60 for 60 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 60000; // 60秒前
      expect(calculateElapsedSeconds(past, now)).toBe(60);
    });

    it('should return 125 for 2 minutes 5 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 125000;
      expect(calculateElapsedSeconds(past, now)).toBe(125);
    });
  });

  describe('calculateElapsedMinutes', () => {
    it('should return 0 for 1 second elapsed', () => {
      const now = Date.now();
      const past = now - 1000; // 1秒前
      expect(calculateElapsedMinutes(past, now)).toBe(0);
    });

    it('should return 0 for 59 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 59000; // 59秒前
      expect(calculateElapsedMinutes(past, now)).toBe(0);
    });

    it('should return 1 for 60 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 60000; // 60秒前
      expect(calculateElapsedMinutes(past, now)).toBe(1);
    });

    it('should return 1 for 61 seconds elapsed', () => {
      const now = Date.now();
      const past = now - 61000; // 61秒前
      expect(calculateElapsedMinutes(past, now)).toBe(1);
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
    it('should return "0秒前" for 0 seconds', () => {
      expect(formatElapsedTime(0)).toBe('0秒前');
    });

    it('should return "30秒前" for 30 seconds', () => {
      expect(formatElapsedTime(30)).toBe('30秒前');
    });

    it('should return "59秒前" for 59 seconds', () => {
      expect(formatElapsedTime(59)).toBe('59秒前');
    });

    it('should return "1分0秒前" for 60 seconds', () => {
      expect(formatElapsedTime(60)).toBe('1分0秒前');
    });

    it('should return "1分30秒前" for 90 seconds', () => {
      expect(formatElapsedTime(90)).toBe('1分30秒前');
    });

    it('should return "2分15秒前" for 135 seconds', () => {
      expect(formatElapsedTime(135)).toBe('2分15秒前');
    });

    it('should return "10分0秒前" for 600 seconds', () => {
      expect(formatElapsedTime(600)).toBe('10分0秒前');
    });

    it('should return "100分45秒前" for 6045 seconds', () => {
      expect(formatElapsedTime(6045)).toBe('100分45秒前');
    });
  });

  describe('formatDuration', () => {
    it('should return "0秒" for 0 seconds', () => {
      expect(formatDuration(0)).toBe('0秒');
    });

    it('should return "30秒" for 30 seconds', () => {
      expect(formatDuration(30)).toBe('30秒');
    });

    it('should return "1分0秒" for 60 seconds', () => {
      expect(formatDuration(60)).toBe('1分0秒');
    });

    it('should return "1分30秒" for 90 seconds', () => {
      expect(formatDuration(90)).toBe('1分30秒');
    });

    it('should return "30分0秒" for 1800 seconds', () => {
      expect(formatDuration(1800)).toBe('30分0秒');
    });

    it('should return "120分0秒" for 7200 seconds', () => {
      expect(formatDuration(7200)).toBe('120分0秒');
    });
  });

  describe('getElapsedTimeColorClass', () => {
    it('should return empty string for 0 minutes', () => {
      expect(getElapsedTimeColorClass(0)).toBe('');
    });

    it('should return empty string for 9 minutes', () => {
      expect(getElapsedTimeColorClass(9)).toBe('');
    });

    it('should return yellow class for exactly 10 minutes', () => {
      expect(getElapsedTimeColorClass(10)).toBe('text-yellow-400 font-semibold');
    });

    it('should return yellow class for 11 minutes', () => {
      expect(getElapsedTimeColorClass(11)).toBe('text-yellow-400 font-semibold');
    });

    it('should return yellow class for 14 minutes', () => {
      expect(getElapsedTimeColorClass(14)).toBe('text-yellow-400 font-semibold');
    });

    it('should return red class for exactly 15 minutes', () => {
      expect(getElapsedTimeColorClass(15)).toBe('text-red-400 font-semibold');
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
