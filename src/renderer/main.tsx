import React from 'react';
import ReactDOM from 'react-dom/client';
import {WorkbenchLayout} from '@/renderer/components/layout/WorkbenchLayout';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <WorkbenchLayout/>
    </React.StrictMode>,
);
