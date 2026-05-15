import { FortuneRecord, UserInput, StarChart } from '@/types';

export interface RecordIndex {
  id: string;
  timestamp: number;
  userInput: UserInput;
  preview: string;
  hasAnalysis: boolean;
}

interface StorageService {
  saveRecord(record: FortuneRecord): Promise<void>;
  getRecordsIndex(): Promise<RecordIndex[]>;
  getRecord(id: string): Promise<FortuneRecord | null>;
  deleteRecord(id: string): Promise<void>;
  getRecordCount(): Promise<number>;
}

const RECORDS_DIR = 'fortune_records';
const INDEX_KEY = 'fortune_records_index';

class HybridStorageService implements StorageService {
  private useCapacitorFS = false;
  private initialized = false;
  private fs: any = null;
  private dir: any = null;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      this.fs = Filesystem;
      this.dir = Directory;
      this.useCapacitorFS = true;

      await this.fs.mkdir({
        path: RECORDS_DIR,
        directory: this.dir.Documents,
        recursive: true,
      }).catch(() => {});

      console.log('[Storage] Capacitor Filesystem 初始化成功');
      this.initialized = true;
    } catch (error) {
      console.log('[Storage] Capacitor Filesystem 不可用，使用 LocalStorage');
      this.useCapacitorFS = false;
      this.initialized = true;
    }
  }

  private async stringToBase64(str: string): Promise<string> {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      let binary = '';
      for (let i = 0; i < data.byteLength; i++) {
        binary += String.fromCharCode(data[i]);
      }
      return btoa(binary);
    } catch {
      return btoa(unescape(encodeURIComponent(str)));
    }
  }

  private async base64ToString(base64: string): Promise<string> {
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const decoder = new TextDecoder();
      return decoder.decode(bytes);
    } catch {
      return decodeURIComponent(escape(atob(base64)));
    }
  }

  async saveRecord(record: FortuneRecord): Promise<void> {
    await this.init();
    const data = JSON.stringify(record, null, 2);

    try {
      if (this.useCapacitorFS && this.fs && this.dir) {
        const fileName = `${RECORDS_DIR}/${record.id}.json`;
        const base64Data = await this.stringToBase64(data);

        await this.fs.writeFile({
          path: fileName,
          data: base64Data,
          directory: this.dir.Documents,
          recursive: true,
        });

        console.log('[Storage] 记录已保存到设备文件系统:', fileName);
      } else {
        localStorage.setItem(`fortune_record_${record.id}`, data);
        console.log('[Storage] 记录已保存到 LocalStorage');
      }
    } catch (error) {
      console.warn('[Storage] 文件系统失败，回退到 LocalStorage:', error);
      this.useCapacitorFS = false;
      localStorage.setItem(`fortune_record_${record.id}`, data);
    }

    await this.updateIndex(record);
  }

  async getRecordsIndex(): Promise<RecordIndex[]> {
    const indexData = localStorage.getItem(INDEX_KEY);

    if (!indexData) {
      return [];
    }

    try {
      const parsed = JSON.parse(indexData);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      console.warn('[Storage] 索引不是数组，重置为空');
      return [];
    } catch (error) {
      console.error('[Storage] 解析索引失败:', error);
      localStorage.removeItem(INDEX_KEY);
      return [];
    }
  }

  async getRecord(id: string): Promise<FortuneRecord | null> {
    await this.init();

    try {
      if (this.useCapacitorFS && this.fs && this.dir) {
        try {
          const fileName = `${RECORDS_DIR}/${id}.json`;
          const result = await this.fs.readFile({
            path: fileName,
            directory: this.dir.Documents,
          });

          let dataStr = '';
          if (typeof result.data === 'string') {
            dataStr = await this.base64ToString(result.data);
          }

          return JSON.parse(dataStr);
        } catch {
          console.log('[Storage] 文件读取失败，尝试 LocalStorage');
        }
      }
    } catch {
      console.log('[Storage] Capacitor 读取失败，回退到 LocalStorage');
    }

    const data = localStorage.getItem(`fortune_record_${id}`);
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return null;
      }
    }

    return null;
  }

  async deleteRecord(id: string): Promise<void> {
    await this.init();

    if (this.useCapacitorFS && this.fs && this.dir) {
      try {
        const fileName = `${RECORDS_DIR}/${id}.json`;
        await this.fs.deleteFile({
          path: fileName,
          directory: this.dir.Documents,
        });
      } catch {
        console.log('[Storage] 删除文件失败，可能不存在');
      }
    }

    localStorage.removeItem(`fortune_record_${id}`);
    await this.removeFromIndex(id);
  }

  async getRecordCount(): Promise<number> {
    const index = await this.getRecordsIndex();
    return index.length;
  }

  private async updateIndex(record: FortuneRecord): Promise<void> {
    const index = await this.getRecordsIndex();
    const preview = record.analysisContent?.substring(0, 100) || '暂无解读';

    const recordIndex: RecordIndex = {
      id: record.id,
      timestamp: record.timestamp,
      userInput: record.userInput,
      preview: preview + '...',
      hasAnalysis: !!record.analysisContent,
    };

    const existingIndex = index.findIndex((r) => r.id === record.id);

    if (existingIndex >= 0) {
      index[existingIndex] = recordIndex;
    } else {
      index.unshift(recordIndex);
    }

    index.sort((a, b) => b.timestamp - a.timestamp);
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));

    console.log('[Storage] 索引已更新，当前记录数:', index.length);
  }

  private async removeFromIndex(id: string): Promise<void> {
    const index = await this.getRecordsIndex();
    const filteredIndex = index.filter((r) => r.id !== id);

    localStorage.setItem(INDEX_KEY, JSON.stringify(filteredIndex));
    console.log('[Storage] 索引已更新，记录已删除');
  }
}

export const storageService = new HybridStorageService();

export function generateRecordId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `fortune_${timestamp}_${random}`;
}

export async function saveRecordToFile(record: FortuneRecord): Promise<void> {
  await storageService.saveRecord(record);
}

export async function getRecordsIndex(): Promise<RecordIndex[]> {
  return await storageService.getRecordsIndex();
}

export async function getRecord(id: string): Promise<FortuneRecord | null> {
  return await storageService.getRecord(id);
}

export async function deleteRecord(id: string): Promise<void> {
  await storageService.deleteRecord(id);
}

export async function importRecordFromFile(file: File): Promise<FortuneRecord | null> {
  try {
    const text = await file.text();
    const record = JSON.parse(text) as FortuneRecord;

    if (!record.id || !record.userInput || !record.starChart) {
      throw new Error('Invalid record format');
    }

    record.id = generateRecordId();
    record.timestamp = Date.now();

    await storageService.saveRecord(record);
    return record;
  } catch (error) {
    console.error('[Import] 导入失败:', error);
    return null;
  }
}
