import { useState } from 'react';
import Tabs from 'react-tabs/lib/components/Tabs';
import TabList from 'react-tabs/lib/components/TabList';
import Tab from 'react-tabs/lib/components/Tab';
import TabPanel from 'react-tabs/lib/components/TabPanel';
import 'react-tabs/style/react-tabs.css';

// Componentes de Tabs
import TabMensajes from '../components/TabMensajes';
import TabTurnos from '../components/TabTurnos';
import TabConfiguracion from '../components/TabConfiguracion';
import OwnerSchedule from '../components/OwnerSchedule';

// Página Dashboard - Panel de gestión principal
function Dashboard() {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-blue-900">Dashboard - Clínica Dental</h1>
              <p className="text-gray-600 mt-1">Gestión de turnos y mensajes vía WhatsApp</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                • Sistema Activo
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          selectedIndex={activeTab}
          onSelect={index => setActiveTab(index)}
          className="w-full"
        >
          {/* Tab List - Pestañas de navegación */}
          <TabList className="flex space-x-2 mb-8 border-b border-gray-200">
            <Tab
              className="px-6 py-3 font-medium cursor-pointer border-b-2 border-transparent hover:border-blue-300 focus:outline-none transition-colors"
              selectedClassName="text-blue-600 border-blue-600"
            >
              💬 Mensajes
            </Tab>
            <Tab
              className="px-6 py-3 font-medium cursor-pointer border-b-2 border-transparent hover:border-blue-300 focus:outline-none transition-colors"
              selectedClassName="text-blue-600 border-blue-600"
            >
              📅 Turnos
            </Tab>
            <Tab
              className="px-6 py-3 font-medium cursor-pointer border-b-2 border-transparent hover:border-blue-300 focus:outline-none transition-colors"
              selectedClassName="text-blue-600 border-blue-600"
            >
              👤 Owner Schedule
            </Tab>
            <Tab
              className="px-6 py-3 font-medium cursor-pointer border-b-2 border-transparent hover:border-blue-300 focus:outline-none transition-colors"
              selectedClassName="text-blue-600 border-blue-600"
            >
              ⚙️ Configuración
            </Tab>
          </TabList>

          {/* Tab Panels - Contenido de cada pestaña */}
          <TabPanel>
            <TabMensajes />
          </TabPanel>

          <TabPanel>
            <TabTurnos />
          </TabPanel>

          <TabPanel>
            <OwnerSchedule />
          </TabPanel>

          <TabPanel>
            <TabConfiguracion />
          </TabPanel>
        </Tabs>
      </main>
    </div>
  );
}

export default Dashboard;