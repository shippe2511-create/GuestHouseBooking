import { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  useWindowDimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, {
  Path,
  Line,
  Text as SvgText,
  Circle,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { ChevronDown, TrendingUp } from 'lucide-react-native';
import { colors } from '../../src/constants/theme';
import { useTheme } from '../../src/contexts/ThemeContext';
import { useCurrentGuesthouse } from '../../src/contexts/GuesthouseContext';
import { useRevenueStats } from '../../src/hooks/usePayments';
import { useRooms } from '../../src/hooks/useRooms';

const mockRevenueData = [
  { day: 1, amount: 12500 },
  { day: 2, amount: 15000 },
  { day: 3, amount: 8500 },
  { day: 4, amount: 22000 },
  { day: 5, amount: 18500 },
  { day: 6, amount: 25000 },
  { day: 7, amount: 28000 },
  { day: 8, amount: 21000 },
  { day: 9, amount: 32000 },
  { day: 10, amount: 29500 },
  { day: 11, amount: 35000 },
  { day: 12, amount: 31000 },
  { day: 13, amount: 38500 },
  { day: 14, amount: 0 },
  { day: 15, amount: 0 },
  { day: 16, amount: 0 },
  { day: 17, amount: 0 },
  { day: 18, amount: 0 },
  { day: 19, amount: 0 },
  { day: 20, amount: 0 },
  { day: 21, amount: 0 },
  { day: 22, amount: 0 },
  { day: 23, amount: 0 },
  { day: 24, amount: 0 },
  { day: 25, amount: 0 },
  { day: 26, amount: 0 },
  { day: 27, amount: 0 },
  { day: 28, amount: 0 },
  { day: 29, amount: 0 },
  { day: 30, amount: 0 },
];

export default function RevenueScreen() {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();
  const { currentGuesthouse } = useCurrentGuesthouse();

  const [selectedMonth, setSelectedMonth] = useState(new Date(2026, 6, 1));
  const [selectedPeriod, setSelectedPeriod] = useState('This month');
  const [showPeriodPicker, setShowPeriodPicker] = useState(false);

  const { stats, loading } = useRevenueStats(currentGuesthouse?.id, selectedMonth);
  const { stats: roomStats } = useRooms(currentGuesthouse?.id);

  const revenueData = useMemo(() => {
    if (stats.dailyData.length > 0 && stats.total > 0) {
      return stats.dailyData;
    }
    return mockRevenueData;
  }, [stats]);

  const chartWidth = Math.min(width - 40, 1060);
  const chartHeight = 260;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const actualData = revenueData.filter((d) => d.amount > 0);
  const totalRevenue = stats.total > 0 ? stats.total : actualData.reduce((sum, d) => sum + d.amount, 0);
  const maxRevenue = actualData.length > 0 ? Math.max(...actualData.map((d) => d.amount)) : 40000;
  const avgPerNight = stats.avgPerNight > 0 ? stats.avgPerNight : (actualData.length > 0 ? Math.round(totalRevenue / actualData.length) : 0);
  const bestDay = stats.bestDay.amount > 0 ? stats.bestDay : (actualData.length > 0 ? actualData.reduce((best, d) => (d.amount > best.amount ? d : best), actualData[0]) : { day: 0, amount: 0 });

  const occupancyRate = roomStats.total > 0
    ? Math.round((roomStats.occupied / roomStats.total) * 100)
    : Math.round((actualData.length / 30) * 100);

  const yMax = Math.ceil(maxRevenue / 10000) * 10000 || 40000;
  const yLabels = [0, yMax * 0.25, yMax * 0.5, yMax * 0.75, yMax];

  const getX = (day: number) => {
    if (actualData.length <= 1) return paddingLeft;
    const dataWidth = chartWidth - paddingLeft - paddingRight;
    const idx = actualData.findIndex((d) => d.day === day);
    return paddingLeft + (idx / (actualData.length - 1)) * dataWidth;
  };

  const getY = (amount: number) => {
    const dataHeight = chartHeight - paddingTop - paddingBottom;
    return chartHeight - paddingBottom - (amount / yMax) * dataHeight;
  };

  const linePath = useMemo(() => {
    if (actualData.length === 0) return '';
    return actualData
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.day)} ${getY(d.amount)}`)
      .join(' ');
  }, [actualData, chartWidth, yMax]);

  const areaPath = useMemo(() => {
    if (actualData.length === 0) return '';
    const lastDay = actualData[actualData.length - 1].day;
    return `${linePath} L ${getX(lastDay)} ${chartHeight - paddingBottom} L ${paddingLeft} ${chartHeight - paddingBottom} Z`;
  }, [linePath, actualData, chartWidth]);

  const formatCurrency = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}k`;
    }
    return amount.toString();
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    setShowPeriodPicker(false);
    const now = new Date();
    switch (period) {
      case 'This month':
        setSelectedMonth(new Date(2026, 6, 1)); // Demo: July 2026
        break;
      case 'Last month':
        setSelectedMonth(new Date(2026, 5, 1)); // Demo: June 2026
        break;
      case 'Last 3 months':
        setSelectedMonth(new Date(now.getFullYear(), now.getMonth() - 2, 1));
        break;
      case 'This year':
        setSelectedMonth(new Date(now.getFullYear(), 0, 1));
        break;
    }
  };

  const currency = currentGuesthouse?.currency || 'MVR';
  const monthLabel = selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.page }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {/* Main Card */}
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
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              padding: 24,
            }}
          >
            <View>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 11.5,
                  color: theme.muted2,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                Total revenue · {monthLabel}
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  marginTop: 8,
                }}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={colors.light.primary} />
                ) : (
                  <>
                    <Text
                      style={{
                        fontFamily: 'PlusJakartaSans_800ExtraBold',
                        fontSize: 38,
                        color: theme.ink,
                        letterSpacing: -0.5,
                      }}
                    >
                      {currency} {totalRevenue.toLocaleString()}
                    </Text>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: theme.status.okBg,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 20,
                        gap: 4,
                      }}
                    >
                      <TrendingUp size={14} color={theme.status.ok} strokeWidth={2} />
                      <Text
                        style={{
                          fontFamily: 'Inter_600SemiBold',
                          fontSize: 12,
                          color: theme.status.okText,
                        }}
                      >
                        18% vs last period
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>

            {/* Period Picker */}
            <View style={{ position: 'relative' }}>
              <Pressable
                onPress={() => setShowPeriodPicker(!showPeriodPicker)}
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
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 13,
                    color: theme.ink2,
                  }}
                >
                  {selectedPeriod}
                </Text>
                <ChevronDown size={16} color={theme.muted} strokeWidth={1.7} />
              </Pressable>

              {showPeriodPicker && (
                <View
                  style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    backgroundColor: theme.surface,
                    borderWidth: 1,
                    borderColor: theme.inputLine,
                    borderRadius: 10,
                    marginTop: 4,
                    zIndex: 10,
                    shadowColor: '#0f172a',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.1,
                    shadowRadius: 12,
                    elevation: 5,
                    minWidth: 140,
                  }}
                >
                  {['This month', 'Last month', 'Last 3 months', 'This year'].map(
                    (period, index, arr) => (
                      <Pressable
                        key={period}
                        onPress={() => handlePeriodChange(period)}
                        style={({ pressed }) => ({
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          backgroundColor:
                            pressed
                              ? theme.chip
                              : selectedPeriod === period
                              ? colors.light.primarySoft
                              : theme.surface,
                          borderBottomWidth: index < arr.length - 1 ? 1 : 0,
                          borderBottomColor: theme.lineSoft,
                        })}
                      >
                        <Text
                          style={{
                            fontFamily:
                              selectedPeriod === period
                                ? 'Inter_600SemiBold'
                                : 'Inter_400Regular',
                            fontSize: 13,
                            color:
                              selectedPeriod === period
                                ? colors.light.primary
                                : theme.ink,
                          }}
                        >
                          {period}
                        </Text>
                      </Pressable>
                    )
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Chart */}
          <View style={{ paddingHorizontal: 24 }}>
            {loading ? (
              <View style={{ height: chartHeight, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.light.primary} />
              </View>
            ) : (
              <Svg width={chartWidth} height={chartHeight}>
                <Defs>
                  <LinearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0%" stopColor={colors.light.primary} stopOpacity={0.16} />
                    <Stop offset="100%" stopColor={colors.light.primary} stopOpacity={0} />
                  </LinearGradient>
                </Defs>

                {/* Y Grid Lines & Labels */}
                {yLabels.map((value, index) => {
                  const y = getY(value);
                  return (
                    <View key={index}>
                      <Line
                        x1={paddingLeft}
                        y1={y}
                        x2={chartWidth - paddingRight}
                        y2={y}
                        stroke={theme.lineSoft}
                        strokeWidth={1}
                      />
                      <SvgText
                        x={paddingLeft - 10}
                        y={y + 4}
                        textAnchor="end"
                        fill={theme.muted2}
                        fontSize={11}
                        fontFamily="Inter_400Regular"
                      >
                        {formatCurrency(value)}
                      </SvgText>
                    </View>
                  );
                })}

                {/* X Labels */}
                {actualData.map((d) => (
                  <SvgText
                    key={d.day}
                    x={getX(d.day)}
                    y={chartHeight - 8}
                    textAnchor="middle"
                    fill={theme.muted2}
                    fontSize={11}
                    fontFamily="Inter_400Regular"
                  >
                    {d.day}
                  </SvgText>
                ))}

                {/* Area Fill */}
                <Path d={areaPath} fill="url(#areaGradient)" />

                {/* Line */}
                <Path
                  d={linePath}
                  stroke={colors.light.primary}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* End Dot */}
                {actualData.length > 0 && (
                  <>
                    <Circle
                      cx={getX(actualData[actualData.length - 1].day)}
                      cy={getY(actualData[actualData.length - 1].amount)}
                      r={6}
                      fill={colors.light.primary}
                    />
                    <Circle
                      cx={getX(actualData[actualData.length - 1].day)}
                      cy={getY(actualData[actualData.length - 1].amount)}
                      r={3}
                      fill="#ffffff"
                    />
                  </>
                )}
              </Svg>
            )}
          </View>

          {/* Stat Tiles */}
          <View
            style={{
              flexDirection: 'row',
              padding: 24,
              gap: 16,
            }}
          >
            <StatTile
              label="Avg. per night"
              value={`${currency} ${avgPerNight.toLocaleString()}`}
              theme={theme}
            />
            <StatTile
              label="Best day"
              value={bestDay.day > 0 ? `Day ${bestDay.day} · ${currency} ${bestDay.amount.toLocaleString()}` : 'N/A'}
              theme={theme}
            />
            <StatTile
              label="Avg. occupancy"
              value={`${occupancyRate}%`}
              theme={theme}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface StatTileProps {
  label: string;
  value: string;
  theme: typeof colors.light;
}

function StatTile({ label, value, theme }: StatTileProps) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.tableHead,
        borderRadius: 10,
        padding: 16,
      }}
    >
      <Text
        style={{
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11.5,
          color: theme.muted2,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: 'PlusJakartaSans_700Bold',
          fontSize: 18,
          color: theme.ink,
        }}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
    </View>
  );
}
