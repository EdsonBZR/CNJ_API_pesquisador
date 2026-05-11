import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SearchPanel } from './components/SearchPanel';
import { ResultCard } from './components/ResultCard';
import { fetchProcesso, fetchJurisprudencia } from './api/cnjClient';
import type { CnjSearchResult } from './api/cnjClient';
import { Key } from 'lucide-react';

function App() {
  const [apiKey, setApiKey] = useState<string>('');
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [tempKey, setTempKey] = useState<string>('');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CnjSearchResult | null>(null);

  useEffect(() => {
    // Load API Key from local storage on init
    const savedKey = localStorage.getItem('@CnjGUI:apiKey');
    if (savedKey) {
      setApiKey(savedKey);
    } else {
      setShowSettings(true); // Force user to set key initially
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!tempKey.trim()) {
      alert('A Chave API não pode estar vazia.');
      return;
    }
    setApiKey(tempKey.trim());
    localStorage.setItem('@CnjGUI:apiKey', tempKey.trim());
    setShowSettings(false);
  };

  const handleSearchNpu = async (tribunal: string, npu: string) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchProcesso(tribunal, npu, apiKey);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado ao conectar à API do CNJ.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchJurisprudencia = async (tribunal: string, termo: string) => {
    if (!apiKey) {
      setShowSettings(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await fetchJurisprudencia(tribunal, termo, apiKey);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado ao conectar à API do CNJ.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Header onOpenSettings={() => {
        setTempKey(apiKey);
        setShowSettings(true);
      }} />

      <SearchPanel 
        onSearchNpu={handleSearchNpu} 
        onSearchJurisprudencia={handleSearchJurisprudencia}
        isLoading={isLoading} 
      />

      {isLoading && (
        <div className="loading-state glass-panel animate-fade" style={{ animationDelay: '0.2s', padding: '2rem' }}>
          <div className="loader">Buscando na API do CNJ...</div>
        </div>
      )}

      {error && (
        <div className="error-message animate-fade" style={{ animationDelay: '0.2s' }}>
          <strong>Erro:</strong> {error}
        </div>
      )}

      {!isLoading && !error && result && (
        <ResultCard result={result} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal-overlay animate-fade">
          <div className="glass-panel modal-content">
            <div className="modal-header">
              <h2 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} color="var(--color-accent)"/>
                Configurar API Key
              </h2>
            </div>
            
            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" htmlFor="apiKey">Sua Chave Pública do CNJ</label>
              <input 
                id="apiKey"
                type="password" 
                value={tempKey} 
                onChange={(e) => setTempKey(e.target.value)}
                placeholder="Ex: cDZia...="
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                Essa chave fica salva apenas no seu navegador, no Local Storage.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {apiKey && (
                <button 
                  type="button" 
                  onClick={() => setShowSettings(false)}
                  style={{ background: 'transparent', color: '#fff', border: '1px solid var(--color-border)' }}
                >
                  Cancelar
                </button>
              )}
              <button onClick={handleSaveApiKey} className="btn-primary">
                Salvar Chave
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default App;

