import { useState } from 'react';
import { Search } from 'lucide-react';

const TIBUNAIS = [
  'TST', 'TSE', 'STJ', 
  'TRF1', 'TRF2', 'TRF3', 'TRF4', 'TRF5', 'TRF6',
  'TJSP', 'TJRJ', 'TJMG', 'TJRS', 'TJPR', 'TJSC', 'TJBA', 'TJPE', 'TJCE',
  'TRT1', 'TRT2', 'TRT3', 'TRT4', 'TRT5', 'TRT15'
];

interface SearchPanelProps {
  onSearchNpu: (tribunal: string, npu: string) => void;
  onSearchJurisprudencia: (tribunal: string, termo: string) => void;
  isLoading: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearchNpu, onSearchJurisprudencia, isLoading }) => {
  const [searchMode, setSearchMode] = useState<'npu' | 'juris'>('npu');
  const [tribunal, setTribunal] = useState('TST');
  const [npu, setNpu] = useState('');
  const [termo, setTermo] = useState('');

  const formatNpu = (value: string) => {
    // 0000000-00.0000.0.00.0000
    const numbers = value.replace(/\D/g, '').slice(0, 20);
    let formatted = numbers;
    if (numbers.length > 7) formatted = `${numbers.slice(0,7)}-${numbers.slice(7)}`;
    if (numbers.length > 9) formatted = `${formatted.slice(0,10)}.${formatted.slice(10)}`;
    if (numbers.length > 13) formatted = `${formatted.slice(0,15)}.${formatted.slice(15)}`;
    if (numbers.length > 14) formatted = `${formatted.slice(0,17)}.${formatted.slice(17)}`;
    if (numbers.length > 16) formatted = `${formatted.slice(0,20)}.${formatted.slice(20)}`;
    return formatted;
  };

  const handleChangeNpu = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNpu(formatNpu(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMode === 'npu') {
      if (npu.replace(/\D/g, '').length !== 20) {
        alert('O NPU deve conter 20 dígitos numéricos.');
        return;
      }
      onSearchNpu(tribunal.toLowerCase(), npu);
    } else {
      if (!termo.trim()) {
        alert('O termo de pesquisa não pode estar vazio.');
        return;
      }
      onSearchJurisprudencia(tribunal.toLowerCase(), termo);
    }
  };

  return (
    <div className="glass-panel animate-fade" style={{ animationDelay: '0.1s' }}>
      
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem', paddingBottom: '1rem' }}>
        <button 
          onClick={() => setSearchMode('npu')}
          style={{ 
            background: searchMode === 'npu' ? 'var(--color-accent)' : 'transparent', 
            color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', 
            border: searchMode === 'npu' ? 'none' : '1px solid var(--color-border)',
            cursor: 'pointer'
          }}>
          Pesquisar por NPU
        </button>
        <button 
          onClick={() => setSearchMode('juris')}
          style={{ 
            background: searchMode === 'juris' ? 'var(--color-accent)' : 'transparent', 
            color: '#fff', padding: '0.5rem 1rem', borderRadius: '0.5rem', 
            border: searchMode === 'juris' ? 'none' : '1px solid var(--color-border)',
            cursor: 'pointer'
          }}>
          Pesquisar Jurisprudência
        </button>
      </div>

      <form onSubmit={handleSubmit} className="search-container">
        
        <div className="form-group">
          <label className="form-label" htmlFor="tribunal">Tribunal</label>
          <select 
            id="tribunal" 
            value={tribunal} 
            onChange={(e) => setTribunal(e.target.value)}
          >
            {TIBUNAIS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {searchMode === 'npu' ? (
          <div className="form-group">
            <label className="form-label" htmlFor="npu">Número do Processo (NPU)</label>
            <input 
              id="npu"
              type="text" 
              value={npu} 
              onChange={handleChangeNpu}
              placeholder="0000000-00.0000.0.00.0000"
            />
          </div>
        ) : (
          <div className="form-group">
            <label className="form-label" htmlFor="termo">Termo / Palavra-chave</label>
            <input 
              id="termo"
              type="text" 
              value={termo} 
              onChange={(e) => setTermo(e.target.value)}
              placeholder="Ex: assédio moral"
            />
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={isLoading || (searchMode === 'npu' ? !npu : !termo)}>
          <Search size={20} />
          {isLoading ? 'Buscando...' : 'Pesquisar'}
        </button>

      </form>
    </div>
  );
};

