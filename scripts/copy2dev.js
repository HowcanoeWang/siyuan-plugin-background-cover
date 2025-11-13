const fs = require('fs-extra');
const path = require('path');

// 1. 读取环境变量
const siyuanDevPath = process.env.SIYUANDEV;

if (!siyuanDevPath) {
  console.error('错误：环境变量 SIYUANDEV 未设置。');
  process.exit(1); // 退出脚本并返回错误码
}

// 2. 读取 plugin.json 获取插件名称
let pluginName;
try {
  const pluginConfig = fs.readJsonSync(path.resolve(__dirname, '../plugin.json'));
  pluginName = pluginConfig.name;
} catch (err) {
  console.error('错误：无法读取或解析 plugin.json 文件。', err);
  process.exit(1);
}

if (!pluginName) {
  console.error('错误：plugin.json 中未找到 "name" 字段。');
  process.exit(1);
}

// 3. 定义源目录和目标目录
const sourceDir = path.resolve(__dirname, '../dist');
const targetDir = path.join(siyuanDevPath, 'data', 'plugins', pluginName);

// 4. 执行复制操作
try {
  fs.copySync(sourceDir, targetDir, { overwrite: true });
  console.log(`✅ 成功将 ${sourceDir} 复制到 ${targetDir}`);
} catch (err) {
  console.error(`❌ 复制文件时发生错误:`, err);
  process.exit(1);
}
