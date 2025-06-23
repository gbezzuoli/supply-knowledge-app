// Arquivo: src/pages/DashboardLayout/DashboardLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar/Sidebar';
import Header from '../../components/Header/Header';
import styles from './DashboardLayout.module.css';
import Box from '@mui/material/Box';

const DashboardLayout = () => {
  return (
    <Box className={styles.root}>
      <Header />
      <Box className={styles.container}>
        <Sidebar />
        <main className={styles.content}>
          <Outlet />
        </main>
      </Box>
    </Box>
  );
};

export default DashboardLayout;