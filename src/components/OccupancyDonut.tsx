import { View, Text, useColorScheme, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { colors } from '../constants/theme';

interface OccupancyDonutProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
}

export default function OccupancyDonut({
  percent,
  size = 148,
  strokeWidth = 14,
}: OccupancyDonutProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? colors.dark : colors.light;

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.track}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
        <G
          rotation={-90}
          origin={Platform.OS === 'web' ? undefined : `${size / 2}, ${size / 2}`}
          transform={Platform.OS === 'web' ? `rotate(-90 ${size / 2} ${size / 2})` : undefined}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.light.primary}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: 'PlusJakartaSans_800ExtraBold',
            fontSize: size * 0.22,
            color: theme.ink,
            letterSpacing: -0.5,
          }}
        >
          {percent}%
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_500Medium',
            fontSize: size * 0.09,
            color: theme.muted,
            marginTop: 2,
          }}
        >
          booked
        </Text>
      </View>
    </View>
  );
}
