/**
 * 轮播图管理。1:1 复刻旧界面 index.html:522-544,575-602 + admin.js:380-455。
 * 卡片列表(不是表格);选中图片即上传(字段名 file,响应 data 是 URL 字符串);
 * 排序留空时兜底成「当前条数 + 1」。
 */
import { useEffect, useRef, useState } from 'react';
import { ImagePlusIcon } from 'lucide-react';
import AdminLayout from '../components/AdminLayout';
import PageHeader from '../components/PageHeader';
import { useConfirm } from '../components/ConfirmDialog';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ApiState, useApiResource } from '../hooks/useApiResource';
import { toast } from '../lib/localizedToast';
import { bannerStatusMeta, StatusBadge } from '../lib/enums';
import { normalizeImageUrl } from '../lib/format';
import {
  addBanner,
  deleteBanner,
  listBanners,
  updateBannerStatus,
  uploadBanner,
  type Banner,
} from '../api';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';

export default function BannerPage() {
  const resource = useApiResource(listBanners);
  const { confirm, confirmNode } = useConfirm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [picUrl, setPicUrl] = useState('');
  const [sort, setSort] = useState<number | ''>(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const banners = resource.data ?? [];

  useEffect(() => {
    if (dialogOpen) {
      setPicUrl('');
      setSort(1);
    }
  }, [dialogOpen]);

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadBanner(file);
      setPicUrl(url);
      toast.success('图片上传成功');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '上传失败');
    } finally {
      setUploading(false);
      // 清空 input 以便重复选择同一个文件(admin.js:410)
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const submitBanner = async () => {
    if (!picUrl) {
      toast.warning('请先上传图片');
      return;
    }
    setSubmitting(true);
    try {
      await addBanner(picUrl, sort === '' ? banners.length + 1 : sort);
      toast.success('添加成功');
      setDialogOpen(false);
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '添加失败');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStatus = async (banner: Banner) => {
    try {
      await updateBannerStatus(banner.id, banner.status === 1 ? 0 : 1);
      toast.success('状态已更新');
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '更新失败');
    }
  };

  const removeBanner = async (banner: Banner) => {
    const confirmed = await confirm({ title: '提示', description: '确定删除该轮播图?' });
    if (!confirmed) return;
    try {
      await deleteBanner(banner.id);
      toast.success('删除成功');
      void resource.reload();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '删除失败');
    }
  };

  return (
    <AdminLayout>
      <PageHeader title="轮播图管理" description="小程序首页轮播位" />

      <Card className="gap-0 overflow-hidden py-0">
        <CardHeader className="flex items-center justify-between border-b px-5 py-4">
          <span className="font-semibold">轮播图列表</span>
          <Button size="sm" onClick={() => setDialogOpen(true)}>添加轮播图</Button>
        </CardHeader>

        <CardContent className="px-5">
          {(resource.loading || resource.error) && <ApiState loading={resource.loading} error={resource.error} />}

          {!resource.loading && !resource.error && banners.length === 0 && (
            <div className="text-muted-foreground py-16 text-center">暂无轮播图</div>
          )}

          {!resource.loading &&
            !resource.error &&
            banners.map(banner => (
              <div key={banner.id} className="flex flex-wrap items-center gap-4 border-b py-4 last:border-b-0">
                <img
                  src={normalizeImageUrl(banner.picUrl)}
                  alt={`轮播图 ${banner.id}`}
                  className="h-20 w-36 shrink-0 rounded-lg border object-cover"
                />
                <div className="grid min-w-0 gap-1">
                  <div className="font-semibold">排序: {banner.sort}</div>
                  <div className="text-muted-foreground">ID: {banner.id}</div>
                  <div className="text-muted-foreground flex items-center gap-1.5">
                    状态: <StatusBadge meta={bannerStatusMeta(banner.status)} />
                  </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Button variant={banner.status === 1 ? 'destructive' : 'default'} size="sm" onClick={() => void toggleStatus(banner)}>{banner.status === 1 ? '禁用' : '启用'}</Button>
                  <Button variant="destructive" size="sm" onClick={() => void removeBanner(banner)}>删除</Button>
                </div>
              </div>
            ))}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加轮播图</DialogTitle>
            <DialogDescription>选中图片后会立即上传,上传成功才能提交。</DialogDescription>
          </DialogHeader>

          <div className="grid gap-3.5">
            <div className="grid gap-1.5">
              <Label>图片</Label>
              <label className="hover:bg-accent flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed transition-colors">
                {picUrl ? (
                  <img src={normalizeImageUrl(picUrl)} alt="轮播图预览" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-muted-foreground flex flex-col items-center gap-2">
                    <ImagePlusIcon size={22} />
                    {uploading ? '上传中…' : '点击上传图片'}
                  </span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={event => void handleUpload(event.target.files?.[0])}
                />
              </label>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="banner-sort">排序</Label>
              <Input
                id="banner-sort"
                type="number"
                value={sort}
                onChange={event => setSort(event.target.value === '' ? '' : Number(event.target.value))}
                placeholder="数字越大越靠前"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
            <Button onClick={() => void submitBanner()} disabled={!picUrl || submitting}>{submitting ? '提交中…' : '确认添加'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {confirmNode}
    </AdminLayout>
  );
}
