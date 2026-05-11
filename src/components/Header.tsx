import { Scale, Settings } from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSettings }) => {
  return (
    <header className="app-header animate-fade">
      <div className="logo-container">
        <Scale className="logo-icon" size={32} />
        <h1 className="logo-text text-gradient">CNJ_API_Pesquisador</h1>
      </div>
      <button onClick={onOpenSettings} className="btn-icon" aria-label="Configurações (API Key)">
        <Settings size={24} />
      </button>
    </header>
  );
};
