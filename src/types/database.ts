export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type GuestHouseStatus = 'active' | 'trial' | 'suspended';
export type RoomStatus = 'available' | 'occupied' | 'cleaning';
export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type UserRole = 'owner' | 'manager' | 'housekeeping';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer';
export type Currency = 'MVR' | 'USD';

export interface Database {
  public: {
    Tables: {
      guesthouses: {
        Row: {
          id: string;
          name: string;
          island: string;
          total_rooms: number;
          currency: Currency;
          settings: Json;
          status: GuestHouseStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['guesthouses']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['guesthouses']['Insert']>;
      };
      rooms: {
        Row: {
          id: string;
          guesthouse_id: string;
          number: string;
          status: RoomStatus;
          price_per_night: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rooms']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['rooms']['Insert']>;
      };
      bookings: {
        Row: {
          id: string;
          guesthouse_id: string;
          room_id: string;
          guest_name: string;
          guest_phone: string;
          guest_email: string;
          check_in: string;
          check_out: string;
          guests: number;
          price: number;
          currency: Currency;
          status: BookingStatus;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>;
      };
      payments: {
        Row: {
          id: string;
          guesthouse_id: string;
          booking_id: string;
          amount: number;
          currency: Currency;
          method: PaymentMethod;
          date: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['payments']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['payments']['Insert']>;
      };
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      memberships: {
        Row: {
          id: string;
          user_id: string;
          guesthouse_id: string;
          role: UserRole;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['memberships']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['memberships']['Insert']>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      guesthouse_status: GuestHouseStatus;
      room_status: RoomStatus;
      booking_status: BookingStatus;
      user_role: UserRole;
      payment_method: PaymentMethod;
      currency: Currency;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
