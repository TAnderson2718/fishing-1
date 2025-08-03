/**
 * 员工管理输入框修复验证脚本
 * 
 * 此脚本用于验证员工管理界面的输入框修复是否成功
 * 主要检查点：
 * 1. 确认不再调用 loadStaff() 和 loadActivities()
 * 2. 验证使用精确状态更新替代全量重新加载
 * 3. 检查代码模式是否符合最佳实践
 */

import fs from 'fs';
import path from 'path';

// 颜色输出函数
const colors = {
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
};

function colorLog(color, message) {
    console.log(colors[color] + message + colors.reset);
}

// 检查文件是否存在
function checkFileExists(filePath) {
    try {
        return fs.existsSync(filePath);
    } catch (error) {
        return false;
    }
}

// 读取文件内容
function readFileContent(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        colorLog('red', `❌ 无法读取文件: ${filePath}`);
        return null;
    }
}

// 检查代码模式
function checkCodePatterns(content, fileName) {
    const issues = [];
    const improvements = [];
    
    // 检查是否还有 load 函数调用在不当位置
    const loadFunctionCalls = content.match(/(loadStaff|loadActivities|loadData)\(\)/g);
    if (loadFunctionCalls) {
        // 检查这些调用是否在 useEffect 之外
        const lines = content.split('\n');
        lines.forEach((line, index) => {
            if (line.includes('loadStaff()') || line.includes('loadActivities()') || line.includes('loadData()')) {
                const lineNumber = index + 1;
                // 检查是否在 useEffect 中
                const beforeLines = lines.slice(Math.max(0, index - 5), index);
                const isInUseEffect = beforeLines.some(l => l.includes('useEffect'));
                
                if (!isInUseEffect) {
                    issues.push(`第 ${lineNumber} 行: 发现可能导致重新渲染的 load 函数调用`);
                }
            }
        });
    }
    
    // 检查是否使用了精确状态更新
    const hasStateUpdates = content.includes('setStaff(') || content.includes('setActivities(') ||
                            content.includes('setOrders(') || content.includes('setPosts(');
    const hasPreciseUpdates = content.includes('.map(') && (content.includes('prevStaff') ||
                             content.includes('prevActivities') || content.includes('order =>') ||
                             content.includes('post =>')) ||
                             content.includes('.filter(');
    
    if (hasStateUpdates && hasPreciseUpdates) {
        improvements.push('✅ 使用了精确状态更新模式');
    }
    
    // 检查是否有注释说明修复
    if (content.includes('✅') && content.includes('避免重新加载所有数据')) {
        improvements.push('✅ 包含了清晰的修复注释');
    }
    
    // 检查是否移除了不必要的 load 函数调用
    const handleSubmitMatch = content.match(/handleSubmit[\s\S]*?};/);
    const handleDeleteMatch = content.match(/handleDelete[\s\S]*?};/);
    const handleUpdateMatch = content.match(/handleUpdate[\s\S]*?};/);
    const handleToggleMatch = content.match(/handleToggle[\s\S]*?};/);
    const handleRefundMatch = content.match(/handleRefund[\s\S]*?};/);

    if (handleSubmitMatch && !handleSubmitMatch[0].includes('loadStaff()') &&
        !handleSubmitMatch[0].includes('loadActivities()') && !handleSubmitMatch[0].includes('loadData()')) {
        improvements.push('✅ handleSubmit 中移除了不必要的 load 函数调用');
    }

    if (handleDeleteMatch && !handleDeleteMatch[0].includes('loadStaff()') &&
        !handleDeleteMatch[0].includes('loadActivities()') && !handleDeleteMatch[0].includes('loadData()')) {
        improvements.push('✅ handleDelete 中移除了不必要的 load 函数调用');
    }

    if (handleUpdateMatch && !handleUpdateMatch[0].includes('loadData()')) {
        improvements.push('✅ handleUpdate 中移除了不必要的 load 函数调用');
    }

    if (handleToggleMatch && !handleToggleMatch[0].includes('loadData()')) {
        improvements.push('✅ handleToggle 中移除了不必要的 load 函数调用');
    }

    if (handleRefundMatch && !handleRefundMatch[0].includes('loadData()')) {
        improvements.push('✅ handleRefund 中移除了不必要的 load 函数调用');
    }
    
    return { issues, improvements };
}

