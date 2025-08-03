import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon, 
  StopIcon,
  CalendarDaysIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

const ShiftManagement = () => {
  const [currentShift, setCurrentShift] = useState(null);
  const [shiftHistory, setShiftHistory] = useState([]);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [currentBreak, setCurrentBreak] = useState(null);
  const [todayStats, setTodayStats] = useState({
    totalHours: 0,
    breakTime: 0,
    workingTime: 0
  });

  useEffect(() => {
    loadShiftData();
    const interval = setInterval(loadShiftData, 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, []);

  const loadShiftData = () => {
    const shifts = storage.get('staffShifts') || [];
    const breaks = storage.get('staffBreaks') || [];
    
    // 查找当前班次
    const activeShift = shifts.find(shift => !shift.clockOut);
    setCurrentShift(activeShift);
    
    // 查找当前休息
    const activeBreak = breaks.find(breakItem => 
      activeShift && 
      breakItem.shiftId === activeShift.id && 
      !breakItem.endTime
    );
    setCurrentBreak(activeBreak);
    setIsOnBreak(!!activeBreak);
    
    // 获取今日班次历史
    const today = new Date().toISOString().split('T')[0];
    const todayShifts = shifts.filter(shift => 
      shift.clockIn.startsWith(today)
    );
    setShiftHistory(todayShifts);
    
    // 计算今日统计
    calculateTodayStats(todayShifts, breaks);
  };

  const calculateTodayStats = (shifts, breaks) => {
    let totalHours = 0;
    let breakTime = 0;
    
    shifts.forEach(shift => {
      if (shift.clockOut) {
        const start = new Date(shift.clockIn);
        const end = new Date(shift.clockOut);
        totalHours += (end - start) / (1000 * 60 * 60);
      } else if (shift.clockIn) {
        // 当前班次
        const start = new Date(shift.clockIn);
        const now = new Date();
        totalHours += (now - start) / (1000 * 60 * 60);
      }
      
      // 计算该班次的休息时间
      const shiftBreaks = breaks.filter(breakItem => breakItem.shiftId === shift.id);
      shiftBreaks.forEach(breakItem => {
        if (breakItem.endTime) {
          const breakStart = new Date(breakItem.startTime);
          const breakEnd = new Date(breakItem.endTime);
          breakTime += (breakEnd - breakStart) / (1000 * 60 * 60);
        } else if (breakItem.startTime) {
          // 当前休息
          const breakStart = new Date(breakItem.startTime);
          const now = new Date();
          breakTime += (now - breakStart) / (1000 * 60 * 60);
        }
      });
    });
    
    setTodayStats({
      totalHours: Math.round(totalHours * 100) / 100,
      breakTime: Math.round(breakTime * 100) / 100,
      workingTime: Math.round((totalHours - breakTime) * 100) / 100
    });
  };

  const clockIn = () => {
    const newShift = {
      id: Date.now().toString(),
      staffId: 'current_staff', // 实际应用中应该是当前登录员工ID
      clockIn: new Date().toISOString(),
      clockOut: null,
      date: new Date().toISOString().split('T')[0]
    };
    
    const shifts = storage.get('staffShifts') || [];
    storage.set('staffShifts', [...shifts, newShift]);
    setCurrentShift(newShift);
  };

  const clockOut = () => {
    if (!currentShift) return;
    
    // 如果正在休息，先结束休息
    if (isOnBreak && currentBreak) {
      endBreak();
    }
    
    const shifts = storage.get('staffShifts') || [];
    const updatedShifts = shifts.map(shift => 
      shift.id === currentShift.id 
        ? { ...shift, clockOut: new Date().toISOString() }
        : shift
    );
    
    storage.set('staffShifts', updatedShifts);
    setCurrentShift(null);
  };

  const startBreak = () => {
    if (!currentShift || isOnBreak) return;
    
    const newBreak = {
      id: Date.now().toString(),
      shiftId: currentShift.id,
      startTime: new Date().toISOString(),
      endTime: null,
      type: 'break'
    };
    
    const breaks = storage.get('staffBreaks') || [];
    storage.set('staffBreaks', [...breaks, newBreak]);
    setCurrentBreak(newBreak);
    setIsOnBreak(true);
  };

  const endBreak = () => {
    if (!currentBreak) return;
    
    const breaks = storage.get('staffBreaks') || [];
    const updatedBreaks = breaks.map(breakItem => 
      breakItem.id === currentBreak.id 
        ? { ...breakItem, endTime: new Date().toISOString() }
        : breakItem
    );
    
    storage.set('staffBreaks', updatedBreaks);
    setCurrentBreak(null);
    setIsOnBreak(false);
  };

  const formatDuration = (startTime, endTime = null) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end - start;
    
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}小时${minutes}分钟`;
  };

  const getCurrentShiftDuration = () => {
    if (!currentShift) return '0小时0分钟';
    return formatDuration(currentShift.clockIn);
  };

  const getCurrentBreakDuration = () => {
    if (!currentBreak) return '0分钟';
    const start = new Date(currentBreak.startTime);
    const now = new Date();
    const duration = now - start;
    const minutes = Math.floor(duration / (1000 * 60));
    return `${minutes}分钟`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">班次管理</h1>
        <p className="text-gray-600 mt-2">考勤打卡和工作时间管理</p>
      </div>

      {/* 当前状态卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">当前状态</h2>
            <div className={`w-3 h-3 rounded-full ${
              currentShift ? (isOnBreak ? 'bg-yellow-500' : 'bg-green-500') : 'bg-gray-400'
            }`}></div>
          </div>
          
          <div className="space-y-2">
            <div className="text-2xl font-bold">
              {!currentShift ? '未上班' : isOnBreak ? '休息中' : '工作中'}
            </div>
            {currentShift && (
              <div className="text-sm text-gray-600">
                上班时间: {new Date(currentShift.clockIn).toLocaleTimeString()}
              </div>
            )}
            {isOnBreak && currentBreak && (
              <div className="text-sm text-gray-600">
                休息时间: {getCurrentBreakDuration()}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <ClockIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold">工作时长</h2>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {currentShift ? getCurrentShiftDuration() : '0小时0分钟'}
          </div>
          <div className="text-sm text-gray-600 mt-1">本次班次</div>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-4">
            <ChartBarIcon className="h-6 w-6 text-green-600 mr-2" />
            <h2 className="text-lg font-semibold">今日统计</h2>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-bold text-green-600">
              {todayStats.workingTime}小时
            </div>
            <div className="text-sm text-gray-600">
              总时长: {todayStats.totalHours}小时 | 休息: {todayStats.breakTime}小时
            </div>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">考勤操作</h2>
        <div className="flex space-x-4">
          {!currentShift ? (
            <button
              onClick={clockIn}
              className="btn-primary flex items-center"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              上班打卡
            </button>
          ) : (
            <>
              <button
                onClick={clockOut}
                className="btn-primary flex items-center bg-red-600 hover:bg-red-700"
              >
                <StopIcon className="h-5 w-5 mr-2" />
                下班打卡
              </button>
              
              {!isOnBreak ? (
                <button
                  onClick={startBreak}
                  className="btn-secondary flex items-center"
                >
                  <PauseIcon className="h-5 w-5 mr-2" />
                  开始休息
                </button>
              ) : (
                <button
                  onClick={endBreak}
                  className="btn-primary flex items-center bg-green-600 hover:bg-green-700"
                >
                  <PlayIcon className="h-5 w-5 mr-2" />
                  结束休息
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 今日班次记录 */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <CalendarDaysIcon className="h-6 w-6 text-purple-600 mr-2" />
          <h2 className="text-lg font-semibold">今日班次记录</h2>
        </div>
        
        {shiftHistory.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <ClockIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>今日暂无班次记录</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shiftHistory.map((shift, index) => {
              const breaks = storage.get('staffBreaks') || [];
              const shiftBreaks = breaks.filter(breakItem => breakItem.shiftId === shift.id);
              const totalBreakTime = shiftBreaks.reduce((total, breakItem) => {
                if (breakItem.endTime) {
                  const start = new Date(breakItem.startTime);
                  const end = new Date(breakItem.endTime);
                  return total + (end - start);
                } else if (breakItem.startTime) {
                  const start = new Date(breakItem.startTime);
                  const now = new Date();
                  return total + (now - start);
                }
                return total;
              }, 0);
              
              return (
                <div key={shift.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium">
                        班次 #{index + 1}
                        {shift === currentShift && (
                          <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            进行中
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        上班: {new Date(shift.clockIn).toLocaleTimeString()}
                        {shift.clockOut && (
                          <span> | 下班: {new Date(shift.clockOut).toLocaleTimeString()}</span>
                        )}
                      </div>
                      {shiftBreaks.length > 0 && (
                        <div className="text-sm text-gray-600 mt-1">
                          休息次数: {shiftBreaks.length} | 
                          休息时长: {Math.round(totalBreakTime / (1000 * 60))}分钟
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {shift.clockOut ? formatDuration(shift.clockIn, shift.clockOut) : getCurrentShiftDuration()}
                      </div>
                      <div className="text-sm text-gray-600">总时长</div>
                    </div>
                  </div>
                  
                  {shiftBreaks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <div className="text-sm font-medium text-gray-700 mb-2">休息记录:</div>
                      <div className="space-y-1">
                        {shiftBreaks.map((breakItem, breakIndex) => (
                          <div key={breakItem.id} className="text-sm text-gray-600 flex justify-between">
                            <span>
                              休息 #{breakIndex + 1}: {new Date(breakItem.startTime).toLocaleTimeString()}
                              {breakItem.endTime && ` - ${new Date(breakItem.endTime).toLocaleTimeString()}`}
                              {!breakItem.endTime && ' - 进行中'}
                            </span>
                            <span>
                              {breakItem.endTime 
                                ? formatDuration(breakItem.startTime, breakItem.endTime)
                                : getCurrentBreakDuration()
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShiftManagement;
