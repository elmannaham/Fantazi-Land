"use client";

import { Card, CardBody } from "@/components/atoms/Card";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";

interface Booking {
  id: string | number;
  client: string;
  service: string;
  date: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

interface BookingsListProps {
  bookings: Booking[];
  isLoading?: boolean;
  onAccept?: (id: string | number) => void;
  onDecline?: (id: string | number) => void;
  onDetails?: (id: string | number) => void;
}

const statusConfig = {
  pending: { label: "En attente", variant: "warning" as const },
  confirmed: { label: "Confirmée", variant: "success" as const },
  completed: { label: "Complétée", variant: "info" as const },
  cancelled: { label: "Annulée", variant: "error" as const },
};

export function BookingsList({
  bookings,
  isLoading = false,
  onAccept,
  onDecline,
  onDetails,
}: BookingsListProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-32 bg-slate-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardBody className="text-center py-12">
          <p className="text-slate-600">Aucune réservation pour le moment</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <Card key={booking.id}>
          <CardBody>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-slate-900">
                  {booking.client}
                </h3>
                <p className="text-sm text-slate-600">{booking.service}</p>
              </div>
              <Badge
                label={statusConfig[booking.status].label}
                variant={statusConfig[booking.status].variant}
              />
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-slate-100">
              <div className="text-sm text-slate-600">
                📅 {booking.date} • €{booking.price}
              </div>
              <div className="flex gap-2">
                {booking.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => onAccept?.(booking.id)}
                    >
                      Accepter
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onDecline?.(booking.id)}
                    >
                      Refuser
                    </Button>
                  </>
                )}
                {booking.status !== "pending" && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onDetails?.(booking.id)}
                  >
                    Détails
                  </Button>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      ))}
    </div>
  );
}
