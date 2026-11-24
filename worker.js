// Static asset worker for the portfolio: serves the built files in ./dist.
export default {
  async fetch(request, env) {
    return env.ASSETS.fetch(request);
  },
};
