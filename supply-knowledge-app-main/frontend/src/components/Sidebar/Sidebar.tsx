// Arquivo: src/components/Sidebar/Sidebar.tsx (VERSÃO CORRIGIDA)

import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService';
import styles from './Sidebar.module.css';

// Importações do MUI
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import BugReportIcon from '@mui/icons-material/BugReport'; // <-- 1. IMPORTE UM ÍCONE PARA DEBUG
import Divider from '@mui/material/Divider';

// Ícones
import ChatIcon from '@mui/icons-material/Chat';
import UpdateIcon from '@mui/icons-material/Update';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import StorageIcon from '@mui/icons-material/Storage';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { text: 'CHATBOT', icon: <ChatIcon />, path: '/chatbot' },
    { text: 'Atualizar Base', icon: <UpdateIcon />, path: '/update-base' },
    { text: 'Relatórios', icon: <AssessmentIcon />, path: '/reports' },
    { text: 'Visualizar Base', icon: <StorageIcon />, path: '/view-base' },
    { text: 'Diagnóstico', icon: <BugReportIcon />, path: '/debug-search' },
  ];

  return (
    <Box className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <img src="/logopadrao.svg" alt="Logo" className={styles.logo} />
      </div>
      
      <List>
        {menuItems.map((item) => (
          // O ListItem em si não precisa do onClick, o botão dentro dele sim.
          <ListItem key={item.text} disablePadding>
            {/* --- A CORREÇÃO ESTÁ AQUI --- */}
            {/* Adicionamos o evento onClick que chama a função navigate com o caminho do item */}
            <ListItemButton className={styles.menuItem} onClick={() => navigate(item.path)}>
              <ListItemIcon sx={{ color: '#8e9297' }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
            {/* --- FIM DA CORREÇÃO --- */}
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ flexGrow: 1 }} /> {/* Empurra o logout para baixo */}

      <List>
        <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}/>
        <ListItem disablePadding onClick={handleLogout}>
          <ListItemButton className={styles.menuItem}>
            <ListItemIcon sx={{ color: '#8e9297' }}><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );
};

export default Sidebar;