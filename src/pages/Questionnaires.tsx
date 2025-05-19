import React, { useState, useEffect } from 'react';
import { dataApi } from '../api/api';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { ClipboardList, Check, AlertCircle } from 'lucide-react';

interface QuestionOption { // Interfaz para las opciones de preguntas tipo 'opciones'
  _id: string;
  texto: string;
}
interface Question {
  id: string;
  text: string;
  tipo: 'texto' | 'numero' | 'opciones' | 'boolean' | 'rango' | 'obtencion_altura' | 'obtencion_peso' | 'obtencion_fotos_progreso' | 'obtencion_archivos'; // Tipos de pregunta
  opciones?: QuestionOption[]; // Opciones para preguntas de tipo 'opciones'
}

interface Questionnaire {
  id: string;
  title: string;
  status: 'Completed' | 'Pending';
  questions: Question[];
}

const Questionnaires: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({}); // Estado para las respuestas
  const [submitting, setSubmitting] = useState(false); // Nuevo estado para controlar el envío
  const [submitError, setSubmitError] = useState<string | null>(null); // Estado para manejar errores
  const [submitSuccess, setSubmitSuccess] = useState(false); // Estado para manejar éxito

  // Log state at the beginning of each render cycle
  console.log(
    '[Questionnaires Render] isLoading:', isLoading,
    'selectedQuestionnaire:', selectedQuestionnaire ? selectedQuestionnaire.id : null,
    'questionnaireCount:', questionnaires.length,
    'answers:', answers
  );

  useEffect(() => {
    const fetchQuestionnaires = async () => {
      try {
        setIsLoading(true);
        const response = await dataApi.getQuestionnaires();
        console.log('API Response:', response);

        const mappedQuestionnaires: Questionnaire[] = response.map((item: any) => ({
          id: item._id,
          title: item.titulo,
          status: item.estado === 'activo' ? 'Pending' : 'Completed',
          questions: item.preguntas.map((q: any) => ({
            id: q._id,
            text: q.texto,
            tipo: q.tipo, // Mapear el tipo de pregunta
            opciones: q.opciones || [], // Mapear las opciones, asegurando que sea un array
          })),
        }));

        setQuestionnaires(mappedQuestionnaires);

      } catch (error) {
        console.error('Error fetching questionnaires:', error);
        setQuestionnaires([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestionnaires();
  }, []);

  const handleQuestionnaireClick = (questionnaire: Questionnaire) => {
    console.log('[handleQuestionnaireClick] Clicked on questionnaire - ID:', questionnaire.id, 'Title:', questionnaire.title);
    setSelectedQuestionnaire(questionnaire);
    // Inicializar respuestas para el cuestionario seleccionado (o cargar existentes si es necesario)
    const initialAnswers: { [key: string]: any } = {};
    questionnaire.questions.forEach(q => {
      // Aquí podrías pre-cargar respuestas si ya existen
      initialAnswers[q.id] = ''; // O un valor por defecto según el tipo
      if (q.tipo === 'boolean') {
        initialAnswers[q.id] = null; // o false/true por defecto
      }
    });
    setAnswers(initialAnswers);
  };

  const handleBack = () => {
    console.log('[handleBack] Navigating back to list.');
    setSelectedQuestionnaire(null);
    setAnswers({}); // Limpiar respuestas al volver
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: value,
    }));
  };

  // Nueva función para manejar el envío de respuestas
  const handleSubmitAnswers = async () => {
    if (!selectedQuestionnaire) return;
    
    try {
      setSubmitting(true);
      setSubmitError(null);
      
      // Preparar el formato de las respuestas según lo que espera el backend
      const respuestasFormateadas = Object.keys(answers).map(questionId => ({
        preguntaId: questionId,
        respuesta: answers[questionId]
      }));
      
      // Objeto de respuesta completo
      const datosRespuesta = {
        respuestas: respuestasFormateadas
      };
      
      // Llamar a la API para enviar las respuestas
      await dataApi.submitQuestionnaireResponses(selectedQuestionnaire.id, datosRespuesta);
      
      // Actualizar el estado para mostrar éxito
      setSubmitSuccess(true);
      
      // Opcional: Actualizar el estado del cuestionario localmente
      setQuestionnaires(prevQuestionnaires => 
        prevQuestionnaires.map(q => 
          q.id === selectedQuestionnaire.id 
            ? { ...q, status: 'Completed' } 
            : q
        )
      );
      
      // Opcional: Volver a la lista después de un tiempo
      setTimeout(() => {
        setSelectedQuestionnaire(null);
        setAnswers({});
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error al enviar respuestas:', error);
      setSubmitError('Ocurrió un error al enviar tus respuestas. Por favor, intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const commonProps = {
      className: "w-full p-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
      value: answers[question.id] || '',
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => handleAnswerChange(question.id, e.target.value),
    };

    switch (question.tipo) {
      case 'texto':
        return <textarea {...commonProps} placeholder="Tu respuesta..." rows={3} />;
      case 'numero':
      case 'obtencion_altura': // Tratar como número por ahora
      case 'obtencion_peso':   // Tratar como número por ahora
        return <input type="number" {...commonProps} placeholder="Introduce un número" />;
      case 'boolean':
        return (
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={answers[question.id] === 'true'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="mr-2"
              />
              Sí
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={answers[question.id] === 'false'}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                className="mr-2"
              />
              No
            </label>
          </div>
        );
      case 'opciones':
        return (
          <div className="space-y-2">
            {(question.opciones || []).map(opcion => (
              <label key={opcion._id} className="flex items-center">
                <input
                  type="radio"
                  name={question.id}
                  value={opcion._id} // o opcion.texto si prefieres guardar el texto
                  checked={answers[question.id] === opcion._id}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mr-2"
                />
                {opcion.texto}
              </label>
            ))}
          </div>
        );
      case 'obtencion_fotos_progreso':
      case 'obtencion_archivos':
        return <input type="file" className={commonProps.className} onChange={(e) => handleAnswerChange(question.id, e.target.files ? e.target.files[0] : null)} />;
      // Añadir más casos para 'rango', etc.
      default:
        return <p className="text-sm text-red-500">Tipo de pregunta no soportado: {question.tipo}</p>;
    }
  };


  if (isLoading) {
    console.log('[Questionnaires Render] State: Loading');
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questionnaires...</p>
        </div>
      </div>
    );
  }

  if (selectedQuestionnaire) {
    console.log('[Questionnaires Render] State: Showing detail view for ID:', selectedQuestionnaire.id);
    return (
      <div className="mx-auto p-4 pb-20 bg-gray-50 min-h-screen"> {/* Eliminado max-w-xl para mayor ancho */}
        {/* Botón Back - Movido dentro del encabezado azul */}
        {/* Eliminado el div contenedor anterior del botón */}
        {/* <div className="mb-4">
          <button
            onClick={handleBack}
            className="flex items-center text-blue-500 hover:text-blue-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div> */}

        {/* Header con estilo azul y flexbox para alinear contenido */}
        <div className="mb-6 bg-blue-500 p-4 rounded-lg text-white flex justify-between items-center"> {/* Estilos de encabezado azul con flexbox */}
          {/* Botón Back - Ahora dentro del encabezado, alineado a la izquierda */}
          <button
            onClick={handleBack}
            className="flex items-center text-blue-100 hover:text-white transition-colors duration-200" // Ajuste de color para contraste
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>

          {/* Contenedor para el título y estado, centrado */}
          <div className="flex-1 text-center">
            <h1 className="text-2xl font-bold">{selectedQuestionnaire.title}</h1> {/* Título del cuestionario */}
            <div className="flex items-center justify-center mt-2"> {/* Centrar el estado también */}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                              ${selectedQuestionnaire.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {selectedQuestionnaire.status === 'Completed' ? (
                  <Check size={14} className="mr-1" />
                ) : (
                  <AlertCircle size={14} className="mr-1" />
                )}
                {selectedQuestionnaire.status}
              </span> {/* Moved closing span here */}
            </div>
          </div>
          {/* Added an empty div to balance the flex layout if needed, or remove if not necessary */}
          <div className="w-12"></div> {/* Adjust width as needed to align with the back button */}
        </div>

        <Card>
          <h2 className="text-lg font-semibold mb-4">Questions</h2>
          
          {submitSuccess && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center">
              <Check size={18} className="mr-2" />
              <span>¡Respuestas enviadas correctamente!</span>
            </div>
          )}
          
          {submitError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex items-center">
              <AlertCircle size={18} className="mr-2" />
              <span>{submitError}</span>
            </div>
          )}
          
          <div className="space-y-6"> {/* Aumentado el espacio entre preguntas */}
            {selectedQuestionnaire.questions.map((question, index) => (
              <div key={question.id} className="p-4 border border-gray-200 rounded-lg shadow-sm"> {/* Estilo mejorado para cada pregunta */}
                <p className="font-medium text-gray-800 mb-2">Pregunta {index + 1}: {question.text}</p> {/* Texto de la pregunta más prominente */}
                {selectedQuestionnaire.status === 'Pending' && (
                  <div className="mt-2">
                    {renderQuestionInput(question)}
                  </div>
                )}
                 {selectedQuestionnaire.status === 'Completed' && answers[question.id] && ( // Mostrar respuesta si está completado
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <p className="text-sm text-gray-700"><strong>Respuesta:</strong> {typeof answers[question.id] === 'boolean' ? (answers[question.id] ? 'Sí' : 'No') : answers[question.id]}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedQuestionnaire.status === 'Pending' && (
            <div className="mt-8">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={handleSubmitAnswers}
                disabled={submitting}
              >
                {submitting ? 'Enviando...' : 'Enviar Respuestas'}
              </Button>
            </div>
          )}
        </Card>
      </div>
    );
  }

  // This block renders the list of questionnaires if none is selected and not loading
  console.log('[Questionnaires Render] State: Showing list view.');
  return (
    <div className="mx-auto p-4 pb-20">
      {/* Header */}
      <div className="mb-6 bg-blue-500 p-4 rounded-lg text-white">
        <h1 className="text-2xl font-bold">Cuestionarios</h1>
        <p className="text-blue-100">Completa tus evaluaciones de salud y fitness</p>
      </div>

      {questionnaires.length > 0 ? (
        <div className="space-y-4">
          {questionnaires.map(questionnaire => (
            <div // Usando div como se probó anteriormente
              key={questionnaire.id}
              className="cursor-pointer hover:shadow-lg transition-shadow p-4 border border-gray-200 rounded-lg bg-white shadow-sm"
              onClick={() => handleQuestionnaireClick(questionnaire)}
              style={{ marginBottom: '1rem' }}
            >
              <div className="flex items-start">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4"> {/* Aumentado margen */}
                  <ClipboardList size={20} className="text-purple-600" /> {/* Color de icono ajustado */}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800">{questionnaire.title}</h3>
                  <p className="text-sm text-gray-500">{questionnaire.questions.length} preguntas</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium // Padding ajustado
                                ${questionnaire.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}> {/* Colores ajustados */}
                  {questionnaire.status === 'Completed' ? (
                    <Check size={14} className="mr-1.5" /> 
                  ) : (
                    <AlertCircle size={14} className="mr-1.5" />
                  )}
                  {questionnaire.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12"> {/* Padding aumentado */}
          <ClipboardList size={48} className="mx-auto text-gray-400 mb-4" /> {/* Tamaño y margen ajustados */}
          <p className="text-gray-500 text-lg">No questionnaires available</p> {/* Texto más grande */}
        </div>
      )}
    </div>
  );
};

export default Questionnaires;