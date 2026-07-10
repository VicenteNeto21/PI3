import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import logoSiti from '../../../assets/logo-siti.svg';
import { maskCPF, maskDate, maskPhone } from '../../utils/masks';
import './CadastroAluno.css';

export const CadastroAluno = () => {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  // Estados dos campos de cadastro
  const [formNome, setFormNome] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formNascimento, setFormNascimento] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formRua, setFormRua] = useState('');
  const [formDeficiencias, setFormDeficiencias] = useState('');
  const [formNumero, setFormNumero] = useState('');
  const [formComplemento, setFormComplemento] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formSenha, setFormSenha] = useState('');
  const [formConfirmaSenha, setFormConfirmaSenha] = useState('');
  const [formInstituicao, setFormInstituicao] = useState('');
  const [formCurso, setFormCurso] = useState('');
  const [formDias, setFormDias] = useState('');
  const [formHorarios, setFormHorarios] = useState('');
  const [formAnexo1, setFormAnexo1] = useState('');
  const [formAnexo2, setFormAnexo2] = useState('');

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formEmail || !formSenha) {
      setApiError('E-mail e senha são obrigatórios.');
      return;
    }
    if (formSenha !== formConfirmaSenha) {
      setApiError('As senhas não coincidem!');
      return;
    }
    if (formSenha.length < 8) {
      setApiError('A senha deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      const { httpClient } = await import('../../../data/api/httpClient');
      await httpClient.post('/users/register', {
        email: formEmail,
        password: formSenha,
        identifierDocument: formCpf.replace(/\D/g, '') || '00000000000',
      });
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-aluno-container">
      <div className="form-passenger-wrapper">
        {/* Banner Roxo com Corte Diagonal idêntico ao de adm/passageiros */}
        <div className="custom-figma-header-container">
          <div className="banner-siti-cut-purple">
            <img 
              src={logoSiti} 
              alt="SITI Logo" 
              className="ms-4" 
              style={{ height: '44px', cursor: 'pointer' }} 
              onClick={() => navigate('/')} 
              title="Clique na logo para voltar ao Login" 
            />
          </div>
          <div className="header-title-notch">
            <h3 className="page-sub-title-figma">
              Formulário de Cadastro
            </h3>
          </div>
        </div>

        <div className="px-0 py-1">
          {submitted ? (
            <div className="bg-white p-5 rounded-4 border text-center my-5 shadow-sm mx-auto" style={{ maxWidth: '600px', borderColor: '#E2E2E2' }}>
              <div className="text-success mb-3" style={{ fontSize: '3.5rem' }}>
                <FontAwesomeIcon icon={faCheckCircle} />
              </div>
              <h3 className="fw-bold text-dark mb-3">Cadastro Enviado com Sucesso!</h3>
              <p className="text-muted mb-4" style={{ lineHeight: '1.6' }}>
                Suas informações foram enviadas para análise da coordenação de transporte universitário (SITI). Assim que sua matrícula for aprovada, você receberá a confirmação no seu e-mail cadastrado.
              </p>
              <button 
                type="button" 
                onClick={() => navigate('/')} 
                className="btn-aprovar-figma px-5"
              >
                Voltar para a Tela de Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* 1. Informações Pessoais */}
              <div className="section-card-figma">
                <span className="section-title-figma">Informações Pessoais</span>
                <div className="row g-3">
                  <div className="col-md-4">
                    <label className="label-passenger-figma">Nome Completo *</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Ana Paula Rodrigues" value={formNome} onChange={(e) => setFormNome(e.target.value)} required />
                  </div>
                  <div className="col-md-4">
                    <label className="label-passenger-figma">CPF *</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: 111.222.333-44" value={formCpf} onChange={(e) => setFormCpf(maskCPF(e.target.value))} required />
                  </div>
                  <div className="col-md-4">
                    <label className="label-passenger-figma">Data de Nascimento</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: 15/03/2004" value={formNascimento} onChange={(e) => setFormNascimento(maskDate(e.target.value))} />
                  </div>
                  <div className="col-md-4">
                    <label className="label-passenger-figma">Bairro</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Centro" value={formBairro} onChange={(e) => setFormBairro(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="label-passenger-figma">Rua</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Rua Principal" value={formRua} onChange={(e) => setFormRua(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="label-passenger-figma">Deficiências Físicas</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Nenhuma" value={formDeficiencias} onChange={(e) => setFormDeficiencias(e.target.value)} />
                  </div>
                  <div className="col-md-4">
                    <label className="label-passenger-figma">Número</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: 123" value={formNumero} onChange={(e) => setFormNumero(e.target.value)} />
                  </div>
                  <div className="col-md-8">
                    <label className="label-passenger-figma">Complemento</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Apto 201" value={formComplemento} onChange={(e) => setFormComplemento(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 2. Informações de Contato */}
              <div className="section-card-figma">
                <span className="section-title-figma">Informações de Contato</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="label-passenger-figma">E-mail</label>
                    <input type="email" className="input-passenger-figma" placeholder="Ex: aluno@estudante.ufc.br" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Telefone</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: (85) 99999-9999" value={formTelefone} onChange={(e) => setFormTelefone(maskPhone(e.target.value))} />
                  </div>
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Criar Senha</label>
                    <input type="password" className="input-passenger-figma" placeholder="••••••••" value={formSenha} onChange={(e) => setFormSenha(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Digite Novamente Sua Senha</label>
                    <input type="password" className="input-passenger-figma" placeholder="••••••••" value={formConfirmaSenha} onChange={(e) => setFormConfirmaSenha(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 3. Informações Acadêmicas */}
              <div className="section-card-figma">
                <span className="section-title-figma">Informações Acadêmicas</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Instituição</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: UFC / IFCE" value={formInstituicao} onChange={(e) => setFormInstituicao(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Curso</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Engenharia / Direito" value={formCurso} onChange={(e) => setFormCurso(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 4. Informações de Utilização do Transporte */}
              <div className="section-card-figma">
                <span className="section-title-figma">Informações de Utilização do Transporte</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Dias da Semana</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: Segunda a Sexta" value={formDias} onChange={(e) => setFormDias(e.target.value)} />
                  </div>
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Horários</label>
                    <input type="text" className="input-passenger-figma" placeholder="Ex: 07:00 - 13:00" value={formHorarios} onChange={(e) => setFormHorarios(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* 5. Anexos (.pdf) */}
              <div className="section-card-figma mb-4">
                <span className="section-title-figma">Anexos (.pdf)</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Comprovante de Identidade (RG, CIN, CNH...)</label>
                    <div className="file-box-figma">
                      <span className="text-truncate me-2">{formAnexo1 || 'Nenhum arquivo selecionado'}</span>
                      <label className="btn btn-sm btn-outline-primary m-0 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                        Fazer Upload
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.png" 
                          style={{ display: 'none' }} 
                          onChange={(e) => setFormAnexo1(e.target.files[0]?.name || '')} 
                        />
                      </label>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Comprovante de Vínculo com a Instituição (declaração de matrícula...)</label>
                    <div className="file-box-figma">
                      <span className="text-truncate me-2">{formAnexo2 || 'Nenhum arquivo selecionado'}</span>
                      <label className="btn btn-sm btn-outline-primary m-0 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                        Fazer Upload
                        <input 
                          type="file" 
                          accept=".pdf,.jpg,.png" 
                          style={{ display: 'none' }} 
                          onChange={(e) => setFormAnexo2(e.target.files[0]?.name || '')} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra Inferior com aviso e botões */}
              {apiError && (
                <div className="alert alert-danger py-2 mb-3" role="alert">
                  {apiError}
                </div>
              )}
              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
                <span className="text-mandatory-figma">O preenchimento de todas as informações é obrigatório!</span>
                <div className="d-flex gap-2 ms-auto">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={() => navigate('/')} disabled={loading}>
                    Cancelar / Voltar
                  </button>
                  <button type="submit" className="btn-aprovar-figma" disabled={loading}>
                    {loading ? 'Enviando...' : 'Solicitar Acesso'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
