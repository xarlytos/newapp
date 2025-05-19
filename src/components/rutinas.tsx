import React, { useState, useEffect } from 'react'; // Importar useEffect y useState
import { dataApi } from '../api/api'; // Importar dataApi

// Definir interfaces para la estructura de datos esperada de la API
interface Exercise {
  id: number;
  _id?: string;  // ID del ejercicio en el backend
  name: string;
  exercise?: string; // Nombre alternativo del ejercicio
  series: string;
  image?: string;
  planningId?: string; // ID del planning al que pertenece
  sessionId?: string;  // ID de la sesión a la que pertenece
  sets?: Array<{
    _id?: string;
    weight?: number;
    reps?: number;
    rest?: number;
    renderConfig?: {
      campo1: string;
      campo2: string;
      campo3?: string;
    };
    [key: string]: any; // Para permitir acceso dinámico a propiedades
  }>;
}

interface DailyRoutine {
  name: string;
  exercises: Exercise[];
}

interface DailyPlan {
  date: string; // Formato esperado: "YYYY-MM-DD"
  routine?: DailyRoutine; // La rutina puede ser opcional para un día
  _id?: string; // ID del planning
  day?: string; // Día de la semana (Lunes, Martes, etc.)
}

// Nueva interfaz para la estructura de datos actualizada
interface PlanningResponse {
  planningId: string;
  nombre: string;
  semanas: Array<{
    _id: string;
    weekNumber: number;
    startDate: string;
    days: {
      [key: string]: {
        _id: string;
        day: string;
        fecha: string;
        sessions: Array<{
          _id: string;
          name: string;
          exercises: Exercise[];
        }>;
      };
    };
  }>;
}

