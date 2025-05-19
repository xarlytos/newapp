import React, { useState } from 'react'; // Importa useState
import Rutinas from '../components/rutinas';
import Clase from '../components/Clase';

const Exercises: React.FC = () => {
  // Estado para controlar la pestaña activa, por defecto 'rutinas'
  const [activeTab, setActiveTab] = useState<'rutinas' | 'clases'>('rutinas');

  return (
    <div className="mx-auto p-4 pb-20"> {/* Eliminado 'container' para mayor ancho */}
      {/* Header */}
      <div className="mb-6 bg-blue-500 p-4 rounded-lg text-white flex justify-between items-center"> {/* Estilos de encabezado azul con flexbox */}
        <h1 className="text-2xl font-bold">Entrenamiento</h1> {/* Título actualizado */}
        {/* Botón Formulario - Movido dentro del encabezado */}
        <button className="bg-blue-200 text-blue-800 text-sm font-semibold py-2 px-4 rounded-full">
          Formulario
        </button>
      </div>

      {/* Eliminado el div contenedor anterior del botón */}
      {/* <div className="flex justify-end mb-4 px-4">
        <button className="bg-blue-200 text-blue-800 text-sm font-semibold py-2 px-4 rounded-full">
          Formulario
        </button>
      </div> */}


      {/* Tab Navigation */}
      <div className="flex bg-gray-200 rounded-lg p-1 mx-4 mt-4 mb-4"> {/* Estilos del contenedor de pestañas */}
        <button
          className={`flex-1 text-center py-2 rounded-lg transition-colors ${
            activeTab === 'rutinas' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100' // Estilos de botón activo/inactivo
          }`}
          onClick={() => setActiveTab('rutinas')}
        >
          Rutinas
        </button>
        <button
          className={`flex-1 text-center py-2 rounded-lg transition-colors ${
            activeTab === 'clases' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100' // Estilos de botón activo/inactivo
          }`}
          onClick={() => setActiveTab('clases')}
        >
          Clases
        </button>
      </div>

      {/* Content based on active tab */}
      <div className="p-4 bg-gray-100 min-h-screen"> {/* Contenedor para el contenido con fondo gris claro */}
        {activeTab === 'rutinas' ? <Rutinas /> : <Clase />}
      </div>

      {/* Bottom Navigation (assuming handled by parent layout) */}
    </div>
  );
};

export default Exercises;