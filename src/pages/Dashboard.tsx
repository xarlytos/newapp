import React, { useState, useEffect } from 'react';
import { dataApi } from '../api/api';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { MessageCircle, Calendar, ChevronLeft, ChevronRight, Clock, Dumbbell, User } from 'lucide-react';
import SeccionDeContactoTrainer from '../components/SeccionDeContactoTrainer';

interface WorkoutData {
  id: string;
  name: string;
  date: string;
  exercises: number;
}

// Helper function to get the start of the week (Sunday) for a given date
const getStartOfWeek = (date: Date): Date => {
  const dayOfWeek = date.getDay();
  const start = new Date(date);
  start.setDate(date.getDate() - dayOfWeek);
  start.setHours(0, 0, 0, 0); // Reset time to start of day
  return start;
};

const Dashboard: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutData[]>([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);
  const [days, setDays] = useState<{ day: string; date: string }[]>([]);
  const [currentStartDate, setCurrentStartDate] = useState(new Date());
  const [animationClass, setAnimationClass] = useState('');

  // Obtener la fecha actual para mostrar en el encabezado
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
  const formattedDate = today.toLocaleDateString('es-ES', options);
  const capitalizedFormattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);


  // useEffect para generar los días cuando cambia currentStartDate
  useEffect(() => {
    const generateDays = (startDate: Date) => {
      const weekDays = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
      const generatedDays = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let todayIndex = -1;

      for (let i = 0; i < 4; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        currentDate.setHours(0, 0, 0, 0);

        generatedDays.push({
          day: weekDays[currentDate.getDay()],
          date: currentDate.getDate().toString(),
        });

        if (currentDate.getTime() === today.getTime()) {
          todayIndex = i;
        }
      }
      setDays(generatedDays);
      if (todayIndex !== -1) {
         setSelectedDayIndex(todayIndex);
      } else {
        setSelectedDayIndex(0);
      }
    };

    generateDays(currentStartDate);

  }, [currentStartDate]); // Este useEffect depende de currentStartDate

  // useEffect para cargar los datos del dashboard UNA VEZ al montar
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const response = await dataApi.getDashboardData();
        setWorkoutPlan(response.data.workoutPlan || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // Array de dependencias vacío: se ejecuta solo al montar

  // Funciones para navegar entre bloques de 4 días
  const goToPreviousDays = () => {
    setAnimationClass('animate-slide-right'); // Clase para animación de retroceso
    const previousStart = new Date(currentStartDate);
    previousStart.setDate(currentStartDate.getDate() - 4); // Retroceder 4 días
    setCurrentStartDate(previousStart);
  };

  const goToNextDays = () => {
    setAnimationClass('animate-slide-left'); // Clase para animación de avance
    const nextStart = new Date(currentStartDate);
    nextStart.setDate(currentStartDate.getDate() + 4); // Avanzar 4 días
    setCurrentStartDate(nextStart);
  };

  // Función para volver al día actual
  const goToToday = () => {
    setAnimationClass(''); // Sin animación al ir a hoy directamente
    setCurrentStartDate(new Date()); // Establecer la fecha de inicio al día de hoy
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600 font-medium">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 pb-20 bg-gray-50 min-h-screen"> {/* Eliminado max-w-xl y añadido p-4 para mayor ancho */}
      {/* Header con estilo azul */}
      <div className="mb-6 bg-blue-500 p-4 rounded-lg text-white flex justify-between items-center"> {/* Estilos de encabezado azul con flexbox */}
        <div> {/* Contenedor para el título y la fecha */}
          <h1 className="text-2xl font-bold text-white">ASTROFIT</h1> {/* Título actualizado */}
          <p className="text-blue-100 text-sm mt-1">{capitalizedFormattedDate}</p> {/* Fecha actual */}
        </div>
        <div className="flex gap-2">
          <button className="p-2 bg-white bg-opacity-30 rounded-full hover:bg-opacity-50 transition-all duration-300">
            <MessageCircle className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Trainer Profile - Usando el componente existente */}
      <SeccionDeContactoTrainer />

      {/* Calendar Section con diseño mejorado */}
      <div className="p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-500" />
            Tu Horario
          </h2>
          {/* Botón "Hoy" con mejor estilo */}
          <button 
            onClick={goToToday} 
            className="text-blue-500 bg-blue-50 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-100 transition-colors duration-300"
          >
            Hoy
          </button>
        </div>
        
        <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm p-3 mb-4"> 
          {/* Flecha izquierda con mejor estilo */}
          <button 
            onClick={goToPreviousDays} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>

          {/* Días de la semana con animación y mejor estilo */}
          <div
            className={`flex justify-between flex-1 mx-2 ${animationClass}`}
            onAnimationEnd={() => setAnimationClass('')}
          >
            {days.map((day, index) => (
              <div
                key={index}
                className={`flex flex-col items-center cursor-pointer rounded-xl px-4 py-2 transition-all duration-300 ${
                  index === selectedDayIndex
                    ? 'bg-gradient-to-b from-blue-100 to-blue-50 text-blue-600 shadow-sm transform scale-110'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDayIndex(index)}
              >
                <span className={`text-sm ${index === selectedDayIndex ? 'font-medium' : 'text-gray-500'}`}>
                  {day.day}
                </span>
                <span className={`mt-1 ${index === selectedDayIndex ? 'font-bold text-lg' : 'font-medium'}`}>
                  {day.date}
                </span>
              </div>
            ))}
          </div>

          {/* Flecha derecha con mejor estilo */}
          <button 
            onClick={goToNextDays} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-300"
          >
            <ChevronRight className="w-6 h-6 text-gray-600" />
          </button>
        </div>
        
        {/* Mensaje de no rutina con mejor estilo */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center border border-gray-100">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">
            No hay rutina programada para este día.
          </p>
        </div>
      </div>

      {/* Workout Plan con diseño mejorado */}
      <div className="p-6 animate-fade-in"> 
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <Dumbbell className="w-6 h-6 mr-2 text-blue-500" />
            Plan de Hoy
          </h2>
        </div>
        <p className="text-gray-700 text-sm mb-4 font-medium">Hoy, MAY 12</p>
        
        <Card className="bg-white border border-gray-100 rounded-2xl shadow-md overflow-hidden">
          {/* Encabezado de la tarjeta con gradiente */}
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-5 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-blue-600 font-bold text-lg">Plan de Fuerza - Abril 2025</h3>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                  <Dumbbell className="w-4 h-4 mr-1 text-gray-500" />
                  2 ejercicios
                </p>
              </div>
              <div className="bg-white p-3 rounded-full shadow-sm">
                <Calendar className="text-blue-500 w-5 h-5" />
              </div>
            </div>
          </div>
          
          {/* Listado de ejercicios con mejor estilo */}
          <div className="p-5">
            <ol className="space-y-4">
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-600 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  1
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Press de Banca</span>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    3 series
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <div className="bg-blue-100 text-blue-600 font-bold rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-1 flex-shrink-0">
                  2
                </div>
                <div>
                  <span className="font-semibold text-gray-800">Remo con Barra</span>
                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <span className="inline-block w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                    3 series
                  </p>
                </div>
              </li>
            </ol>
            
            {/* Botón para iniciar entrenamiento */}
            <button className="w-full mt-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
              INICIAR ENTRENAMIENTO
            </button>
          </div>
        </Card>
      </div>

      {/* Últimos Mensajes Section con diseño mejorado */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center mb-4">
          <MessageCircle className="w-6 h-6 mr-2 text-blue-500" />
          Últimos Mensajes
        </h2>
        
        {/* Contenedor del mensaje con estilos mejorados */}
        <div className="bg-white p-5 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:translate-y-[-2px]">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <User className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Coach Alex</p>
              <p className="text-gray-500 text-xs">2 horas atrás</p>
            </div>
          </div>
          
          <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
            ¡Gran progreso en tu forma de sentadilla! Hablemos de tu plan de nutrición mañana.
          </p>
        </div>
        
        {/* Botón para ver todos los mensajes */}
        <button className="w-full mt-4 text-blue-500 bg-blue-50 font-medium py-3 rounded-xl hover:bg-blue-100 transition-colors duration-300">
          Ver todos los mensajes
        </button>
      </div>
    </div>
  );
};

export default Dashboard;