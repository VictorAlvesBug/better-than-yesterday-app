
import { getColor } from '@/types/color.type';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { twMerge } from 'tailwind-merge';
const statusBarHeight = Constants.statusBarHeight;

type GradientHeaderProps = {
    children: React.ReactNode;
    className?: string;
};

export default function GradientHeader({ children, className }: GradientHeaderProps) {
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
              marginTop: statusBarHeight,
            }}
            className={twMerge("flex flex-row items-center justify-start w-full", className)}
          >
        {children}
    </LinearGradient>
  );
}
