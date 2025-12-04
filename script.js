// script.js

let model;
let webcam;
let labelContainer;
let maxPredictions;

async function init() {
    const URL = "替换为你的模型json文件的URL"; // 替换为你自己的模型地址

    try {
        model = await tf.loadGraphModel(URL);
        console.log("模型加载成功");
        document.getElementById('status').innerText = "模型已加载，正在启动摄像头...";

        // 设置UI元素
        labelContainer = document.getElementById("predictions-list");

        // 初始化webcam
        webcam = new Webcam(document.getElementById('video'), 'user');
        await webcam.setup(); // 请求访问摄像头
        await webcam.play();
        window.requestAnimationFrame(loop);

        document.getElementById('status').innerText = "摄像头已启动，开始识别...";
    } catch (error) {
        console.error("初始化失败:", error);
        document.getElementById('status').innerText = "初始化失败: " + error.message;
    }
}

function loop() {
    if (webcam.webcam.readyState === 4) { // 确保视频流已就绪
        webcam.update(); // 更新webcam帧
        predict();
    }
    window.requestAnimationFrame(loop);
}

async function predict() {
    if (!model || !webcam.canvas) return;

    const img = tf.browser.fromPixels(webcam.canvas).toFloat().resizeNearestNeighbor([224, 224]).div(tf.scalar(255.0)).expandDims();
    const predictions = await model.predict(img).data();

    let bestPrediction = "";
    let highestProbability = -1;

    for (let i = 0; i < predictions.length; i++) {
        const probability = predictions[i];
        if (probability > highestProbability) {
            highestProbability = probability;
            bestPrediction = getLabelName(i); // 假设你有一个方法可以获取标签名
        }
    }

    document.getElementById("best-prediction").innerText = `${bestPrediction} (${highestProbability.toFixed(2)})`;
    performAction(bestPrediction, highestProbability);
}

function getLabelName(index) {
    // 这里应该返回与你的模型输出对应的标签名称
    // 例如，如果模型是二分类（如“ThumbsUp”和“Other”），则可以根据index返回相应的字符串
    // 示例仅为演示目的，请根据实际情况调整
    const labels = ["ThumbsUp", "Other"];
    return labels[index] || "Unknown";
}

function performAction(gestureName, confidence) {
    const object = document.getElementById("virtual-object");
    const description = document.getElementById("action-description");
    const threshold = 0.8; // 置信度阈值

    if (confidence < threshold) {
        description.innerText = `识别到 "${gestureName}" 但置信度低 (${confidence.toFixed(2)})`;
        resetObjectStyle();
        return;
    }

    resetObjectStyle(); // 清除之前的效果

    switch(gestureName.toLowerCase()) {
        case 'thumbsup':
            description.innerText = "👍 点赞！改变颜色";
            object.style.backgroundColor = "#FF5722"; // 改变颜色作为示例
            break;
        // 添加其他手势处理逻辑...
        default:
            description.innerText = `识别到未知手势: ${gestureName}`;
    }
}

function resetObjectStyle() {
    const object = document.getElementById("virtual-object");
    object.style.backgroundColor = "#4CAF50"; // 恢复默认颜色
}

window.addEventListener('load', init);

// 注意：这里的Webcam类需要你自己实现或找到合适的库来简化摄像头操作。
// 如果你遇到问题，可以考虑使用现成的库，比如 clmtrackr 或 tracking.js。
