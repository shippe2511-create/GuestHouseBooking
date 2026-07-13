import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Download, Send } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import { usePayments } from '../../src/hooks/usePayments';
import { sendReceiptEmail } from '../../src/lib/emails';
import Logo from '../../src/components/Logo';
import type { PaymentMethod, Currency, Tables } from '../../src/types/database';

interface DisplayPayment {
  id: string;
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  date: Date;
  method: PaymentMethod;
  amount: number;
  currency: Currency;
  nights: number;
  pricePerNight: number;
  greenTax: number;
  bookingId: string;
}

const mockPayments: DisplayPayment[] = [
  { id: '1', guestName: 'Ahmed Hassan', guestEmail: 'ahmed@email.com', roomNumber: '101', date: new Date(2026, 6, 13), method: 'card', amount: 13108, currency: 'MVR', nights: 5, pricePerNight: 2500, greenTax: 608, bookingId: 'b1' },
  { id: '2', guestName: 'Sarah Chen', guestEmail: 'sarah@email.com', roomNumber: '102', date: new Date(2026, 6, 12), method: 'bank_transfer', amount: 15730, currency: 'MVR', nights: 6, pricePerNight: 2500, greenTax: 730, bookingId: 'b2' },
  { id: '3', guestName: 'John Smith', guestEmail: 'john@email.com', roomNumber: '104', date: new Date(2026, 6, 11), method: 'cash', amount: 17387, currency: 'MVR', nights: 6, pricePerNight: 2800, greenTax: 587, bookingId: 'b3' },
  { id: '4', guestName: 'Maria Garcia', guestEmail: 'maria@email.com', roomNumber: '201', date: new Date(2026, 6, 10), method: 'card', amount: 16486, currency: 'MVR', nights: 5, pricePerNight: 3200, greenTax: 486, bookingId: 'b4' },
  { id: '5', guestName: 'James Wilson', guestEmail: 'james@email.com', roomNumber: '202', date: new Date(2026, 6, 9), method: 'card', amount: 23192, currency: 'MVR', nights: 7, pricePerNight: 3200, greenTax: 792, bookingId: 'b5' },
  { id: '6', guestName: 'Lisa Anderson', guestEmail: 'lisa@email.com', roomNumber: '204', date: new Date(2026, 6, 8), method: 'bank_transfer', amount: 14487, currency: 'MVR', nights: 4, pricePerNight: 3500, greenTax: 487, bookingId: 'b6' },
  { id: '7', guestName: 'David Brown', guestEmail: 'david@email.com', roomNumber: '301', date: new Date(2026, 6, 7), method: 'cash', amount: 20608, currency: 'MVR', nights: 5, pricePerNight: 4000, greenTax: 608, bookingId: 'b7' },
  { id: '8', guestName: 'Emma Davis', guestEmail: 'emma@email.com', roomNumber: '303', date: new Date(2026, 6, 6), method: 'card', amount: 32354, currency: 'MVR', nights: 7, pricePerNight: 4500, greenTax: 854, bookingId: 'b8' },
];

