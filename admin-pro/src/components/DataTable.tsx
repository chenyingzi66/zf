/**
 * 列表页共用的卡片 + 表格 + 前端分页。
 * 表格、按钮、卡片全部用模版自带组件(components/ui/{table,button,card}.tsx),
 * 不再手写内联样式。后端全站没有分页(见 docs/管理端功能与接口对接文档.md §1.4),
 * 所以一次拉全量、在内存里切片。
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';

export interface Column<T> {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  title: ReactNode;
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  extra?: ReactNode;
  toolbar?: ReactNode;
  loading?: boolean;
  error?: Error | null;
  emptyText?: string;
  pageSize?: number;
}

export default function DataTable<T>({
  title,
  columns,
  rows,
  rowKey,
  extra,
  toolbar,
  loading = false,
  error = null,
  emptyText = '暂无数据',
  pageSize = 10,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1);
  const total = rows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    if (page > pageCount) setPage(1);
  }, [page, pageCount]);

  const visible = useMemo(() => {
    const start = (Math.min(page, pageCount) - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageCount, pageSize]);

  return (
    <Card className="gap-0 overflow-hidden py-0">
      <CardHeader className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <span className="font-semibold">{title}</span>
        {extra ?? <span className="text-muted-foreground">共 {total} 条记录</span>}
      </CardHeader>

      {toolbar && <div className="flex flex-wrap items-center gap-3 border-b px-5 py-3">{toolbar}</div>}

      <CardContent className="px-0">
        {loading && <div className="text-muted-foreground py-16 text-center">加载中…</div>}
        {!loading && error && (
          <div className="text-destructive py-16 text-center">数据加载失败：{error.message}</div>
        )}

        {!loading && !error && (
          <Table>
            <TableHeader className="bg-muted/60">
              <TableRow>
                {columns.map(column => (
                  <TableHead
                    key={column.key}
                    className="text-muted-foreground px-5 font-semibold"
                    style={{ width: column.width, textAlign: column.align ?? 'left' }}
                  >
                    {column.title}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map(row => (
                <TableRow key={rowKey(row)}>
                  {columns.map(column => (
                    <TableCell
                      key={column.key}
                      className="px-5 py-3"
                      style={{ textAlign: column.align ?? 'left' }}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {total === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={columns.length} className="text-muted-foreground py-16 text-center">
                    {emptyText}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <CardFooter className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3">
        <span>共 {total} 条记录</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            title="上一页"
            disabled={page <= 1}
            onClick={() => setPage(current => Math.max(1, current - 1))}
          >
            <ChevronLeftIcon />
          </Button>
          <span>第 {Math.min(page, pageCount)} / {pageCount} 页</span>
          <Button
            variant="outline"
            size="icon-sm"
            title="下一页"
            disabled={page >= pageCount}
            onClick={() => setPage(current => Math.min(pageCount, current + 1))}
          >
            <ChevronRightIcon />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
