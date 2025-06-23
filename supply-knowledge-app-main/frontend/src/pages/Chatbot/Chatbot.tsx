// Arquivo: src/pages/Chatbot/Chatbot.tsx
import { useState, useRef, useEffect } from 'react';
import { askBot } from '../../services/chatService';
import styles from './Chatbot.module.css';

// Importações do MUI
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Avatar from '@mui/material/Avatar';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close'; // Ícone para remover a imagem
import { Paper } from '@mui/material';

type Message = {
  role: 'user' | 'model';
  text: string;
  imagePreview?: string;
  timestamp: string;
  username: string;
};

const ChatbotComponent = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() && !imageFile) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      imagePreview: imagePreview || undefined,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      username: 'Você' // Ou pegar o nome do usuário do authService
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      const response = await askBot({
        query: input,
        history: messages.map(({ imagePreview, ...rest }) => rest),
        image: imageFile,
      });

      const botMessage: Message = {
        role: 'model',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        username: 'CHAT-BOT'
      };
      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      const errorMessage: Message = { role: 'model', text: 'Desculpe, ocorreu um erro.', timestamp: new Date().toLocaleTimeString(), username: 'CHAT-BOT' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setInput('');
      removeImage(); // Limpa a imagem após o envio
      setIsLoading(false);
    }
  };

  return (
    <Box className={styles.chatPage}>
      <Box className={styles.messagesArea}>
        {messages.map((msg, index) => (
          <div key={index} className={styles.messageGroup}>
            <Avatar className={styles.avatar} sx={{ bgcolor: msg.role === 'user' ? '#7289da' : '#43b581' }}>
              {msg.username.charAt(0)}
            </Avatar>
            <div className={styles.messageContent}>
              <div className={styles.messageHeader}>
                <Typography variant="body1" className={styles.username}>{msg.username}</Typography>
                <Typography variant="caption" className={styles.timestamp}>{msg.timestamp}</Typography>
              </div>
              {msg.text && <Typography variant="body2" className={styles.messageText}>{msg.text}</Typography>}
              {msg.imagePreview && <img src={msg.imagePreview} alt="anexo" className={styles.imageAttachment} />}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={styles.messageGroup}>
            <Avatar className={styles.avatar} sx={{ bgcolor: '#43b581' }}>B</Avatar>
            <div className={styles.messageContent}>
              <div className={styles.messageHeader}>
                <Typography variant="body1" className={styles.username}>CHAT-BOT</Typography>
              </div>
              <CircularProgress size={20} color="inherit" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Box className={styles.inputWrapper}>
        {/* Preview da imagem anexada */}
        {imagePreview && (
          <div className={styles.attachmentPreview}>
            <img src={imagePreview} alt="Preview" />
            <IconButton onClick={removeImage} className={styles.removeButton}>
              <CloseIcon />
            </IconButton>
          </div>
        )}
        <Box component="form" className={styles.inputArea} onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
          <IconButton className={styles.addButton} onClick={() => fileInputRef.current?.click()}>
            <AddCircleOutlineIcon />
          </IconButton>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} accept="image/*" />
          <TextField
            fullWidth variant="standard" placeholder={`Conversar em #chatbot`}
            value={input} onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            InputProps={{ disableUnderline: true }}
          />
          <IconButton onClick={handleSendMessage} disabled={isLoading || (!input.trim() && !imageFile)}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatbotComponent;