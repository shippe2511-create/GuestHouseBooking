// Mock react-native
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

// Mock expo modules
jest.mock('expo-file-system', () => ({
  cacheDirectory: '/mock/cache/',
  writeAsStringAsync: jest.fn(),
  EncodingType: { UTF8: 'utf8' },
}));

jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  shareAsync: jest.fn(() => Promise.resolve()),
}));

// Mock Supabase
jest.mock('./src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({ data: [], error: null })),
      })),
      insert: jest.fn(() => ({ data: [], error: null })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({ data: [], error: null })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({ data: [], error: null })),
      })),
    })),
    functions: {
      invoke: jest.fn(() => Promise.resolve({ data: null, error: null })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() => Promise.resolve({ data: { path: 'test.jpg' }, error: null })),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'https://example.com/test.jpg' } })),
      })),
    },
  },
}));
