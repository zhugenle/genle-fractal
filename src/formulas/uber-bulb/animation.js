function referencePhases(position,v){const f=((position%1)+1)%1,period=TAU/v.Power;return [v.Loop1Start-2*period*f,v.Loop2Start-4*period*f];}
