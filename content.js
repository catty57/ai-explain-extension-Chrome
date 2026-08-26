// AI文本解释助手 - 内容脚本
// 功能：监听文本选择，显示悬浮图标，处理点击事件

// 全局标志，防止点击图标后 mouseup 事件移除图标
let isIconClicking = false;

// 创建悬浮图标按钮
function createFloatingIcon(x, y) {
    // 移除已存在的图标
    removeFloatingIcon();
    
    // 在创建图标时立即保存选中的文本
    const selectedText = window.getSelection().toString().trim();
    console.log('💾 保存选中文本到图标:', selectedText);
    
    const icon = document.createElement('div');
    icon.id = 'ai-explain-icon';
    icon.innerHTML = '🤖';
    icon.style.cssText = `
        position: fixed;
        left: ${x + 10}px;
        top: ${y + 10}px;
        width: 40px;
        height: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        cursor: pointer;
        z-index: 999999;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: all 0.3s ease;
        user-select: none;
    `;
    
    // 鼠标悬停效果
    icon.addEventListener('mouseenter', () => {
        icon.style.transform = 'scale(1.1)';
        icon.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
    });
    
    icon.addEventListener('mouseleave', () => {
        icon.style.transform = 'scale(1)';
        icon.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    });
    
    // 使用 mousedown 事件而不是 click，防止文本选择被取消
    icon.addEventListener('mousedown', (e) => {
        console.log('🎯 图标被点击了（mousedown）！');
        isIconClicking = true; // 设置标志，防止 mouseup 移除图标
        e.preventDefault(); // 阻止默认行为
        e.stopPropagation(); // 阻止事件冒泡
        
        // 使用保存的文本，而不是重新获取
        console.log('📝 使用保存的文本:', selectedText);
        console.log('📏 保存的文本长度:', selectedText.length);
        
        if (selectedText && selectedText.length > 0) {
            console.log('✅ 准备显示解释弹窗，位置:', x, y);
            showExplanationPopup(selectedText, x, y);
        } else {
            console.log('❌ 没有获取到选中文本或文本为空');
        }
        removeFloatingIcon();
        
        // 延迟重置标志
        setTimeout(() => {
            isIconClicking = false;
        }, 200);
    });
    
    document.body.appendChild(icon);
}

// 移除悬浮图标
function removeFloatingIcon() {
    const icon = document.getElementById('ai-explain-icon');
    if (icon) {
        icon.remove();
    }
}

