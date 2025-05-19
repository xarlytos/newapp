import React, { useState, useEffect, useRef } from 'react';
import { dataApi } from '../api/api';
import { useAuth } from '../auth/AuthContext';
import Card from '../components/Common/Card';
import Button from '../components/Common/Button';
import { User, LogOut, Award, Calendar, ArrowLeft, Edit, Instagram, Phone, MapPin, Calendar as CalendarIcon, Heart, Save, XCircle } from 'lucide-react'; // Importar Save y XCircle

interface ProfileData {
  id: string;
  name: string;
  email: string;
  age?: number; // Making age optional as it's not in the new API response structure
  height: string;
  weight: string;
  goals?: string[]; // Making goals optional
  memberSince?: string; // Making memberSince optional
  // Fields based on the new API response structure and image layout
  imc?: string; // IMC might be calculated or fetched
  phone?: string;
  address?: string;
  birthDate?: string;
  medicalConditions?: string;
  instagram?: string;
  progressPhotos?: { date: string; url: string; label: string }[]; // Assuming structure for progress photos
}

const Profile: React.FC = () => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para cambiar foto de perfil
  const newPhotoInputRef = useRef<HTMLInputElement>(null); // Referencia para añadir nueva foto de progreso

  // State for editing Information section
  const [isEditingInformation, setIsEditingInformation] = useState(false);
  const [editedInfo, setEditedInfo] = useState({
    phone: '',
    address: '',
    birthDate: '',
    medicalConditions: '',
  });

  // State for editing Social Media section
  const [isEditingSocialMedia, setIsEditingSocialMedia] = useState(false);
  const [editedSocialMedia, setEditedSocialMedia] = useState({
    instagram: '',
  });


  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await dataApi.getUserProfile();
        console.log('Datos del perfil recibidos:', response);

        const apiProfileData = response; // Access data directly from response

        // Map API data to ProfileData interface
        const mappedProfile: ProfileData = {
          id: apiProfileData.id,
          name: apiProfileData.nombre || 'Nombre Apellido',
          email: apiProfileData.email || 'email@ejemplo.com',
          height: apiProfileData.altura ? `${apiProfileData.altura}cm` : 'N/A',
          weight: apiProfileData.peso && apiProfileData.peso.length > 0 ? `${apiProfileData.peso[apiProfileData.peso.length - 1].valor}kg` : 'N/A',
          phone: apiProfileData.telefono || 'N/A',
          address: apiProfileData.direccion ? `${apiProfileData.direccion.calle} ${apiProfileData.direccion.numero}\n${apiProfileData.direccion.codigoPostal}, ${apiProfileData.direccion.ciudad}`.trim() || 'N/A' : 'N/A',
          birthDate: apiProfileData.fechaNacimiento ? new Date(apiProfileData.fechaNacimiento).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A',
          medicalConditions: apiProfileData.condicionesMedicas && apiProfileData.condicionesMedicas.length > 0 ? apiProfileData.condicionesMedicas.join(', ') : 'Ninguna',
          instagram: apiProfileData.redesSociales?.find((social: any) => social.nombre === 'Instagram')?.url || 'N/A',
          imc: '22.86', // Placeholder
          profileImageUrl: 'https://via.placeholder.com/112', // Placeholder
          // Map API fotosProgreso data to progressPhotos
          progressPhotos: apiProfileData.fotosProgreso && apiProfileData.fotosProgreso.length > 0
            ? apiProfileData.fotosProgreso.map((item: any) => ({
                date: item.fecha ? new Date(item.fecha).toLocaleDateString('es-ES') : 'N/A',
                url: item.url || 'https://via.placeholder.com/128x160',
                label: `Foto ${new Date(item.fecha).toLocaleDateString('es-ES')}`,
              }))
            : [], // Usar array vacío si fotosProgreso está vacío o es null/undefined
        };

        setProfile(mappedProfile);

        // Initialize editedInfo state with fetched data
        setEditedInfo({
          phone: apiProfileData.telefono !== undefined && apiProfileData.telefono !== null ? apiProfileData.telefono : '',
          address: apiProfileData.direccion ? `${apiProfileData.direccion.calle} ${apiProfileData.direccion.numero}\n${apiProfileData.direccion.codigoPostal}, ${apiProfileData.direccion.ciudad}`.trim() : '',
          birthDate: apiProfileData.fechaNacimiento ? new Date(apiProfileData.fechaNacimiento).toISOString().split('T')[0] : '', // Format date for input type="date"
          medicalConditions: apiProfileData.condicionesMedicas && apiProfileData.condicionesMedicas.length > 0 ? apiProfileData.condicionesMedicas.join(', ') : '',
        });

        // Initialize editedSocialMedia state with fetched data
        setEditedSocialMedia({
           instagram: apiProfileData.redesSociales?.find((social: any) => social.nombre === 'Instagram')?.url || '',
        });


      } catch (error) {
        console.error('Error fetching profile:', error);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleBack = () => {
    console.log('Navigate back');
  };

  const handleChangePhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Archivo seleccionado:', file);
      
      // Mostrar indicador de carga
      setIsLoading(true);
      
      // Llamar a la API para actualizar la foto de perfil
      dataApi.actualizarfotoperfil(file)
        .then(response => {
          console.log('Foto de perfil actualizada:', response);
          
          // Actualizar el estado del perfil con la nueva URL de la imagen
          if (profile) {
            setProfile({
              ...profile,
              profileImageUrl: response.fotoPerfilUrl // Usar la URL de fotoPerfilUrl de la respuesta
            });
          }
          
          // Opcional: Mostrar mensaje de éxito
          alert(response.mensaje || 'Foto de perfil actualizada con éxito');
        })
        .catch(error => {
          console.error('Error al actualizar la foto de perfil:', error);
          // Opcional: Mostrar mensaje de error
          alert('Error al actualizar la foto de perfil. Por favor, inténtalo de nuevo.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Function to handle "Editar" for Information
  const handleEditInformation = () => {
    setIsEditingInformation(true);
    if (profile) {
       setEditedInfo({
          phone: profile.phone !== 'N/A' ? profile.phone || '' : '',
          address: profile.address !== 'N/A' ? profile.address || '' : '',
          birthDate: profile.birthDate && profile.birthDate !== 'N/A' ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
          medicalConditions: profile.medicalConditions !== 'Ninguna' ? profile.medicalConditions || '' : '',
       });
    }
  };

  // Function to handle saving Information
  const handleSaveInformation = async () => {
    setIsLoading(true); // Optional: show loading while saving
    try {
      // TODO: Implement API call to update user information
      console.log('Saving information:', editedInfo);
      // Example: await dataApi.updateUserProfile(profile.id, { ...editedInfo, address: editedInfo.address.replace('\n', ', ') }); // Adjust address format for API if needed

      // After successful save, fetch updated profile data or update state directly
      // For now, just exit editing mode and potentially refetch
      setIsEditingInformation(false);
      // Consider refetching profile data to ensure consistency
      // fetchProfile(); // Uncomment this line to refetch after saving
    } catch (error) {
      console.error('Error saving profile information:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false); // Optional: hide loading
    }
  };

  // Function to handle canceling Information edit
  const handleCancelEditInformation = () => {
    setIsEditingInformation(false);
    // Reset editedInfo to original profile data
    if (profile) {
       setEditedInfo({
          phone: profile.phone !== 'N/A' ? profile.phone || '' : '',
          address: profile.address !== 'N/A' ? profile.address || '' : '',
          birthDate: profile.birthDate && profile.birthDate !== 'N/A' ? new Date(profile.birthDate).toISOString().split('T')[0] : '',
          medicalConditions: profile.medicalConditions !== 'Ninguna' ? profile.medicalConditions || '' : '',
       });
    }
  };


  // Function to handle "Editar" for Social Media
  const handleEditSocialMedia = () => {
    setIsEditingSocialMedia(true);
     if (profile) {
       setEditedSocialMedia({
          instagram: profile.instagram !== 'N/A' ? profile.instagram || '' : '',
       });
    }
  };

  // Function to handle saving Social Media
  const handleSaveSocialMedia = async () => {
     setIsLoading(true); // Optional: show loading while saving
    try {
      // TODO: Implement API call to update social media information
      console.log('Saving social media:', editedSocialMedia);
      // Example: await dataApi.updateUserSocialMedia(profile.id, editedSocialMedia);

      // After successful save, fetch updated profile data or update state directly
      setIsEditingSocialMedia(false);
      // Consider refetching profile data to ensure consistency
      // fetchProfile(); // Uncomment this line to refetch after saving
    } catch (error) {
      console.error('Error saving social media information:', error);
      // Handle error (e.g., show error message)
    } finally {
      setIsLoading(false); // Optional: hide loading
    }
  };

  // Function to handle canceling Social Media edit
  const handleCancelEditSocialMedia = () => {
    setIsEditingSocialMedia(false);
    // Reset editedSocialMedia to original profile data
    if (profile) {
       setEditedSocialMedia({
          instagram: profile.instagram !== 'N/A' ? profile.instagram || '' : '',
       });
    }
  };


  // Function to handle "Ver todo" for Progress
  const handleViewAllProgress = () => {
    console.log('View all progress photos');
  };

  // Function to handle "AÑADIR FOTO"
  const handleAddPhoto = () => {
    // console.log('Add progress photo'); // Eliminar este console.log
    newPhotoInputRef.current?.click(); // Simular clic en el input de archivo para nueva foto
  };
  const handleNewPhotoFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Nueva foto de progreso seleccionada:', file);
      
      // Mostrar indicador de carga
      setIsLoading(true);
      
      // Llamar a la API para enviar la foto de progreso
      dataApi.enviarfotoprogreso(file)
        .then(response => {
          console.log('Foto de progreso enviada:', response);
          
          // Crear una nueva entrada para la foto de progreso
          const newPhotoEntry = { 
            date: new Date().toLocaleDateString('es-ES'), 
            url: response.foto?.url || '', // Usar la URL correcta desde response.foto.url
            label: `Foto ${new Date().toLocaleDateString('es-ES')}` 
          };
          
          // Actualizar el estado del perfil con la nueva foto de progreso
          if (profile) {
            setProfile({
              ...profile,
              progressPhotos: [...(profile.progressPhotos || []), newPhotoEntry]
            });
          }
          
          // Opcional: Mostrar mensaje de éxito
          alert(response.mensaje || 'Foto de progreso añadida con éxito');
        })
        .catch(error => {
          console.error('Error al enviar la foto de progreso:', error);
          // Opcional: Mostrar mensaje de error
          alert('Error al enviar la foto de progreso. Por favor, inténtalo de nuevo.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto p-4 pb-20 bg-gray-50 min-h-screen"> {/* Eliminado max-w-xl para mayor ancho */}
      {/* Botón Back - Eliminado */}
      {/* <div className="mb-4">
        <button onClick={handleBack} className="flex items-center text-blue-500 hover:text-blue-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
      </div> */}

      {/* Header con estilo azul */}
      <div className="mb-6 bg-blue-500 p-4 rounded-lg text-white"> {/* Estilos de encabezado azul */}
        <h1 className="text-2xl font-bold">Perfil</h1> {/* Título simple */}
        {/* Puedes añadir una descripción aquí si lo deseas, como en Nutrition.tsx */}
        {/* <p className="text-blue-100">Gestiona tu información y progreso</p> */}
      </div>

      {/* Profile Summary con efectos mejorados */}
      <Card className="mb-8 text-center p-6 shadow-lg rounded-2xl border border-gray-100 bg-white">
        <div className="flex flex-col items-center">
          {/* Profile Picture con borde y efecto hover */}
          <div className="w-28 h-28 rounded-full overflow-hidden bg-gradient-to-r from-purple-400 to-blue-500 p-1 shadow-md mb-4 transform hover:scale-105 transition-all duration-300">
            <img
              src={profile?.profileImageUrl || "https://via.placeholder.com/112"} // Usar la URL del perfil si existe, si no, el placeholder
              alt="Profile"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{profile?.name || 'Nombre Apellido'}</h2>
          <p className="text-gray-500 text-sm mb-4">{profile?.email || 'email@ejemplo.com'}</p>
          {/* Input de archivo oculto */}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden" // Ocultar el input visualmente
            accept="image/*" // Aceptar solo archivos de imagen
            onChange={handleFileChange} // Manejar la selección del archivo
          />
          <button
            onClick={handleChangePhoto}
            className="text-blue-600 text-sm font-semibold py-1 px-3 rounded-full bg-blue-50 hover:bg-blue-100 transition-colors duration-300"
          >
            Cambiar foto de perfil
          </button>
        </div>

        {/* Height, Weight, IMC con diseño mejorado */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-around text-center">
          <div className="bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 w-1/3 mx-1">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Altura</p>
            <p className="font-semibold text-gray-800 text-lg">{profile?.height || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 w-1/3 mx-1">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Peso</p>
            <p className="font-semibold text-gray-800 text-lg">{profile?.weight || 'N/A'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 w-1/3 mx-1">
            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">IMC</p>
            <p className="font-semibold text-gray-800 text-lg">{profile?.imc || 'N/A'}</p>
          </div>
        </div>
      </Card>

      {/* Información Section con iconos y mejor diseño */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <User size={18} className="mr-2 text-purple-600" />
            Información
          </h2>
          {isEditingInformation ? (
            <div className="flex space-x-2">
              <button
                onClick={handleSaveInformation}
                className="text-green-600 text-sm font-semibold flex items-center bg-green-50 py-1 px-3 rounded-full hover:bg-green-100 transition-colors duration-300"
              >
                <Save size={14} className="mr-1" />
                Guardar
              </button>
              <button
                onClick={handleCancelEditInformation}
                className="text-red-600 text-sm font-semibold flex items-center bg-red-50 py-1 px-3 rounded-full hover:bg-red-100 transition-colors duration-300"
              >
                <XCircle size={14} className="mr-1" />
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditInformation}
              className="text-purple-600 text-sm font-semibold flex items-center bg-purple-50 py-1 px-3 rounded-full hover:bg-purple-100 transition-colors duration-300"
            >
              <Edit size={14} className="mr-1" />
              Editar
            </button>
          )}
        </div>
        <Card className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <div className="space-y-5 text-gray-700 p-1">
            {/* Teléfono */}
            <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-300">
              <Phone size={18} className="text-purple-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Teléfono</p>
                {isEditingInformation ? (
                  <input
                    type="text"
                    value={editedInfo.phone}
                    onChange={(e) => setEditedInfo({ ...editedInfo, phone: e.target.value })}
                    className="font-medium border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-medium">{profile?.phone || 'N/A'}</p>
                )}
              </div>
            </div>
            {/* Dirección */}
            <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-300">
              <MapPin size={18} className="text-purple-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Dirección</p>
                 {isEditingInformation ? (
                  <textarea
                    value={editedInfo.address}
                    onChange={(e) => setEditedInfo({ ...editedInfo, address: e.target.value })}
                    className="font-medium border rounded px-2 py-1 w-full h-20" // Adjust height as needed
                  />
                ) : (
                  <p className="font-medium whitespace-pre-wrap">{profile?.address || 'N/A'}</p>
                )}
              </div>
            </div>
            {/* Fecha de nacimiento */}
            <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-300">
              <CalendarIcon size={18} className="text-purple-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Fecha de nacimiento</p>
                 {isEditingInformation ? (
                  <input
                    type="date"
                    value={editedInfo.birthDate}
                    onChange={(e) => setEditedInfo({ ...editedInfo, birthDate: e.target.value })}
                    className="font-medium border rounded px-2 py-1 w-full"
                  />
                ) : (
                  <p className="font-medium">{profile?.birthDate || 'N/A'}</p>
                )}
              </div>
            </div>
            {/* Condiciones médicas */}
            <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-300">
              <Heart size={18} className="text-purple-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Condiciones médicas</p>
                 {isEditingInformation ? (
                  <textarea
                    value={editedInfo.medicalConditions}
                    onChange={(e) => setEditedInfo({ ...editedInfo, medicalConditions: e.target.value })}
                    className="font-medium border rounded px-2 py-1 w-full h-20" // Adjust height as needed
                  />
                ) : (
                  <p className="font-medium">{profile?.medicalConditions || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Redes Sociales Section con iconos y mejor diseño */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Instagram size={18} className="mr-2 text-purple-600" />
            Redes Sociales
          </h2>
          {isEditingSocialMedia ? (
             <div className="flex space-x-2">
              <button
                onClick={handleSaveSocialMedia}
                className="text-green-600 text-sm font-semibold flex items-center bg-green-50 py-1 px-3 rounded-full hover:bg-green-100 transition-colors duration-300"
              >
                <Save size={14} className="mr-1" />
                Guardar
              </button>
              <button
                onClick={handleCancelEditSocialMedia}
                className="text-red-600 text-sm font-semibold flex items-center bg-red-50 py-1 px-3 rounded-full hover:bg-red-100 transition-colors duration-300"
              >
                <XCircle size={14} className="mr-1" />
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={handleEditSocialMedia}
              className="text-purple-600 text-sm font-semibold flex items-center bg-purple-50 py-1 px-3 rounded-full hover:bg-purple-100 transition-colors duration-300"
            >
              <Edit size={14} className="mr-1" />
              Editar
            </button>
          )}
        </div>
        <Card className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          <div className="space-y-5 text-gray-700 p-1">
            <div className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-300">
              <Instagram size={18} className="text-pink-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Instagram</p>
                {isEditingSocialMedia ? (
                   <input
                    type="text"
                    value={editedSocialMedia.instagram}
                    onChange={(e) => setEditedSocialMedia({ ...editedSocialMedia, instagram: e.target.value })}
                    className="font-medium border rounded px-2 py-1 w-full text-pink-500"
                  />
                ) : (
                  <p className="font-medium text-pink-500">{profile?.instagram || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Section con diseño mejorado */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center">
            <Award size={18} className="mr-2 text-purple-600" />
            Tu progreso
          </h2>
          <button
            onClick={handleViewAllProgress}
            className="text-purple-600 text-sm font-semibold"
          >
            Ver todo
          </button>
        </div>
        <Card className="shadow-md rounded-xl overflow-hidden border border-gray-100">
          {profile?.progressPhotos && profile.progressPhotos.length > 0 ? (
            <div className="p-4">
              <div className="grid grid-cols-4 gap-2">
                {profile.progressPhotos.slice(0, 4).map((photo, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-gray-500 mb-1">{photo.date}</div>
                    <img 
                      src={photo.url} 
                      alt={`Foto ${photo.date}`} 
                      className="w-full h-32 object-cover rounded-lg shadow-sm"
                      onError={(e) => {
                        console.error(`Error loading image: ${photo.url}`);
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128x160';
                      }}
                    />
                    <div className="text-xs text-center mt-1">{photo.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  onClick={handleAddPhoto}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
                >
                  AÑADIR FOTO
                </Button>
                {/* Input de archivo oculto para nueva foto de progreso */}
                <input
                  type="file"
                  ref={newPhotoInputRef}
                  className="hidden" // Ocultar el input visualmente
                  accept="image/*" // Aceptar solo archivos de imagen
                  onChange={handleNewPhotoFileChange} // Manejar la selección del archivo
                />
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-gray-500 mb-4">No hay fotos de progreso todavía.</p>
              <Button
                onClick={handleAddPhoto}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-full shadow-md hover:shadow-lg transition-all duration-300"
              >
                AÑADIR FOTO
              </Button>
              {/* Input de archivo oculto para nueva foto de progreso */}
              <input
                type="file"
                ref={newPhotoInputRef}
                className="hidden" // Ocultar el input visualmente
                accept="image/*" // Aceptar solo archivos de imagen
                onChange={handleNewPhotoFileChange} // Manejar la selección del archivo
              />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Profile;


// Function to handle "AÑADIR FOTO" - Triggers new photo file input click