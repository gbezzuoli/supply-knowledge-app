import React from 'react';
import styles from './AtualizarBase.module.css';

const AtualizarBase: React.FC = () => {
  return (
    <div className={styles.container}>
      <h1>Atualizar Base de Conhecimento</h1>
      <p>Esta página permitirá a atualização da base de conhecimento do sistema.</p>
      {/* Adicione aqui os componentes para upload de arquivos, edição de dados, etc. */}
    </div>
  );
};

export default AtualizarBase;

