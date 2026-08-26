// AI文本解释助手 - 后台服务脚本
// 功能：处理API调用，支持多种AI服务提供商

// 监听来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('📨 Background 收到消息:', request.action, request.data);
    
    if (request.action === 'explainText') {
        console.log('🎯 处理解释请求');
        handleExplainRequest(request.data)
            .then(result => {
                console.log('✅ 解释请求处理成功:', result);
                sendResponse(result);
            })
            .catch(error => {
                console.error('❌ 解释请求处理失败:', error);
                sendResponse({ error: error.message });
            });
        return true; // 保持消息通道开放以支持异步响应
    }
    
    if (request.action === 'testConnection') {
        testConnection(request.data)
            .then(result => sendResponse(result))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true;
    }
});

// 处理解释请求
async function handleExplainRequest(data) {
    const { text, apiKey, model, provider } = data;
    
    console.log('📋 handleExplainRequest 接收到的数据:', { text, apiKey: apiKey ? '***已配置***' : '未配置', model, provider });
    
    try {
        let response;
        
        console.log('🎯 准备调用 API，提供商:', provider);
        
        // 根据不同的提供商调用不同的API
        switch (provider) {
            case 'openai':
                console.log('📞 调用 OpenAI API');
                response = await callOpenAI(text, apiKey, model);
                break;
            case 'deepseek':
                console.log('📞 调用 DeepSeek API');
                response = await callDeepSeek(text, apiKey, model);
                break;
            case 'doubao':
                console.log('📞 调用豆包 API');
                response = await callDoubao(text, apiKey, model);
                break;
            default:
                console.log('📞 默认调用 OpenAI API');
                response = await callOpenAI(text, apiKey, model);
        }
        
        console.log('✅ API 调用完成，返回内容长度:', response.length);
        console.log('📄 API 返回的内容:', response);
        
        return { content: response };
        
    } catch (error) {
        console.error('❌ API调用失败:', error);
        throw error;
    }
}

// 调用OpenAI API
async function callOpenAI(text, apiKey, model) {
    console.log('🔵 callOpenAI 开始执行');
    console.log('📝 要解释的文本:', text);
    console.log('🔑 API Key:', apiKey ? '***已配置***' : '未配置');
    console.log('🤖 模型:', model || 'gpt-3.5-turbo');
    
    const prompt = `请用通俗易懂的中文解释以下内容，帮助用户理解：

${text}

要求：
1. 用简单明了的语言解释
2. 如果包含专业术语，请给出解释
3. 如果是代码，请说明其功能
4. 保持回答简洁但全面`;

    console.log('💬 发送的 prompt:', prompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: '你是一个乐于助人的AI助手，擅长用简单易懂的语言解释复杂的概念和内容。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    console.log('📡 API 响应状态:', response.status, response.statusText);

    if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ OpenAI API 错误:', errorData);
        throw new Error(`OpenAI API 错误: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 API 返回的数据:', data);
    console.log('✅ 提取的解释内容:', data.choices[0].message.content);
    
    return data.choices[0].message.content;
}

// 调用DeepSeek API
async function callDeepSeek(text, apiKey, model) {
    const prompt = `请用通俗易懂的中文解释以下内容，帮助用户理解：

${text}

要求：
1. 用简单明了的语言解释
2. 如果包含专业术语，请给出解释
3. 如果是代码，请说明其功能
4. 保持回答简洁但全面`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: [
                {
                    role: 'system',
                    content: '你是一个乐于助人的AI助手，擅长用简单易懂的语言解释复杂的概念和内容。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API 错误: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// 调用豆包API（火山引擎）
async function callDoubao(text, apiKey, model) {
    // 豆包API需要从apiKey中解析出accessKey和secretKey
    // 格式通常为: accessKey|secretKey
    const [accessKey, secretKey] = apiKey.split('|');
    
    if (!accessKey || !secretKey) {
        throw new Error('豆包 API Key 格式错误，应为: accessKey|secretKey');
    }

    const prompt = `请用通俗易懂的中文解释以下内容，帮助用户理解：

${text}

要求：
1. 用简单明了的语言解释
2. 如果包含专业术语，请给出解释
3. 如果是代码，请说明其功能
4. 保持回答简洁但全面`;

    // 豆包API端点（实际使用时需要替换为正确的端点）
    const endpoint = model || 'ep-20241201123456-xxxxx';
    
    const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessKey}`
        },
        body: JSON.stringify({
            model: endpoint,
            messages: [
                {
                    role: 'system',
                    content: '你是一个乐于助人的AI助手，擅长用简单易懂的语言解释复杂的概念和内容。'
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            temperature: 0.7,
            max_tokens: 2000
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`豆包 API 错误: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// 测试连接
async function testConnection(data) {
    const { apiKey, provider, model } = data;
    
    try {
        let response;
        
        // 根据不同的提供商调用测试API
        switch (provider) {
            case 'openai':
                response = await testOpenAI(apiKey, model);
                break;
            case 'deepseek':
                response = await testDeepSeek(apiKey, model);
                break;
            case 'doubao':
                response = await testDoubao(apiKey, model);
                break;
            default:
                response = await testOpenAI(apiKey, model);
        }
        
        return { success: true, message: '连接成功' };
        
    } catch (error) {
        console.error('测试连接失败:', error);
        throw error;
    }
}

// 测试OpenAI连接
async function testOpenAI(apiKey, model) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'user',
                    content: 'Hello'
                }
            ],
            max_tokens: 10
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API 错误: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
}

// 测试DeepSeek连接
async function testDeepSeek(apiKey, model) {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model || 'deepseek-chat',
            messages: [
                {
                    role: 'user',
                    content: 'Hello'
                }
            ],
            max_tokens: 10
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`DeepSeek API 错误: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
}

// 测试豆包连接
async function testDoubao(apiKey, model) {
    const [accessKey, secretKey] = apiKey.split('|');
    
    if (!accessKey || !secretKey) {
        throw new Error('豆包 API Key 格式错误，应为: accessKey|secretKey');
    }

    const endpoint = model || 'ep-20241201123456-xxxxx';
    
    const response = await fetch(`https://ark.cn-beijing.volces.com/api/v3/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessKey}`
        },
        body: JSON.stringify({
            model: endpoint,
            messages: [
                {
                    role: 'user',
                    content: 'Hello'
                }
            ],
            max_tokens: 10
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`豆包 API 错误: ${errorData.error?.message || response.statusText}`);
    }

    return await response.json();
}

// 插件安装时的初始化
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // 首次安装时，打开设置页面
        chrome.tabs.create({ url: 'options.html' });
        
        // 设置默认配置
        chrome.storage.local.set({
            apiProvider: 'openai',
            apiModel: 'gpt-3.5-turbo',
            apiKey: ''
        });
    }
});

// 监听插件图标点击
chrome.action.onClicked.addListener((tab) => {
    // 打开设置页面
    chrome.tabs.create({ url: 'options.html' });
});

console.log('AI文本解释助手后台服务已启动');