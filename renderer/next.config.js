const withCSS = require('@zeit/next-css')
module.exports = withCSS()
module.exports = {
  webpack5: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.node = {
        fs: 'empty'
      }
      config.target = 'electron-renderer';
    }

    return config;
  },
};

