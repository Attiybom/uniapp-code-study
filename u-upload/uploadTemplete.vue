<template>
  <view>
    <view>
      <textarea v-model="returnReason" placeholder="请输入退货理由"></textarea>
    </view>
    <u-upload
      :max-count="5"
      :show-count="true"
      :file-list="fileList"
      @delete="deleteFile"
      @change="fileChange"
    >
    </u-upload>
    <u-button @click="submitReturn">提交退货</u-button>
  </view>
</template>
<script>
export default {
  data() {
    return {
      returnReason: "", // 退货理由
      fileList: [], // 上传的文件列表
    };
  },
  methods: {
    // 文件改变时的回调
    fileChange(e) {
      this.fileList = e.fileList;
    },
    // 删除文件
    deleteFile(index) {
      this.fileList.splice(index, 1);
    },

    // 提交退货
    async submitReturn() {
      if (!this.returnReason) {
        uni.showToast({
          title: "请输入退货理由",
          icon: "none",
        });
        return;
      }

      const platform = uni.getSystemInfoSync().platform;
      const baseUrl = this.getBaseUrl(); // 获取当前环境的API基础URL
      const uploadUrl = `${baseUrl}/${
        platform === "h5" ? "h5/upload" : "miniapp/upload"
      }`;

      // 上传文件
      const uploadedFiles = [];
      for (let i = 0; i < this.fileList.length; i++) {
        const file = this.fileList[i];
        const uploadResponse = await this.uploadFile(uploadUrl, file);
        uploadedFiles.push(uploadResponse.data); // 假设服务器返回的数据中包含文件的URL或其他标识
      }

      // 提交退货理由和其他信息，包括上传的文件信息...
      this.submitReturnInfo(this.returnReason, uploadedFiles);
    },

    // 上传文件
    uploadFile(url, file) {
      const uniqueIdentifier = new Date().getTime(); // 使用时间戳作为唯一标识，实际应用中可以使用更复杂的方法
      const fileName = `${uniqueIdentifier}_${file.name}`; // 生成唯一的文件名

      return new Promise((resolve, reject) => {
        uni.uploadFile({
          url: url,
          filePath: file.path,
          name: "file",
          formData: {
            fileName: fileName,
          },
          success: (uploadFileRes) => {
            resolve(uploadFileRes);
          },
          fail: (error) => {
            reject(error);
          },
        });
      });
    },

  },
};
</script>
