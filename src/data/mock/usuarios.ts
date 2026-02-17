export interface MockUsuario {
  id: string;
  email: string;
  password: string;
  full_name: string;
  role: "admin" | "vendedor";
  avatar_initials: string;
}

export const mockUsuarios: MockUsuario[] = [
  {
    id: "admin-001",
    email: "admin@laticinio.com",
    password: "Admin123",
    full_name: "Maria Santos",
    role: "admin",
    avatar_initials: "MS",
  },
  {
    id: "vendedor-001",
    email: "vendedor1@laticinio.com",
    password: "Vend123",
    full_name: "Carlos Silva",
    role: "vendedor",
    avatar_initials: "CS",
  },
  {
    id: "vendedor-002",
    email: "vendedor2@laticinio.com",
    password: "Vend123",
    full_name: "Ana Paula Costa",
    role: "vendedor",
    avatar_initials: "AC",
  },
  {
    id: "vendedor-003",
    email: "vendedor3@laticinio.com",
    password: "Vend123",
    full_name: "Roberto Almeida",
    role: "vendedor",
    avatar_initials: "RA",
  },
  {
    id: "vendedor-004",
    email: "vendedor4@laticinio.com",
    password: "Vend123",
    full_name: "Juliana Ferreira",
    role: "vendedor",
    avatar_initials: "JF",
  },
  {
    id: "vendedor-005",
    email: "vendedor5@laticinio.com",
    password: "Vend123",
    full_name: "Pedro Oliveira",
    role: "vendedor",
    avatar_initials: "PO",
  },
];

export const getVendedores = () => mockUsuarios.filter((u) => u.role === "vendedor");
export const getUsuarioByEmail = (email: string) => mockUsuarios.find((u) => u.email === email);
export const getUsuarioById = (id: string) => mockUsuarios.find((u) => u.id === id);