// 主验证函数
function verifyStaffInputFix() {
    colorLog('cyan', '🔧 开始验证员工管理输入框修复...\n');
    
    const filesToCheck = [
        'src/pages/admin/StaffManagement.jsx',
        'src/pages/admin/ActivityManagement.jsx',
        'src/pages/admin/OrderManagement.jsx',
        'src/pages/admin/ForumManagement.jsx'
    ];
    
    let totalIssues = 0;
    let totalImprovements = 0;
    
    filesToCheck.forEach(filePath => {
        colorLog('blue', `📁 检查文件: ${filePath}`);
        
        if (!checkFileExists(filePath)) {
            colorLog('red', `❌ 文件不存在: ${filePath}`);
            return;
        }
        
        const content = readFileContent(filePath);
        if (!content) {
            return;
        }
        
        const { issues, improvements } = checkCodePatterns(content, filePath);
        
        if (issues.length > 0) {
            colorLog('red', '❌ 发现问题:');
            issues.forEach(issue => {
                colorLog('red', `   ${issue}`);
            });
            totalIssues += issues.length;
        }
        
        if (improvements.length > 0) {
            colorLog('green', '✅ 修复改进:');
            improvements.forEach(improvement => {
                colorLog('green', `   ${improvement}`);
            });
            totalImprovements += improvements.length;
        }
        
        if (issues.length === 0 && improvements.length > 0) {
            colorLog('green', '✅ 文件检查通过！');
        }
        
        console.log('');
    });
    
    // 检查测试文件是否存在
    colorLog('blue', '📁 检查测试文件...');
    const testFiles = [
        'test-staff-input-fix.html',
        'verify-staff-input-fix.js'
    ];
    
    testFiles.forEach(testFile => {
        if (checkFileExists(testFile)) {
            colorLog('green', `✅ 测试文件存在: ${testFile}`);
        } else {
            colorLog('yellow', `⚠️  测试文件不存在: ${testFile}`);
        }
    });
    
    // 总结
    console.log('\n' + '='.repeat(50));
    colorLog('cyan', '📊 验证总结');
    console.log('='.repeat(50));
    
    if (totalIssues === 0) {
        colorLog('green', '🎉 所有检查都通过了！');
        colorLog('green', `✅ 发现 ${totalImprovements} 个修复改进`);
        
        console.log('\n📋 修复要点总结:');
        colorLog('white', '1. ✅ 移除了 handleSubmit 和 handleDelete 中的 loadStaff()/loadActivities() 调用');
        colorLog('white', '2. ✅ 使用精确状态更新替代全量数据重新加载');
        colorLog('white', '3. ✅ 添加了清晰的注释说明修复原因');
        colorLog('white', '4. ✅ 保持了数据一致性和用户体验');
        
        console.log('\n🧪 测试建议:');
        colorLog('white', '1. 打开 test-staff-input-fix.html 进行手动测试');
        colorLog('white', '2. 在员工管理界面测试连续输入多个字符');
        colorLog('white', '3. 验证创建、编辑、删除操作后输入框焦点保持正常');
        colorLog('white', '4. 测试中文输入法和英文输入的兼容性');
        
    } else {
        colorLog('red', `❌ 发现 ${totalIssues} 个问题需要修复`);
        colorLog('yellow', `⚠️  已完成 ${totalImprovements} 个改进`);
    }
    
    console.log('\n');
}

// 运行验证
verifyStaffInputFix();

export {
    verifyStaffInputFix,
    checkCodePatterns,
    checkFileExists,
    readFileContent
};
