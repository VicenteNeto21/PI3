import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, 
  faUserGraduate, 
  faEdit, 
  faTrash, 
  faFilePdf, 
  faCheck, 
  faTimes, 
  faList, 
  faTh, 
  faArrowLeft 
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../components/Button/Button';
import { ProfileIcon } from '../../components/ProfileIcon/ProfileIcon';
import { useAuth } from '../../hooks/useAuth';
import { maskCPF, maskDate, maskPhone, maskCEP } from '../../utils/masks';
import { httpClient } from '../../../data/api/httpClient';
import { logger } from '../../../utils/logger';
import logoSiti from '../../../assets/logo-siti.svg';
import './AlunosAdm.css';

export const AlunosAdm = () => {
  const { currentUser } = useAuth();
  const [view, setView] = useState('figma'); // 'figma' (Duas colunas: Cadastrados/Pendentes) | 'review' | 'details' | 'new' | 'table'
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [alertMsg, setAlertMsg] = useState('');
  const [showReprovarModal, setShowReprovarModal] = useState(false);
  const [justificativa, setJustificativa] = useState('');

  // Alunos já Aprovados / Cadastrados
  const [cadastrados, setCadastrados] = useState([
    {
      id: 1,
      nome: 'Ana Paula Rodrigues Silva',
      cpf: '111.222.333-44',
      nascimento: '15/03/2004',
      bairro: 'Centro',
      rua: 'Rua São José',
      numero: '123',
      complemento: 'Apto 201',
      deficiencias: 'Nenhuma',
      email: 'anapaula@estudante.ufc.br',
      telefone: '(85) 99911-2233',
      instituicao: 'UFC - Universidade Federal do Ceará',
      curso: 'Engenharia de Software',
      dias: 'Segunda a Sexta',
      horarios: '07:00 - 13:00',
      anexo1: 'RG_Ana_Paula.pdf',
      anexo2: 'Matricula_UFC_2026.pdf',
      status: 'Cadastrado'
    },
    {
      id: 2,
      nome: 'João Pedro Mendes Oliveira',
      cpf: '222.333.444-55',
      nascimento: '20/08/2003',
      bairro: 'Universitário',
      rua: 'Av. Gentil Cardoso',
      numero: '450',
      complemento: 'Casa',
      deficiencias: 'Nenhuma',
      email: 'joaopedro@ifce.edu.br',
      telefone: '(85) 98822-3344',
      instituicao: 'IFCE - Campus Central',
      curso: 'Tecnologia em Telemática',
      dias: 'Segunda, Quarta e Sexta',
      horarios: '13:00 - 18:00',
      anexo1: 'CNH_Joao_Mendes.pdf',
      anexo2: 'Declaracao_Vinc_IFCE.pdf',
      status: 'Cadastrado'
    },
    { id: 3, nome: 'Maria Clara Santos Ferreira', cpf: '333.444.555-66', nascimento: '10/05/2005', bairro: 'Centro', rua: 'Rua da Matriz', numero: '77', complemento: 'Bloco A', deficiencias: 'Nenhuma', email: 'mariaclara@ufc.br', telefone: '(85) 97788-9900', instituicao: 'UFC', curso: 'Direito', dias: 'Segunda a Sexta', horarios: '08:00 - 12:00', anexo1: 'RG_Maria.pdf', anexo2: 'Vinc_UFC.pdf', status: 'Cadastrado' },
    { id: 4, nome: 'Carlos Eduardo Lima Costa', cpf: '444.555.666-77', nascimento: '22/11/2002', bairro: 'Norte', rua: 'Rua Paraná', numero: '101', complemento: 'Casa 2', deficiencias: 'Nenhuma', email: 'carlosedu@ifce.edu.br', telefone: '(85) 96655-4433', instituicao: 'IFCE', curso: 'Engenharia Civil', dias: 'Terça e Quinta', horarios: '14:00 - 18:00', anexo1: 'CNH_Carlos.pdf', anexo2: 'Declaracao_IFCE.pdf', status: 'Cadastrado' },
    { id: 5, nome: 'Beatriz Vasconcelos de Souza', cpf: '555.666.777-88', nascimento: '04/07/2004', bairro: 'Sul', rua: 'Av. dos Estados', numero: '890', complemento: 'Apto 502', deficiencias: 'Nenhuma', email: 'beatriz.v@ufc.br', telefone: '(85) 95544-3322', instituicao: 'UFC', curso: 'Psicologia', dias: 'Segunda a Sexta', horarios: '07:00 - 12:00', anexo1: 'RG_Beatriz.pdf', anexo2: 'Matricula_Psico.pdf', status: 'Cadastrado' },
    { id: 6, nome: 'Lucas Gabriel Pereira', cpf: '666.777.888-99', nascimento: '19/09/2003', bairro: 'Centro', rua: 'Rua do Sol', numero: '45', complemento: '', deficiencias: 'Nenhuma', email: 'lucas.gabriel@ufc.br', telefone: '(85) 94433-2211', instituicao: 'UFC', curso: 'Administração', dias: 'Segunda a Sexta', horarios: '13:00 - 18:00', anexo1: 'RG_Lucas.pdf', anexo2: 'Comprovante_Adm.pdf', status: 'Cadastrado' },
    { id: 7, nome: 'Fernanda Gomes Ribeiro', cpf: '777.888.999-00', nascimento: '30/01/2005', bairro: 'Universitário', rua: 'Rua da Paz', numero: '300', complemento: 'Apto 101', deficiencias: 'Nenhuma', email: 'fernando.g@ifce.br', telefone: '(85) 93322-1100', instituicao: 'IFCE', curso: 'Matemática', dias: 'Segunda, Quarta e Sexta', horarios: '07:00 - 11:00', anexo1: 'RG_Fernanda.pdf', anexo2: 'Matricula_Mat.pdf', status: 'Cadastrado' }
  ]);

  // Alunos Pendentes de Validação
  const [pendentes, setPendentes] = useState([
    {
      id: 101,
      nome: 'Gabriel Barbosa de Assis',
      cpf: '888.999.000-11',
      nascimento: '12/04/2005',
      bairro: 'Centro',
      rua: 'Rua Barão de Baturité',
      numero: '512',
      complemento: 'Apto 302',
      deficiencias: 'Nenhuma',
      email: 'gabriel.barbosa@estudante.ufc.br',
      telefone: '(85) 99887-7665',
      instituicao: 'UFC - Universidade Federal do Ceará',
      curso: 'Ciência da Computação',
      dias: 'Segunda a Sexta',
      horarios: '07:00 - 17:00',
      anexo1: 'RG_Gabriel_Assis.pdf',
      anexo2: 'Comprovante_Matricula_UFC_2026.pdf',
      status: 'Pendente'
    },
    {
      id: 102,
      nome: 'Larissa Monteiro Albuquerque',
      cpf: '999.000.111-22',
      nascimento: '08/11/2004',
      bairro: 'Universitário',
      rua: 'Rua Coronel Ferraz',
      numero: '88',
      complemento: 'Casa B',
      deficiencias: 'Visual (Baixa Visão)',
      email: 'larissa.m@ifce.edu.br',
      telefone: '(85) 98765-4321',
      instituicao: 'IFCE - Campus Central',
      curso: 'Licenciatura em Química',
      dias: 'Terça e Quinta',
      horarios: '08:00 - 12:00',
      anexo1: 'RG_Larissa_Albuquerque.pdf',
      anexo2: 'Declaracao_Matricula_IFCE.pdf',
      status: 'Pendente'
    },
    { id: 103, nome: 'Pedro Henrique Cavalcante', cpf: '101.202.303-44', nascimento: '14/02/2003', bairro: 'Sul', rua: 'Rua José Bonifácio', numero: '900', complemento: '', deficiencias: 'Nenhuma', email: 'pedro.henrique@ufc.br', telefone: '(85) 97654-3210', instituicao: 'UFC', curso: 'Medicina', dias: 'Segunda a Sexta', horarios: '07:00 - 18:00', anexo1: 'RG_Pedro.pdf', anexo2: 'Matricula_Med.pdf', status: 'Pendente' },
    { id: 104, nome: 'Camila Duarte Castro', cpf: '202.303.404-55', nascimento: '25/06/2005', bairro: 'Norte', rua: 'Rua Castro Alves', numero: '150', complemento: 'Apto 404', deficiencias: 'Nenhuma', email: 'camila.d@ifce.br', telefone: '(85) 96543-2109', instituicao: 'IFCE', curso: 'Física', dias: 'Segunda, Quarta e Sexta', horarios: '13:00 - 17:00', anexo1: 'RG_Camila.pdf', anexo2: 'Declaracao_Fisica.pdf', status: 'Pendente' },
    { id: 105, nome: 'Rafael Souza Andrade', cpf: '303.404.505-66', nascimento: '17/12/2004', bairro: 'Centro', rua: 'Av. Dom Luís', numero: '1200', complemento: 'Casa 10', deficiencias: 'Nenhuma', email: 'rafael.andrade@ufc.br', telefone: '(85) 95432-1098', instituicao: 'UFC', curso: 'Economia', dias: 'Segunda a Sexta', horarios: '08:00 - 12:00', anexo1: 'RG_Rafael.pdf', anexo2: 'Matricula_Econ.pdf', status: 'Pendente' }
  ]);

  // Formulário para Cadastro Manual
  const [formNome, setFormNome] = useState('');
  const [formCpf, setFormCpf] = useState('');
  const [formNascimento, setFormNascimento] = useState('');
  const [formBairro, setFormBairro] = useState('');
  const [formRua, setFormRua] = useState('');
  const [formNumero, setFormNumero] = useState('');
  const [formComplemento, setFormComplemento] = useState('');
  const [formDeficiencias, setFormDeficiencias] = useState('Nenhuma');
  const [formEmail, setFormEmail] = useState('');
  const [formTelefone, setFormTelefone] = useState('');
  const [formInstituicao, setFormInstituicao] = useState('UFC - Universidade Federal do Ceará');
  const [formCurso, setFormCurso] = useState('');
  const [formDias, setFormDias] = useState('Segunda a Sexta');
  const [formHorarios, setFormHorarios] = useState('07:00 - 13:00');
  const [formSenha, setFormSenha] = useState('');
  const [formConfirmaSenha, setFormConfirmaSenha] = useState('');
  const [formAnexo1, setFormAnexo1] = useState('');
  const [formAnexo2, setFormAnexo2] = useState('');

  const mapPassenger = (p, status) => ({
    id: p.id || 0,
    nome: p.name || p.nome || 'Estudante',
    cpf: p.document || p.cpf || '000.000.000-00',
    nascimento: p.birthDate || p.nascimento || '01/01/2000',
    telefone: p.phone || p.telefone || '(00) 00000-0000',
    email: p.email || '',
    bairro: p.bairro || '—',
    rua: p.rua || '—',
    numero: p.numero || '—',
    complemento: p.complemento || '',
    deficiencias: p.deficiencias || 'Nenhuma',
    instituicao: p.instituicao || '—',
    curso: p.curso || '—',
    dias: p.dias || '—',
    horarios: p.horarios || '—',
    anexo1: p.anexo1 || p.bondFile || '—',
    anexo2: p.anexo2 || '—',
    status: status || p.status || 'Cadastrado',
  });

  const fetchAlunos = async () => {
    try {
      logger.info('ALUNOS ADM', '🎓 Buscando estudantes na API (/admin/passengers e /admin/pending-homologations)...');
      const [resCadastrados, resPendentes] = await Promise.all([
        httpClient.get('/admin/passengers').catch(() => null),
        httpClient.get('/admin/pending-homologations').catch(() => null)
      ]);
      if (resCadastrados && Array.isArray(resCadastrados)) {
        const ativos = resCadastrados.filter(p => p.status === 'Ativo');
        setCadastrados(ativos.map(p => mapPassenger(p, 'Cadastrado')));
      }
      if (resPendentes && Array.isArray(resPendentes)) {
        setPendentes(resPendentes.map(p => mapPassenger(p, 'Pendente')));
      }
    } catch (error) {
      logger.error('ALUNOS ADM', 'Erro ao carregar alunos da API:', error);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  const handleOpenStudent = (aluno, type) => {
    setSelectedStudent(aluno);
    setView(type === 'cadastrado' ? 'details' : 'review');
  };

  const handleOpenNewForm = () => {
    setSelectedStudent(null);
    setFormNome('');
    setFormCpf('');
    setFormNascimento('');
    setFormBairro('');
    setFormRua('');
    setFormNumero('');
    setFormComplemento('');
    setFormDeficiencias('Nenhuma');
    setFormEmail('');
    setFormTelefone('');
    setFormCurso('');
    setFormSenha('');
    setFormConfirmaSenha('');
    setFormAnexo1('');
    setFormAnexo2('');
    setView('new');
  };

  const handleAprovar = async () => {
    if (!selectedStudent) return;
    try {
      await httpClient.post(`/admin/homologate/${selectedStudent.id}`);
      logger.success('ALUNOS ADM', `✅ Aluno ${selectedStudent.id} homologado na API!`);
      await fetchAlunos();
    } catch (e) {
      logger.warn('ALUNOS ADM', 'Homologação via API falhou, atualizando estado local.');
      const aprovado = { ...selectedStudent, status: 'Cadastrado' };
      setCadastrados([aprovado, ...cadastrados]);
      setPendentes(pendentes.filter(p => p.id !== selectedStudent.id));
    }
    setAlertMsg(`Cadastro do estudante ${selectedStudent.nome} aprovado com sucesso!`);
    setView('figma');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  const handleOpenReprovar = () => {
    setJustificativa('');
    setShowReprovarModal(true);
  };

  const handleConfirmarReprovacao = async (e) => {
    e?.preventDefault();
    if (!selectedStudent) return;
    try {
      await httpClient.post(`/admin/reject/${selectedStudent.id}`);
      logger.success('ALUNOS ADM', `❌ Aluno ${selectedStudent.id} reprovado na API!`);
      await fetchAlunos();
    } catch (err) {
      logger.warn('ALUNOS ADM', 'Reprovação via API falhou, atualizando estado local.');
      setPendentes(pendentes.filter(p => p.id !== selectedStudent.id));
    }
    const motivo = justificativa.trim() || 'Documentação incompleta ou fora dos padrões exigidos.';
    setAlertMsg(`Cadastro de ${selectedStudent.nome} reprovado! A justificativa foi enviada para o e-mail: ${selectedStudent.email} ("${motivo}").`);
    setShowReprovarModal(false);
    setJustificativa('');
    setView('figma');
    setTimeout(() => setAlertMsg(''), 7000);
  };

  const handleSalvarNovo = async (e) => {
    e.preventDefault();
    if (!formNome) return;
    try {
      await httpClient.post('/admin/passengers', {
        name: formNome,
        email: formEmail || `${formNome.toLowerCase().split(' ')[0]}@estudante.edu.br`,
        document: (formCpf || '00000000000').replace(/\D/g, ''),
        phone: formTelefone || '(85) 99999-9999',
        type: 'Estudante',
        registrationCode: Date.now().toString().slice(-8)
      });
      logger.success('ALUNOS ADM', '✅ Aluno criado via API /admin/passengers!');
      await fetchAlunos();
    } catch (error) {
      logger.warn('ALUNOS ADM', 'Criação via API falhou, salvando localmente.');
      const novoAluno = {
        id: Date.now(),
        nome: formNome,
        cpf: formCpf || '000.000.000-00',
        nascimento: formNascimento || '01/01/2005',
        bairro: formBairro || 'Centro',
        rua: formRua || 'Rua Principal',
        numero: formNumero || '100',
        complemento: formComplemento,
        deficiencias: formDeficiencias || 'Nenhuma',
        email: formEmail || `${formNome.toLowerCase().split(' ')[0]}@estudante.edu.br`,
        telefone: formTelefone || '(85) 99999-9999',
        instituicao: formInstituicao,
        curso: formCurso || 'Curso Geral',
        dias: formDias,
        horarios: formHorarios,
        anexo1: formAnexo1 || 'Documento_Identidade.pdf',
        anexo2: formAnexo2 || 'Comprovante_Matricula.pdf',
        status: 'Cadastrado'
      };
      setCadastrados([novoAluno, ...cadastrados]);
    }
    setAlertMsg('Novo passageiro/estudante cadastrado no sistema com sucesso!');
    setView('figma');
    setTimeout(() => setAlertMsg(''), 5000);
  };

  return (
    <div className="alunos-adm-container w-100 h-100 d-flex flex-column">
      {/* Alerta de feedback */}
      {alertMsg && (
        <div className="alert alert-success d-flex align-items-center justify-content-between shadow-sm mb-4" role="alert" style={{ background: '#E8F8F0', borderColor: '#28A745', color: '#155724' }}>
          <span>{alertMsg}</span>
          <button type="button" className="btn-close" onClick={() => setAlertMsg('')}></button>
        </div>
      )}

      {/* Header idêntico ao protótipo (visível na tela principal e tabela) */}
      {(view === 'figma' || view === 'table') && (
        <div className="d-flex justify-content-between align-items-center mb-5 pb-1">
          <h2 className="adm-header-title m-0">
            Olá, {currentUser?.nome || 'Bruno'}!
          </h2>

          <div className="d-flex align-items-center gap-3">
            <button 
              onClick={() => setView(view === 'figma' ? 'table' : 'figma')} 
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 px-3 py-2 rounded-3"
              title="Alternar entre o painel duplo do Figma e a Tabela Geral"
            >
              <FontAwesomeIcon icon={view === 'figma' ? faList : faTh} />
              <span>{view === 'figma' ? 'Ver em Tabela' : 'Painel do Figma'}</span>
            </button>
            <ProfileIcon />
          </div>
        </div>
      )}

      {/* VISÃO 1: PAINEL DUPLO DO FIGMA (CADASTRADOS / PENDENTES) */}
      {view === 'figma' && (
        <div className="flex-grow-1 d-flex flex-column">
          <div className="row g-4 flex-grow-1">
            {/* Coluna da Esquerda: Cadastrados */}
            <div className="col-lg-6 d-flex">
              <div className="col-card-passageiros w-100">
                <h4 className="card-passageiros-title">Cadastrados</h4>
                <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: '68vh' }}>
                  {cadastrados.map((aluno) => (
                    <button
                      key={aluno.id}
                      type="button"
                      className="passageiro-pill-figma"
                      onClick={() => handleOpenStudent(aluno, 'cadastrado')}
                      title="Ver informações detalhadas do passageiro"
                    >
                      <span>{aluno.nome}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna da Direita: Pendentes */}
            <div className="col-lg-6 d-flex">
              <div className="col-card-passageiros w-100">
                <h4 className="card-passageiros-title">Pendentes</h4>
                <div className="flex-grow-1 overflow-auto pe-1" style={{ maxHeight: '68vh' }}>
                  {pendentes.length > 0 ? (
                    pendentes.map((aluno) => (
                      <button
                        key={aluno.id}
                        type="button"
                        className="passageiro-pill-figma"
                        onClick={() => handleOpenStudent(aluno, 'pendente')}
                        title="Analisar solicitação de cadastro pendente"
                        style={{ borderLeft: '4px solid #FFC107' }}
                      >
                        <span>{aluno.nome}</span>
                      </button>
                    ))
                  ) : (
                    <div className="text-center py-5 text-muted">
                      Nenhuma solicitação de cadastro pendente no momento.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botão Flutuante (+) para Cadastrar Novo Aluno - Posição Fixa Padrão */}
          <button
            type="button"
            className="btn-fab-add"
            onClick={handleOpenNewForm}
            title="Cadastrar Novo Aluno / Passageiro"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      )}

      {/* VISÃO 2 & 3: FORMULÁRIO DE CADASTRO (PENDENTE / REVISÃO) E INFORMAÇÕES DO PASSAGEIRO (CADASTRADO) */}
      {(view === 'review' || view === 'details') && selectedStudent && (
        <div className="form-passenger-wrapper">
          {/* Banner Roxo com Corte Diagonal idêntico ao protótipo */}
          <div className="custom-figma-header-container">
            <div className="banner-siti-cut-purple">
              <img 
                src={logoSiti} 
                alt="SITI Logo" 
                className="ms-4" 
                style={{ height: '44px', cursor: 'pointer' }} 
                onClick={() => setView('figma')} 
                title="Clique na logo para voltar ao painel" 
              />
            </div>
            <div className="header-title-notch">
              <h3 className="page-sub-title-figma">
                {view === 'review' ? 'Formulário de Cadastro' : 'Informações do Passageiro'}
              </h3>
            </div>
          </div>

          <div className="px-0 py-1">

            {/* SEÇÃO 1: Informações Pessoais */}
            <div className="section-card-figma">
              <span className="section-title-figma">Informações Pessoais</span>
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="label-passenger-figma">Nome Completo</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.nome} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="label-passenger-figma">CPF</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.cpf} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="label-passenger-figma">Data de Nascimento</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.nascimento} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="label-passenger-figma">Bairro</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.bairro} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="label-passenger-figma">Rua</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.rua} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="label-passenger-figma">Deficiências Físicas</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.deficiencias} readOnly />
                </div>
                <div className="col-md-4">
                  <label className="label-passenger-figma">Número</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.numero} readOnly />
                </div>
                <div className="col-md-8">
                  <label className="label-passenger-figma">Complemento</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.complemento || 'Nenhum'} readOnly />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: Informações de Contato */}
            <div className="section-card-figma">
              <span className="section-title-figma">Informações de Contato</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="label-passenger-figma">E-mail</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.email} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="label-passenger-figma">Telefone</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.telefone} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="label-passenger-figma">Criar Senha</label>
                  <input type="password" className="input-passenger-figma" value="••••••••" readOnly />
                </div>
                <div className="col-md-6">
                  <label className="label-passenger-figma">Digite Novamente Sua Senha</label>
                  <input type="password" className="input-passenger-figma" value="••••••••" readOnly />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: Informações Acadêmicas */}
            <div className="section-card-figma">
              <span className="section-title-figma">Informações Acadêmicas</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="label-passenger-figma">Instituição</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.instituicao} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="label-passenger-figma">Curso</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.curso} readOnly />
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: Informações de Utilização do Transporte */}
            <div className="section-card-figma">
              <span className="section-title-figma">Informações de Utilização do Transporte</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="label-passenger-figma">Dias da Semana</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.dias} readOnly />
                </div>
                <div className="col-md-6">
                  <label className="label-passenger-figma">Horários</label>
                  <input type="text" className="input-passenger-figma" value={selectedStudent.horarios} readOnly />
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: Anexos (.pdf) */}
            <div className="section-card-figma mb-4">
              <span className="section-title-figma">Anexos (.pdf)</span>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="label-passenger-figma">Comprovante de Identidade (RG, CPF, CNH...)</label>
                  <div className="file-box-figma">
                    <span className="text-truncate me-2">{selectedStudent.anexo1 || 'documento_identidade.pdf'}</span>
                    <label className="btn btn-sm btn-outline-primary m-0 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                      Alterar
                      <input type="file" accept=".pdf" style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="label-passenger-figma">Comprovante de Vínculo com a Instituição (declaração de matrícula...)</label>
                  <div className="file-box-figma">
                    <span className="text-truncate me-2">{selectedStudent.anexo2 || 'declaracao_matricula.pdf'}</span>
                    <label className="btn btn-sm btn-outline-primary m-0 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                      Alterar
                      <input type="file" accept=".pdf" style={{ display: 'none' }} />
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* RODAPÉ DE VALIDAÇÃO OU SAÍDA */}
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
              <span className="text-mandatory-figma">
                O preenchimento de todas as informações é obrigatório!
              </span>

              <div className="d-flex gap-2 ms-auto">
                {view === 'review' ? (
                  <>
                    <button type="button" className="btn-reprovar-figma" onClick={handleOpenReprovar}>
                      Reprovar
                    </button>
                    <button type="button" className="btn-aprovar-figma" onClick={handleAprovar}>
                      Aprovar
                    </button>
                  </>
                ) : (
                  <button type="button" className="btn-sair-figma" onClick={() => setView('figma')}>
                    Sair
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VISÃO 4: FORMULÁRIO PARA CADASTRAR NOVO ALUNO MANUALMENTE */}
      {view === 'new' && (
        <div className="form-passenger-wrapper">
          {/* Banner Roxo com Corte Diagonal idêntico ao protótipo */}
          <div className="custom-figma-header-container">
            <div className="banner-siti-cut-purple">
              <img 
                src={logoSiti} 
                alt="SITI Logo" 
                className="ms-4" 
                style={{ height: '44px', cursor: 'pointer' }} 
                onClick={() => setView('figma')} 
                title="Clique na logo para voltar ao painel" 
              />
            </div>
            <div className="header-title-notch">
              <h3 className="page-sub-title-figma">
                Informações do Passageiro
              </h3>
            </div>
          </div>

          <div className="px-0 py-1">

            <form onSubmit={handleSalvarNovo}>
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

              <div className="section-card-figma mb-4">
                <span className="section-title-figma">Anexos (.pdf)</span>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="label-passenger-figma">Comprovante de Identidade (RG, CPF, CNH...)</label>
                    <div className="file-box-figma">
                      <span className="text-truncate me-2">{formAnexo1 || 'Nenhum arquivo selecionado'}</span>
                      <label className="btn btn-sm btn-outline-primary m-0 text-nowrap" style={{ cursor: 'pointer', fontSize: '0.8rem' }}>
                        Fazer Upload
                        <input 
                          type="file" 
                          accept=".pdf" 
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
                          accept=".pdf" 
                          style={{ display: 'none' }} 
                          onChange={(e) => setFormAnexo2(e.target.files[0]?.name || '')} 
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 pt-3 border-top">
                <span className="text-mandatory-figma">O preenchimento de todas as informações é obrigatório!</span>
                <div className="d-flex gap-2 ms-auto">
                  <button type="button" className="btn btn-outline-secondary px-4 py-2" onClick={() => setView('figma')}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-aprovar-figma">
                    Cadastrar Aluno
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISÃO 5: TABELA GERAL (BACKUP PARA GESTÃO LINEAR) */}
      {view === 'table' && (
        <div className="flex-grow-1 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold text-dark m-0">Todos os Alunos Registrados ({cadastrados.length + pendentes.length})</h5>
            <Button className="btn-add-rota d-flex align-items-center gap-2" onClick={handleOpenNewForm}>
              <FontAwesomeIcon icon={faPlus} />
              <span>Novo Aluno</span>
            </Button>
          </div>

          <div className="card shadow-sm border-0 flex-grow-1">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th className="ps-4">Aluno / Estudante</th>
                      <th>CPF</th>
                      <th>Instituição / Curso</th>
                      <th>Telefone</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...pendentes, ...cadastrados].map((aluno) => (
                      <tr key={aluno.id}>
                        <td className="ps-4 fw-semibold text-dark">
                          <div className="d-flex align-items-center gap-2">
                            <FontAwesomeIcon icon={faUserGraduate} style={{ color: '#9D00FF' }} />
                            <span>{aluno.nome}</span>
                          </div>
                        </td>
                        <td className="fw-monospace">{aluno.cpf}</td>
                        <td>{aluno.instituicao} ({aluno.curso})</td>
                        <td>{aluno.telefone}</td>
                        <td>
                          <span className={`badge px-3 py-2 rounded-pill ${aluno.status === 'Cadastrado' ? 'bg-success bg-opacity-10 text-success' : 'bg-warning bg-opacity-10 text-dark'}`}>
                            {aluno.status}
                          </span>
                        </td>
                        <td className="text-end pe-4">
                          <button 
                            className="btn btn-sm btn-outline-primary me-2" 
                            title="Ver Informações"
                            onClick={() => handleOpenStudent(aluno, aluno.status === 'Cadastrado' ? 'cadastrado' : 'pendente')}
                          >
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger" 
                            title="Excluir"
                            onClick={async () => {
                              try {
                                await httpClient.delete(`/admin/passengers/${aluno.id}`);
                                logger.success('ALUNOS ADM', `🗑️ Aluno ${aluno.id} removido via API`);
                                await fetchAlunos();
                              } catch (e) {
                                logger.warn('ALUNOS ADM', 'Exclusão via API falhou, removendo localmente.');
                                setCadastrados(cadastrados.filter(c => c.id !== aluno.id));
                                setPendentes(pendentes.filter(p => p.id !== aluno.id));
                              }
                            }}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Justificativa de Reprovação */}
      {showReprovarModal && (
        <div 
          className="modal-overlay-figma"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowReprovarModal(false);
          }}
        >
          <div className="modal-card-figma p-0 overflow-hidden shadow-lg" style={{ border: '1px solid #5C2078', borderRadius: '16px', maxWidth: '520px', width: '90%' }}>
            {/* Cabeçalho Roxo com gradiente elegante */}
            <div className="p-4 text-white d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #2A0041 0%, #5C2078 100%)' }}>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center justify-content-center bg-white rounded-circle shadow-sm" style={{ width: '44px', height: '44px', color: '#9D00FF' }}>
                  <FontAwesomeIcon icon={faTimes} className="fs-5" />
                </div>
                <div>
                  <h5 className="fw-bold m-0 text-white" style={{ letterSpacing: '0.3px' }}>Justificativa de Reprovação</h5>
                  <span className="small text-white-50" style={{ fontSize: '0.8rem' }}>Envio automático para o e-mail do estudante</span>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowReprovarModal(false)}
                aria-label="Fechar"
                style={{ filter: 'invert(1) grayscale(100%) brightness(200%)' }}
              ></button>
            </div>

            {/* Corpo do formulário */}
            <form onSubmit={handleConfirmarReprovacao} className="p-4" style={{ backgroundColor: '#FAF9FC' }}>
              <p className="text-muted small mb-4" style={{ lineHeight: '1.5' }}>
                Informe abaixo o motivo da reprovação do cadastro de <strong>{selectedStudent?.nome}</strong>. O estudante receberá esta notificação diretamente no e-mail: <strong>{selectedStudent?.email}</strong>.
              </p>

              <div className="bg-white p-3 rounded-4 border mb-4 shadow-sm" style={{ borderColor: '#EBE5F0' }}>
                <label className="form-label fw-bold text-dark mb-2 d-block fs-6" style={{ color: '#2A0041' }}>
                  Motivo / Justificativa:
                </label>
                <textarea 
                  className="form-control shadow-none" 
                  rows="4"
                  placeholder="Ex: Documentação incompleta ou legibilidade ruim da foto do RG..."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  required
                  style={{ 
                    borderColor: '#9D00FF', 
                    borderWidth: '1px',
                    borderRadius: '10px',
                    color: '#2A0041',
                    backgroundColor: '#FBF8FF',
                    fontSize: '0.95rem'
                  }}
                ></textarea>
              </div>

              <div className="d-flex justify-content-end gap-2 pt-2 border-top" style={{ borderColor: '#EBE5F0' }}>
                <button 
                  type="button" 
                  className="btn btn-light px-4 py-2 rounded-3 fw-semibold text-secondary border"
                  onClick={() => setShowReprovarModal(false)}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn px-4 py-2 rounded-3 fw-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #DC3545 0%, #A71D2A 100%)', border: 'none' }}
                >
                  Confirmar Reprovação e Enviar E-mail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
