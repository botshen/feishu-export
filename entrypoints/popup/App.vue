<script lang="ts" setup>
const handleExportPdfAll = async () => {
  console.log("批量导出PDF");
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      await browser.tabs.sendMessage(tab.id, { action: "handleExportPdfAll" });
      console.log("已发送导出PDF消息到标签页");
    } else {
      console.error("无法获取当前标签页信息");
    }
  } catch (error) {
    console.error("发送消息到标签页失败:", error);
  }
};
const handleExportPdfCurrent = async () => {
  console.log("导出当前文档为PDF");
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        action: "triggerCaptureScreen",
      });
      console.log("已发送导出当前文档PDF消息到标签页");
    } else {
      console.error("无法获取当前标签页信息");
    }
  } catch (error) {
    console.error("发送消息到标签页失败:", error);
  }
};
const handleExportMarkdown = async () => {
  console.log("导出当前文档为Markdown");
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        action: "triggerExportMarkdown",
      });
      console.log("已发送导出当前文档Markdown消息到标签页");
    } else {
      console.error("无法获取当前标签页信息");
    }
  } catch (error) {
    console.error("发送消息到标签页失败:", error);
  }
};
const handleExportFdf = async () => {
  console.log("导出当前文档为Fdf");
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        action: "exportPdf",
      });
      console.log("已发送导出当前文档Fdf消息到标签页");
    } else {
      console.error("无法获取当前标签页信息");
    }
  } catch (error) {
    console.error("发送消息到标签页失败:", error);
  }
};
const handleExportImage = async () => {
  console.log("导出当前文档为图片");
  try {
    const [tab] = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.id) {
      await browser.tabs.sendMessage(tab.id, {
        action: "exportImage",
      });
      console.log("已发送导出当前文档图片消息到标签页");
    } else {
      console.error("无法获取当前标签页信息");
    }
  } catch (error) {
    console.error("发送消息到标签页失败:", error);
  }
};
</script>

<template>
  <div class="w-[300px] p-4 bg-gradient-to-br from-gray-50 to-gray-100">
    <h1 class="text-xl font-bold text-gray-800 mb-4 text-center">
      超级强大的飞书导出神器
    </h1>
    <div class="flex flex-col gap-3">
     <button
        @click="handleExportPdfAll"
        class="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
        批量导出PDF
      </button>
     <!--   <button
        @click="handleExportPdfCurrent"
        class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
            clip-rule="evenodd"
          />
        </svg>
        导出当前文档为PDF
      </button>
      <button
        @click="handleExportMarkdown"
        class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fill-rule="evenodd"
            d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z"
            clip-rule="evenodd"
          />
        </svg>
        导出当前文档为Markdown
      </button> -->
      <button
        @click="handleExportFdf"
        class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
      >
        导出当前文档为PDF
      </button>
      <!-- <button
        @click="handleExportImage"
        class="bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center"
      >
        导出当前文档为图片
      </button> -->
    </div>
    <div class="mt-4 text-center text-xs text-gray-500">
      欢迎加入交流群QQ：741683982
    </div>
  </div>
</template>
