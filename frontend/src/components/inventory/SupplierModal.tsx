import React, { useEffect, useState } from 'react';
import { Supplier, SupplierRequest } from '../../types/inventory';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';

interface SupplierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SupplierRequest) => Promise<void>;
  initialData?: Supplier | null;
  isLoading: boolean;
}

export function SupplierModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}: SupplierModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setPhone(initialData.phone || '');
      setEmail(initialData.email || '');
      setAddress(initialData.address || '');
      setNote(initialData.note || '');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setAddress('');
      setNote('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Tên nhà cung cấp không được trống';
    
    // Optional phone/email regex check if needed, otherwise skip to keep simple
    if (email && !/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không đúng định dạng';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    await onSubmit({
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      address: address.trim() || undefined,
      note: note.trim() || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Chỉnh sửa nhà cung cấp' : 'Thêm nhà cung cấp mới'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          label="Tên nhà cung cấp *"
          placeholder="Ví dụ: Đại lý sữa Vinamilk, NCC Cà phê Buôn Ma Thuột..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
          disabled={isLoading}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Số điện thoại"
            placeholder="Ví dụ: 0987654321"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isLoading}
          />

          <Input
            label="Email"
            type="email"
            placeholder="Ví dụ: contact@ncc.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            disabled={isLoading}
          />
        </div>

        <Input
          label="Địa chỉ"
          placeholder="Số nhà, tên đường, quận/huyện..."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          disabled={isLoading}
        />

        <TextArea
          label="Ghi chú"
          placeholder="Thông tin liên hệ phụ, chiết khấu, chính sách thanh toán..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          disabled={isLoading}
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} className="bg-amber-850 hover:bg-amber-900 text-white">
            {isLoading ? 'Đang lưu...' : 'Lưu lại'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
