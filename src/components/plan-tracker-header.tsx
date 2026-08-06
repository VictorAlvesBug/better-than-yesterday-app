import { getColor } from '@/types/color.type';
import { PlanEnriched } from '@/types/plan.type';
import React from 'react';
import { Animated, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GradientView from './gradient-view';
import Icon from './icon';
import { SideDrawerOpenButton } from './side-drawer';

const COLLAPSE_THRESHOLD = 60;
const TOOLBAR_HEIGHT = 80;
const HERO_SLOT_HEIGHT = 88;
const HEADER_CONTENT_HEIGHT = TOOLBAR_HEIGHT + HERO_SLOT_HEIGHT;
const TITLE_FONT_SIZE = 24;
const TITLE_COLLAPSED_SCALE = 0.85;
const TITLE_COLLAPSED_LINE_HEIGHT = TITLE_FONT_SIZE * TITLE_COLLAPSED_SCALE;
const TITLE_TRANSLATE_X = 64;
const TITLE_HERO_TOP_OFFSET = 8;
const FREQUENCY_HERO_TOP_OFFSET = 40;

type PlanTrackerHeaderProps = {
  plan: PlanEnriched;
  scrollY: Animated.Value;
  onOpenSettings: () => void;
  setIsDrawerOpen: (open: boolean) => void;
};

export default function PlanTrackerHeader({
  plan,
  scrollY,
  onOpenSettings,
  setIsDrawerOpen,
}: PlanTrackerHeaderProps) {
  const insets = useSafeAreaInsets();
  const planTitle = plan.description ?? plan.habitName;
  const frequency = `${7 - plan.daysOffPerWeek}x por semana`;

  const titleStartTop = insets.top + TOOLBAR_HEIGHT + TITLE_HERO_TOP_OFFSET;
  const titleCollapsedTop =
    insets.top + (TOOLBAR_HEIGHT - TITLE_COLLAPSED_LINE_HEIGHT) / 2;
  const titleTranslateYEnd = titleCollapsedTop - titleStartTop;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [insets.top + HEADER_CONTENT_HEIGHT, insets.top + TOOLBAR_HEIGHT],
    extrapolate: 'clamp',
  });

  const heroSlotHeight = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [HERO_SLOT_HEIGHT, 0],
    extrapolate: 'clamp',
  });

  const btyOpacity = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const frequencyOpacity = scrollY.interpolate({
    inputRange: [0, 28],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const titleTranslateY = scrollY.interpolate({
    inputRange: [0, 8, COLLAPSE_THRESHOLD],
    outputRange: [0, 0, titleTranslateYEnd],
    extrapolate: 'clamp',
  });

  const titleTranslateX = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [0, TITLE_TRANSLATE_X],
    extrapolate: 'clamp',
  });

  const titleScale = scrollY.interpolate({
    inputRange: [0, COLLAPSE_THRESHOLD],
    outputRange: [1, TITLE_COLLAPSED_SCALE],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={{
        height: headerHeight,
        width: '100%',
        overflow: 'hidden',
      }}
    >
      <GradientView
        style={{
          height: insets.top + HEADER_CONTENT_HEIGHT,
          paddingTop: insets.top,
        }}
        className="w-full"
      >
        <View
          className="flex flex-row items-center w-full h-20"
          style={{ zIndex: 3 }}
        >
          <SideDrawerOpenButton setIsDrawerOpen={setIsDrawerOpen} />
          <View className="flex-1" />
          <Pressable
            className="flex justify-center items-center w-20 h-20"
            onPress={onOpenSettings}
          >
            <Icon name="people" size={24} color="white" />
          </Pressable>
        </View>

        <Animated.View
          style={{ height: heroSlotHeight, zIndex: 0, overflow: 'hidden' }}
          className="px-4"
        >
          <Animated.Text
            style={{
              color: getColor('white'),
              opacity: frequencyOpacity,
              marginTop: FREQUENCY_HERO_TOP_OFFSET,
            }}
            className="text-md"
            pointerEvents="none"
          >
            {frequency}
          </Animated.Text>
        </Animated.View>

        <Animated.Text
          style={{
            position: 'absolute',
            left: 80,
            top: insets.top,
            height: TOOLBAR_HEIGHT,
            lineHeight: TOOLBAR_HEIGHT,
            color: getColor('white'),
            opacity: btyOpacity,
            fontSize: 20,
            fontWeight: '700',
            zIndex: 1,
          }}
          pointerEvents="none"
        >
          BTY
        </Animated.Text>

        <Animated.Text
          style={{
            position: 'absolute',
            left: 16,
            right: 80,
            top: titleStartTop,
            color: getColor('white'),
            fontSize: TITLE_FONT_SIZE,
            fontWeight: '700',
            zIndex: 10,
            includeFontPadding: false,
            transform: [
              { translateY: titleTranslateY },
              { translateX: titleTranslateX },
              { scale: titleScale },
            ],
          }}
          numberOfLines={1}
          pointerEvents="none"
        >
          {planTitle}
        </Animated.Text>
      </GradientView>
    </Animated.View>
  );
}
