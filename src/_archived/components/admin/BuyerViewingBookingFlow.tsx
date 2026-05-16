import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, Clock, MapPin, CheckCircle, Phone, User,
  Bell, ArrowRight, ArrowLeft, Home, RefreshCw, Eye, Zap
} from "lucide-react";

const timeSlots = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const dates = [
  { day: "Mon", date: "24", month: "Mar", available: true },
  { day: "Tue", date: "25", month: "Mar", available: true },
  { day: "Wed", date: "26", month: "Mar", available: false },
  { day: "Thu", date: "27", month: "Mar", available: true },
  { day: "Fri", date: "28", month: "Mar", available: true },
  { day: "Sat", date: "29", month: "Mar", available: true },
  { day: "Sun", date: "30", month: "Mar", available: false },
];

const bookingStats = {
  totalBookings: 248, completionRate: 82, avgBookingTime: "48s",
  showUpRate: 78, conversionToOffer: 24, cancelRate: 12,
};

const recentBookings = [
  { buyer: "Ahmad R.", property: "Modern Villa Seminyak", date: "Mar 24, 10:00", status: "confirmed" },
  { buyer: "Sarah L.", property: "Penthouse Canggu", date: "Mar 25, 14:00", status: "pending" },
  { buyer: "David K.", property: "Beach House Nusa Dua", date: "Mar 26, 11:00", status: "completed" },
  { buyer: "Lisa M.", property: "Studio Ubud", date: "Mar 27, 09:00", status: "cancelled" },
];

const statusColor = (s: string) =>
  s === "confirmed" ? "bg-chart-1/15 text-chart-1 border-chart-1/30" :
  s === "pending" ? "bg-chart-3/15 text-chart-3 border-chart-3/30" :
  s === "completed" ? "bg-primary/15 text-primary border-primary/30" :
  "bg-destructive/15 text-destructive border-destructive/30";

const steps = ["Property", "Date & Time", "Contact", "Confirmed"];

