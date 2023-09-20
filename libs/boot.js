import envLoader from '../utils/env_loader';

const startServer = (api) => {
  envLoader();
  const port = process.env.PORT || 5000;
  api.listen(port, () => {
    console.log(`Server listening on port:${port}`);
  });
};

export default startServer;
