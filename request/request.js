// 请求管理器
class RequestManager {
    constructor() {
        this.pendingRequests = new Map();
    }
    // 生成请求唯一标识符
    getRequestId(config) {
        return [config.method, config.url, JSON.stringify(config.data)].join('&');
    }
    // 添加请求
    addRequest(config) {
        const requestId = this.getRequestId(config);
        this.pendingRequests.set(requestId, true);
    }
    // 移除请求
    removeRequest(config) {
        const requestId = this.getRequestId(config);
        this.pendingRequests.delete(requestId);
    }
    // 验证是否重复请求
    isRequestDuplicate(config) {
        const requestId = this.getRequestId(config);
        return this.pendingRequests.has(requestId);
    }
}
// 生成请求管理器实例
const requestManager = new RequestManager();

// 生成签名
function generateSignature(data, secretKey) {
    const sortedData = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&');
    return uni.getStorageSync(sortedData + secretKey); // 使用简化的加密方式，实际中应使用更复杂的加密方法
}

// 发送请求
function sendRequest(url, method = 'GET', data, headers = {}, retryTimes = 3) {
    if (requestManager.isRequestDuplicate({ url, method, data })) {
        console.warn('重复请求已被拦截:', url);
        return Promise.reject('重复请求');
    }

    const signature = generateSignature(data, 'YOUR_SECRET_KEY');
    const platform = uni.getSystemInfoSync().platform;

    uni.showLoading({
        title: '加载中...'
    });

    requestManager.addRequest({ url, method, data });

    return new Promise((resolve, reject) => {
        uni.request({
            url: url,
            method: method,
            data: data,
            header: {
                ...headers,
                'token': uni.getStorageSync('token') || '',
                'signature': signature,
                'platform': platform
            },
            success: (response) => {
                switch (response.statusCode) {
                    case 200:
                        resolve(response.data);
                        break;
                    case 401:
                        console.error('权限验证失败');
                        reject('权限验证失败');
                        break;
                    case 500:
                        console.error('服务器错误');
                        reject('服务器错误');
                        break;
                    default:
                        reject('未知错误');
                }
            },
            fail: (error) => {
                if (retryTimes > 0) {
                    console.warn('请求失败，正在重试...', url);
                    setTimeout(() => {
                        sendRequest(url, method, data, headers, retryTimes - 1)
                            .then(resolve)
                            .catch(reject);
                    }, 1000);
                } else {
                    console.error('请求失败:', error);
                    reject('请求失败');
                }
            },
            complete: () => {
                uni.hideLoading();
                requestManager.removeRequest({ url, method, data });
            }
        });
    });
}