const BuyerViewingBookingFlow: React.FC = () => {
  const [step, setStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [reminder, setReminder] = useState(true);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            Buyer Viewing Booking Flow
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Effortless property visit scheduling</p>
        </div>
        <Badge className="bg-chart-1/15 text-chart-1 border-chart-1/30 text-xs">
          {bookingStats.completionRate}% Completion
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
        {[
          { label: "Total Bookings", value: bookingStats.totalBookings },
          { label: "Completion", value: `${bookingStats.completionRate}%` },
          { label: "Avg Time", value: bookingStats.avgBookingTime },
          { label: "Show-Up", value: `${bookingStats.showUpRate}%` },
          { label: "→ Offer", value: `${bookingStats.conversionToOffer}%` },
          { label: "Cancel", value: `${bookingStats.cancelRate}%` },
        ].map(m => (
          <Card key={m.label} className="border-border/50">
            <CardContent className="p-2 text-center">
              <div className="text-sm font-bold text-foreground">{m.value}</div>
              <div className="text-[9px] text-muted-foreground uppercase">{m.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Booking Flow */}
        <div className="md:col-span-2 space-y-3">
          {/* Step Indicator */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center gap-1 mb-2">
                {steps.map((s, i) => (
                  <React.Fragment key={s}>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${
                      i <= step ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"
                    }`}>
                      {i < step ? <CheckCircle className="h-3 w-3" /> : <span className="w-3 text-center">{i + 1}</span>}
                      <span className="hidden sm:inline">{s}</span>
                    </div>
                    {i < steps.length - 1 && <div className={`flex-1 h-px ${i < step ? "bg-primary" : "bg-border"}`} />}
                  </React.Fragment>
                ))}
              </div>
              <Progress value={((step + 1) / steps.length) * 100} className="h-1.5" />
            </CardContent>
          </Card>

          <Card className="border-border/50 min-h-[280px]">
            <CardContent className="p-4">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div key="prop" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border-border/30">
                      <div className="h-32 bg-muted rounded-t-lg flex items-center justify-center">
                        <Home className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <CardContent className="p-3">
                        <div className="text-sm font-bold text-foreground">Modern 3BR Villa with Pool</div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" /> Seminyak, Bali
                        </div>
                        <div className="text-base font-bold text-primary mt-2">Rp 4,200,000,000</div>
                        <div className="flex gap-1 mt-2">
                          <Badge variant="secondary" className="text-[9px]">3 BR</Badge>
                          <Badge variant="secondary" className="text-[9px]">2 BA</Badge>
                          <Badge variant="secondary" className="text-[9px]">Pool</Badge>
                          <Badge variant="secondary" className="text-[9px]">280 m²</Badge>
                        </div>
                      </CardContent>
                    </Card>
                    <Button className="w-full mt-3" size="sm" onClick={() => setStep(1)}>
                      <Zap className="h-3.5 w-3.5 mr-1" /> Request Earliest Viewing
                    </Button>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div key="date" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    <div>
                      <span className="text-xs font-bold text-foreground">Select Date</span>
                      <div className="grid grid-cols-7 gap-1.5 mt-2">
                        {dates.map((d, i) => (
                          <div key={i} onClick={() => d.available && setSelectedDate(i)}
                            className={`p-2 rounded-lg text-center cursor-pointer transition-colors ${
                              !d.available ? "opacity-30 cursor-not-allowed" :
                              selectedDate === i ? "bg-primary text-primary-foreground" : "border border-border/50 hover:bg-muted/30"
                            }`}>
                            <div className="text-[9px] text-inherit">{d.day}</div>
                            <div className="text-sm font-bold">{d.date}</div>
                            <div className="text-[8px]">{d.month}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-foreground">Available Time Slots</span>
                      <div className="grid grid-cols-4 gap-1.5 mt-2">
                        {timeSlots.map(t => (
                          <Badge key={t} variant={selectedTime === t ? "default" : "secondary"}
                            onClick={() => setSelectedTime(t)}
                            className="cursor-pointer text-[10px] justify-center py-1.5">{t}</Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="contact" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3 max-w-sm mx-auto">
                    <div className="text-center mb-4">
                      <User className="h-8 w-8 mx-auto text-primary mb-2" />
                      <h3 className="text-base font-bold text-foreground">Confirm Your Details</h3>
                    </div>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Full name" className="pl-10" defaultValue="Ahmad Rizal" />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Phone number" className="pl-10" defaultValue="+62 812 3456 7890" />
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg border border-border/30">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-primary" />
                        <span className="text-xs text-foreground">Send me a reminder</span>
                      </div>
                      <button onClick={() => setReminder(!reminder)}
                        className={`w-8 h-5 rounded-full transition-colors ${reminder ? "bg-primary" : "bg-muted"}`}>
                        <div className={`w-4 h-4 bg-background rounded-full transition-transform ${reminder ? "translate-x-3.5" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                      <CheckCircle className="h-16 w-16 mx-auto text-chart-1 mb-3" />
                    </motion.div>
                    <h3 className="text-lg font-bold text-foreground">Viewing Booked!</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedDate !== null ? dates[selectedDate].day + " " + dates[selectedDate].date + " " + dates[selectedDate].month : "—"} at {selectedTime || "—"}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Agent will confirm within 2 hours</p>
                    <div className="flex gap-2 justify-center mt-4">
                      <Button size="sm" variant="outline" className="text-xs">
                        <RefreshCw className="h-3 w-3 mr-1" /> Reschedule
                      </Button>
                      <Button size="sm" className="text-xs">
                        <Eye className="h-3 w-3 mr-1" /> View Status
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {step < 3 && (
            <div className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}>
                <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Back
              </Button>
              <Button size="sm" onClick={() => setStep(step + 1)} disabled={step === 1 && (selectedDate === null || !selectedTime)}>
                {step === 2 ? "Confirm Booking" : "Continue"} <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </div>
          )}
        </div>

        {/* Recent Bookings Sidebar */}
        <div className="space-y-3">
          <Card className="border-border/50">
            <CardHeader className="pb-2 pt-3 px-3">
              <CardTitle className="text-xs flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" /> Recent Bookings
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3 space-y-1.5">
              {recentBookings.map((b, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded border border-border/20">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-foreground truncate">{b.buyer}</div>
                    <div className="text-[9px] text-muted-foreground truncate">{b.property}</div>
                    <div className="text-[9px] text-muted-foreground">{b.date}</div>
                  </div>
                  <Badge className={`${statusColor(b.status)} text-[8px]`}>{b.status}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <Eye className="h-4 w-4 text-primary mb-1" />
              <div className="text-xs font-bold text-foreground">Viewing Status Tracker</div>
              <div className="space-y-1.5 mt-2">
                {["Requested", "Agent Confirmed", "Reminder Sent", "Viewing Complete"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full border-2 ${i <= 1 ? "border-chart-1 bg-chart-1" : "border-border"}`} />
                    <span className={`text-[10px] ${i <= 1 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BuyerViewingBookingFlow;
