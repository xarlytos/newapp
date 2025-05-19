import axios from 'axios';

// Define la URL base de la API usando una variable de entorno
// Si no está definida (por ejemplo, en desarrollo local), usa la URL de Heroku por defecto
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://fitoffice-a7ed6ea26ba4.herokuapp.com';

// API base instance
const api = axios.create({
  baseURL: API_BASE_URL, // Usa la variable de entorno
  timeout: 10000, // Aumentado el timeout por si acaso
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Mock API endpoints (mantengo otros mocks si son necesarios)
const mockEndpoints = {
  // Auth endpoints - REMOVED MOCK LOGIN
  
  // Dashboard data
  async getDashboardData() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        stats: {
          workoutsThisWeek: 3,
          caloriesAverage: 2100,
          waterIntake: '2.5L',
          sleepAverage: '7.2h'
        },
        recentWorkouts: [
          { id: '1', name: 'Upper Body', date: '2023-06-01', duration: '45 min' },
          { id: '2', name: 'Cardio', date: '2023-05-30', duration: '30 min' },
          { id: '3', name: 'Legs', date: '2023-05-28', duration: '50 min' }
        ],
        upcomingWorkouts: [
          { id: '4', name: 'Full Body', date: '2023-06-03', duration: '60 min' },
          { id: '5', name: 'Cardio', date: '2023-06-05', duration: '30 min' }
        ]
      }
    };
  },
  
  // Exercises data
  async getExercises() {
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      data: {
        categories: [
          { id: '1', name: 'Strength' },
          { id: '2', name: 'Cardio' },
          { id: '3', name: 'Flexibility' }
        ],
        exercises: [
          { id: '1', name: 'Bench Press', category: 'Strength', muscles: 'Chest, Triceps', difficulty: 'Intermediate' },
          { id: '2', name: 'Squats', category: 'Strength', muscles: 'Quadriceps, Glutes', difficulty: 'Beginner' },
          { id: '3', name: 'Running', category: 'Cardio', calories: '400-600 kcal/h', difficulty: 'Variable' },
          { id: '4', name: 'Yoga', category: 'Flexibility', benefits: 'Balance, Flexibility', difficulty: 'Variable' }
        ]
      }
    };
  },
  
  // Nutrition data - REMOVED MOCK
  // async getNutrition() {
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   return {
  //     data: {
  //       dailyIntake: {
  //         calories: 2200,
  //         protein: '150g',
  //         carbs: '220g',
  //         fats: '70g'
  //       },
  //       mealPlan: [
  //         { id: '1', name: 'Breakfast', time: '8:00 AM', foods: ['Oatmeal', 'Banana', 'Protein Shake'] },
  //         { id: '2', name: 'Lunch', time: '12:30 PM', foods: ['Chicken Salad', 'Brown Rice', 'Broccoli'] },
  //         { id: '3', name: 'Dinner', time: '7:00 PM', foods: ['Salmon', 'Sweet Potato', 'Asparagus'] }
  //       ]
  //     }
  //   };
  // },
  
  // Questionnaires data - REMOVED MOCK
  // async getQuestionnaires() {
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   return {
  //     data: {
  //       questionnaires: [
  //         { 
  //           id: '1', 
  //           title: 'Fitness Assessment', 
  //           status: 'Completed',
  //           questions: [
  //             { id: '1', text: 'How many days per week do you exercise?' },
  //             { id: '2', text: 'What are your fitness goals?' }
  //           ]
  //         },
  //         { 
  //           id: '2', 
  //           title: 'Nutrition Habits', 
  //           status: 'Pending',
  //           questions: [
  //             { id: '1', text: 'How many meals do you eat per day?' },
  //             { id: '2', text: 'Do you track your calorie intake?' }
  //           ]
  //         }
  //       ]
  //     }
  //   };
  // },
  
  // User profile data - REMOVED MOCK
  // async getUserProfile() {
  //   await new Promise(resolve => setTimeout(resolve, 500));
  //   return {
  //     data: {
  //       profile: {
  //         id: '123456',
  //         name: 'John Doe',
  //         email: 'user@example.com',
  //         age: 32,
  //         height: '180cm',
  //         weight: '75kg',
  //         goals: ['Build muscle', 'Improve endurance'],
  //         memberSince: '2023-01-15'
  //       }
  //     }
  //   };
  // }
};

// Export API functions
export const authApi = {
  // Implementación real del login usando Axios
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login/cliente', { email, password });
    return response;
  },
};

