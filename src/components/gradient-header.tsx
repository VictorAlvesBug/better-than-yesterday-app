
import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
const statusBarHeight = Constants.statusBarHeight;

type GradientHeaderProps = {
    children: React.ReactNode;
};

export default function GradientHeader({ children }: GradientHeaderProps) {
  return (
    <LinearGradient
            colors={[
                getColor("violet"), 
                getColor("purple-violet"), 
                getColor("purple")
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginTop: statusBarHeight,
            }}
          >
        {children}
    </LinearGradient>
  );
}
