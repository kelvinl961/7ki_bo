import type { ImportGameData, ImportValidationError } from '#/api/game/subgame';

// Simple CSV parser
export function parseCSV(text: string): string[][] {
  const lines = text.split('\n');
  const result: string[][] = [];
  
  for (const line of lines) {
    if (line.trim()) {
      // Simple CSV parsing - handle quoted fields
      const fields = [];
      let current = '';
      let inQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          fields.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      
      fields.push(current.trim());
      result.push(fields);
    }
  }
  
  return result;
}

// Parse Excel file using a simple approach
export async function parseExcel(file: File): Promise<string[][]> {
  // For now, we'll use a simple approach - you might want to add a library like xlsx
  // This is a placeholder that assumes the file is actually CSV
  const text = await file.text();
  return parseCSV(text);
}

// Parse file based on extension
export async function parseFile(file: File): Promise<string[][]> {
  console.log('parseFile called with:', file.name, file.type, file.size);
  
  const extension = file.name.split('.').pop()?.toLowerCase();
  console.log('File extension:', extension);
  
  if (extension === 'csv') {
    const text = await file.text();
    console.log('CSV text content (first 200 chars):', text.substring(0, 200));
    const result = parseCSV(text);
    console.log('CSV parse result:', result);
    return result;
  } else if (extension === 'xlsx' || extension === 'xls') {
    // For Excel files, you might want to use a library like SheetJS
    // For now, treat as CSV and see if it works
    console.log('Excel file detected, trying to read as text...');
    try {
      const text = await file.text();
      console.log('Excel text content (first 200 chars):', text.substring(0, 200));
      const result = parseCSV(text);
      console.log('Excel parse result:', result);
      return result;
    } catch (error) {
      console.error('Failed to parse Excel file as text:', error);
      throw new Error('Excel文件解析失败，请转换为CSV格式或使用CSV文件');
    }
  } else {
    throw new Error(`不支持的文件格式: ${extension}。请使用CSV文件`);
  }
}

// Validate and convert parsed data to ImportGameData
export function validateGameData(data: string[][]): {
  games: ImportGameData[];
  errors: ImportValidationError[];
} {
  const games: ImportGameData[] = [];
  const errors: ImportValidationError[] = [];
  
  if (data.length === 0) {
    errors.push({
      row: 1,
      field: '文件',
      message: '文件为空',
      value: null,
    });
    return { games, errors };
  }
  
  // Expected columns based on the screenshot
  const expectedColumns = ['NO.', 'Game Name (中文)', 'Game Name (英文)', '游戏类型', 'GameID', 'Icon'];
  const headers = data[0];
  
  if (!headers) {
    errors.push({
      row: 1,
      field: '表头',
      message: '文件缺少表头行',
      value: null,
    });
    return { games, errors };
  }
  
  // Validate headers
  const requiredFields = ['Game Name (中文)', 'Game Name (英文)', '游戏类型', 'GameID'];
  for (const field of requiredFields) {
    if (!headers.includes(field)) {
      errors.push({
        row: 1,
        field: '表头',
        message: `缺少必需的列: ${field}`,
        value: headers.join(', '),
      });
    }
  }
  
  if (errors.length > 0) {
    return { games, errors };
  }
  
  // Find column indices
  const columnIndices = {
    no: headers.indexOf('NO.'),
    gameNameCn: headers.indexOf('Game Name (中文)'),
    gameNameEn: headers.indexOf('Game Name (英文)'),
    gameType: headers.indexOf('游戏类型'),
    gameId: headers.indexOf('GameID'),
    iconUrl: headers.indexOf('Icon'),
  };
  
  // Process data rows
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const rowNumber = i + 1;
    
    if (!row || row.length === 0 || row.every(cell => !cell?.trim())) {
      continue; // Skip empty rows
    }
    
    const gameData: ImportGameData = {
      no: columnIndices.no >= 0 ? parseInt(row[columnIndices.no] || '0') || i : i,
      gameNameCn: row[columnIndices.gameNameCn]?.trim() || '',
      gameNameEn: row[columnIndices.gameNameEn]?.trim() || '',
      gameType: row[columnIndices.gameType]?.trim() || '',
      gameId: row[columnIndices.gameId]?.trim() || '',
      iconUrl: columnIndices.iconUrl >= 0 ? row[columnIndices.iconUrl]?.trim() || '' : '',
    };
    
    // Validate required fields
    if (!gameData.gameNameCn) {
      errors.push({
        row: rowNumber,
        field: '游戏名称(中文)',
        message: '游戏名称(中文)不能为空',
        value: gameData.gameNameCn,
      });
    }
    
    if (!gameData.gameNameEn) {
      errors.push({
        row: rowNumber,
        field: '游戏名称(英文)',
        message: '游戏名称(英文)不能为空',
        value: gameData.gameNameEn,
      });
    }
    
    if (!gameData.gameType) {
      errors.push({
        row: rowNumber,
        field: '游戏类型',
        message: '游戏类型不能为空',
        value: gameData.gameType,
      });
    }
    
    if (!gameData.gameId) {
      errors.push({
        row: rowNumber,
        field: '游戏ID',
        message: '游戏ID不能为空',
        value: gameData.gameId,
      });
    }
    
    // Validate GameID format (simple validation)
    if (gameData.gameId && !/^[a-zA-Z0-9_-]+$/.test(gameData.gameId)) {
      errors.push({
        row: rowNumber,
        field: '游戏ID',
        message: '游戏ID只能包含字母、数字、下划线和横线',
        value: gameData.gameId,
      });
    }
    
    games.push(gameData);
  }
  
  return { games, errors };
}

// Generate import template data
export function generateTemplateData(): string[][] {
  return [
    ['NO.', 'Game Name (中文)', 'Game Name (英文)', '游戏类型', 'GameID', 'Icon'],
    ['1', '红飞机', 'Aviator', '电子游戏', 'spribe_01', 'https://example.com/icon1.png'],
    ['2', '黑杰克', 'Blackjack', '电子游戏', 'evolution_bj', 'https://example.com/icon2.png'],
    ['3', '轮盘', 'Roulette', '电子游戏', 'evolution_roulette', 'https://example.com/icon3.png'],
  ];
}

// Convert template data to CSV
export function templateToCSV(data: string[][]): string {
  return data.map(row => 
    row.map(cell => 
      cell.includes(',') || cell.includes('"') || cell.includes('\n') 
        ? `"${cell.replace(/"/g, '""')}"` 
        : cell
    ).join(',')
  ).join('\n');
}

// Download template file
export function downloadTemplate(): void {
  const data = generateTemplateData();
  const csv = templateToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = '游戏导入模板.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
} 