// Cross-platform video player
// Web  → native HTML5 <video> element (reliable, handles local files)
// iOS/Android → expo-av Video component
import { Platform, StyleSheet } from "react-native";

interface VideoPlayerProps {
  source: number;        // require(...) result
  width: number;
  height: number;
  muted?: boolean;
  autoPlay?: boolean;
  onEnded?: () => void;
  style?: object;
}

export function VideoPlayer({
  source,
  width,
  height,
  muted = true,
  autoPlay = true,
  onEnded,
  style,
}: VideoPlayerProps) {
  if (Platform.OS === "web") {
    // On web, Expo resolves require() assets to a URL string at runtime
    // Cast through unknown so TypeScript doesn't complain
    const uri = source as unknown as string;

    return (
      // @ts-ignore — web-only JSX element
      <video
        src={uri}
        autoPlay={autoPlay}
        muted={muted}
        playsInline
        controls
        onEnded={onEnded}
        style={{
          width,
          height,
          objectFit: "contain",
          backgroundColor: "#000",
          borderRadius: 16,
          display: "block",
          ...style,
        }}
      />
    );
  }

  // Native — use expo-av
  const { Video, ResizeMode } = require("expo-av");
  return (
    <Video
      source={source}
      style={[{ width, height }, style]}
      resizeMode={ResizeMode.CONTAIN}
      shouldPlay={autoPlay}
      isMuted={muted}
      isLooping={false}
      useNativeControls
      onPlaybackStatusUpdate={(s: any) => {
        if (s?.isLoaded && s?.didJustFinish) onEnded?.();
      }}
    />
  );
}
