import React from 'react';
import { Ingredient } from '../../types/inventory';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { formatCurrency } from '../../lib/utils';

interface StockTableProps {
  items: Ingredient[];
  onView: (item: Ingredient) => void;
  onEdit: (item: Ingredient) => void;
  onAdjust: (item: Ingredient) => void;
  onDelete: (id: number) => void;
}

export function StockTable({ items, onView, onEdit, onAdjust, onDelete }: StockTableProps) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50 dark:bg-gray-900/50">
            <TableHead>Tên nguyên liệu</TableHead>
            <TableHead>Đơn vị</TableHead>
            <TableHead>Tồn kho hiện tại</TableHead>
            <TableHead>Tồn tối thiểu</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead>Giá vốn</TableHead>
            <TableHead>Nhà cung cấp</TableHead>
            <TableHead>Hạn sử dụng</TableHead>
            <TableHead className="text-right">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableEmpty message="Không tìm thấy nguyên liệu nào." />
          ) : (
            items.map((item) => {
              const isLow = item.currentStock < item.minStock;
              const ratio = item.minStock > 0 ? (item.currentStock / item.minStock) * 100 : 100;
              
              // Determine progress bar color
              let barColor = 'bg-emerald-500';
              if (isLow) {
                barColor = 'bg-rose-500 animate-pulse';
              } else if (item.currentStock < item.minStock * 1.5) {
                barColor = 'bg-amber-500';
              }

              return (
                <TableRow key={item.id} className={isLow ? 'bg-rose-50/10 dark:bg-rose-950/5' : ''}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">
                    {item.name}
                  </TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <span className={`font-semibold ${isLow ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                        {item.currentStock}
                      </span>
                      <div className="w-24 bg-gray-250 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${barColor}`} 
                          style={{ width: `${Math.min(ratio, 100)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{item.minStock}</TableCell>
                  <TableCell>
                    {isLow ? (
                      <Badge variant="danger" size="sm">Cần nhập gấp</Badge>
                    ) : item.currentStock < item.minStock * 1.5 ? (
                      <Badge variant="warning" size="sm">Sắp hết</Badge>
                    ) : (
                      <Badge variant="success" size="sm">An toàn</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatCurrency(item.unitCost)}</TableCell>
                  <TableCell className="text-gray-500 dark:text-gray-400">
                    {item.supplierName ?? '—'}
                  </TableCell>
                  <TableCell>
                    {item.expiryDays ? `${item.expiryDays} ngày` : '—'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onView(item)}
                        className="py-1 px-2.5 h-8 text-xs border-blue-200 hover:bg-blue-50 hover:text-blue-600 dark:border-blue-950/20"
                      >
                        🔍 Xem
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onAdjust(item)}
                        className="py-1 px-2.5 h-8 text-xs border-amber-200 hover:bg-amber-50 hover:text-amber-850 dark:border-amber-900/50"
                      >
                        ⚙️ Cân đối
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(item)}
                        className="py-1 px-2.5 h-8 text-xs"
                      >
                        ✏️ Sửa
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Bạn chắc chắn muốn ngưng sử dụng nguyên liệu "${item.name}"?`)) {
                            onDelete(item.id);
                          }
                        }}
                        className="py-1 px-2.5 h-8 text-xs border-rose-200 hover:bg-rose-50 hover:text-rose-600 dark:border-rose-950/20"
                      >
                        🗑️ Ngưng dùng
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
