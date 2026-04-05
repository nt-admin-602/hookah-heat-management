import { createCoal, completeCoal, getPreparingCoals } from '../coal-domain';
import { db } from '../db';

// Mock the database
jest.mock('../db', () => ({
  db: {
    coals: {
      add: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      where: jest.fn(() => ({
        equals: jest.fn(() => ({
          toArray: jest.fn(),
        })),
      })),
    },
  },
}));

describe('Coal Domain', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createCoal', () => {
    it('should create a flat coal', async () => {
      (db.coals.add as jest.Mock).mockResolvedValue(undefined);

      const coal = await createCoal('flat');

      expect(coal.type).toBe('flat');
      expect(coal.status).toBe('preparing');
      expect(coal.startedAt).toBeGreaterThan(0);
      expect(coal.id).toBeDefined();
      expect(db.coals.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'flat',
          status: 'preparing',
        })
      );
    });

    it('should create a cube coal', async () => {
      (db.coals.add as jest.Mock).mockResolvedValue(undefined);

      const coal = await createCoal('cube');

      expect(coal.type).toBe('cube');
      expect(db.coals.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'cube',
        })
      );
    });

    it('should create a hexa coal', async () => {
      (db.coals.add as jest.Mock).mockResolvedValue(undefined);

      const coal = await createCoal('hexa');

      expect(coal.type).toBe('hexa');
      expect(db.coals.add).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'hexa',
        })
      );
    });
  });

  describe('completeCoal', () => {
    it('should mark coal as completed and delete it', async () => {
      (db.coals.update as jest.Mock).mockResolvedValue(undefined);
      (db.coals.delete as jest.Mock).mockResolvedValue(undefined);

      await completeCoal('test-coal-id');

      expect(db.coals.update).toHaveBeenCalledWith(
        'test-coal-id',
        expect.objectContaining({
          status: 'completed',
          completedAt: expect.any(Number),
        })
      );
      expect(db.coals.delete).toHaveBeenCalledWith('test-coal-id');
    });
  });

  describe('getPreparingCoals', () => {
    it('should return only preparing coals sorted by start time', async () => {
      const mockCoals = [
        {
          id: '2',
          type: 'cube' as const,
          status: 'preparing' as const,
          startedAt: 2000,
        },
        {
          id: '1',
          type: 'flat' as const,
          status: 'preparing' as const,
          startedAt: 1000,
        },
      ];

      (db.coals.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue(mockCoals),
        }),
      });

      const result = await getPreparingCoals();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('1'); // Oldest first
      expect(result[1].id).toBe('2');
    });

    it('should return empty array when no preparing coals', async () => {
      (db.coals.where as jest.Mock).mockReturnValue({
        equals: jest.fn().mockReturnValue({
          toArray: jest.fn().mockResolvedValue([]),
        }),
      });

      const result = await getPreparingCoals();

      expect(result).toHaveLength(0);
    });
  });
});
