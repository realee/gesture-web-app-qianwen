// --- 配置 ---
// 替换为你从 Teachable Machine 导出的 model.json URL
// 示例URL（可能无法识别你的手势）:
const URL = "https://teachablemachine.withgoogle.com/models/YOUR_MODEL_URL/";
// const URL = "https://teachablemachine.withgoogle.com/models/lbhJU6mHI/"; // 示例模型 (Rock/Paper/Scissors)

let model, webcam, labelContainer, maxPredictions;
let isPredicting = false;

// 主函数，负责初始化
async function init() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // 加载模型和元数据
    try {
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();
        console.log("模型加载成功");
        document.getElementById('status').innerText = "模型已加载，正在启动摄像头...";

        // 设置UI元素
        labelContainer = document.getElementById("predictions-list");
        labelContainer.innerHTML = ""; // Clear any previous content
        for (let i = 0; i < maxPredictions; i++) {
            labelContainer.appendChild(document.createElement("li"));
        }

         // 初始化 webcam
        const flip = true; // 是否水平翻转视频
        webcam = new tmImage.Webcam(300, 225, flip); // 宽, 高, 是否翻转
        await webcam.setup(); // 请求访问摄像头
        await webcam.play();
        window.requestAnimationFrame(loop);

        // 将 webcam 的视频源附加到 video 元素上
        document.getElementById("video").srcObject = webcam.canvas.captureStream();

        document.getElementById('status').innerText = "摄像头已启动，开始识别...";
        isPredicting = true;

    } catch (error) {
        console.error("初始化失败:", error);
        document.getElementById('status').innerText = "初始化失败: " + error.message;
    }
}


// 预测和渲染循环
async function loop() {
    if (isPredicting && webcam.webcam.readyState === 4) { // 确保视频流已就绪
        webcam.update(); // 更新 webcam 帧
        await predict();
    }
    window.requestAnimationFrame(loop);
}

// 运行图像预测
async function predict() {
    if (!model || !webcam) return;

    // Run the webcam image through the model
    const prediction = await model.predict(webcam.canvas);

    let bestPrediction = "";
    let highestProbability = -1;
    let bestIndex = -1;

    // 更新预测结果列表
    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        const li = labelContainer.childNodes[i];
        li.innerText = classPrediction;

        // 移除之前的高亮类
        li.classList.remove("strong-prediction");

        // 找到概率最高的预测
        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestPrediction = prediction[i].className;
            bestIndex = i;
        }
    }

    // 高亮显示最佳预测
    if (bestIndex >= 0) {
        labelContainer.childNodes[bestIndex].classList.add("strong-prediction");
        document.getElementById("best-prediction").innerText = bestPrediction;
        // 根据最佳预测执行动作
        performAction(bestPrediction, highestProbability);
    } else {
        document.getElementById("best-prediction").innerText = "-";
        document.getElementById("action-description").innerText = "无明确手势识别";
        resetObjectStyle(); // 重置对象样式
    }
}

// 根据手势执行页面上的动作
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
    object.classList.remove("action-move", "action-change-color", "action-spin"); // 清除动画类

    switch(gestureName.toLowerCase()) { // 使用 toLowerCase 使匹配不区分大小写
        case 'thumbsup':
            description.innerText = "👍 点赞！改变颜色";
            object.classList.add("action-change-color");
            break;
        case 'peace':
        case 'peace sign': // Teachable Machine 可能会给出不同的标签名
             description.innerText = "✌️ 和平！开始移动";
            object.classList.add("action-move");
            break;
        case 'fist':
            description.innerText = "✊ 握拳！开始旋转";
            object.classList.add("action-spin");
            break;
        case 'open_palm':
        case 'open palm':
        case 'stop':
             description.innerText = "✋ 停止！重置状态";
            // 重置已经在 resetObjectStyle 中做了
            break;
        default:
            description.innerText = `识别到未知手势: ${gestureName}`;
            // 可以为未定义的手势添加默认行为
    }
}

// 重置虚拟对象的样式和动画
function resetObjectStyle() {
    const object = document.getElementById("virtual-object");
    // 移除所有动作相关的类
    object.classList.remove("action-move", "action-change-color", "action-spin");
    // 重置为默认样式（如果需要）
    // object.style.backgroundColor = "#4CAF50";
    // object.style.transform = "translateX(0) rotate(0deg)";
}

// 页面加载完成后启动应用
window.addEventListener('load', init);

// (可选) 添加页面卸载时停止摄像头的逻辑
window.addEventListener('beforeunload', () => {
    if (webcam) {
        webcam.stop();
    }
    isPredicting = false;
});
