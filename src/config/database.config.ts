const databaseConfig = () => ({
  database: {
    uri: process.env.DATABASE_URI,
  },
});

export default databaseConfig;
