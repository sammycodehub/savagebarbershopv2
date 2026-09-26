export type UserRole = "customer" | "admin" | "barber";

export interface Profile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Service {
  id: number;
  service_id_csv: string | null;
  service_name: string;
  duration_mins: number;
  price: number;
  description?: string | null;
  is_active: boolean;
  created_at: string;
}

export interface OperatingHours {
  id: number;
  day_of_week: number; // 0 = Sunday ... 6 = Saturday
  open_time: string; // "HH:mm:ss"
  close_time: string;
  is_closed: boolean;
}

export interface BarberSchedule {
  id: number;
  barber_id: string;
  override_date: string;
  start_time: string | null;
  end_time: string | null;
  is_off: boolean;
  reason: string | null;
}

export type BookingStatus = "held" | "confirmed" | "completed" | "cancelled";
export type PaymentOption = "pay_online" | "pay_in_person";

export interface Booking {
  id: string;
  customer_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  service_id: number;
  appointment_timestamp: string;
  buffer_end_timestamp: string;
  status: BookingStatus;
  payment_method: PaymentOption;
  held_until: string | null;
  created_at: string;
  updated_at: string;
  // Convenience joins, populated by API routes when needed
  service?: Service;
}

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned";

export interface Payment {
  id: string;
  booking_id: string;
  paystack_reference: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  gateway_response: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface BookingFormValues {
  serviceId: number;
  appointmentTimestamp: string;
  fullName: string;
  phoneNumber: string;
  paymentMethod: PaymentOption;
}

export interface WhatsAppPayload {
  customerName: string;
  phoneNumber: string;
  serviceName: string;
  dateTimeLabel: string;
  totalPrice: number;
  paymentStatus: "Paid Online" | "Pay in Person";
}
