import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Rect, Path } from 'react-native-svg';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 48 }: LogoProps) {
  const radius = size * (13 / 48);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 48 48">
        <Defs>
          <LinearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#2563eb" />
            <Stop offset="100%" stopColor="#0d9488" />
          </LinearGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="48"
          height="48"
          rx={radius}
          fill="url(#logoGradient)"
        />
        {/* Dhoni sail design */}
        <Path
          d="M24 10 L24 32 L36 32 Q36 20 24 10"
          fill="white"
          opacity={0.95}
        />
        <Path
          d="M12 36 Q24 32 36 36"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}
