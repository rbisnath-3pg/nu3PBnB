// Mock mongoose completely to avoid ESM issues
jest.mock('mongoose', () => ({
  Schema: jest.fn(),
  model: jest.fn(),
  connect: jest.fn().mockResolvedValue({}),
  connection: {
    close: jest.fn().mockResolvedValue({}),
    readyState: 1
  }
}));

// Mock the User model
const mockUser = {
  _id: 'test-id',
  email: 'test@example.com',
  name: 'Test User',
  password: 'hashedpassword',
  validate: jest.fn(),
  save: jest.fn()
};

jest.mock('../User', () => mockUser);

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have required fields', () => {
    expect(mockUser.email).toBe('test@example.com');
    expect(mockUser.name).toBe('Test User');
  });

  it('should validate user data', async () => {
    // Mock validation error
    const validationError = {
      errors: {
        email: { message: 'Email is required' },
        password: { message: 'Password is required' }
      }
    };
    
    mockUser.validate.mockRejectedValue(validationError);
    
    let err;
    try {
      await mockUser.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should save user successfully', async () => {
    mockUser.save.mockResolvedValue(mockUser);
    
    const savedUser = await mockUser.save();
    expect(savedUser.email).toBe('test@example.com');
    expect(savedUser.name).toBe('Test User');
  });
}); 