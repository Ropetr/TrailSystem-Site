/**
 * TrailSystem ERP - Página Placeholder
 * Componente genérico para páginas em desenvolvimento
 */

import MainLayout from '../../components/layout/MainLayout';

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: string;
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-500">{description}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="text-6xl mb-4">{icon}</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Em Desenvolvimento</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            Esta funcionalidade está sendo implementada e estará disponível em breve.
          </p>
        </div>
      </div>
    </MainLayout>
  );
}
