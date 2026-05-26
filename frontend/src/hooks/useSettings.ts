import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { ApiResponse, ShopSettings } from '../types/api';
import { useSettingsStore } from '../store/settingsStore';
import { toast } from './useToast';

export function useSettings() {
  const { settings, isLoaded, setSettings } = useSettingsStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchSettings = async () => {
    setIsLoading(true);
    try {
      const res = await api.get<any, ApiResponse<ShopSettings>>('/settings');
      setSettings(res.data);
    } catch {
      // Ignore — ít khi xảy ra vì đã có auth guard
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      fetchSettings();
    }
  }, [isLoaded]);

  const updateSettings = async (data: Partial<ShopSettings>) => {
    setIsLoading(true);
    try {
      const res = await api.put<any, ApiResponse<ShopSettings>>('/settings', data);
      setSettings(res.data);
      toast.success('Cập nhật thông tin quán thành công');
      return res.data;
    } catch (err: any) {
      toast.error(err?.message ?? 'Cập nhật thất bại');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { settings, isLoading, updateSettings, refetch: fetchSettings };
}
