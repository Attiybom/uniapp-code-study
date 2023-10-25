// 检查登录状态
function checkLoginStatus() {
  const token = uni.getStorageSync('token');
  const loginTime = uni.getStorageSync('loginTime');
  const currentTime = new Date().getTime();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;

  if (token && loginTime && (currentTime - loginTime < sevenDays)) {
      return true;
  } else {
      uni.removeStorageSync('token');
      uni.removeStorageSync('loginTime');
      return false;
  }
}

// 登录方法封装
// 环境配置
const ENV = {
  DEV: 'dev',
  PRO: 'pro',
  BETA: 'beta',
  TEST: 'test'
};

// 根据实际情况设置当前环境
const CURRENT_ENV = ENV.DEV; // 例如，当前为开发环境

// API基础URL配置
const BASE_URLS = {
  [ENV.DEV]: {
      H5: 'https://dev-h5-api.example.com',
      MP: 'https://dev-miniapp-api.example.com'
  },
  [ENV.PRO]: {
      H5: 'https://h5-api.example.com',
      MP: 'https://miniapp-api.example.com'
  },
  [ENV.BETA]: {
      H5: 'https://beta-h5-api.example.com',
      MP: 'https://beta-miniapp-api.example.com'
  },
  [ENV.TEST]: {
      H5: 'https://test-h5-api.example.com',
      MP: 'https://test-miniapp-api.example.com'
  }
};


// // 获取当前环境的API基础URL
// function getBaseUrl() {
//   return BASE_URLS[CURRENT_ENV];
// }



// 登录方法封装
function login(username, password) {
  if (checkLoginStatus()) {
      return Promise.resolve('已登录，无需重新登录');
  }

  let loginUrl = '';

  // 使用条件编译和环境配置来确定登录API的URL
  #ifdef H5
  loginUrl = `${BASE_URLS[CURRENT_ENV].H5}/login`;
  #endif

  #ifdef MP-WEIXIN
  loginUrl = `${BASE_URLS[CURRENT_ENV].MP}/login`;
  #endif

  return sendRequest(loginUrl, 'POST', { username, password })
      .then(data => {
          if (data && data.token) {
              const currentTime = new Date().getTime();
              uni.setStorageSync('token', data.token);
              uni.setStorageSync('loginTime', currentTime);
          }
          return data;
      });
}

// ... 其他代码 ...



// 使用
login('yourUsername', 'yourPassword')
  .then(data => {
      if (data === '已登录，无需重新登录') {
          console.log(data);
      } else {
          console.log('登录成功:', data);
      }
  })
  .catch(error => {
    console.error('登录失败:', error);
    // 跳转等其他逻辑
  });
