import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Edit2, Trash2, Download, Loader2, User, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { nl } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ChatWidget } from "@/components/chat/ChatWidget";

interface TimelineEvent {
  id: string;
  event_date: string;
  title: string;
  description: string | null;
  people_involved: string | null;
  evidence_notes: string | null;
  event_type: string | null;
}

const eventTypes = [
  { value: "incident", label: "Incident", color: "bg-destructive/20 text-destructive" },
  { value: "gesprek", label: "Gesprek", color: "bg-primary/20 text-primary" },
  { value: "document", label: "Document", color: "bg-accent/20 text-accent-foreground" },
  { value: "getuige", label: "Getuige", color: "bg-success/20 text-success" },
  { value: "general", label: "Overig", color: "bg-muted text-muted-foreground" },
];

const Tijdlijn = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    event_date: "",
    title: "",
    description: "",
    people_involved: "",
    evidence_notes: "",
    event_type: "general",
  });

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("timeline_events")
        .select("*")
        .order("event_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      toast({
        title: "Fout bij laden",
        description: "Kon je tijdlijn niet laden. Probeer het later opnieuw.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      event_date: "",
      title: "",
      description: "",
      people_involved: "",
      evidence_notes: "",
      event_type: "general",
    });
    setEditingEvent(null);
  };

  const handleOpenDialog = (event?: TimelineEvent) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        event_date: event.event_date,
        title: event.title,
        description: event.description || "",
        people_involved: event.people_involved || "",
        evidence_notes: event.evidence_notes || "",
        event_type: event.event_type || "general",
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    try {
      if (editingEvent) {
        const { error } = await supabase
          .from("timeline_events")
          .update({
            event_date: formData.event_date,
            title: formData.title,
            description: formData.description || null,
            people_involved: formData.people_involved || null,
            evidence_notes: formData.evidence_notes || null,
            event_type: formData.event_type,
          })
          .eq("id", editingEvent.id);

        if (error) throw error;
        toast({ title: "Gebeurtenis bijgewerkt" });
      } else {
        const { error } = await supabase.from("timeline_events").insert({
          user_id: user.id,
          event_date: formData.event_date,
          title: formData.title,
          description: formData.description || null,
          people_involved: formData.people_involved || null,
          evidence_notes: formData.evidence_notes || null,
          event_type: formData.event_type,
        });

        if (error) throw error;
        toast({ title: "Gebeurtenis toegevoegd" });
      }

      await fetchEvents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Fout bij opslaan",
        description: "Kon de gebeurtenis niet opslaan. Probeer het opnieuw.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Weet je zeker dat je deze gebeurtenis wilt verwijderen?")) return;

    try {
      const { error } = await supabase.from("timeline_events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Gebeurtenis verwijderd" });
      await fetchEvents();
    } catch (error) {
      toast({
        title: "Fout bij verwijderen",
        description: "Kon de gebeurtenis niet verwijderen.",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const exportData = events.map((e) => ({
      Datum: format(new Date(e.event_date), "d MMMM yyyy", { locale: nl }),
      Titel: e.title,
      Beschrijving: e.description || "",
      "Betrokken personen": e.people_involved || "",
      Bewijsnotities: e.evidence_notes || "",
      Type: eventTypes.find((t) => t.value === e.event_type)?.label || "Overig",
    }));

    const header = Object.keys(exportData[0] || {}).join("\t");
    const rows = exportData.map((row) => Object.values(row).join("\t")).join("\n");
    const content = header + "\n" + rows;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `tijdlijn-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: "Tijdlijn geëxporteerd" });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 py-12 px-4">
          <div className="max-w-lg mx-auto text-center">
            <Card className="shadow-card">
              <CardContent className="pt-8 pb-6 space-y-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-heading font-bold mb-2">Log in om je tijdlijn te gebruiken</h1>
                  <p className="text-muted-foreground">
                    Om gebeurtenissen op te slaan en later terug te kijken, heb je een account nodig. 
                    Je gegevens blijven privé en veilig.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/auth">
                    <Button className="w-full">Inloggen of registreren</Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" className="w-full">Terug naar home</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
        <ChatWidget />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-heading font-bold">Je Tijdlijn</h1>
              <p className="text-muted-foreground mt-1">
                Documenteer wat er is gebeurd. Dit helpt bij gesprekken met adviseurs.
              </p>
            </div>
            <div className="flex gap-2">
              {events.length > 0 && (
                <Button variant="outline" onClick={handleExport} className="gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Exporteren</span>
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Toevoegen</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? "Gebeurtenis bewerken" : "Nieuwe gebeurtenis"}
                    </DialogTitle>
                    <DialogDescription>
                      Beschrijf wat er is gebeurd. Neem je tijd en vul in wat je weet.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event_date">Datum</Label>
                        <Input
                          id="event_date"
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData((p) => ({ ...p, event_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_type">Type</Label>
                        <select
                          id="event_type"
                          value={formData.event_type}
                          onChange={(e) => setFormData((p) => ({ ...p, event_type: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {eventTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Korte titel</Label>
                      <Input
                        id="title"
                        placeholder="Bijv: Gesprek met manager"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Wat is er gebeurd?</Label>
                      <Textarea
                        id="description"
                        placeholder="Beschrijf in je eigen woorden wat er is gebeurd..."
                        value={formData.description}
                        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="people_involved">Wie waren erbij?</Label>
                      <Input
                        id="people_involved"
                        placeholder="Bijv: Jan (manager), Lisa (HR)"
                        value={formData.people_involved}
                        onChange={(e) => setFormData((p) => ({ ...p, people_involved: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="evidence_notes">Bewijs of notities</Label>
                      <Textarea
                        id="evidence_notes"
                        placeholder="Heb je e-mails, berichten of andere bewijzen? Noteer hier waar je ze kunt vinden."
                        value={formData.evidence_notes}
                        onChange={(e) => setFormData((p) => ({ ...p, evidence_notes: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        Annuleren
                      </Button>
                      <Button type="submit" disabled={saving} className="flex-1">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {editingEvent ? "Bijwerken" : "Opslaan"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {events.length === 0 ? (
            <Card className="shadow-card">
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Je tijdlijn is nog leeg</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Begin met het toevoegen van gebeurtenissen. Denk aan gesprekken, incidenten, 
                  of momenten die belangrijk zijn voor je situatie.
                </p>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Eerste gebeurtenis toevoegen
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <AnimatePresence>
                {events.map((event, index) => {
                  const typeInfo = eventTypes.find((t) => t.value === event.event_type) || eventTypes[4];
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-12 pb-8"
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-2 top-1 w-5 h-5 rounded-full bg-background border-2 border-primary flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>

                      <Card className="shadow-soft hover:shadow-card transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeInfo.color}`}>
                                  {typeInfo.label}
                                </span>
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(event.event_date), "d MMMM yyyy", { locale: nl })}
                                </span>
                              </div>
                              <h3 className="font-semibold text-lg">{event.title}</h3>
                              {event.description && (
                                <p className="text-muted-foreground mt-2 whitespace-pre-wrap">
                                  {event.description}
                                </p>
                              )}
                              {event.people_involved && (
                                <p className="text-sm text-muted-foreground mt-2">
                                  <span className="font-medium">Betrokken:</span> {event.people_involved}
                                </p>
                              )}
                              {event.evidence_notes && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                                  <span className="font-medium">Bewijs:</span> {event.evidence_notes}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(event)}
                                aria-label="Bewerken"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(event.id)}
                                aria-label="Verwijderen"
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          <Card className="mt-8 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium">Tip: Wees zo specifiek mogelijk</p>
                  <p className="text-muted-foreground mt-1">
                    Noteer data, namen, exacte woorden die zijn gezegd. Details die nu onbelangrijk lijken, 
                    kunnen later cruciaal zijn voor je zaak.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Tijdlijn;
