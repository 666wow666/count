import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Star, Trash2, Upload, FileText, Calendar } from 'lucide-react';
import { FortuneRecord } from '@/types';
import { getRecordsIndex, deleteRecord, importRecordFromFile, getRecord, RecordIndex } from '@/utils/storage';
import { useAppStore } from '@/store/useAppStore';

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
}

function RecordCard({ 
  record, 
  onView, 
  onDelete 
}: { 
  record: RecordIndex; 
  onView: (record: RecordIndex) => void;
  onDelete: (id: string) => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('确定要删除这条占卜记录吗？')) {
      setIsDeleting(true);
      setTimeout(() => {
        onDelete(record.id);
      }, 300);
    }
  };

  return (
    <div 
      onClick={() => onView(record)}
      className={`bg-purple-950/30 backdrop-blur-sm rounded-2xl border border-purple-500/20 p-5 cursor-pointer hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all animate-fadeIn ${
        isDeleting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Star className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-white font-semibold truncate text-lg">
                {record.userInput.name}
              </h3>
              <span className="px-3 py-1 rounded-xl bg-purple-600/30 text-purple-200 text-xs font-medium border border-purple-500/20">
                {record.userInput.mbti}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-purple-400/70 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(record.timestamp)}</span>
            </div>
            <p className="text-sm text-purple-300/70 line-clamp-2 leading-relaxed">
              {record.preview}
            </p>
          </div>
        </div>

        <button
          onClick={handleDelete}
          className="p-2.5 text-purple-400/60 hover:text-red-400 hover:bg-red-950/30 rounded-xl transition-all flex-shrink-0"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const navigate = useNavigate();
  const { setUserInput, setStarChart } = useAppStore();
  const [records, setRecords] = useState<RecordIndex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [importingRecord, setImportingRecord] = useState<FortuneRecord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadRecords = async () => {
      const data = await getRecordsIndex();
      setRecords(data);
      setIsLoading(false);
    };
    loadRecords();
  }, []);

  const handleView = async (record: RecordIndex) => {
    const fullRecord = await getRecord(record.id);
    
    if (fullRecord) {
      // 设置 store 中的数据
      setUserInput(fullRecord.userInput);
      setStarChart(fullRecord.starChart);
      // 保存 analysis 到 sessionStorage
      sessionStorage.setItem('saved_analysis', fullRecord.analysisContent);
      sessionStorage.setItem('is_from_history', 'true');
      navigate('/history-detail');
    }
  };

  const handleDelete = async (id: string) => {
    await deleteRecord(id);
    const updatedRecords = await getRecordsIndex();
    setRecords(updatedRecords);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const record = await importRecordFromFile(file);
    if (record) {
      setImportingRecord(record);
    } else {
      alert('导入失败，请确保文件格式正确');
    }
    
    e.target.value = '';
  };

  useEffect(() => {
    if (importingRecord) {
      setUserInput(importingRecord.userInput);
      setStarChart(importingRecord.starChart);
      sessionStorage.setItem('saved_analysis', importingRecord.analysisContent);
      sessionStorage.setItem('is_from_history', 'false');
      navigate('/analysis');
    }
  }, [importingRecord, setUserInput, setStarChart, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1f] via-[#1a0f3a] to-[#0f0a1f] text-white px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
              历史占卜记录
            </h1>
            <p className="text-purple-400/70 text-xs">共 {records.length} 条记录</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="hidden"
        />

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-3 border-purple-500 border-t-transparent" />
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-amber-600 rounded-full blur-2xl opacity-20 animate-pulse" />
              <div className="w-24 h-24 mx-auto rounded-full bg-purple-950/50 flex items-center justify-center border border-purple-500/20">
                <Star className="w-12 h-12 text-purple-400/50" />
              </div>
            </div>
            <h3 className="text-white font-semibold mb-3 text-xl">暂无占卜记录</h3>
            <p className="text-purple-400/60 text-sm mb-8 max-w-xs mx-auto">
              开始您的第一次占卜后，记录将保存在这里
            </p>
            
            <div className="space-y-4 max-w-sm mx-auto">
              <button
                onClick={() => navigate('/')}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-600 text-white font-semibold hover:shadow-xl hover:shadow-purple-500/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <FileText className="w-5 h-5" />
                <span>开始占卜</span>
              </button>
              
              <button
                onClick={handleImportClick}
                className="w-full py-4 px-6 rounded-2xl border-2 border-purple-500/40 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>导入历史记录</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {records.map((record, index) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onView={handleView}
                  onDelete={handleDelete}
                />
              ))}
            </div>
            
            <button
              onClick={handleImportClick}
              className="w-full mt-8 py-4 px-6 rounded-2xl border-2 border-purple-500/40 text-purple-300 hover:bg-purple-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              <span>导入更多记录</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