const Rutinas = () => {
  // Estados para almacenar los datos de la API
  const [weeklyPlanning, setWeeklyPlanning] = useState<DailyPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estado para controlar qué ejercicio está seleccionado para ver el detalle
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  // Estado para la fecha seleccionada en el calendario, inicializado con la fecha actual
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Variable para almacenar la respuesta original de la API
  const [response, setResponse] = useState<PlanningResponse | null>(null);

  // Función para manejar el clic en un ejercicio
  const handleExerciseClick = (exercise: Exercise) => {
    setSelectedExercise(exercise);
  };

  // Función para volver a la lista de ejercicios
  const handleBackToList = () => {
    setSelectedExercise(null);
  };

  // Nueva función para manejar el guardado del ejercicio
  const handleSaveExercise = async () => {
    if (!selectedExercise || !selectedExercise._id) {
      console.error('No hay ejercicio seleccionado o falta ID');
      return;
    }
  
    try {
      // Recopilar los datos de los sets desde los inputs
      const setsData = [];
      const setInputs = document.querySelectorAll('.set-input-row');
      
      // Si no hay filas con la clase set-input-row, buscar todas las filas de inputs
      const rows = setInputs.length > 0 
        ? setInputs 
        : document.querySelectorAll('.grid.grid-cols-3.gap-4.mb-3.items-center');
      
      rows.forEach((row, index) => {
        const inputs = row.querySelectorAll('input');
        if (inputs.length >= 2) {
          const setData = {
            setId: selectedExercise.sets && selectedExercise.sets[index] ? selectedExercise.sets[index]._id : `set-${index}`,
            peso: parseFloat(inputs[0].value) || 0,
            reps: parseInt(inputs[1].value) || 0,
            comentario: '' // Opcional, podríamos añadir un campo para comentarios
          };
          setsData.push(setData);
        }
      });
  
      // Obtener el ID del planning desde los datos de la API
      const planningId = response ? response.planningId : selectedExercise.planningId || '';
      
      console.log('Planning ID:', planningId); // Para depuración
      
      // Obtener el ID de la sesión
      let sessionId = selectedExercise.sessionId || '';
      
      // Si no está disponible, buscamos en los datos de la API
      if (!sessionId && response && response.semanas && response.semanas.length > 0) {
        // Buscar la sesión correspondiente al día seleccionado
        const selectedDay = selectedDateString.split('T')[0];
        
        for (const semana of response.semanas) {
          for (const dayKey in semana.days) {
            const dayData = semana.days[dayKey];
            const dayDate = dayData.fecha ? dayData.fecha.split('T')[0] : '';
            
            if (dayDate === selectedDay && dayData.sessions && dayData.sessions.length > 0) {
              // Encontramos la sesión del día seleccionado
              sessionId = dayData.sessions[0]._id || '';
              break;
            }
          }
          if (sessionId) break;
        }
      }
      
      // Si aún no tenemos sessionId, intentamos obtenerlo de los datos del ejercicio
      if (!sessionId && selectedExercise.sets && selectedExercise.sets.length > 0 && selectedExercise.sets[0].sessionId) {
        sessionId = selectedExercise.sets[0].sessionId;
      }
      
      console.log('Session ID:', sessionId); // Para depuración
      
      // Verificar que tenemos un sessionId antes de continuar
      if (!sessionId) {
        throw new Error('No se pudo determinar el ID de la sesión');
      }
  
      // Enviar los datos a la API para cada set
      for (const setData of setsData) {
        if (setData.setId) {
          await dataApi.enviarSet(
            planningId,
            sessionId,
            setData.setId,
            {
              pesocliente: setData.peso,
              reps: setData.reps,
              comentario: setData.comentario
            }
          );
        }
      }
  
      // Mostrar mensaje de éxito
      alert('Ejercicio guardado correctamente');
      
      // Volver a la lista de ejercicios
      handleBackToList();
      
    } catch (error) {
      console.error('Error al guardar el ejercicio:', error);
      alert('Error al guardar el ejercicio. Por favor, inténtalo de nuevo.');
    }
  };

  // Efecto para cargar los datos de la API al montar el componente
  useEffect(() => {
    const fetchPlanning = async () => {
      try {
        setIsLoading(true);
        // dataApi.getExercises() ahora devuelve la nueva estructura
        const apiResponse = await dataApi.getExercises();
        setResponse(apiResponse); // Guardar la respuesta completa
        console.log('Datos recibidos de la API:', apiResponse);

        // Verificar si la respuesta tiene la estructura esperada
        if (apiResponse && apiResponse.planningId && apiResponse.semanas && apiResponse.semanas.length > 0) {
          const transformedPlanning: DailyPlan[] = [];
          
          // Iterar sobre las semanas y días
          for (const semana of apiResponse.semanas) {
            for (const dayKey in semana.days) {
              const dayData = semana.days[dayKey];
              
              // Crear un objeto DailyPlan para cada día
              const dailyPlan: DailyPlan = {
                date: dayData.fecha.split('T')[0], // Usar la fecha y formatearla a YYYY-MM-DD
                day: dayData.day, // Guardar el día de la semana
                routine: undefined, // Inicializar rutina como undefined
                _id: apiResponse.planningId // Guardar el ID del planning
              };

              // Si hay sesiones para este día, tomar la primera como la rutina
              if (dayData.sessions && Array.isArray(dayData.sessions) && dayData.sessions.length > 0) {
                const firstSession = dayData.sessions[0];
                dailyPlan.routine = {
                  name: firstSession.name || 'Rutina sin nombre', // Usar el nombre de la sesión
                  exercises: firstSession.exercises.map((ex: any) => ({
                    ...ex,
                    planningId: apiResponse.planningId, // Añadir el ID del planning a cada ejercicio
                    sessionId: firstSession._id // Añadir el ID de la sesión a cada ejercicio
                  })) || [], // Usar los ejercicios de la sesión
                  sessionId: firstSession._id // Guardar el ID de la sesión
                };
              }

              // Añadir el plan diario al array transformado
              transformedPlanning.push(dailyPlan);
            }
          }

          // Ordenar los planes por fecha para asegurar que "hoy" y "próximas" funcionen correctamente
          transformedPlanning.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

          setWeeklyPlanning(transformedPlanning);
        } else {
          console.error('Failed to fetch weekly planning: Invalid response structure.', apiResponse);
          setError('No se pudo cargar el plan de entrenamiento debido a un error en los datos.');
          setWeeklyPlanning([]); // Asegurarse de que el estado esté vacío en caso de error
        }

      } catch (err) {
        console.error('Error fetching weekly planning:', err);
        setError('No se pudo cargar el plan de entrenamiento.');
        setWeeklyPlanning([]); // Asegurarse de que el estado esté vacío en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlanning();
  }, []);

  // Formato "YYYY-MM-DD" de la fecha seleccionada, con verificación de fecha válida
  const selectedDateString = selectedDate && selectedDate instanceof Date && !isNaN(selectedDate.getTime())
    ? selectedDate.toISOString().split('T')[0]
    : '';

  const selectedDayPlan = weeklyPlanning.find(plan => plan.date === selectedDateString);
  const selectedDayRoutine = selectedDayPlan?.routine || null;

  // Filtrar próximas sesiones (días con rutina, sin importar la fecha)
  const upcomingSessions = weeklyPlanning.filter(plan => plan.routine);

  // Función para formatear la fecha para las próximas sesiones (ej: "27 NOV")
  const formatUpcomingDate = (dateString: string): string => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleString('es-ES', { month: 'short' }).toUpperCase();
    return `${day} ${month}`;
  };

  // Obtener y formatear la fecha actual para el calendario
  const formattedSelectedDate = selectedDate.toLocaleDateString('es-ES', {
    weekday: 'long', // Nombre completo del día de la semana
    day: 'numeric',  // Día del mes
    month: 'long',   // Nombre completo del mes
    year: 'numeric', // Año
  });

  // Función para ir al día anterior
  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Función para ir al día siguiente
  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Función para volver al día de hoy
  const goToToday = () => {
    setSelectedDate(new Date());
  };

  // Renderizado condicional: mostrar detalle del ejercicio si hay uno seleccionado, de lo contrario mostrar la lista
  if (selectedExercise) {
    // Vista de detalle del ejercicio
    return (
        <div className="container mx-auto p-4 bg-gray-100 min-h-screen">
        <button
          className="mb-6 text-blue-600 font-semibold flex items-center hover:underline"
          onClick={handleBackToList}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver a la lista
        </button>
        <h2 className="text-3xl font-bold mb-3 text-gray-800">{selectedExercise.exercise || selectedExercise.name}</h2>
        {selectedExercise.series && (
          <p className="text-lg text-gray-600 mb-6">{selectedExercise.series}</p>
        )}

        {/* Aquí puedes mostrar la imagen del ejercicio si la tienes */}
        {selectedExercise.image && (
          <img src={selectedExercise.image} alt={selectedExercise.name || selectedExercise.exercise} className="w-full h-48 object-cover rounded-lg mb-4" />
        )}

        {/* Tabla/Formulario para Sets, Peso, Reps */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">Registro de Sets</h3>
          <div className="grid grid-cols-3 gap-4 text-center font-bold text-gray-700 border-b pb-2 mb-3">
            <div>Set</div>
            {selectedExercise.sets && selectedExercise.sets.length > 0 && selectedExercise.sets[0].renderConfig ? (
              <>
                <div>{selectedExercise.sets[0].renderConfig.campo1 === 'weight' ? 'Peso (kg)' : 
                      selectedExercise.sets[0].renderConfig.campo1 === 'reps' ? 'Reps' : 
                      selectedExercise.sets[0].renderConfig.campo1 === 'rest' ? 'Descanso (s)' : 
                      selectedExercise.sets[0].renderConfig.campo1}</div>
                <div>{selectedExercise.sets[0].renderConfig.campo2 === 'weight' ? 'Peso (kg)' : 
                      selectedExercise.sets[0].renderConfig.campo2 === 'reps' ? 'Reps' : 
                      selectedExercise.sets[0].renderConfig.campo2 === 'rest' ? 'Descanso (s)' : 
                      selectedExercise.sets[0].renderConfig.campo2}</div>
              </>
            ) : (
              <>
                <div>Peso (kg)</div>
                <div>Reps</div>
              </>
            )}
          </div>
          {/* Renderizar filas para cada set, usando sets si existe, o creando un array basado en series */}
          {selectedExercise.sets && selectedExercise.sets.length > 0 ? (
            // Si hay sets definidos, usarlos
            selectedExercise.sets.map((set, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 mb-3 items-center set-input-row">
                <div className="text-center text-gray-800 font-medium">{index + 1}</div>
                {set.renderConfig ? (
                  <>
                    <input 
                      type="number" 
                      className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                      placeholder="0"
                      defaultValue={set[set.renderConfig.campo1] || ''} 
                    />
                    <input 
                      type="number" 
                      className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                      placeholder="0"
                      defaultValue={set[set.renderConfig.campo2] || ''} 
                    />
                  </>
                ) : (
                  <>
                    <input 
                      type="number" 
                      className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                      placeholder="0"
                      defaultValue={set.weight || ''} 
                    />
                    <input 
                      type="number" 
                      className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" 
                      placeholder="0"
                      defaultValue={set.reps || ''} 
                    />
                  </>
                )}
              </div>
            ))
          ) : (
            // Si no hay sets definidos pero hay series, usar el número de series
            selectedExercise.series ? (
              [...Array(parseInt(selectedExercise.series.split(' ')[0]))].map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-3 items-center set-input-row">
                  <div className="text-center text-gray-800 font-medium">{index + 1}</div>
                  <input type="number" className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" placeholder="0" />
                  <input type="number" className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" placeholder="0" />
                </div>
              ))
            ) : (
              // Si no hay ni sets ni series, mostrar 3 filas por defecto
              [...Array(3)].map((_, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 mb-3 items-center set-input-row">
                  <div className="text-center text-gray-800 font-medium">{index + 1}</div>
                  <input type="number" className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" placeholder="0" />
                  <input type="number" className="border rounded-md px-3 py-2 text-center focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-200" placeholder="0" />
                </div>
              ))
            )
          )}
        </div>

        <button 
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          onClick={handleSaveExercise}
        >
          Guardar Ejercicio
        </button>
      </div>
    );
  }

  // Vista de lista de ejercicios
  return (
    <div className="container mx-auto p-4 bg-gray-100">
      {/* Header (assuming handled by parent screen) */}
      {/* Tabs (assuming handled by parent screen) */}

      {/* Entrenamiento de Hoy Section */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">Entrenamiento de Hoy</h2> {/* Increased font size and adjusted margins */}
      {/* Usar selectedDayRoutine en lugar de todayRoutine */}
      {selectedDayRoutine ? (
        <div className="flex justify-between items-center bg-purple-700 rounded-lg p-5 mb-5 text-white shadow-lg transform transition duration-300 hover:scale-105"> {/* Added shadow-lg, transform, transition, duration, hover:scale */}
          <div>
            <h3 className="text-lg font-bold">{selectedDayRoutine.name}</h3> {/* Increased font size */}
            <p className="text-sm opacity-90">{selectedDayRoutine.exercises.length} ejercicios</p> {/* Adjusted opacity */}
          </div>
          <button className="bg-white text-purple-700 font-bold py-2 px-5 rounded-full text-sm shadow-md hover:bg-gray-200 transition duration-200"> {/* Adjusted padding, added shadow, hover effect, transition */}
            Comenzar
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg p-5 mb-5 text-center text-gray-600 shadow-md">
          No hay rutina programada para esta fecha.
        </div>
      )}

      {/* Mostrar los ejercicios de la rutina seleccionada */}
      {selectedDayRoutine?.exercises.map((exercise, exerciseIndex) => (
        // Añadir onClick handler a cada ejercicio
        <div
          key={exercise._id || exerciseIndex} // Usar _id si está disponible, si no, el índice
          className="flex flex-col bg-white rounded-lg p-4 mb-3 shadow-md transform transition duration-200 hover:translate-x-1 cursor-pointer" // Añadir cursor-pointer, cambiar a flex-col
          onClick={() => handleExerciseClick(exercise)} // Llamar a la función al hacer clic
        >
          <div className="flex items-center mb-2"> {/* Contenedor para el número y nombre del ejercicio */}
             {/* Asumiendo que no hay un ID numérico en la nueva estructura, usamos el índice + 1 */}
            <p className="text-base font-bold mr-4 text-purple-700">{exerciseIndex + 1}</p>
            <div className="flex-1 mr-3">
              <h3 className="text-base font-bold text-gray-800">{exercise.exercise}</h3> {/* Usar exercise.exercise para el nombre */}
              {/* La información de series se mostrará en la tabla de sets */}
              {/* <p className="text-sm text-gray-600">{exercise.series}</p> */}
            </div>
             {/* El botón de Información podría eliminarse o cambiar su función */}
            <button className="bg-gray-200 text-gray-700 text-xs py-1 px-3 rounded-full hover:bg-gray-300 transition duration-200">
              Información
            </button>
          </div>

          {/* Mostrar los sets del ejercicio */}
          {exercise.sets && exercise.sets.length > 0 && (
            <div className="mt-2 w-full"> {/* Añadir margen superior y ancho completo */}
              <div className="grid grid-cols-4 gap-4 text-center text-sm font-semibold text-gray-700 border-b pb-1 mb-1"> {/* Cambiado a grid-cols-4 para incluir el tercer campo */}
                <div>Set</div>
                {exercise.sets[0].renderConfig ? (
                  <>
                    <div>{exercise.sets[0].renderConfig.campo1 === 'weight' ? 'Peso (kg)' : 
                          exercise.sets[0].renderConfig.campo1 === 'reps' ? 'Reps' : 
                          exercise.sets[0].renderConfig.campo1 === 'rest' ? 'Descanso (s)' : 
                          exercise.sets[0].renderConfig.campo1}</div>
                    <div>{exercise.sets[0].renderConfig.campo2 === 'weight' ? 'Peso (kg)' : 
                          exercise.sets[0].renderConfig.campo2 === 'reps' ? 'Reps' : 
                          exercise.sets[0].renderConfig.campo2 === 'rest' ? 'Descanso (s)' : 
                          exercise.sets[0].renderConfig.campo2}</div>
                    <div>{exercise.sets[0].renderConfig.campo3 === 'weight' ? 'Peso (kg)' : 
                          exercise.sets[0].renderConfig.campo3 === 'reps' ? 'Reps' : 
                          exercise.sets[0].renderConfig.campo3 === 'rest' ? 'Descanso (s)' : 
                          exercise.sets[0].renderConfig.campo3}</div>
                  </>
                ) : (
                  <>
                    <div>Peso (kg)</div>
                    <div>Reps</div>
                    <div>Descanso (s)</div>
                  </>
                )}
              </div>
              {exercise.sets.map((set, setIndex) => (
                <div key={set._id || setIndex} className="grid grid-cols-4 gap-4 text-center text-sm text-gray-800 mb-1 items-center"> {/* Cambiado a grid-cols-4 para incluir el tercer campo */}
                  <div>{setIndex + 1}</div>
                  {set.renderConfig ? (
                    <>
                      <div>{set[set.renderConfig.campo1] || '-'}</div>
                      <div>{set[set.renderConfig.campo2] || '-'}</div>
                      <div>{set[set.renderConfig.campo3] || '-'}</div>
                    </>
                  ) : (
                    <>
                      <div>{set.weight || '-'}</div>
                      <div>{set.reps || '-'}</div>
                      <div>{set.rest || '-'}</div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* Calendario de Entrenamiento Section */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">Calendario de Entrenamiento</h2> {/* Increased font size and adjusted margins */}
      <div className="bg-white rounded-lg p-4 mb-5 shadow-md flex flex-col items-center"> {/* Adjusted margin bottom */}
        {/* This is where your Calendar component would go */}
        <div className="flex justify-between items-center w-full mb-3"> {/* Adjusted margin bottom */}
            {/* Botón para ir al día anterior */}
            <button className="p-2 rounded-full hover:bg-gray-200 transition duration-200" onClick={goToPreviousDay}>&lt;</button> {/* Added transition */}
            {/* Mostrar la fecha seleccionada formateada */}
            <p className="text-base font-bold text-gray-800">{formattedSelectedDate}</p>
            {/* Botón para ir al día siguiente */}
            <button className="p-2 rounded-full hover:bg-gray-200 transition duration-200" onClick={goToNextDay}>&gt;</button> {/* Added transition */}
        </div>
        {/* Botón para volver al día de hoy */}
        <button className="bg-blue-200 text-blue-800 text-sm py-1 px-4 rounded-full font-semibold hover:bg-blue-300 transition duration-200" onClick={goToToday}> {/* Adjusted padding, added transition */}
            Hoy
        </button>
      </div>


      {/* Próximas Sesiones de Entrenamiento Section */}
      <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">Próximas Sesiones de Entrenamiento...</h2> {/* Increased font size and adjusted margins */}
      {upcomingSessions.length > 0 ? (
        upcomingSessions.map(session => (
          <div key={session.date} className="flex items-center bg-white rounded-lg p-4 mb-3 shadow-md transform transition duration-200 hover:translate-x-1"> {/* Added transform, transition, duration, hover:translate-x */}
            <div className="bg-gray-200 rounded-lg p-3 text-center mr-4">
              <p className="text-lg font-bold text-gray-800">{formatUpcomingDate(session.date).split(' ')[0]}</p>
              <p className="text-xs text-gray-600">{formatUpcomingDate(session.date).split(' ')[1]}</p>
            </div>
            <div className="flex-1 mr-3">
              <h3 className="text-base font-bold text-gray-800">{session.routine?.name}</h3>
              {/* Asumiendo que la API no devuelve la hora, omitimos session.time */}
              {/* <p className="text-sm text-gray-600">{session.time}</p> */}
            </div>
            <button className="bg-gray-200 text-gray-700 text-xs py-1 px-3 rounded-full hover:bg-gray-300 transition duration-200"> {/* Adjusted padding, added transition */}
              Ver
            </button>
          </div>
        ))
      ) : (
        <div className="bg-white rounded-lg p-5 mb-5 text-center text-gray-600 shadow-md">
          No hay próximas sesiones programadas.
        </div>
      )}


      {/* Bottom Navigation (assuming handled by parent screen) */}
    </div>
  );
};

export default Rutinas;