import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PerfilRepository } from '../../data/repositories/PerfilRepository';
import { GetPerfilUseCase } from '../../domain/usecases/GetPerfilUseCase';
import { UpdatePerfilUseCase } from '../../domain/usecases/UpdatePerfilUseCase';
import { STORAGE_KEY, storage } from '../../data/api/httpClient';
import { logger } from '../../utils/logger';

const perfilRepository = new PerfilRepository();
const getPerfilUseCase = new GetPerfilUseCase(perfilRepository);
const updatePerfilUseCase = new UpdatePerfilUseCase(perfilRepository);

export const usePerfil = () => {
  const navigate = useNavigate();

  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    role: '',
    roleCode: '',
    status: '',
    avatarUrl: null,
    phone: null,
    registration: null,
    institution: null,
    cnh: null,
    category: null,
    birthDate: null,
    validity: null,
    adminId: null,
    settings: {
      notifications: true,
      whatsappAlerts: true,
      autoReport: false,
    }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const data = await getPerfilUseCase.execute();
        if (isMounted) {
          setUserProfile(data);
          setFormData(data);
        }
      } catch (err) {
        logger.error('PERFIL', 'Erro ao carregar perfil no hook:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => { isMounted = false; };
  }, []);

  const handleStartEdit = () => {
    setFormData({ ...userProfile });
    setIsEditing(true);
    setSaveSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleToggleSetting = (settingKey) => {
    setUserProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [settingKey]: !prev.settings[settingKey]
      }
    }));
  };

  const handleSave = async (e) => {
    e?.preventDefault();
    setSaving(true);
    logger.info('PERFIL', '🔄 Salvando alterações do perfil no banco de dados da API...');
    try {
      const updatedProfile = await updatePerfilUseCase.execute(formData);
      setUserProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true);

      logger.success('PERFIL', '✅ Dados atualizados no banco da API com sucesso!', updatedProfile);

      // Atualiza o storage local se nome ou e-mail tiverem sido editados
      try {
        const stored = storage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.nome = updatedProfile.name;
          parsed.name = updatedProfile.name;
          parsed.email = updatedProfile.email;
          storage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        }
      } catch (err) {
        logger.error('PERFIL', 'Erro ao atualizar dados na sessão local:', err);
      }

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (error) {
      logger.error('PERFIL', '❌ Erro ao atualizar perfil no banco de dados:', error);
      alert('Não foi possível salvar as alterações no servidor. Verifique os logs.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logger.auth('LOGOUT', '🚪 Realizando logout na tela de perfil...');
    storage.removeItem(STORAGE_KEY);
    navigate('/');
  };

  return {
    userProfile,
    loading,
    saving,
    isEditing,
    formData,
    saveSuccess,
    handleStartEdit,
    handleCancelEdit,
    handleChange,
    handleToggleSetting,
    handleSave,
    handleLogout
  };
};
