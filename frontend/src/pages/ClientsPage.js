import React, { useEffect, useState, useCallback, useRef } from 'react';
import { clientsAPI, uploadAPI, BACKEND_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Users, Instagram, Phone, MapPin, Upload, X, ImageIcon } from 'lucide-react';

const emptyClient = { name: '', surname: '', ig_name: '', address: '', phone: '', photo: '' };

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [formData, setFormData] = useState(emptyClient);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const loadClients = useCallback(async () => {
    try {
      const res = await clientsAPI.getAll();
      setClients(res.data);
    } catch (err) {
      toast.error('Gabim gjatë ngarkimit të klientëve');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClients();
  }, [loadClients]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAPI.upload(file);
      setFormData((prev) => ({ ...prev, photo: res.data.url }));
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
    if (!formData.name || !formData.surname) {
      toast.error('Emri dhe mbiemri janë të detyrueshme');
      return;
    }
    setSaving(true);
    try {
      if (editingClient) {
        await clientsAPI.update(editingClient.id, formData);
        toast.success('Klienti u përditësua me sukses');
      } else {
        await clientsAPI.create(formData);
        toast.success('Klienti u shtua me sukses');
      }
      setDialogOpen(false);
      setEditingClient(null);
      setFormData(emptyClient);
      setPreviewUrl('');
      loadClients();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Gabim gjatë ruajtjes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    try {
      await clientsAPI.delete(deletingClient.id);
      toast.success('Klienti u fshi me sukses');
      setDeleteDialogOpen(false);
      setDeletingClient(null);
      loadClients();
    } catch (err) {
      toast.error('Gabim gjatë fshirjes');
    }
  };

  const openEdit = (client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      surname: client.surname,
      ig_name: client.ig_name || '',
      address: client.address || '',
      phone: client.phone || '',
      photo: client.photo || '',
    });
    if (client.photo) {
      setPreviewUrl(`${BACKEND_URL}${client.photo}`);
    } else {
      setPreviewUrl('');
    }
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingClient(null);
    setFormData(emptyClient);
    setPreviewUrl('');
    setDialogOpen(true);
  };

  // Search prioritizes IG username
  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.ig_name?.toLowerCase().includes(q) ||
      c.name?.toLowerCase().includes(q) ||
      c.surname?.toLowerCase().includes(q) ||
      c.phone?.includes(q)
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
    <div data-testid="clients-page">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 font-['Outfit']" data-testid="clients-title">
            Klientët
          </h1>
          <p className="text-zinc-500 mt-1">{clients.length} klientë gjithsej</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-orange-600 text-white hover:bg-orange-700 shadow-sm rounded-lg px-6 font-medium transition-transform active:scale-95"
          data-testid="add-client-button"
        >
          <Plus className="w-4 h-4 mr-2" /> Shto Klient
        </Button>
      </div>

      {/* Search - prioritizes IG */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Kërko me IG username, emër, telefon..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 h-10 border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
          data-testid="search-clients-input"
        />
      </div>

      {/* Table */}
      <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl" data-testid="clients-table-card">
        <CardContent className="p-0">
          {filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">Foto</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">IG & Emri</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Adresa</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Telefoni</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow key={client.id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100" data-testid={`client-row-${client.id}`}>
                    <TableCell>
                      {client.photo ? (
                        <img
                          src={`${BACKEND_URL}${client.photo}`}
                          alt={client.name}
                          className="w-10 h-10 rounded-lg object-cover border border-zinc-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-orange-700">
                            {client.name?.[0]}{client.surname?.[0]}
                          </span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        {client.ig_name && (
                          <p className="font-bold text-zinc-900 flex items-center gap-1.5" data-testid={`client-ig-display-${client.id}`}>
                            <Instagram className="w-3.5 h-3.5 text-orange-600" />
                            @{client.ig_name}
                          </p>
                        )}
                        <p className={`text-sm ${client.ig_name ? 'text-zinc-500' : 'font-medium text-zinc-900'}`}>
                          {client.name} {client.surname}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {client.address ? (
                        <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                          <MapPin className="w-3.5 h-3.5" /> {client.address}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {client.phone ? (
                        <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                          <Phone className="w-3.5 h-3.5" /> {client.phone}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" data-testid={`client-actions-${client.id}`}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(client)} data-testid={`edit-client-${client.id}`}>
                            <Pencil className="w-4 h-4 mr-2" /> Ndrysho
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => { setDeletingClient(client); setDeleteDialogOpen(true); }}
                            className="text-red-600 focus:text-red-600"
                            data-testid={`delete-client-${client.id}`}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Fshi
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-16 text-zinc-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
              <p className="text-base font-medium">
                {search ? 'Asnjë klient nuk u gjet' : 'Nuk ka klientë ende'}
              </p>
              <p className="text-sm mt-1">
                {search ? 'Provoni me terma të tjera kërkimi' : 'Shtoni klientin tuaj të parë'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md" data-testid="client-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit'] text-xl">
              {editingClient ? 'Ndrysho Klientin' : 'Shto Klient të Ri'}
            </DialogTitle>
            <DialogDescription>
              {editingClient ? 'Përditësoni të dhënat e klientit' : 'Plotësoni fushat për klientin e ri'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSave} className="space-y-4">
            {/* Photo Upload */}
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Foto e Klientit</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleUpload}
                className="hidden"
                data-testid="client-photo-file-input"
              />
              {previewUrl ? (
                <div className="relative inline-block">
                  <img src={previewUrl} alt="Preview" className="w-24 h-24 rounded-xl object-cover border border-zinc-200" />
                  <button
                    type="button"
                    onClick={() => { setPreviewUrl(''); setFormData((prev) => ({ ...prev, photo: '' })); }}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    data-testid="remove-client-photo-button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="w-24 h-24 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center gap-1 text-zinc-400 hover:border-orange-300 hover:text-orange-500 transition-colors"
                  data-testid="upload-client-photo-button"
                >
                  {uploading ? (
                    <div className="animate-spin w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span className="text-xs font-medium">Ngarko</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-700 font-medium">Emri *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Emri"
                  className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                  data-testid="client-name-input"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700 font-medium">Mbiemri *</Label>
                <Input
                  value={formData.surname}
                  onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                  placeholder="Mbiemri"
                  className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                  data-testid="client-surname-input"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Emri IG</Label>
              <Input
                value={formData.ig_name}
                onChange={(e) => setFormData({ ...formData, ig_name: e.target.value })}
                placeholder="emri_instagram"
                className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                data-testid="client-ig-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Adresa</Label>
              <Input
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Adresa e plotë"
                className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                data-testid="client-address-input"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-700 font-medium">Numri i Telefonit</Label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+355 69 xxx xxxx"
                className="border-zinc-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-lg bg-white"
                data-testid="client-phone-input"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                className="border-zinc-200"
                data-testid="client-cancel-button"
              >
                Anulo
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-orange-600 text-white hover:bg-orange-700"
                data-testid="client-save-button"
              >
                {saving ? 'Duke ruajtur...' : 'Ruaj'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm" data-testid="delete-client-dialog">
          <DialogHeader>
            <DialogTitle className="font-['Outfit']">Fshi Klientin</DialogTitle>
            <DialogDescription>
              Jeni i sigurt që doni të fshini klientin{' '}
              <strong>{deletingClient?.name} {deletingClient?.surname}</strong>? Ky veprim nuk mund të kthehet.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="border-zinc-200"
              data-testid="delete-cancel-button"
            >
              Anulo
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 text-white hover:bg-red-700"
              data-testid="delete-confirm-button"
            >
              Fshi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
