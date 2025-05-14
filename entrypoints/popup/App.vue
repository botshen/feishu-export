<script lang="ts" setup>
const handleClick = () => {
  console.log('Button clicked');
  // 发送自定义事件给content script
  document.dispatchEvent(new CustomEvent('exportFeishuPDF'));
};
</script>

<template>
  <button @click="handleClick">导出PDF</button>
</template>

<style scoped>
button {
  position: fixed;
  top: 200px;
  right: 0px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  color: red;
  z-index: 9999;
  cursor: pointer;
}
</style>
