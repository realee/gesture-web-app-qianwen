1. 准备工作
创建项目目录:

mkdir gesture-web-app
cd gesture-web-app
touch index.html style.css script.js

使用 Teachable Machine 训练模型:
访问 Teachable Machine。
选择 "Image Project"。
创建几个类，比如 "ThumbsUp", "PeaceSign", "OpenPalm", "Fist"。
为每个类收集样本（对着摄像头做手势并点击录制）。
点击 "Train Model" 进行训练。
训练完成后，切换到 "Preview" 标签页，确保模型工作正常。
点击 "Export Model" -> "TensorFlow.js" -> "Upload my model" (推荐，获取一个稳定的链接) 或 "Download model" (下载到本地)。记录下生成的 model.json 文件的URL。


V2.0
创建完整的手势控制应用（不依赖tmImage）
