export const mockContext = (mdDirectory = '/tmp') => ({
  log: (..._args: any[]) => {},
  warn: (..._args: any[]) => {},
  error: (..._args: any[]) => {},
  debug: (..._args: any[]) => {},
  config: {
    carddav: {
      url: 'https://dav.example.com',
      credentials: { username: 'user', password: 'pass' },
      authMethod: 'Basic' as const,
    },
    md: { directory: mdDirectory },
  },
});
