export const RoleNames = {
  Cliente: 'Cliente',
  Administrador: 'Administrador',
  Proveedor: 'Proveedor',
  Analista: 'Analista'
} as const;

export type RoleName = (typeof RoleNames)[keyof typeof RoleNames];
