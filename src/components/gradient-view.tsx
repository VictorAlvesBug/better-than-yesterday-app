
import { getColor } from '@/types/color.type';
import { LinearGradient, LinearGradientPoint } from 'expo-linear-gradient';
import { View } from 'react-native';

type GradientFlowDirection =
  | 'left-to-right'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'right-to-left';

type GradientViewProps = {
  children?: React.ReactNode;
  gradientFlowDirection?: GradientFlowDirection;
} & React.ComponentProps<typeof View>;

export default function GradientView({
  children,
  gradientFlowDirection = 'left-to-right',
  ...rest
}: GradientViewProps) {
  return (
    <LinearGradient
      colors={[
        getColor("violet"),
        getColor("purple-violet"),
        getColor("purple")
      ]}
      {...getGradientDirectionProps(gradientFlowDirection)}
      {...rest}
    >
      {children}
    </LinearGradient>
  );
}

type GradientDirectionProps = {
  start: LinearGradientPoint;
  end: LinearGradientPoint;
};

function getGradientDirectionProps(
  direction: GradientFlowDirection
): GradientDirectionProps {
  switch (direction) {
    case 'top-to-bottom':
      return { start: { x: 0.5, y: 0 }, end: { x: 0.5, y: 1 } };
    case 'bottom-to-top':
      return { start: { x: 0.5, y: 1 }, end: { x: 0.5, y: 0 } };
    case 'right-to-left':
      return { start: { x: 1, y: 0.5 }, end: { x: 0, y: 0.5 } };
    case 'left-to-right':
    default:
      return { start: { x: 0, y: 0.5 }, end: { x: 1, y: 0.5 } };
  }
}