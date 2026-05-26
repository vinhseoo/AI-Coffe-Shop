'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useInventory } from '../../../../hooks/useInventory';
import { ImportForm } from '../../../../components/inventory/ImportForm';
import { Spinner } from '../../../../components/ui/Spinner';

export default function InventoryImportPage() {
  const { isLoading, activeIngredients, fetchActiveIngredients, importStock } = useInventory();
  const router = useRouter();

  useEffect(() => {
    fetchActiveIngredients();
  }, []);

  const handleSubmit = async (data: { items: any[]; note: string }) => {
    try {
      await importStock(data);
      router.push('/inventory');
    } catch (err) {
      // errors are already toasted in the hook
    }
  };

  const handleCancel = () => {
    router.push('/inventory');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          📥 Nhập kho nguyên liệu
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Điền thông tin số lượng, đơn giá thực tế của các nguyên liệu vừa nhập từ nhà cung cấp để đồng bộ tồn kho.
        </p>
      </div>

      {isLoading && activeIngredients.length === 0 ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : (
        <ImportForm
          ingredients={activeIngredients}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
