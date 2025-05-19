import React, { useState, useEffect } from 'react';
import { dataApi } from '../api/api';
import Card from '../components/Common/Card';
import { PieChart, Apple, Utensils, Clock } from 'lucide-react';

interface DailyIntake {
  calories: number;
  protein: string;
  carbs: string;
  fats: string;
}

interface FoodItem {
  nombre: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

interface Meal {
  id: string;
  name: string;
  time: string;
  foods: FoodItem[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
}

const Nutrition: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dailyIntake, setDailyIntake] = useState<DailyIntake | null>(null);
  const [mealPlan, setMealPlan] = useState<Meal[]>([]);

  useEffect(() => {
    const fetchNutritionData = async () => {
      try {
        setIsLoading(true);
        const response = await dataApi.getNutrition(); // response is { dias: [...] }
        
        // Añadir console.log para ver los datos que llegan
        console.log('Datos de nutrición recibidos:', response);
        
        // Check if the response has the expected 'dias' array and it's not empty
        if (response && response.dias && Array.isArray(response.dias) && response.dias.length > 0) {
          const dayData = response.dias[0]; // Get the first day's data
          
          // Añadir console.log para ver los datos del día específico
          console.log('Datos del día seleccionado:', dayData);

          // Process daily intake from dayData.restricciones
          if (dayData.restricciones) {
            const restrictions = dayData.restricciones;
            setDailyIntake({
              calories: restrictions.calorias,
              protein: restrictions.proteinas !== undefined ? restrictions.proteinas.toString() : '0', // API provides numbers
              carbs: restrictions.carbohidratos !== undefined ? restrictions.carbohidratos.toString() : '0', // UI expects strings
              fats: restrictions.grasas !== undefined ? restrictions.grasas.toString() : '0',
            });
          } else {
            console.error('Nutrition data: "restricciones" not found in dayData', dayData);
            setDailyIntake(null); // Handle missing data
          }

          // Process meal plan from dayData.comidas
          if (dayData.comidas && Array.isArray(dayData.comidas)) {
            const meals: Meal[] = dayData.comidas.map((apiMeal: any) => {
              // Extraer los ingredientes con sus macros
              const foodItems: FoodItem[] = (apiMeal.ingredientes && Array.isArray(apiMeal.ingredientes))
                ? apiMeal.ingredientes.map((food: any) => ({
                    nombre: food.nombre || 'Alimento sin nombre',
                    calorias: food.calorias || 0,
                    proteinas: food.proteinas || 0,
                    carbohidratos: food.carbohidratos || 0,
                    grasas: food.grasas || 0
                  }))
                : [];
              
              // Calcular los macros totales de la comida
              const totalMacros = foodItems.reduce((acc, food) => {
                return {
                  calories: acc.calories + food.calorias,
                  protein: acc.protein + food.proteinas,
                  carbs: acc.carbs + food.carbohidratos,
                  fats: acc.fats + food.grasas
                };
              }, { calories: 0, protein: 0, carbs: 0, fats: 0 });
              
              return {
                id: apiMeal._id || `meal-${apiMeal.numero || Math.random()}`, // Ensure an ID
                name: apiMeal.nombre || 'Comida sin nombre', // API 'nombre' (e.g., "caca")
                time: apiMeal.numero ? `Comida ${apiMeal.numero}` : 'N/A', // API 'numero' (e.g., 1) as placeholder
                foods: foodItems,
                totalMacros: totalMacros
              };
            });
            setMealPlan(meals);
          } else {
            console.error('Nutrition data: "comidas" not found or not an array in dayData', dayData);
            setMealPlan([]); // Handle missing data
          }
        } else {
          // Log an error if the response structure is not as expected
          console.error('Failed to fetch nutrition data: Invalid response structure. Expected "response.dias[0]". Actual response:', response);
          setDailyIntake(null);
          setMealPlan([]);
        }
      } catch (error) {
        console.error('Error fetching nutrition data:', error);
        setDailyIntake(null);
        setMealPlan([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNutritionData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="animate-pulse text-center">
          <div className="w-12 h-12 rounded-full bg-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de nutrición...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 pb-20">
      <div className="mb-6 bg-blue-500 p-4 rounded-lg text-white">
        <h1 className="text-2xl font-bold">Nutrición</h1>
        <p className="text-blue-100">Seguimiento de tu nutrición diaria</p>
      </div>

      {/* Daily Intake Summary */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">Objetivos Nutricionales Diarios</h2>
        <Card>
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <PieChart size={20} className="text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Objetivo Diario</p>
              <p className="text-xl font-bold">{dailyIntake?.calories} calorías</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-500">Proteínas</p>
              <p className="text-lg font-semibold">{dailyIntake?.protein}g</p>
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <p className="text-xs text-gray-500">Carbohidratos</p>
              <p className="text-lg font-semibold">{dailyIntake?.carbs}g</p>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-xs text-gray-500">Grasas</p>
              <p className="text-lg font-semibold">{dailyIntake?.fats}g</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Meal Plan */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Plan de Comidas de Hoy</h2>
        
        {mealPlan.map((meal) => (
          <Card key={meal.id} className="mb-4">
            <div className="flex items-center mb-3">
              {meal.name.toLowerCase().includes('desayuno') ? (
                <Apple size={20} className="text-green-500 mr-2" />
              ) : meal.name.toLowerCase().includes('almuerzo') ? (
                <Utensils size={20} className="text-orange-500 mr-2" />
              ) : (
                <Utensils size={20} className="text-indigo-500 mr-2" />
              )}
              <h3 className="font-medium">{meal.name}</h3>
              <div className="ml-auto flex items-center text-gray-500">
                <Clock size={14} className="mr-1" />
                <span className="text-sm">{meal.time}</span>
              </div>
            </div>
            
            {/* Macros totales de la comida */}
            <div className="mb-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-1">Macros Totales:</p>
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Calorías:</span>
                  <p className="font-medium">{meal.totalMacros.calories} kcal</p>
                </div>
                <div>
                  <span className="text-gray-500">Proteínas:</span>
                  <p className="font-medium">{meal.totalMacros.protein}g</p>
                </div>
                <div>
                  <span className="text-gray-500">Carbos:</span>
                  <p className="font-medium">{meal.totalMacros.carbs}g</p>
                </div>
                <div>
                  <span className="text-gray-500">Grasas:</span>
                  <p className="font-medium">{meal.totalMacros.fats}g</p>
                </div>
              </div>
            </div>
            
            <p className="text-sm font-semibold mb-2">Ingredientes:</p>
            <ul className="space-y-3">
              {meal.foods.map((food, index) => (
                <li key={index} className="border-b pb-2">
                  <div className="flex items-center mb-1">
                    <div className="w-2 h-2 rounded-full bg-gray-300 mr-2"></div>
                    <span className="font-medium">{food.nombre}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs pl-4">
                    <div>
                      <span className="text-gray-500">Calorías:</span>
                      <p>{food.calorias} kcal</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Proteínas:</span>
                      <p>{food.proteinas}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Carbos:</span>
                      <p>{food.carbohidratos}g</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Grasas:</span>
                      <p>{food.grasas}g</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Nutrition;