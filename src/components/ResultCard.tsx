import { FileJson, FileSpreadsheet } from 'lucide-react';
import type { CnjSearchResult } from '../api/cnjClient';

interface ResultCardProps {
  result: CnjSearchResult | null;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const formataData = (isoDate: string) => {
  if (!isoDate) return 'N/A';
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(isoDate));
  } catch {
    return isoDate;
  }
};

const formatNpuDisplay = (numbers: string) => {
  if (!numbers || numbers.length !== 20) return numbers;
  return `${numbers.slice(0,7)}-${numbers.slice(7,9)}.${numbers.slice(9,13)}.${numbers.slice(13,14)}.${numbers.slice(14,16)}.${numbers.slice(16)}`;
};

const today = () => new Date().toISOString().slice(0, 10);

const triggerDownload = (content: string, filename: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

// ── Export Functions ──────────────────────────────────────────────────────────

const exportToJSON = (result: CnjSearchResult) => {
  const payload = {
    exportadoEm: new Date().toISOString(),
    totalEncontrado: result.hits.total.value,
    processos: result.hits.hits.map(h => h._source)
  };
  triggerDownload(
    JSON.stringify(payload, null, 2),
    `datajud_export_${today()}.json`,
    'application/json'
  );
};

const exportToCSV = (result: CnjSearchResult) => {
  const header = ['numeroProcesso', 'classe', 'assunto', 'dataAjuizamento', 'orgaoJulgador'];

  const rows = result.hits.hits.map(h => {
    const s = h._source;
    return [
      s.numeroProcesso ?? '',
      s.classe?.nome ?? '',
      s.assunto?.map(a => a.nome).join(' | ') ?? '',
      s.dataAjuizamento ? formataData(s.dataAjuizamento) : '',
      s.orgaoJulgador?.nome ?? ''
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
  });

  const csv = [header.join(','), ...rows].join('\r\n');
  triggerDownload(
    csv,
    `datajud_export_${today()}.csv`,
    'text/csv;charset=utf-8;'
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  if (!result) return null;

  const hits = result.hits.hits;

  if (hits.length === 0) {
    return (
      <div className="glass-panel animate-fade" style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>Nenhum processo encontrado</h3>
        <p style={{ color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
          Verifique se os dados informados estão corretos.
        </p>
      </div>
    );
  }

  return (
    <div className="results-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>

      {/* ── Export Bar ─────────────────────────────────────────────────────── */}
      <div className="export-bar animate-fade">
        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginRight: 'auto' }}>
          Foram encontrados {result.hits.total.value} resultados (exibindo até {hits.length})
        </span>
        <button
          id="btn-export-json"
          className="btn-secondary"
          onClick={() => exportToJSON(result)}
          title="Baixar dados completos em JSON"
        >
          <FileJson size={16} />
          Exportar JSON
        </button>
        <button
          id="btn-export-csv"
          className="btn-secondary"
          onClick={() => exportToCSV(result)}
          title="Baixar tabela em CSV (Excel)"
        >
          <FileSpreadsheet size={16} />
          Exportar CSV
        </button>
      </div>

      {/* ── Result Cards ───────────────────────────────────────────────────── */}
      {hits.map((hit, index) => {
        const processo = hit._source;
        return (
          <div key={index} className="glass-panel result-container animate-fade" style={{ animationDelay: `${0.1 * index}s` }}>

            <div className="result-header">
              <div>
                <h2 className="result-title">
                  Processo {formatNpuDisplay(processo.numeroProcesso)}
                </h2>
                {processo.orgaoJulgador?.nome && (
                  <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                    {processo.orgaoJulgador.nome}
                  </p>
                )}
              </div>
              {processo.classe?.nome && (
                <span className="chip">{processo.classe.nome}</span>
              )}
            </div>

            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Ajuizamento</span>
                <span className="info-value">{formataData(processo.dataAjuizamento)}</span>
              </div>

              <div className="info-item" style={{ gridColumn: 'span 2' }}>
                <span className="info-label">Assunto(s) Principal(is)</span>
                <span className="info-value">
                  {processo.assunto && processo.assunto.length > 0
                    ? processo.assunto.map(a => a.nome).join(', ')
                    : 'Neste momento não disponível na capa'}
                </span>
              </div>
            </div>

            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                Histórico de Movimentações
              </h3>
              {(!processo.movimentos || processo.movimentos.length === 0) ? (
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                  Sem movimentações públicas disponíveis.
                </p>
              ) : (
                <div className="movements-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {[...processo.movimentos]
                    .sort((a, b) => new Date(b.dataHora).getTime() - new Date(a.dataHora).getTime())
                    .slice(0, 5)
                    .map((mov, idx) => (
                      <div key={idx} className="movement-item">
                        <div className="movement-date">{formataData(mov.dataHora)}</div>
                        <div className="movement-desc">{mov.nome}</div>
                      </div>
                    ))}
                  {processo.movimentos.length > 5 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', textAlign: 'center', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      + {processo.movimentos.length - 5} movimentações listadas nos autos
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
};