export const dataApi = {
  getDashboardData: () => mockEndpoints.getDashboardData(),
  // Implementación real de getExercises usando Axios
  getExercises: async () => {
    const response = await api.get('/api/plannings/cliente/mi-planning-semanas-dias');
    // Asumiendo que la respuesta del backend es directamente el array del planning semanal
    return response.data;
  },
  getUserProfile: async () => {
    const response = await api.get('/api/clients/ProfileService');
    console.log('GetUserProfile Response Data:', response.data); // Log response
    // Asumiendo que la respuesta del backend es directamente el objeto del perfil
    return response.data;
  },


  // Implementación real de getNutrition usando Axios
  getNutrition: async () => {
    const response = await api.get('/api/dietas/cliente/mis-dias-comidas');
    // Asumiendo que la respuesta del backend es un objeto con la propiedad "dias"
    // como { dias: [ ... ] }
    return response.data;
  },
  // Implementación real de getQuestionnaires usando Axios
  getQuestionnaires: async () => {
    const response = await api.get('/api/cuestionarios/cliente/mis-cuestionarios');
    // Asumiendo que la respuesta del backend ya tiene el formato esperado [ { ...cuestionario1... }, { ...cuestionario2... } ]
    // y que quieres devolver directamente el array de cuestionarios.
    // Si la estructura de la respuesta del backend es { data: [ ...cuestionarios... ] }, entonces sería return response.data.data;
    // Basado en tu ejemplo de respuesta, parece que el backend devuelve directamente el array.
    return response.data;
  },
  submitQuestionnaireResponses: async (idCuestionario: string, respuestas: any) => {
    const response = await api.post(`/api/cuestionarios/${idCuestionario}/responder`, respuestas);
    return response.data;
  },
  // Nueva función para obtener clases grupales del cliente
  getGroupClasses: async () => {
    const response = await api.get('/api/clases-grupales/mis-clases/cliente');
    // La respuesta tiene el formato: { message, count, data }
    // donde data es el array de clases grupales
    return response.data;
  },
  registerToGroupClass: async (claseGrupalId: string, sesionId: string) => {
    const response = await api.post(`/api/clases-grupales/${claseGrupalId}/sesiones/${sesionId}/inscribir`);
    return response.data;
  },
  enviarSet: async (planningId: string, sessionId: string, setId: string, datos: {
    pesocliente: number,
    reps: number,
    comentario?: string
  }) => {
    const response = await api.post(
      `/api/plannings/${planningId}/session/${sessionId}/set/${setId}/checkin`, 
      datos
    );
    return response.data;
  },

  // Nueva función para actualizar la foto de perfil
  actualizarfotoperfil: async (profileImage: File) => {
    // Crear un FormData para enviar la imagen
    const formData = new FormData();
    formData.append('profileImage', profileImage);
    
    // Configuración especial para enviar FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.put('/api/clientes/perfil/foto', formData, config);
    return response.data;
  },

  // Nueva función para enviar foto de progreso
  enviarfotoprogreso: async (fotoProgreso: File) => {
    // Crear un FormData para enviar la imagen
    const formData = new FormData();
    formData.append('fotoProgreso', fotoProgreso);
    
    // Configuración especial para enviar FormData
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
    const response = await api.post('/api/clientes/mi-progreso/foto', formData, config);
    return response.data;
  },

  // REMOVED DUPLICATE: getUserProfile: () => mockEndpoints.getUserProfile(),
};

export default api;