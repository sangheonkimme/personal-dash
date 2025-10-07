'use client';

import { useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { ColDef, GridReadyEvent, CellEditingStoppedEvent } from 'ag-grid-community';
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { BaseRow } from '@/types';
import { useUpdateTransaction, useDeleteTransaction } from '@/hooks/use-transactions';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import dayjs from 'dayjs';

// ag-Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule]);

export interface TransactionGridProps {
  rows: BaseRow[];
  currency: string;
  locale: 'ko' | 'en';
  isLoading?: boolean;
  onRefresh?: () => void;
}

export function TransactionGrid({
  rows,
  currency,
  locale,
  isLoading,
  onRefresh,
}: TransactionGridProps) {
  const gridRef = useRef<AgGridReact>(null);
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const isKorean = locale === 'ko';

  // 삭제 핸들러
  const handleDelete = useCallback(
    (id: number) => {
      if (!confirm(isKorean ? '정말 삭제하시겠습니까?' : 'Are you sure you want to delete this transaction?')) {
        return;
      }

      deleteTransaction.mutate(id, {
        onSuccess: () => {
          toast.success(isKorean ? '삭제되었습니다' : 'Deleted successfully');
          onRefresh?.();
        },
        onError: () => {
          toast.error(isKorean ? '삭제 실패' : 'Delete failed');
        },
      });
    },
    [deleteTransaction, isKorean, onRefresh]
  );

  // 컬럼 정의
  const columnDefs = useMemo<ColDef<BaseRow>[]>(
    () => [
      {
        headerName: isKorean ? '날짜' : 'Date',
        field: 'date',
        sortable: true,
        filter: 'agDateColumnFilter',
        editable: true,
        width: 130,
        valueFormatter: (params) => {
          if (!params.value) return '';
          return dayjs(params.value).format('YYYY-MM-DD');
        },
      },
      {
        headerName: isKorean ? '타입' : 'Type',
        field: 'type',
        sortable: true,
        filter: true,
        editable: true,
        width: 100,
        cellStyle: (params) => {
          if (params.value === 'income') {
            return { color: 'green', fontWeight: 'bold' };
          } else if (params.value === 'expense') {
            return { color: 'red', fontWeight: 'bold' };
          }
          return undefined;
        },
        valueFormatter: (params) => {
          if (params.value === 'income') return isKorean ? '수입' : 'Income';
          if (params.value === 'expense') return isKorean ? '지출' : 'Expense';
          return params.value;
        },
      },
      {
        headerName: isKorean ? '고정' : 'Fixed',
        field: 'fixed',
        sortable: true,
        filter: true,
        editable: true,
        width: 90,
        valueFormatter: (params) => {
          return params.value ? (isKorean ? '고정' : 'Fixed') : (isKorean ? '변동' : 'Variable');
        },
      },
      {
        headerName: isKorean ? '카테고리' : 'Category',
        field: 'category',
        sortable: true,
        filter: true,
        editable: true,
        width: 130,
      },
      {
        headerName: isKorean ? '하위카테고리' : 'Subcategory',
        field: 'subcategory',
        sortable: true,
        filter: true,
        editable: true,
        width: 130,
      },
      {
        headerName: isKorean ? '금액' : 'Amount',
        field: 'amount',
        sortable: true,
        filter: 'agNumberColumnFilter',
        editable: true,
        width: 130,
        type: 'numericColumn',
        valueFormatter: (params) => {
          if (!params.value) return '';
          return `${currency === 'KRW' ? '₩' : currency} ${params.value.toLocaleString()}`;
        },
      },
      {
        headerName: isKorean ? '결제수단' : 'Payment',
        field: 'paymentMethod',
        sortable: true,
        filter: true,
        editable: true,
        width: 110,
      },
      {
        headerName: isKorean ? '설명' : 'Description',
        field: 'description',
        sortable: true,
        filter: true,
        editable: true,
        flex: 1,
        minWidth: 200,
      },
      {
        headerName: isKorean ? '작업' : 'Actions',
        field: 'id',
        sortable: false,
        filter: false,
        width: 80,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        cellRenderer: (params: any) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(params.data.id)}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          );
        },
      },
    ],
    [currency, isKorean, handleDelete]
  );

  // 셀 편집 완료 핸들러
  const onCellEditingStopped = useCallback(
    (event: CellEditingStoppedEvent<BaseRow>) => {
      const { data, column, newValue, oldValue } = event;
      if (!data || newValue === oldValue) return;

      const field = column.getColId() as keyof BaseRow;

      updateTransaction.mutate(
        {
          id: data.id,
          data: {
            [field]: newValue,
          },
        },
        {
          onError: () => {
            toast.error(isKorean ? '수정 실패' : 'Update failed');
            // 롤백은 React Query의 옵티미스틱 업데이트에서 처리
            onRefresh?.();
          },
        }
      );
    },
    [updateTransaction, isKorean, onRefresh]
  );

  // CSV 내보내기
  const handleExportCSV = useCallback(() => {
    if (!gridRef.current) return;
    gridRef.current.api.exportDataAsCsv({
      fileName: `transactions_${dayjs().format('YYYY-MM-DD')}.csv`,
    });
    toast.success(isKorean ? 'CSV 내보내기 완료' : 'CSV exported successfully');
  }, [isKorean]);

  // 그리드 준비
  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  // 총합 계산
  const totalIncome = useMemo(() => {
    return rows.filter((r) => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  }, [rows]);

  const totalExpense = useMemo(() => {
    return rows.filter((r) => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  }, [rows]);

  const balance = totalIncome - totalExpense;

  return (
    <div className="space-y-4">
      {/* 상단 툴바 */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isKorean ? '거래 내역' : 'Transactions'}: <span className="font-semibold">{rows.length}</span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
        </div>
      </div>

      {/* ag-Grid */}
      <div className="ag-theme-alpine" style={{ height: 500, width: '100%' }}>
        <AgGridReact<BaseRow>
          ref={gridRef}
          rowData={rows}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            sortable: true,
            filter: true,
          }}
          onGridReady={onGridReady}
          onCellEditingStopped={onCellEditingStopped}
          rowSelection="multiple"
          animateRows={true}
          pagination={true}
          paginationPageSize={20}
          loading={isLoading}
        />
      </div>

      {/* 하단 요약 */}
      <div className="flex justify-end gap-6 text-sm font-medium">
        <div className="text-green-600 dark:text-green-400">
          {isKorean ? '총 수입' : 'Total Income'}: {currency === 'KRW' ? '₩' : currency}
          {totalIncome.toLocaleString()}
        </div>
        <div className="text-red-600 dark:text-red-400">
          {isKorean ? '총 지출' : 'Total Expense'}: {currency === 'KRW' ? '₩' : currency}
          {totalExpense.toLocaleString()}
        </div>
        <div className={balance >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-orange-600 dark:text-orange-400'}>
          {isKorean ? '잔액' : 'Balance'}: {currency === 'KRW' ? '₩' : currency}
          {balance.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
