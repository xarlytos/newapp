import React, { useState, useEffect } from 'react';
import { dataApi } from '../api/api';

interface ClassSession {
  id: string;
  className: string;
  date: string;
  time: string;
  location: string;
  instructor: string;
  capacity: number;
  availableSpots: string;
  classId: string;
  description?: string;
}

interface ClassData {
  id: string;
  name: string;
  details: string;
  instructor: string;
  type: string;
  availability?: string;
}

const Clase = () => {
  const [myClasses, setMyClasses] = useState<ClassData[]>([]);
  const [availableSessions, setAvailableSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);
  const [reservationStatus, setReservationStatus] = useState<{
    success: boolean;
    message: string;
    sessionId: string | null;
  } | null>(null);

  const handleReservation = async (sessionId: string, classId: string) => {
    try {
      setIsReserving(true);
      setReservationStatus(null);
      
      // Llamar a la API para inscribirse a la clase
      const response = await dataApi.registerToGroupClass(classId, sessionId);
      console.log('Respuesta de inscripción:', response);
      
      // Actualizar el estado con el resultado exitoso
      setReservationStatus({
        success: true,
        message: 'Te has inscrito correctamente a la clase',
        sessionId: sessionId
      });
      
      // Refrescar los datos de clases para mostrar la nueva inscripción
      fetchClasses();
      
    } catch (err) {
      console.error('Error al inscribirse a la clase:', err);
      setReservationStatus({
        success: false,
        message: 'No se pudo completar la inscripción. Por favor, inténtalo de nuevo.',
        sessionId: sessionId
      });
    } finally {
      setIsReserving(false);
    }
  };

  const fetchClasses = async () => {
    try {
      setIsLoading(true);
      const response = await dataApi.getGroupClasses();
      console.log('Datos de clases recibidos:', response);

      if (response && response.data) {
        // Transformar los datos de la API al formato que necesitamos para mis clases
        const transformedMyClasses: ClassData[] = response.data
          .filter((clase: any) => {
            // Aquí puedes definir la lógica para determinar si el usuario está inscrito
            // Por ejemplo, si hay un campo 'inscrito' o si el ID del usuario está en la lista de clientes
            return false; // Por ahora, asumimos que no hay clases inscritas
          })
          .map((clase: any) => ({
            id: clase._id || '',
            name: clase.nombre || '',
            details: 'Detalles de la clase',
            instructor: clase.entrenador ? `${clase.entrenador.nombre || 'Instructor'} - Nivel no especificado` : 'Instructor - Nivel no especificado',
            type: 'General',
          }));

        // Transformar los datos para mostrar cada sesión como un elemento individual
        let allSessions: ClassSession[] = [];
        
        response.data.forEach((clase: any) => {
          if (clase.sesiones && Array.isArray(clase.sesiones)) {
            const classSessions = clase.sesiones.map((sesion: any) => {
              const sessionDate = sesion.fecha ? new Date(sesion.fecha) : null;
              const formattedDate = sessionDate 
                ? sessionDate.toLocaleDateString('es-ES', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })
                : 'Fecha no disponible';
              
              return {
                id: sesion._id || '',
                className: clase.nombre || '',
                date: formattedDate,
                time: sesion.hora || 'Hora no especificada',
                location: sesion.lugar || 'Lugar no especificado',
                instructor: clase.entrenador ? clase.entrenador.nombre || 'Instructor' : 'Instructor',
                capacity: sesion.capacidad || 0,
                availableSpots: `${sesion.capacidad - (sesion.clientesAsignados?.length || 0)} plazas disponibles`,
                classId: clase._id || '',
                description: clase.descripcion || ''
              };
            });
            
            allSessions = [...allSessions, ...classSessions];
          }
        });

        setMyClasses(transformedMyClasses);
        setAvailableSessions(allSessions);
      } else {
        setError('No se pudieron cargar los datos de clases');
      }
    } catch (err) {
      console.error('Error al obtener clases:', err);
      setError('Error al cargar las clases');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  // Mover las verificaciones de isLoading y error dentro del return
  return (
    <div className="container mx-auto p-4 bg-gray-100">
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-purple-700 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-600">Cargando clases...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      ) : (
        <>
          {/* Mensaje de estado de reserva */}
          {reservationStatus && (
            <div className={`mb-4 p-3 rounded-md ${reservationStatus.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {reservationStatus.message}
            </div>
          )}
          
          {/* Mis Clases Section */}
          <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">Mis Clases</h2>
          {myClasses.length > 0 ? (
            myClasses.map(clase => (
              <div key={clase.id} className="flex justify-between items-center bg-white rounded-lg p-4 mb-3 shadow-md transform transition duration-200 hover:translate-x-1">
                <div className="flex-1 mr-3">
                  <h3 className="text-base font-bold text-gray-800">{clase.name}</h3>
                  <p className="text-sm text-gray-600">{clase.details}</p>
                  <p className="text-sm text-gray-600">{clase.instructor}</p>
                  <p className="text-sm text-purple-700 mt-1">{clase.type}</p>
                </div>
                <button className="bg-purple-700 text-white font-bold py-2 px-4 rounded-md text-sm shadow-md hover:bg-purple-800 transition duration-200">
                  Detalles
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No tienes clases inscritas actualmente</p>
          )}

          {/* Clases Disponibles Section */}
          <h2 className="text-xl font-bold mt-6 mb-3 text-gray-800">Clases Disponibles</h2>
          {availableSessions.length > 0 ? (
            availableSessions.map(session => (
              <div key={session.id} className="flex justify-between items-center bg-white rounded-lg p-4 mb-3 shadow-md transform transition duration-200 hover:translate-x-1">
                <div className="flex-1 mr-3">
                  <h3 className="text-base font-bold text-gray-800">{session.className}</h3>
                  <p className="text-sm text-gray-600">{session.date} - {session.time}</p>
                  <p className="text-sm text-gray-600">Instructor: {session.instructor} - Lugar: {session.location}</p>
                  <p className="text-sm text-purple-700 mt-1">General - {session.availableSpots}</p>
                </div>
                <button 
                  className={`font-bold py-2 px-4 rounded-md text-sm shadow-md transition duration-200 ${
                    isReserving && reservationStatus?.sessionId === session.id 
                      ? 'bg-gray-400 text-white cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  onClick={() => handleReservation(session.id, session.classId)}
                  disabled={isReserving && reservationStatus?.sessionId === session.id}
                >
                  {isReserving && reservationStatus?.sessionId === session.id ? 'Reservando...' : 'Reservar'}
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-center py-4">No hay clases disponibles en este momento</p>
          )}
        </>
      )}
    </div>
  );
};

export default Clase;