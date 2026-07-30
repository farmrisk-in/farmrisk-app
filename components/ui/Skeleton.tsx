import React, { useEffect, useRef } from "react";
import { Animated, ViewProps, StyleSheet } from "react-native";

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  className?: string;
}

export function Skeleton({
  width,
  height,
  borderRadius = 12,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const opacityAnim = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.85,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.35,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [opacityAnim]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius,
          opacity: opacityAnim,
        },
        styles.base,
        style,
      ]}
      className={`bg-muted  ${className}`}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
  },
});
