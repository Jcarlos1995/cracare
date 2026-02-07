/**
 * Jerarquía de roles - Casa de reposo CRACare
 * ADMINISTRADOR: logística de la empresa
 * MEDICO, RAS, RAA: nivel 1 (jefaturas/coordinación)
 * ENFERMERA, OSS, FISIOTERAPEUTA, RECEPCIONISTA: nivel 2 (operativo)
 */
export const ROLES = {
  ADMINISTRADOR: 'ADMINISTRADOR',
  MEDICO: 'MEDICO',
  RAS: 'RAS',
  ENFERMERA: 'ENFERMERA',
  RAA: 'RAA',
  OSS: 'OSS',
  FISIOTERAPEUTA: 'FISIOTERAPEUTA',
  RECEPCIONISTA: 'RECEPCIONISTA',
};

export const ROLE_LABELS = {
  ADMINISTRADOR: 'Administrador',
  MEDICO: 'Médico',
  RAS: 'RAS (Jefa de Enfermería)',
  ENFERMERA: 'Enfermera',
  RAA: 'RAA (Jefa de OSS)',
  OSS: 'OSS (Operador Socio Sanitario)',
  FISIOTERAPEUTA: 'Fisioterapista',
  RECEPCIONISTA: 'Recepcionista',
};

/** Roles que pueden gestionar usuarios */
export const CAN_MANAGE_USERS = [ROLES.ADMINISTRADOR];
