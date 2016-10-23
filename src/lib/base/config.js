import * as envConfig from '../../../config/development.json';

import modelConfig from './model-config';

export default Object.assign(modelConfig, {
  lang: 'en',
  public: envConfig.CORE_URL,
  root: [envConfig.CORE_URL, envConfig.URL_PATH].join('/'),
  tokenName: envConfig.AUTH_TOKEN_NAME,
  getPath(path){
    return this.root + path
  },

  asset(path) {
    return envConfig.CORE_URL + path
  }
})
