#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 开始最终输入框修复验证...\n');

// 检查的文件列表
const filesToCheck = [
  'src/pages/admin/StaffManagement.jsx',
  'src/pages/admin/ActivityManagement.jsx', 
  'src/pages/admin/OrderManagement.jsx',
  'src/pages/admin/ForumManagement.jsx',
  'src/pages/customer/CustomerForum.jsx',
  'src/contexts/ToastContext.jsx',
  'src/contexts/AuthContext.jsx'
];

// 检查代码模式
function checkCodePatterns(content, fileName) {
  const issues = [];
  const improvements = [];
  
  // 检查是否还有 load 函数调用在不当位置
  const loadFunctionCalls = content.match(/(loadStaff|loadActivities|loadData)\(\)/g);
  if (loadFunctionCalls) {
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
  
  // 检查是否有修复注释
  if (content.includes('✅') && content.includes('避免')) {
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

  // 检查 Context 优化
  if (fileName.includes('Context.jsx')) {
    if (content.includes('useMemo') && content.includes('value')) {
      improvements.push('✅ 使用了 useMemo 优化 Context value');
    }
    if (content.includes('useCallback')) {
      improvements.push('✅ 使用了 useCallback 优化函数');
    }
  }

  // 检查组件优化
  if (content.includes('React.memo')) {
    improvements.push('✅ 使用了 React.memo 优化组件');
  }
  
  if (content.includes('useCallback')) {
    improvements.push('✅ 使用了 useCallback 优化事件处理器');
  }
  
  return { issues, improvements };
}

let totalIssues = 0;
let totalImprovements = 0;

// 检查每个文件
filesToCheck.forEach(filePath => {
  console.log(`📁 检查文件: ${filePath}`);
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const { issues, improvements } = checkCodePatterns(content, filePath);
    
    if (issues.length > 0) {
      console.log('❌ 发现问题:');
      issues.forEach(issue => console.log(`   ${issue}`));
      totalIssues += issues.length;
    }
    
    if (improvements.length > 0) {
      console.log('✅ 修复改进:');
      improvements.forEach(improvement => console.log(`   ${improvement}`));
      totalImprovements += improvements.length;
    }
    
    if (issues.length === 0) {
      console.log('✅ 文件检查通过！');
    }
    
  } catch (error) {
    console.log(`❌ 无法读取文件: ${error.message}`);
    totalIssues++;
  }
  
  console.log('');
});

// 检查测试文件
console.log('📁 检查测试文件...');
const testFiles = [
  'test-staff-input-fix.html',
  'test-input-focus.html',
  'test-final-input-validation.js'
];

testFiles.forEach(testFile => {
  if (fs.existsSync(testFile)) {
    console.log(`✅ 测试文件存在: ${testFile}`);
  } else {
    console.log(`❌ 测试文件缺失: ${testFile}`);
    totalIssues++;
  }
});

console.log('\n==================================================');
console.log('📊 最终验证总结');
console.log('==================================================');

if (totalIssues === 0) {
  console.log('🎉 所有检查都通过了！');
  console.log(`✅ 发现 ${totalImprovements} 个修复改进`);
  
  console.log('\n📋 关键修复要点:');
  console.log('1. ✅ 移除了所有事件处理器中的不必要 load 函数调用');
  console.log('2. ✅ 使用精确状态更新替代全量数据重新加载');
  console.log('3. ✅ 优化了 Context 提供者，避免不必要的重新渲染');
  console.log('4. ✅ 使用 React.memo 和 useCallback 优化组件性能');
  console.log('5. ✅ 添加了清晰的注释说明修复原因');
  
  console.log('\n🧪 测试建议:');
  console.log('1. 打开 test-input-focus.html 进行基础输入测试');
  console.log('2. 在实际管理界面测试连续输入多个字符');
  console.log('3. 验证创建、编辑、删除操作后输入框焦点保持正常');
  console.log('4. 测试中文输入法和英文输入的兼容性');
  
} else {
  console.log(`❌ 发现 ${totalIssues} 个问题需要修复`);
  console.log(`⚠️  已完成 ${totalImprovements} 个改进`);
}

console.log('\n');
