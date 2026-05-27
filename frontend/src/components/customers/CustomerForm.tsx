import React, { useEffect, useState } from 'react';
import { Customer } from '../../types/customer';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';

interface CustomerFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; phone: string; email?: string; birthday?: string; note?: string }) => Promise<void>;
  initialData?: Customer | null;
}

export function CustomerForm({ isOpen, onClose, onSubmit, initialData }: CustomerFormProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [birthday, setBirthday] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setPhone(initialData.phone);
        setEmail(initialData.email || '');
        setBirthday(initialData.birthday || '');
        setNote(initialData.note || '');
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setBirthday('');
        setNote('');
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Tên khách hàng không được để trống';
    
    if (!phone.trim()) {
      nextErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^(0|\+84)[35789]\d{8}$/.test(phone.trim())) {
      nextErrors.phone = 'Số điện thoại không hợp lệ (Ví dụ: 0912345678)';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Email không đúng định dạng';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        birthday: birthday || undefined,
        note: note.trim() || undefined,
      });
      onClose();
    } catch {
      // hook handleToast already shows errors
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData?.id ? 'Chỉnh sửa thông tin khách hàng' : 'Đăng ký khách hàng thành viên'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Tên khách hàng *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
            placeholder="Ví dụ: Nguyễn Văn A"
            required
            autoFocus
          />

          <Input
            label="Số điện thoại *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            error={errors.phone}
            placeholder="Ví dụ: 0912345678"
            required
            disabled={!!initialData?.id} // Do not change phone directly on edit to prevent duplicates
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            placeholder="Viết: customer@example.com"
          />

          <Input
            label="Ngày sinh nhật"
            type="date"
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
            placeholder="Chọn ngày sinh nhật"
          />
        </div>

        <TextArea
          label="Ghi chú sở thích khách hàng"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Thích ít ngọt, hay đi cùng gia đình, thích ngồi góc ban công..."
          rows={3}
        />

        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            {initialData?.id ? 'Cập nhật' : 'Đăng ký'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
export default CustomerForm;
