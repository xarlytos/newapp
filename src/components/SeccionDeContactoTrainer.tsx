import React from 'react';
import Card from './Common/Card';
import Button from './Common/Button';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const SeccionDeContactoTrainer: React.FC = () => {
  const navigate = useNavigate(); // Obtén la función navigate

  const handleMessageClick = () => {
    navigate('/chat'); // Navega a la ruta /chat
  };

  return (
    <Card className="mx-4 -mt-4 relative z-10">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
        <div className="flex-1">
          <h2 className="font-semibold text-lg">Entrenador Alex</h2>
          <p className="text-gray-600 text-sm">Entrenador Personal y Nutricionista</p>
          <p className="text-gray-500 text-sm">Más de 8 años de experiencia</p>
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button variant="primary" className="flex-1" onClick={handleMessageClick}> {/* Añade el onClick handler */}
          Mensaje
        </Button>
        <Button variant="secondary" className="flex-1">
          Agendar Llamada
        </Button>
      </div>
    </Card>
  );
};

export default SeccionDeContactoTrainer;