// 显示解释弹窗
function showExplanationPopup(text, x, y) {
    console.log('🚀 showExplanationPopup 被调用');
    console.log('📝 文本:', text);
    console.log('📍 位置:', x, y);
    
    // 移除已存在的弹窗
    removeExplanationPopup();
    
    // 创建弹窗容器
    const popup = document.createElement('div');
    popup.id = 'ai-explain-popup';
    
    // 计算弹窗位置（确保不超出屏幕）
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const popupWidth = 500;
    const popupHeight = 400;
    
    let popupX = x + 60;
    let popupY = y;
    
    // 如果右侧空间不足，显示在左侧
    if (popupX + popupWidth > screenWidth) {
        popupX = x - popupWidth - 60;
    }
    
    // 如果下方空间不足，向上调整
    if (popupY + popupHeight > screenHeight) {
        popupY = screenHeight - popupHeight - 20;
    }
    
    console.log('📐 计算后的弹窗位置:', popupX, popupY);
    
    popup.style.cssText = `
        position: fixed;
        left: ${popupX}px;
        top: ${popupY}px;
        width: ${popupWidth}px;
        height: ${popupHeight}px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 1000000;
        display: flex;
        flex-direction: column;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    `;
    
    // 创建弹窗头部
    const header = document.createElement('div');
    header.style.cssText = `
        padding: 16px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px 12px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: white;
    `;
    
    const title = document.createElement('div');
    title.textContent = '🤖 AI 解释';
    title.style.cssText = `
        font-size: 16px;
        font-weight: 600;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
    `;
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.3)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
    });
    closeBtn.addEventListener('click', () => {
        removeExplanationPopup();
    });
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    
    // 创建选中文本显示区域
    const selectedTextDiv = document.createElement('div');
    selectedTextDiv.style.cssText = `
        padding: 12px 20px;
        background: #f7f7f7;
        border-bottom: 1px solid #e0e0e0;
        font-size: 13px;
        color: #666;
        max-height: 80px;
        overflow-y: auto;
    `;
    selectedTextDiv.innerHTML = `<strong>选中文本：</strong>${text.substring(0, 200)}${text.length > 200 ? '...' : ''}`;
    
    // 创建解释内容显示区域
    const content = document.createElement('div');
    content.id = 'ai-explain-content';
    content.style.cssText = `
        flex: 1;
        padding: 20px;
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.6;
        color: #333;
    `;
    content.innerHTML = '<div style="color: #999; text-align: center; margin-top: 50px;">正在获取解释...</div>';
    
    // 创建底部状态栏
    const footer = document.createElement('div');
    footer.id = 'ai-explain-footer';
    footer.style.cssText = `
        padding: 10px 20px;
        background: #f7f7f7;
        border-top: 1px solid #e0e0e0;
        font-size: 12px;
        color: #999;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    footer.innerHTML = '<span>准备就绪</span>';
    
    // 组装弹窗
    popup.appendChild(header);
    popup.appendChild(selectedTextDiv);
    popup.appendChild(content);
    popup.appendChild(footer);
    
    console.log('📦 准备将弹窗添加到页面');
    document.body.appendChild(popup);
    console.log('✅ 弹窗已添加到页面');
    console.log('🔍 弹窗元素:', document.getElementById('ai-explain-popup'));
    
    // 调用API获取解释
    callAIExplain(text, content, footer);
}

// 移除解释弹窗
function removeExplanationPopup() {
    const popup = document.getElementById('ai-explain-popup');
    if (popup) {
        popup.remove();
    }
}

// 调用AI解释API
async function callAIExplain(text, contentDiv, footerDiv) {
    console.log('🚀 开始调用 AI 解释 API');
    console.log('📝 要解释的文本:', text);
    
    try {
        // 从存储中获取配置
        const config = await chrome.storage.local.get(['apiKey', 'apiModel', 'apiProvider']);
        
        console.log('⚙️ 获取到的配置:', config);
        
        if (!config.apiKey) {
            console.log('❌ 未配置 API Key');
            contentDiv.innerHTML = `
                <div style="color: #f44336; text-align: center; padding: 20px;">
                    <p>❌ 未配置 API Key</p>
                    <p style="font-size: 12px; margin-top: 10px;">请点击浏览器工具栏的插件图标进行配置</p>
                </div>
            `;
            return;
        }
        
        // 更新状态
        footerDiv.innerHTML = '<span>🔄 正在调用 AI...</span>';
        
        // 准备请求数据
        const requestData = {
            text: text,
            apiKey: config.apiKey,
            model: config.apiModel || 'gpt-3.5-turbo',
            provider: config.apiProvider || 'openai'
        };
        
        console.log('📤 发送给 background script 的数据:', requestData);
        
        // 发送消息给background script
        const response = await chrome.runtime.sendMessage({
            action: 'explainText',
            data: requestData
        });
        
        console.log('📥 收到 background script 的响应:', response);
        
        if (response.error) {
            console.log('❌ API 调用返回错误:', response.error);
            throw new Error(response.error);
        }
        
        console.log('✅ API 调用成功，响应内容:', response.content);
        
        // 流式显示结果
        await streamResponse(response.content, contentDiv, footerDiv);
        
    } catch (error) {
        console.error('❌ AI解释失败:', error);
        
        // 检测扩展上下文失效
        if (error.message.includes('Extension context invalidated')) {
            contentDiv.innerHTML = `
                <div style="color: #ff9800; text-align: center; padding: 20px;">
                    <p>⚠️ 插件已更新</p>
                    <p style="font-size: 12px; margin-top: 10px;">请刷新页面后重试（按 F5）</p>
                </div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div style="color: #f44336; padding: 20px;">
                    <p>❌ 解释失败</p>
                    <p style="font-size: 12px; margin-top: 10px;">${error.message}</p>
                </div>
            `;
        }
        footerDiv.innerHTML = '<span>❌ 出错了</span>';
    }
}

// 流式显示响应内容
async function streamResponse(content, contentDiv, footerDiv) {
    contentDiv.innerHTML = '';
    footerDiv.innerHTML = '<span>📝 正在生成解释...</span>';
    
    let displayedText = '';
    const chars = content.split('');
    
    for (let i = 0; i < chars.length; i++) {
        displayedText += chars[i];
        contentDiv.innerHTML = formatMarkdown(displayedText);
        
        // 滚动到底部
        contentDiv.scrollTop = contentDiv.scrollHeight;
        
        // 添加延迟以实现打字效果
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    footerDiv.innerHTML = '<span>✅ 解释完成</span>';
}

// 简单的Markdown格式化
function formatMarkdown(text) {
    // 转义HTML
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // 处理代码块
    text = text.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre style="background: #f5f5f5; padding: 12px; border-radius: 6px; overflow-x: auto; margin: 10px 0;"><code>$2</code></pre>');
    
    // 处理行内代码
    text = text.replace(/`([^`]+)`/g, '<code style="background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">$1</code>');
    
    // 处理粗体
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // 处理斜体
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // 处理换行
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// 监听文本选择事件
document.addEventListener('mouseup', (e) => {
    // 如果是点击图标导致的 mouseup，跳过处理
    if (isIconClicking) {
        console.log('⏭️ 跳过 mouseup 事件（点击图标中）');
        return;
    }
    
    // 延迟执行，确保选择完成
    setTimeout(() => {
        const selectedText = window.getSelection().toString().trim();
        
        console.log('📝 选中文本:', selectedText);
        console.log('📏 文本长度:', selectedText.length);
        
        // 如果有选中文本且长度大于1个字符（降低门槛）
        if (selectedText && selectedText.length > 1) {
            const selection = window.getSelection();
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            
            console.log('📍 选区位置:', rect);
            console.log('✅ 准备显示悬浮图标');
            
            // 在选中文本旁边显示图标
            createFloatingIcon(rect.right, rect.top);
        } else {
            console.log('❌ 文本太短或未选择，移除图标');
            removeFloatingIcon();
        }
    }, 100);
});

// 点击页面其他地方时隐藏图标和弹窗
document.addEventListener('click', (e) => {
    const icon = document.getElementById('ai-explain-icon');
    const popup = document.getElementById('ai-explain-popup');
    
    console.log('🖱️ document click 事件触发，目标:', e.target);
    console.log('🔍 是否点击图标:', icon && icon.contains(e.target));
    console.log('🔍 是否点击弹窗:', popup && popup.contains(e.target));
    
    // 如果点击的不是图标或弹窗内部
    if (icon && !icon.contains(e.target) && popup && !popup.contains(e.target)) {
        console.log('🗑️ 移除悬浮图标');
        removeFloatingIcon();
        // 不自动关闭弹窗，让用户手动关闭
    } else {
        console.log('✅ 点击了图标或弹窗，不移除');
    }
});

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'closePopup') {
        removeExplanationPopup();
        removeFloatingIcon();
    }
});

console.log('AI文本解释助手已加载');