interface Alarm {
  id: string;
  time: string;
  days: boolean[];
  sound: string;
  snoozeTime: string;
  repeatOption: string;
  label: string;
  isActive: boolean;
  createdAt?: number;
}

self.onmessage = (e: MessageEvent) => {
  const alarmsData: Alarm[] = e.data;
  
  if (!alarmsData || alarmsData.length === 0) {
    self.postMessage({ nextAlarmMinutes: null, selectedAlarm: null });
    return;
  }

  const now = new Date();
  const today = now.getDay();
  
  let closestAlarm = null;
  let minDiff = Infinity;

  alarmsData.forEach(alarm => {
    if (!alarm.isActive || !alarm.days.some(day => day)) return;
    
    const [hours, minutes] = alarm.time.split(':').map(Number);
    
    for (let i = 0; i < 7; i++) {
      if (!alarm.days[i]) continue;
      
      let dayDiff = i - today;
      if (dayDiff < 0) dayDiff += 7;
      
      if (dayDiff === 0) {
        const alarmTime = new Date();
        alarmTime.setHours(hours, minutes, 0, 0);
        
        if (alarmTime <= now) {
          dayDiff = 7;
        }
      }
      
      const totalMinutes = dayDiff * 24 * 60 + hours * 60 + minutes - (now.getHours() * 60 + now.getMinutes());
      
      if (totalMinutes < minDiff) {
        minDiff = totalMinutes;
        closestAlarm = alarm;
      }
    }
  });

  self.postMessage({ 
    nextAlarmMinutes: closestAlarm ? minDiff : null, 
    selectedAlarm: closestAlarm || null
  });
}; 