export default function PaymentsScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1024;
  const { currentGuesthouse } = useCurrentGuesthouse();

  const { payments: supabasePayments, loading } = usePayments(currentGuesthouse?.id);

  const paymentsData: DisplayPayment[] = useMemo(() => {
    if (supabasePayments.length > 0) {
      return supabasePayments.map((p) => {
        const pricePerNight = p.bookings?.rooms ? Math.round(p.amount * 0.95 / 5) : Math.round(p.amount / 5);
        const greenTax = Math.round(p.amount * 0.05);
        const nights = pricePerNight > 0 ? Math.round((p.amount - greenTax) / pricePerNight) : 5;
        return {
          id: p.id,
          guestName: p.bookings?.guest_name || 'Guest',
          guestEmail: p.bookings?.guest_email || '',
          roomNumber: p.bookings?.rooms?.number || '---',
          date: new Date(p.created_at),
          method: p.method,
          amount: Number(p.amount),
          currency: p.currency,
          nights,
          pricePerNight,
          greenTax,
          bookingId: p.booking_id,
        };
      });
    }
    return mockPayments;
  }, [supabasePayments]);

  const [selectedPayment, setSelectedPayment] = useState<DisplayPayment | null>(null);

  // Select first payment when data loads
  useMemo(() => {
    if (paymentsData.length > 0 && !selectedPayment) {
      setSelectedPayment(paymentsData[0]);
    }
  }, [paymentsData]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMethod = (method: PaymentMethod) => {
    switch (method) {
      case 'cash':
        return 'Cash';
      case 'card':
        return 'Card';
      case 'bank_transfer':
        return 'Bank Transfer';
    }
  };

  const [sendingReceipt, setSendingReceipt] = useState(false);

  const handleExportCSV = () => {
    const csvRows = [
      ['Guest', 'Room', 'Date', 'Method', 'Amount', 'Currency'].join(','),
      ...paymentsData.map(p => [
        `"${p.guestName}"`,
        p.roomNumber,
        formatDate(p.date),
        p.method,
        p.amount,
        p.currency
      ].join(','))
    ];
    const csv = csvRows.join('\n');
    console.log('CSV Export:', csv);
    Alert.alert('Export', 'CSV data copied to console. For full export, implement file sharing.');
  };

  const handleSendReceipt = async () => {
    if (!selectedPayment || !currentGuesthouse) return;

    if (!selectedPayment.guestEmail) {
      Alert.alert('No Email', 'This guest does not have an email address on file.');
      return;
    }

    setSendingReceipt(true);
    try {
      const booking: Tables<'bookings'> = {
        id: selectedPayment.bookingId,
        guesthouse_id: currentGuesthouse.id,
        room_id: '',
        guest_name: selectedPayment.guestName,
        guest_email: selectedPayment.guestEmail,
        guest_phone: '',
        check_in: '',
        check_out: '',
        guests: 1,
        price: selectedPayment.amount,
        currency: selectedPayment.currency,
        status: 'confirmed',
        total_nights: selectedPayment.nights,
        total_amount: selectedPayment.amount,
        notes: null,
        source: null,
        created_at: selectedPayment.date.toISOString(),
        updated_at: selectedPayment.date.toISOString(),
      };

      const payment: Tables<'payments'> = {
        id: selectedPayment.id,
        guesthouse_id: currentGuesthouse.id,
        booking_id: selectedPayment.bookingId,
        amount: selectedPayment.amount,
        currency: selectedPayment.currency,
        method: selectedPayment.method,
        status: 'completed',
        notes: null,
        created_at: selectedPayment.date.toISOString(),
        updated_at: selectedPayment.date.toISOString(),
      };

      const success = await sendReceiptEmail({
        booking,
        payment,
        guesthouse: currentGuesthouse,
        roomNumber: selectedPayment.roomNumber,
      });

      if (success) {
        Alert.alert('Sent', `Receipt emailed to ${selectedPayment.guestEmail}`);
      } else {
        Alert.alert('Failed', 'Could not send receipt. Check email service configuration.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send receipt email.');
    } finally {
      setSendingReceipt(false);
    }
  };

  const guesthouseName = currentGuesthouse?.name || 'Hudhu Veli';
  const guesthouseIsland = currentGuesthouse?.island || 'Maafushi';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            gap: 20,
          }}
        >
          {/* Payments Table */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                backgroundColor: theme.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.line,
                overflow: 'hidden',
              }}
            >
              {/* Header */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: 18,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.line,
                }}
              >
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 17,
                    color: theme.ink,
                  }}
                >
                  Recent Payments
                </Text>
                <Pressable
                  onPress={handleExportCSV}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: pressed ? theme.chip : theme.surface,
                    borderWidth: 1,
                    borderColor: theme.inputLine,
                    borderRadius: 9,
                    paddingVertical: 9,
                    paddingHorizontal: 14,
                  })}
                >
                  <Download size={16} color={theme.ink3} strokeWidth={1.7} />
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 13,
                      color: theme.ink3,
                    }}
                  >
                    Export CSV
                  </Text>
                </Pressable>
              </View>

              {/* Table Header */}
              <View
                style={{
                  flexDirection: 'row',
                  backgroundColor: theme.tableHead,
                  paddingVertical: 12,
                  paddingHorizontal: 18,
                  borderBottomWidth: 1,
                  borderBottomColor: theme.line,
                }}
              >
                <Text style={[headerStyle, { flex: 1, color: theme.tableHeader }]}>
                  GUEST & ROOM
                </Text>
                <Text style={[headerStyle, { width: 100, color: theme.tableHeader }]}>
                  DATE
                </Text>
                <Text style={[headerStyle, { width: 100, color: theme.tableHeader }]}>
                  METHOD
                </Text>
                <Text
                  style={[
                    headerStyle,
                    { width: 120, textAlign: 'right', color: theme.tableHeader },
                  ]}
                >
                  AMOUNT
                </Text>
              </View>

              {/* Loading / Table Rows */}
              {loading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.light.primary} />
                  <Text
                    style={{
                      fontFamily: 'Inter_500Medium',
                      fontSize: 14,
                      color: theme.muted,
                      marginTop: 12,
                    }}
                  >
                    Loading payments...
                  </Text>
                </View>
              ) : (
                paymentsData.map((payment, index) => (
                  <Pressable
                    key={payment.id}
                    onPress={() => setSelectedPayment(payment)}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      backgroundColor:
                        selectedPayment?.id === payment.id
                          ? colors.light.primarySoft
                          : pressed
                          ? theme.chip
                          : index % 2 === 0
                          ? theme.surface
                          : theme.altRow,
                      borderBottomWidth: index < paymentsData.length - 1 ? 1 : 0,
                      borderBottomColor: theme.rowLine,
                    })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 14,
                          color:
                            selectedPayment?.id === payment.id
                              ? colors.light.primary
                              : theme.ink,
                        }}
                      >
                        {payment.guestName}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          color: theme.muted,
                          marginTop: 2,
                        }}
                      >
                        Room {payment.roomNumber}
                      </Text>
                    </View>
                    <Text
                      style={{
                        width: 100,
                        fontFamily: 'Inter_400Regular',
                        fontSize: 13,
                        color: theme.ink2,
                      }}
                    >
                      {formatDate(payment.date)}
                    </Text>
                    <View style={{ width: 100 }}>
                      <MethodBadge method={payment.method} theme={theme} />
                    </View>
                    <Text
                      style={{
                        width: 120,
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 14,
                        color: theme.ink,
                        textAlign: 'right',
                      }}
                    >
                      {payment.currency} {payment.amount.toLocaleString()}
                    </Text>
                  </Pressable>
                ))
              )}
            </View>
          </View>

          {/* Receipt Card */}
          {selectedPayment && (
            <View
              style={{
                width: isDesktop ? 340 : '100%',
                backgroundColor: theme.surface,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: theme.line,
                overflow: 'hidden',
              }}
            >
              {/* Receipt Header */}
              <View
                style={{
                  padding: 24,
                  alignItems: 'center',
                  borderBottomWidth: 1,
                  borderBottomColor: theme.line,
                  borderStyle: 'dashed',
                }}
              >
                <Logo size={48} />
                <Text
                  style={{
                    fontFamily: 'PlusJakartaSans_700Bold',
                    fontSize: 17,
                    color: theme.ink,
                    marginTop: 12,
                  }}
                >
                  {guesthouseName}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: theme.muted,
                    marginTop: 4,
                    textAlign: 'center',
                  }}
                >
                  {guesthouseIsland} Island, Kaafu Atoll{'\n'}Republic of Maldives
                </Text>
              </View>

              {/* Receipt Details */}
              <View style={{ padding: 24 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 11.5,
                    color: theme.muted2,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    marginBottom: 16,
                  }}
                >
                  Receipt Details
                </Text>

                <ReceiptLine
                  label="Guest"
                  value={selectedPayment.guestName}
                  theme={theme}
                />
                <ReceiptLine
                  label={`Room ${selectedPayment.roomNumber} × ${selectedPayment.nights} nights`}
                  value={`${selectedPayment.currency} ${(selectedPayment.nights * selectedPayment.pricePerNight).toLocaleString()}`}
                  theme={theme}
                />
                <ReceiptLine
                  label="Green tax"
                  value={`${selectedPayment.currency} ${selectedPayment.greenTax.toLocaleString()}`}
                  theme={theme}
                />
                <ReceiptLine
                  label="Payment method"
                  value={formatMethod(selectedPayment.method)}
                  theme={theme}
                />
                <ReceiptLine
                  label="Date"
                  value={formatDate(selectedPayment.date)}
                  theme={theme}
                  isLast
                />

                {/* Total */}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 20,
                    paddingTop: 20,
                    borderTopWidth: 1,
                    borderTopColor: theme.line,
                    borderStyle: 'dashed',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: theme.ink2,
                    }}
                  >
                    Total paid
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'PlusJakartaSans_800ExtraBold',
                      fontSize: 20,
                      color: theme.ink,
                    }}
                  >
                    {selectedPayment.currency} {selectedPayment.amount.toLocaleString()}
                  </Text>
                </View>
              </View>

              {/* Send Receipt Button */}
              <View
                style={{
                  padding: 20,
                  borderTopWidth: 1,
                  borderTopColor: theme.line,
                }}
              >
                <Pressable
                  onPress={handleSendReceipt}
                  disabled={sendingReceipt}
                  style={({ pressed }) => ({
                    backgroundColor: pressed ? '#1d4ed8' : colors.light.primary,
                    borderRadius: 10,
                    paddingVertical: 13,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    shadowColor: '#2563eb',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    elevation: 3,
                    opacity: sendingReceipt ? 0.7 : 1,
                  })}
                >
                  {sendingReceipt ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Send size={18} color="#ffffff" strokeWidth={1.7} />
                  )}
                  <Text
                    style={{
                      fontFamily: 'Inter_600SemiBold',
                      fontSize: 14,
                      color: '#ffffff',
                    }}
                  >
                    {sendingReceipt ? 'Sending...' : 'Send receipt to guest'}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const headerStyle = {
  fontFamily: 'Inter_600SemiBold',
  fontSize: 11.5,
  letterSpacing: 0.5,
};

interface MethodBadgeProps {
  method: PaymentMethod;
  theme: typeof colors.light;
}

function MethodBadge({ method, theme }: MethodBadgeProps) {
  const getMethodStyle = () => {
    switch (method) {
      case 'cash':
        return { bg: theme.status.okBg, text: theme.status.okText };
      case 'card':
        return { bg: colors.light.primarySoft, text: colors.light.primary };
      case 'bank_transfer':
        return { bg: theme.status.warnBg, text: theme.status.warnText };
    }
  };

  const style = getMethodStyle();
  const label = method === 'bank_transfer' ? 'Bank' : method.charAt(0).toUpperCase() + method.slice(1);

  return (
    <View
      style={{
        backgroundColor: style.bg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          color: style.text,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

interface ReceiptLineProps {
  label: string;
  value: string;
  theme: typeof colors.light;
  isLast?: boolean;
}

function ReceiptLine({ label, value, theme, isLast }: ReceiptLineProps) {
  return (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 10,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: theme.lineSoft,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_400Regular',
          fontSize: 13,
          color: theme.muted,
          flex: 1,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 13,
          color: theme.ink,
          textAlign: 'right',
        }}
      >
        {value}
      </Text>
    </View>
  );
}
