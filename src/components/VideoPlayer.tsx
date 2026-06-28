// Cross-platform video player
// Web  → native HTML5 <video> element (reliable, handles local files)
// iOS/Android → expo-av Video component
import { useEffect, useState } from "react";
import { Platform, StyleSheet, TouchableOpacity, Text, View } from "react-native";

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
  // Local mute state so the user can tap to unmute. Starts from the `muted`
  // prop (videos autoplay muted by convention / iOS autoplay policy).
  const [isMuted, setIsMuted] = useState(muted);
  if (Platform.OS === "web") {
    // On web, Expo resolves require() assets to a URL string at runtime
    // Cast through unknown so TypeScript doesn't complain
    const uri = source as unknown as string;

    return (
      // @ts-ignore — web-only JSX element
      <video
        src={uri}
        autoPlay={autoPlay}
        muted={isMuted}
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
  const expoAv = require("expo-av");
  const { Video, ResizeMode, Audio } = expoAv;

  // Configure the audio session so video sound plays even when the phone's
  // ringer/silent switch is on (otherwise expo-av stays silent on the
  // "ambient" channel). Runs once on mount. Guarded so a missing enum on any
  // expo-av version can't crash the screen.
  useEffect(() => {
    try {
      Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      }).catch(() => {});
    } catch {
      /* no-op */
    }
  }, []);

  return (
    <View style={[{ width, height }, style]}>
      <Video
        source={source}
        style={{ width, height }}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay={autoPlay}
        isMuted={isMuted}
        volume={1.0}
        isLooping={false}
        useNativeControls
        onPlaybackStatusUpdate={(s: any) => {
          if (s?.isLoaded && s?.didJustFinish) onEnded?.();
        }}
      />
      {/* Persistent mute/unmute toggle — tap to switch either way. */}
      <TouchableOpacity
        style={styles.soundBtn}
        onPress={() => setIsMuted((m) => !m)}
        activeOpacity={0.85}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.soundIcon}>{isMuted ? "🔇" : "🔊"}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  soundBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  soundIcon: {
    fontSize: 18,
    color: "#fff",
  },
});
