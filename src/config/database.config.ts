export default () => ({
  database: {
    uri: process.env.DATABASE_URI || 'mongodb://localhost:27017/annotation_db',
  },
});
