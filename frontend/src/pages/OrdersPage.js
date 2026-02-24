import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ordersAPI, clientsAPI, uploadAPI, BACKEND_URL } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import {
  Plus, Search, MoreHorizontal, Pencil, Trash2, ShoppingBag, Upload, ImageIcon, X, CheckCircle, Clock, Truck, Instagram, ZoomIn,
} from 'lucide-react';

export default function OrdersPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [deletingOrder, setDeletingOrder] = useState(null);
  const [zoomPhoto, setZoomPhoto] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    total_price: '',
    shipping_type: 'paid',
    product_photo: '',
    masa: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const loadData = useCallback(async () => {
    try {
      const [ordersRes, clientsRes] = await Promise.all([
        ordersAPI.getAll(),
        clientsAPI.getAll(),
      ]);
      setOrders(ordersRes.data);
      setClients(clientsRes.data);
    } catch (err) {
      toast.error('Gabim gjatë ngarkimit');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.upload(file);
      setFormData((prev) => ({ ...prev, product_photo: res.data.url }));
      setPreviewUrl(URL.createObjectURL(file));
      toast.success('Foto u ngarkua me sukses');
    } catch (err) {
      toast.error('Gabim gjatë ngarkimit të fotos');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.client_id) {
      toast.error('Zgjidhni një klient');
      return;
    }
    if (!formData.total_price || parseFloat(formData.total_price) <= 0) {
      toast.error('Vendosni çmimin total');
      return;
    }
    setSaving(true);
    try {
      const data = {
        ...formData,
        total_price: parseFloat(formData.total_price),
      };
      if (editingOrder) {
        await ordersAPI.update(editingOrder.id, data);
        toast.success('Porosia u përditësua me sukses');
      } else {
        await ordersAPI.create(data);
        toast.success('Porosia u krijua me sukses');
      }
      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gabim gjatë ruajtjes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrder) return;
    try {
      await ordersAPI.delete(deletingOrder.id);
      toast.success('Porosia u fshi me sukses');
      setDeleteDialogOpen(false);
      setDeletingOrder(null);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gabim gjatë fshirjes');
    }
  };

  const handleStatusChange = async (order, status) => {
    try {
      await ordersAPI.update(order.id, { status });
      toast.success(status === 'completed' ? 'Porosia u përfundua' : 'Statusi u ndryshua');
      loadData();
    } catch (err) {
      toast.error('Gabim gjatë ndryshimit të statusit');
    }
  };

  const resetForm = () => {
    setEditingOrder(null);
    setFormData({
      client_id: '',
      total_price: '',
      shipping_type: 'paid',
      product_photo: '',
      masa: '',
      notes: '',
    });
    setPreviewUrl('');
  };

  const openEdit = (order) => {
    setEditingOrder(order);
    setFormData({
      client_id: order.client_id,
      total_price: String(order.total_price),
      shipping_type: order.shipping_type,
      product_photo: order.product_photo || '',
      masa: order.masa || '',
      notes: order.notes || '',
    });
    if (order.product_photo) {
      setPreviewUrl(`${BACKEND_URL}${order.product_photo}`);
    } else {
      setPreviewUrl('');
    }
    setDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.client_ig?.toLowerCase().includes(q) ||
      o.client_name?.toLowerCase().includes(q) ||
      o.masa?.toLowerCase().includes(q) ||
      o.status?.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div data-testid="orders-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 font-['Outfit']" data-testid="orders-title">
            Porositë
          </h1>
          <p className="text-zinc-500 mt-1">{orders.length} porosi gjithsej</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-orange-600 text-white hover:bg-orange-700 shadow-sm rounded-lg px-6 font-medium transition-transform active:scale-95"
          data-testid="create-order-button"
        >
          <Plus className="w-4 h-4 mr-2" /> Krijo Porosi
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Kërko me IG, emër, masë..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
          data-testid="search-orders-input"
        />
      </div>

      {/* Table - Columns: FOTO, IG USERNAME, MASA first */}
      <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl" data-testid="orders-table-card">
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">Foto</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">IG Username</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">Masa</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Çmimi</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">Transporti</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Statusi</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Data</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((order) => (
                  <TableRow key={order.id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100" data-testid={`order-row-${order.id}`}>
                    {/* FOTO - clickable for zoom */}
                    <TableCell>
                      {order.product_photo ? (
                        <button
                          type="button"
                          onClick={() => setZoomPhoto(`${BACKEND_URL}${order.product_photo}`)}
                          className="relative group cursor-pointer"
                          data-testid={`zoom-photo-${order.id}`}
                        >
                          <img
                            src={`${BACKEND_URL}${order.product_photo}`}
                            alt="Produkt"
                            className="w-12 h-12 rounded-lg object-cover border border-zinc-200 group-hover:border-orange-400 transition-colors"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-lg flex items-center justify-center transition-all">
                            <ZoomIn className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </button>
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-zinc-400" />
                        </div>
                      )}
                    </TableCell>
                    {/* IG USERNAME */}
                    <TableCell>
                      <div>
                        {order.client_ig ? (
                          <p className="font-bold text-zinc-900 flex items-center gap-1.5">
                            <Instagram className="w-3.5 h-3.5 text-orange-600" />
                            @{order.client_ig}
                          </p>
                        ) : (
                          <p className="font-medium text-zinc-900">{order.client_name}</p>
                        )}
                        {order.client_ig && (
                          <p className="text-xs text-zinc-500">{order.client_name}</p>
                        )}
                      </div>
                    </TableCell>
                    {/* MASA */}
                    <TableCell>
                      <span className="font-medium text-zinc-900">{order.masa || '-'}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-semibold text-zinc-900">
                        {order.total_price?.toLocaleString('sq-AL')} Lekë
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          order.shipping_type === 'free'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                        }
                      >
                        <Truck className="w-3 h-3 mr-1" />
                        {order.shipping_type === 'free' ? 'Falas' : 'Me Pagesë'}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <Badge
                        variant="outline"
                        className={
                          order.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }
                      >
                        {order.status === 'completed' ? (
                          <><CheckCircle className="w-3 h-3 mr-1" /> E Përfunduar</>
                        ) : (
                          <><Clock className="w-3 h-3 mr-1" /> Në Pritje</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-zinc-500">
                      {new Date(order.created_at).toLocaleDateString('sq-AL')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`order-actions-${order.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {order.status === 'pending' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'completed')} data-testid={`complete-order-${order.id}`}>
                              <CheckCircle className="w-4 h-4 mr-2" /> Përfundo
                            </DropdownMenuItem>
                          )}
                          {order.status === 'completed' && (
                            <DropdownMenuItem onClick={() => handleStatusChange(order, 'pending')} data-testid={`reopen-order-${order.id}`}>
                              <Clock className="w-4 h-4 mr-2" /> Kthe në Pritje
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openEdit(order)} data-testid={`edit-order-${order.id}`}>
                            <Pencil className="w-4 h-4 mr-2" /> Ndrysho
                          </DropdownMenuItem>
                          {/* Only admin can delete */}
                          {isAdmin && (
                            <DropdownMenuItem
                              onClick={() => { setDeletingOrder(order); setDeleteDialogOpen(true); }}
                              className="text-red-600 focus:text-red-600"
                              data-testid={`delete-order-${order.id}`}
                            >
                              <Trash2 className="w-4 h-4 mr-2" /> Fshi
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 text-zinc-400">
              <ShoppingBag className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-base font-medium">
                {search ? 'Asnjë porosi nuk u gjet' : 'Nuk ka porosi ende'}
              </p>
              <p className="text-sm mt-1">
                {search ? 'Provoni me terma të tjera kërkimi' : 'Krijoni porosinë tuaj të parë'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Zoom Modal */}
      <Dialog open={!!zoomPhoto} onOpenChange={() => setZoomPhoto(null)}>
        <DialogContent className="sm:max-w-2xl p-2" data-testid="zoom-photo-dialog">
          <DialogHeader className="sr-only">
            <DialogTitle>Foto e Produktit</DialogTitle>
            <DialogDescription>Shikoni foton në madhësi të plotë</DialogDescription>
          </DialogHeader>
          {zoomPhoto && (
            <img
              src={zoomPhoto}
              alt="Produkt - Zoom"
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
              data-testid="zoomed-photo"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Order Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setDialogOpen(open); }}>
        <DialogContent className="sm:max-w-lg" data-testid="order-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl">
              {editingOrder ? 'Ndrysho Porosinë' : 'Krijo Porosi të Re'}
            </DialogTitle>
            <DialogDescription>
              {editingOrder ? 'Përditësoni të dhënat e porosisë' : 'Plotësoni fushat për porosinë e re'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Client Select */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Zgjidh Klientin *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, client_id: val }))}
              >
                <SelectTrigger className="border-zinc-200 focus:border-orange-500 rounded-lg bg-white h-10" data-testid="order-client-select">
                  <SelectValue placeholder="Zgjidhni klientin" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id} data-testid={`select-client-${client.id}`}>
                      {client.ig_name ? `@${client.ig_name}` : ''} {client.name} {client.surname}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Foto e Produktit</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                data-testid="order-photo-file-input"
              />
              {previewUrl ? (
                <div className="relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-32 h-32 rounded-xl object-cover border border-zinc-200"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl('');
                      setFormData((prev) => ({ ...prev, product_photo: '' }));
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    data-testid="remove-photo-button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-full h-32 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-2 text-zinc-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                  data-testid="upload-photo-button"
                >
                  {uploading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6" />
                      <span className="text-sm font-medium">Ngarko Foto</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Masa (Size) */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Masa</Label>
              <Input
                value={formData.masa}
                onChange={(e) => setFormData((prev) => ({ ...prev, masa: e.target.value }))}
                placeholder="psh: S, M, L, XL, 42, 44..."
                className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                data-testid="order-masa-input"
              />
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Çmimi Total (Lekë) *</Label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.total_price}
                onChange={(e) => setFormData((prev) => ({ ...prev, total_price: e.target.value }))}
                placeholder="0.00"
                className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                data-testid="order-price-input"
                required
              />
            </div>

            {/* Shipping Type */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Transporti *</Label>
              <Select
                value={formData.shipping_type}
                onValueChange={(val) => setFormData((prev) => ({ ...prev, shipping_type: val }))}
              >
                <SelectTrigger className="border-zinc-200 focus:border-orange-500 rounded-lg bg-white h-10" data-testid="order-shipping-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid" data-testid="shipping-paid">Me Pagesë</SelectItem>
                  <SelectItem value="free" data-testid="shipping-free">Falas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Shënime</Label>
              <Input
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Shënime shtesë (opsionale)"
                className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                data-testid="order-notes-input"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { resetForm(); setDialogOpen(false); }}
                className="border-zinc-200"
                data-testid="order-cancel-button"
              >
                Anulo
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-orange-600 text-white hover:bg-orange-700"
                data-testid="order-save-button"
              >
                {saving ? 'Duke ruajtur...' : 'Ruaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation - admin only */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm" data-testid="delete-order-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit']">Fshi Porosinë</DialogTitle>
            <DialogDescription>
              Jeni i sigurt që doni të fshini këtë porosi? Ky veprim nuk mund të kthehet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-200"
              data-testid="delete-order-cancel-button"
            >
              Anulo
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="delete-order-confirm-button"
            >
              Fshi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
