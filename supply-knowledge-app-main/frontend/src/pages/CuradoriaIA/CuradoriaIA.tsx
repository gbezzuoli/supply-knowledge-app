import React, { useEffect, useState } from 'react';
import styles from './CuradoriaIA.module.css';
import { getPendingKnowledge, approveKnowledge, rejectKnowledge } from '../../services/dataService';

interface KnowledgeItem {
  id: string;
  pergunta: string;
  resposta: string;
  tags: string;
  fonte: string;
  status: 'pending' | 'approved' | 'rejected';
}

const CuradoriaIA: React.FC = () => {
  const [pendingKnowledge, setPendingKnowledge] = useState<KnowledgeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingKnowledge();
  }, []);

  const fetchPendingKnowledge = async () => {
    try {
      setLoading(true);
      const data = await getPendingKnowledge();
      setPendingKnowledge(data);
    } catch (err) {
      setError('Erro ao carregar conhecimentos pendentes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveKnowledge(id);
      fetchPendingKnowledge(); // Recarrega a lista após aprovar
    } catch (err) {
      setError('Erro ao aprovar conhecimento.');
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await rejectKnowledge(id);
      fetchPendingKnowledge(); // Recarrega a lista após rejeitar
    } catch (err) {
      setError('Erro ao rejeitar conhecimento.');
      console.error(err);
    }
  };

  if (loading) return <div className={styles.container}>Carregando...</div>;
  if (error) return <div className={styles.container} style={{ color: 'red' }}>{error}</div>;

  return (
    <div className={styles.container}>
      <h1>Curadoria de Conhecimento da IA</h1>
      {pendingKnowledge.length === 0 ? (
        <p>Nenhum conhecimento pendente para curadoria no momento.</p>
      ) : (
        <div className={styles.knowledgeList}>
          {pendingKnowledge.map((item) => (
            <div key={item.id} className={styles.knowledgeCard}>
              <h3>Pergunta: {item.pergunta}</h3>
              <p><strong>Resposta:</strong> {item.resposta}</p>
              <p><strong>Tags:</strong> {item.tags}</p>
              <p><strong>Fonte:</strong> {item.fonte}</p>
              <div className={styles.actions}>
                <button onClick={() => handleApprove(item.id)} className={styles.approveButton}>Aprovar</button>
                <button onClick={() => handleReject(item.id)} className={styles.rejectButton}>Rejeitar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CuradoriaIA;

