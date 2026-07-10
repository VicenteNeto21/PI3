// Funções utilitárias de máscaras para formatação de inputs no SITI App

export const maskCPF = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

export const maskDate = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d{1,4})$/, '$1/$2');
};

export const maskCEP = (value) => {
  if (!value) return '';
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{5})(\d{1,3})$/, '$1-$2');
};

export const maskPhone = (value) => {
  if (!value) return '';
  const clean = value.replace(/\D/g, '').slice(0, 11);
  if (clean.length > 10) {
    return clean.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
  } else if (clean.length > 6) {
    return clean.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
  } else if (clean.length > 2) {
    return clean.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
  } else if (clean.length > 0) {
    return clean.replace(/^(\d*)$/, '($1');
  }
  return clean;
};

export const maskCNH = (value) => {
  if (!value) return '';
  return value.replace(/\D/g, '').slice(0, 11);
};

export const maskPlaca = (value) => {
  if (!value) return '';
  const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7);
  if (clean.length > 3) {
    return `${clean.slice(0, 3)}-${clean.slice(3)}`;
  }
  return clean;
};
