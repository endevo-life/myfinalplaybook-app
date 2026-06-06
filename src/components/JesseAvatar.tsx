// Jesse avatar — defaults to local jesse.png, accepts remote URI override.
// Shows a shimmer skeleton while the image loads.
import { useState } from "react";
import { View, Image, StyleSheet, ViewStyle } from "react-native";
import { Skeleton } from "./Skeleton";
import { COLORS } from "@/constants/theme";

import LOCAL_JESSE from "../../assets/jesse.png";

interface JesseAvatarProps {
  size?: number;
  /** Pass a remote URI to override the local image */
  imageUri?: string;
  style?: ViewStyle;
}

export function JesseAvatar({ size = 56, imageUri, style }: JesseAvatarProps) {
  const source = imageUri ? { uri: imageUri } : LOCAL_JESSE;
  const [loaded, setLoaded] = useState(!imageUri); // local images load instantly
  const [errored, setErrored] = useState(false);

  const showSkeleton = imageUri && !loaded && !errored;

  return (
    <View style={[styles.wrapper, { width: size, height: size, borderRadius: size / 2 }, style]}>
      {showSkeleton && (
        <Skeleton
          width={size}
          height={size}
          borderRadius={size / 2}
          style={StyleSheet.absoluteFillObject}
        />
      )}
      {!errored && (
        <Image
          source={source}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 },
            showSkeleton && styles.hidden,
          ]}
          onLoad={() => setLoaded(true)}
          onError={() => setErrored(true)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: COLORS.card,
  },
  image: {
    position: "absolute",
  },
  hidden: {
    opacity: 0,
  },
});
