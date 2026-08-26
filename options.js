// AI文本解释助手 - 设置页面脚本
// 功能：处理配置保存、加载和测试

// DOM元素
const apiProviderSelect = document.getElementById('apiProvider');
const apiKeyInput = document.getElementById('apiKey');
const toggleApiKeyBtn = document.getElementById('toggleApiKey');
const apiModelSelect = document.getElementById('apiModel');
const temperatureSlider = document.getElementById('temperature');
const temperatureValue = document.getElementById('temperatureValue');
const maxTokensInput = document.getElementById('maxTokens');
const saveBtn = document.getElementById('saveBtn');
const testBtn = document.getElementById('testBtn');
const statusMessage = document.getElementById('statusMessage');
const apiKeyHelp = document.getElementById('apiKeyHelp');

// API提供商对应的帮助链接
const providerHelpLinks = {
    openai: '在OpenAI平台获取: <a href="https://platform.openai.com/api-keys" target="_blank">https://platform.openai.com/api-keys</a>',
    deepseek: '在DeepSeek平台获取: <a href="https://platform.deepseek.com/" target="_blank">https://platform.deepseek.com/</a>',
    doubao: '在火山引擎获取: <a href="https://console.volcengine.com/ark" target="_blank">https://console.volcengine.com/ark</a>'
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // API提供商改变时更新模型选项和帮助链接
    apiProviderSelect.addEventListener('change', () => {
        updateModelOptions();
        updateHelpLink();
    });

    // 温度滑块值显示
    temperatureSlider.addEventListener('input', () => {
        temperatureValue.textContent = temperatureSlider.value;
    });

    // 切换API Key显示/隐藏
    toggleApiKeyBtn.addEventListener('click', () => {
        const type = apiKeyInput.type === 'password' ? 'text' : 'password';
        apiKeyInput.type = type;
        toggleApiKeyBtn.textContent = type === 'password' ? '👁️' : '🙈';
    });

    // 保存配置
    saveBtn.addEventListener('click', saveSettings);

    // 测试连接
    testBtn.addEventListener('click', testConnection);
}

// 加载保存的设置
async function loadSettings() {
    try {
        const settings = await chrome.storage.local.get([
            'apiProvider',
            'apiKey',
            'apiModel',
            'temperature',
            'maxTokens'
        ]);

        // 填充表单
        if (settings.apiProvider) {
            apiProviderSelect.value = settings.apiProvider;
        }
        if (settings.apiKey) {
            apiKeyInput.value = settings.apiKey;
        }
        if (settings.apiModel) {
            apiModelSelect.value = settings.apiModel;
        }
        if (settings.temperature) {
            temperatureSlider.value = settings.temperature;
            temperatureValue.textContent = settings.temperature;
        }
        if (settings.maxTokens) {
            maxTokensInput.value = settings.maxTokens;
        }

        // 更新模型选项和帮助链接
        updateModelOptions();
        updateHelpLink();

    } catch (error) {
        console.error('加载设置失败:', error);
        showStatus('加载设置失败', 'error');
    }
}

// 保存设置
async function saveSettings() {
    try {
        const settings = {
            apiProvider: apiProviderSelect.value,
            apiKey: apiKeyInput.value.trim(),
            apiModel: apiModelSelect.value,
            temperature: parseFloat(temperatureSlider.value),
            maxTokens: parseInt(maxTokensInput.value)
        };

        // 验证API Key
        if (!settings.apiKey) {
            showStatus('请输入API Key', 'error');
            return;
        }

        // 保存到Chrome存储
        await chrome.storage.local.set(settings);

        showStatus('✅ 配置已保存', 'success');

        // 3秒后清除消息
        setTimeout(() => {
            hideStatus();
        }, 3000);

    } catch (error) {
        console.error('保存设置失败:', error);
        showStatus('保存失败: ' + error.message, 'error');
    }
}

// 测试连接
async function testConnection() {
    const apiKey = apiKeyInput.value.trim();
    const apiProvider = apiProviderSelect.value;
    const apiModel = apiModelSelect.value;

    if (!apiKey) {
        showStatus('请先输入API Key', 'error');
        return;
    }

    // 禁用按钮
    testBtn.disabled = true;
    testBtn.textContent = '🔄 测试中...';
    showStatus('正在测试连接...', 'info');

    try {
        // 发送测试请求到background script
        const response = await chrome.runtime.sendMessage({
            action: 'testConnection',
            data: {
                apiKey: apiKey,
                provider: apiProvider,
                model: apiModel
            }
        });

        if (response.success) {
            showStatus('✅ 连接测试成功！', 'success');
        } else {
            showStatus('❌ 连接测试失败: ' + response.error, 'error');
        }

    } catch (error) {
        console.error('测试连接失败:', error);
        showStatus('❌ 测试失败: ' + error.message, 'error');
    } finally {
        // 恢复按钮
        testBtn.disabled = false;
        testBtn.textContent = '🧪 测试连接';
    }
}

// 更新模型选项
function updateModelOptions() {
    const provider = apiProviderSelect.value;
    
    // 隐藏所有模型组
    document.getElementById('openaiModels').style.display = 'none';
    document.getElementById('deepseekModels').style.display = 'none';
    document.getElementById('doubaoModels').style.display = 'none';
    
    // 显示选中的模型组
    switch (provider) {
        case 'openai':
            document.getElementById('openaiModels').style.display = 'block';
            apiModelSelect.value = 'gpt-3.5-turbo';
            break;
        case 'deepseek':
            document.getElementById('deepseekModels').style.display = 'block';
            apiModelSelect.value = 'deepseek-chat';
            break;
        case 'doubao':
            document.getElementById('doubaoModels').style.display = 'block';
            apiModelSelect.value = 'ep-20241201123456-xxxxx';
            break;
    }
}

// 更新帮助链接
function updateHelpLink() {
    const provider = apiProviderSelect.value;
    apiKeyHelp.innerHTML = providerHelpLinks[provider] || providerHelpLinks.openai;
}

// 显示状态消息
function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = 'status-message ' + type;
}

// 隐藏状态消息
function hideStatus() {
    statusMessage.className = 'status-message';
    statusMessage.textContent = '';
}

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'settingsUpdated') {
        loadSettings();
    }
});