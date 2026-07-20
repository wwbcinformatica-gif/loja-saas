// Middleware para verificar cadastro completo
export function verificarCadastroCompleto(loja: any): {
  completo: boolean;
  camposObrigatorios: string[];
  camposFaltando: string[];
} {
  const camposObrigatorios = [
    'nome_completo',  // Nome completo do responsável
    'telefone',       // Telefone/WhatsApp  
    'email',          // Email de contato
    'empresa',        // Nome da empresa
    'cnpj_cpf'        // CNPJ ou CPF
  ];

  const camposFaltando = camposObrigatorios.filter(campo => {
    const valor = loja[campo];
    return !valor || valor.toString().trim() === '';
  });

  return {
    completo: camposFaltando.length === 0,
    camposObrigatorios,
    camposFaltando
  };
}

// Função para validar formato dos campos
export function validarFormatoCampos(dados: any): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];

  // Validar email
  if (dados.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dados.email)) {
      erros.push('Email deve ter um formato válido');
    }
  }

  // Validar telefone (deve ter pelo menos 10 dígitos)
  if (dados.telefone) {
    const telefoneNumeros = dados.telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10) {
      erros.push('Telefone deve ter pelo menos 10 dígitos');
    }
  }

  // Validar CNPJ/CPF (deve ter 11 ou 14 dígitos)
  if (dados.cnpj_cpf) {
    const cnpjCpfNumeros = dados.cnpj_cpf.replace(/\D/g, '');
    if (cnpjCpfNumeros.length !== 11 && cnpjCpfNumeros.length !== 14) {
      erros.push('CNPJ deve ter 14 dígitos ou CPF deve ter 11 dígitos');
    }
  }

  return {
    valido: erros.length === 0,
    erros
  };
}