import React, { useEffect, useState, useCallback } from 'react';
import { clientsAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Plus, Search, MoreHorizontal, Pencil, Trash2, Users, Instagram, Phone, MapPin } from 'lucide-react';

const emptyClient = { name: '', surname: '', ig_name: '', address: '', phone: '' };

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
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingClient(null);
    setFormData(emptyClient);
    setDialogOpen(true);
  };

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.surname?.toLowerCase().includes(q) ||
      c.ig_name?.toLowerCase().includes(q) ||
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

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <Input
          placeholder="Kërko klientë..."
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
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider">Emri & Mbiemri</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden md:table-cell">IG</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden lg:table-cell">Adresa</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider hidden sm:table-cell">Telefoni</TableHead>
                  <TableHead className="bg-zinc-50 text-zinc-500 font-medium text-xs uppercase tracking-wider w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((client) => (
                  <TableRow key={client.id} className="hover:bg-zinc-50/50 transition-colors border-b border-zinc-100" data-testid={`client-row-${client.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-semibold text-orange-700">
                            {client.name?.[0]}{client.surname?.[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-zinc-900">{client.name} {client.surname}</p>
                          <p className="text-xs text-zinc-400 md:hidden">
                            {client.ig_name && `@${client.ig_name}`}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {client.ig_name ? (
                        <span className="flex items-center gap-1.5 text-sm text-zinc-600">
                          <Instagram className="w-3.5 h-3.5" /> @{client.ig_name}
                        </span>
                      ) : (
                        <span className="text-zinc-300">-</span>
                      )}
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
