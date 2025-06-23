import React from 'react';
import styles from './PainelAdministracao.module.css';

const PainelAdministracao: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Painel de Administração</h1>
      <p>Esta página permitirá gerenciar usuários, configurações e outros aspectos administrativos do sistema.</p>
      {/* Adicione aqui os componentes para gerenciamento de usuários, configurações, etc. */}
    </div>
  );
};

export default PainelAdministracao;

