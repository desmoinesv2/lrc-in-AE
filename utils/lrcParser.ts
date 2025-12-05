import { LrcLine } from '../types';

export const parseLrc = (lrcContent: string): LrcLine[] => {
  const lines = lrcContent.split('\n');
  const result: LrcLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;

  lines.forEach((line, index) => {
    const match = line.match(timeRegex);
    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const milliseconds = parseInt(match[3].padEnd(3, '0'), 10);
      
      const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
      const text = line.replace(timeRegex, '').trim();

      if (text) {
        result.push({
          id: `line-${index}`,
          timestamp: timeInSeconds,
          text,
          timeStr: match[0],
        });
      }
    }
  });

  return result.sort((a, b) => a.timestamp - b.timestamp);
};