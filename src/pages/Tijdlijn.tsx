import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Calendar, Edit2, Trash2, Download, Loader2, User, FileText } from "lucide-react";
import { format } from "date-fns";
import { nl, enUS } from "date-fns/locale";
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

const Tijdlijn = () => {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const dateLocale = language === 'nl' ? nl : enUS;
  
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null);
  const [saving, setSaving] = useState(false);

  const eventTypes = [
    { value: "incident", label: t.eventTypeIncident, color: "bg-destructive/20 text-destructive" },
    { value: "gesprek", label: t.eventTypeConversation, color: "bg-primary/20 text-primary" },
    { value: "document", label: t.eventTypeDocument, color: "bg-accent/20 text-accent-foreground" },
    { value: "getuige", label: t.eventTypeWitness, color: "bg-success/20 text-success" },
    { value: "general", label: t.eventTypeOther, color: "bg-muted text-muted-foreground" },
  ];

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
        title: "Error",
        description: t.tijdlijnLoadError,
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
        toast({ title: t.tijdlijnEventUpdated });
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
        toast({ title: t.tijdlijnEventAdded });
      }

      await fetchEvents();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: t.tijdlijnSaveError,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.tijdlijnDeleteConfirm)) return;

    try {
      const { error } = await supabase.from("timeline_events").delete().eq("id", id);
      if (error) throw error;
      toast({ title: t.tijdlijnEventDeleted });
      await fetchEvents();
    } catch (error) {
      toast({
        title: "Error",
        description: t.tijdlijnDeleteError,
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const exportData = events.map((e) => ({
      [t.tijdlijnDate]: format(new Date(e.event_date), "d MMMM yyyy", { locale: dateLocale }),
      [t.tijdlijnShortTitle]: e.title,
      [t.tijdlijnWhatHappened]: e.description || "",
      [t.tijdlijnWhoInvolved]: e.people_involved || "",
      [t.tijdlijnEvidence]: e.evidence_notes || "",
      [t.tijdlijnType]: eventTypes.find((tt) => tt.value === e.event_type)?.label || t.eventTypeOther,
    }));

    const header = Object.keys(exportData[0] || {}).join("\t");
    const rows = exportData.map((row) => Object.values(row).join("\t")).join("\n");
    const content = header + "\n" + rows;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `timeline-${format(new Date(), "yyyy-MM-dd")}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: t.tijdlijnExported });
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
                  <h1 className="text-2xl font-heading font-bold mb-2">{t.tijdlijnLoginTitle}</h1>
                  <p className="text-muted-foreground">
                    {t.tijdlijnLoginDesc}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <Link to="/auth">
                    <Button className="w-full">{t.tijdlijnLoginButton}</Button>
                  </Link>
                  <Link to="/">
                    <Button variant="outline" className="w-full">{t.tijdlijnBackHome}</Button>
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
              <h1 className="text-3xl font-heading font-bold">{t.tijdlijnTitle}</h1>
              <p className="text-muted-foreground mt-1">
                {t.tijdlijnSubtitle}
              </p>
            </div>
            <div className="flex gap-2">
              {events.length > 0 && (
                <Button variant="outline" onClick={handleExport} className="gap-2">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.tijdlijnExport}</span>
                </Button>
              )}
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => handleOpenDialog()} className="gap-2">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.tijdlijnAdd}</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>
                      {editingEvent ? t.tijdlijnEditEvent : t.tijdlijnNewEvent}
                    </DialogTitle>
                    <DialogDescription>
                      {t.tijdlijnEventDesc}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="event_date">{t.tijdlijnDate}</Label>
                        <Input
                          id="event_date"
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData((p) => ({ ...p, event_date: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event_type">{t.tijdlijnType}</Label>
                        <select
                          id="event_type"
                          value={formData.event_type}
                          onChange={(e) => setFormData((p) => ({ ...p, event_type: e.target.value }))}
                          className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                        >
                          {eventTypes.map((tt) => (
                            <option key={tt.value} value={tt.value}>{tt.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">{t.tijdlijnShortTitle}</Label>
                      <Input
                        id="title"
                        placeholder={t.tijdlijnTitlePlaceholder}
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">{t.tijdlijnWhatHappened}</Label>
                      <Textarea
                        id="description"
                        placeholder={t.tijdlijnWhatHappenedPlaceholder}
                        value={formData.description}
                        onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="people_involved">{t.tijdlijnWhoInvolved}</Label>
                      <Input
                        id="people_involved"
                        placeholder={t.tijdlijnWhoInvolvedPlaceholder}
                        value={formData.people_involved}
                        onChange={(e) => setFormData((p) => ({ ...p, people_involved: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="evidence_notes">{t.tijdlijnEvidence}</Label>
                      <Textarea
                        id="evidence_notes"
                        placeholder={t.tijdlijnEvidencePlaceholder}
                        value={formData.evidence_notes}
                        onChange={(e) => setFormData((p) => ({ ...p, evidence_notes: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)} className="flex-1">
                        {t.tijdlijnCancel}
                      </Button>
                      <Button type="submit" disabled={saving} className="flex-1">
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {editingEvent ? t.tijdlijnUpdate : t.tijdlijnSave}
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
                <h3 className="text-lg font-semibold mb-2">{t.tijdlijnEmpty}</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  {t.tijdlijnEmptyDesc}
                </p>
                <Button onClick={() => handleOpenDialog()} className="gap-2">
                  <Plus className="w-4 h-4" />
                  {t.tijdlijnFirstEvent}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />

              <AnimatePresence>
                {events.map((event, index) => {
                  const typeInfo = eventTypes.find((tt) => tt.value === event.event_type) || eventTypes[4];
                  
                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="relative pl-12 pb-8"
                    >
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
                                  {format(new Date(event.event_date), "d MMMM yyyy", { locale: dateLocale })}
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
                                  <span className="font-medium">{t.tijdlijnInvolved}</span> {event.people_involved}
                                </p>
                              )}
                              {event.evidence_notes && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm">
                                  <span className="font-medium">{t.tijdlijnEvidenceLabel}</span> {event.evidence_notes}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleOpenDialog(event)}
                                className="h-8 w-8"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(event.id)}
                                className="h-8 w-8 text-destructive hover:text-destructive"
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
        </div>
      </main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Tijdlijn;