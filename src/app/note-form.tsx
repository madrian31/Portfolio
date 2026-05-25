import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import * as Sharing from "expo-sharing";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Keyboard,
  KeyboardEvent,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, {
  Circle,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import ViewShot, { captureRef } from "react-native-view-shot";
import { Storage, STORAGE_KEYS } from "../storage";

// ─── Bootstrap Activity Icons ─────────────────────────────────────────────────
function ActivityIcon({
  id,
  color = "#888",
  size = 18,
}: {
  id: string;
  color?: string;
  size?: number;
}) {
  const iconMap: Record<string, string> = {
    stationary: "chair",
    eating: "utensils",
    walking: "person-walking",
    running: "person-running",
    biking: "bicycle",
    automotive: "car",
    flying: "plane",
    none: "circle-minus",
  };
  const iconName = iconMap[id] ?? "circle-question";
  return <FontAwesome6 name={iconName} size={size} color={color} />;
}

function IconChevronLeft({ color = "#c084fc" }: { color?: string }) {
  return <FontAwesome6 name="chevron-left" size={18} color={color} />;
}

function IconShare({ color = "#c084fc" }: { color?: string }) {
  return <FontAwesome6 name="share-from-square" size={14} color={color} />;
}

function IconDownload({ color = "#c084fc" }: { color?: string }) {
  return <FontAwesome6 name="download" size={14} color={color} />;
}

function IconBible({ color = "#7c5fc4" }: { color?: string }) {
  return <FontAwesome6 name="book-bible" size={11} color={color} />;
}

function IconX({ color = "#555" }: { color?: string }) {
  return <FontAwesome6 name="xmark" size={16} color={color} />;
}

function IconCheck({ color = "#c084fc" }: { color?: string }) {
  return <FontAwesome6 name="check" size={14} color={color} />;
}

function IconInfo({ color = "#666" }: { color?: string }) {
  return <FontAwesome6 name="circle-info" size={14} color={color} />;
}

function IconArrowUp({ color = "#444" }: { color?: string }) {
  return <FontAwesome6 name="arrow-up" size={12} color={color} />;
}

// ─── Toolbar Icons ────────────────────────────────────────────────────────────

type IconName =
  | "bold"
  | "italic"
  | "underline"
  | "strike"
  | "heading"
  | "fontSize"
  | "color"
  | "highlight"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "mood"
  | "tags";

function ToolIcon({
  icon,
  color,
  activeColor,
  hasEmotion,
  emotionColor,
}: {
  icon: IconName;
  color: string;
  activeColor?: string;
  hasEmotion?: boolean;
  emotionColor?: string;
}) {
  switch (icon) {
    case "bold":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgText
            x="2"
            y="15"
            fontSize="16"
            fontWeight="800"
            fill={color}
            fontFamily="Georgia, serif"
          >
            B
          </SvgText>
        </Svg>
      );
    case "italic":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgText
            x="5"
            y="15"
            fontSize="15"
            fontStyle="italic"
            fill={color}
            fontFamily="Georgia, serif"
          >
            I
          </SvgText>
        </Svg>
      );
    case "underline":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgText
            x="3"
            y="12"
            fontSize="12"
            fontWeight="700"
            fill={color}
            fontFamily="system-ui, sans-serif"
          >
            U
          </SvgText>
          <Line
            x1="2"
            y1="16"
            x2="16"
            y2="16"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "strike":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgText
            x="2"
            y="15"
            fontSize="12"
            fontWeight="600"
            fill={color}
            fontFamily="system-ui, sans-serif"
          >
            ab
          </SvgText>
          <Line
            x1="1"
            y1="9"
            x2="17"
            y2="9"
            stroke={color}
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "heading":
      return (
        <Svg width={22} height={18} viewBox="0 0 22 18">
          <SvgText
            x="0"
            y="15"
            fontSize="16"
            fontWeight="800"
            fill={color}
            fontFamily="system-ui, sans-serif"
          >
            {"H\u2081"}
          </SvgText>
        </Svg>
      );
    case "fontSize":
      return (
        <Svg width={26} height={18} viewBox="0 0 26 18">
          <SvgText
            x="0"
            y="16"
            fontSize="18"
            fontWeight="800"
            fill={color}
            fontFamily="Georgia, serif"
          >
            A
          </SvgText>
          <SvgText
            x="17"
            y="18"
            fontSize="11"
            fontWeight="600"
            fill={color}
            fontFamily="Georgia, serif"
          >
            a
          </SvgText>
        </Svg>
      );
    case "color":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgText
            x="2"
            y="13"
            fontSize="14"
            fontWeight="700"
            fill={color}
            fontFamily="Georgia, serif"
          >
            A
          </SvgText>
          <Rect
            x="1"
            y="14"
            width="16"
            height="2.5"
            rx="1.2"
            fill={activeColor ?? color}
          />
        </Svg>
      );
    case "highlight":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Path
            d="M4 14 L9 3 L14 14"
            stroke={color}
            strokeWidth="1.6"
            fill="none"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <Line
            x1="6"
            y1="10"
            x2="12"
            y2="10"
            stroke={color}
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <Rect
            x="1"
            y="15"
            width="16"
            height="3"
            rx="1.5"
            fill="#fef08a"
            opacity={0.75}
          />
        </Svg>
      );
    case "alignLeft":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Line
            x1="1"
            y1="4"
            x2="17"
            y2="4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="1"
            y1="8"
            x2="17"
            y2="8"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="1"
            y1="12"
            x2="11"
            y2="12"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="1"
            y1="16"
            x2="14"
            y2="16"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "alignCenter":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Line
            x1="1"
            y1="4"
            x2="17"
            y2="4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="1"
            y1="8"
            x2="17"
            y2="8"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="4"
            y1="12"
            x2="14"
            y2="12"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="3"
            y1="16"
            x2="15"
            y2="16"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "alignRight":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Line
            x1="1"
            y1="4"
            x2="17"
            y2="4"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="1"
            y1="8"
            x2="17"
            y2="8"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="7"
            y1="12"
            x2="17"
            y2="12"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <Line
            x1="4"
            y1="16"
            x2="17"
            y2="16"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </Svg>
      );
    case "mood":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <Circle
            cx="9"
            cy="9"
            r="7"
            stroke={hasEmotion ? emotionColor : color}
            strokeWidth="1.4"
            fill="none"
          />
          <Circle
            cx="6.5"
            cy="7.5"
            r="1.1"
            fill={hasEmotion ? emotionColor : color}
          />
          <Circle
            cx="11.5"
            cy="7.5"
            r="1.1"
            fill={hasEmotion ? emotionColor : color}
          />
          {hasEmotion ? (
            <Path
              d="M6 11.5 Q9 14 12 11.5"
              stroke={emotionColor}
              strokeWidth="1.4"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <Line
              x1="6"
              y1="12"
              x2="12"
              y2="12"
              stroke={color}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )}
        </Svg>
      );
    case "tags":
      return (
        <Svg width={18} height={18} viewBox="0 0 18 18">
          <SvgText
            x="2"
            y="15"
            fontSize="16"
            fontWeight="700"
            fill={color}
            fontFamily="system-ui, sans-serif"
          >
            #
          </SvgText>
        </Svg>
      );
    default:
      return null;
  }
}

function ToolBtn({
  icon,
  active,
  onPress,
  activeColor = "#c084fc",
  hasEmotion,
  emotionColor,
}: {
  icon: IconName;
  active?: boolean;
  onPress: () => void;
  activeColor?: string;
  hasEmotion?: boolean;
  emotionColor?: string;
}) {
  const iconColor = active ? activeColor : "#888";
  return (
    <Pressable
      onPress={onPress}
      onStartShouldSetResponder={() => true}
      onTouchStart={(e) => {
        e.stopPropagation();
        if (Platform.OS === "android") e.preventDefault?.();
      }}
      style={({ pressed }) => [
        tbs.btn,
        active && tbs.btnActive,
        { backgroundColor: active ? activeColor + "22" : "#1c1c1c" },
        pressed && { opacity: 0.7 },
      ]}
    >
      <ToolIcon
        icon={icon}
        color={iconColor}
        activeColor={activeColor}
        hasEmotion={hasEmotion}
        emotionColor={emotionColor}
      />
    </Pressable>
  );
}

const tbs = StyleSheet.create({
  btn: {
    minWidth: 36,
    height: 34,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  btnActive: { borderWidth: 1, borderColor: "#c084fc33" },
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type Segment = {
  id: string;
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  fontSize?: number;
  color?: string;
  highlight?: string;
  heading?: "title" | "h1" | "h2" | "h3";
  align?: "left" | "center" | "right";
};

type EmotionEntry = {
  label: string;
  intensity: 1 | 2 | 3;
  color: string;
  valence: number;
};

type Note = {
  id: string;
  title: string;
  text: string;
  segments: Segment[];
  date: string;
  emotion?: EmotionEntry;
  activities?: string[];
  tags?: string[];
  verseRef?: string;
  verseText?: string;
  journalName?: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32];

const FONT_COLORS = [
  { label: "White", value: "#f0f0f0" },
  { label: "Red", value: "#f87171" },
  { label: "Orange", value: "#fb923c" },
  { label: "Yellow", value: "#fbbf24" },
  { label: "Green", value: "#4ade80" },
  { label: "Blue", value: "#60a5fa" },
  { label: "Purple", value: "#c084fc" },
  { label: "Pink", value: "#f472b6" },
  { label: "Gray", value: "#9ca3af" },
  { label: "Black", value: "#111111" },
];

const HIGHLIGHT_COLORS = [
  { label: "🟡 Yellow", value: "#fef08a" },
  { label: "🟢 Green", value: "#bbf7d0" },
  { label: "🔵 Blue", value: "#bfdbfe" },
  { label: "🩷 Pink", value: "#fce7f3" },
  { label: "🟠 Orange", value: "#fed7aa" },
  { label: "✕ None", value: "" },
];

const HEADINGS = [
  { label: "Title", value: "title" as const, size: 28, weight: "800" as const },
  { label: "H1", value: "h1" as const, size: 24, weight: "700" as const },
  { label: "H2", value: "h2" as const, size: 20, weight: "600" as const },
  { label: "H3", value: "h3" as const, size: 18, weight: "600" as const },
  { label: "Body", value: undefined, size: 16, weight: "400" as const },
];

const HEADING_SIZE: Record<string, number> = {
  title: 28,
  h1: 24,
  h2: 20,
  h3: 18,
};
const HEADING_WEIGHT: Record<string, any> = {
  title: "800",
  h1: "700",
  h2: "600",
  h3: "600",
};

// ─── Emotion data ─────────────────────────────────────────────────────────────

type EmotionDef = {
  valence: number;
  label: string;
  color: string;
  words: [string, string, string];
};

const EMOTIONS: EmotionDef[] = [
  {
    valence: 1,
    label: "Very Unpleasant",
    color: "#ef4444",
    words: ["Uneasy", "Distressed", "Anguished"],
  },
  {
    valence: 2,
    label: "Unpleasant",
    color: "#f97316",
    words: ["Displeased", "Frustrated", "Miserable"],
  },
  {
    valence: 3,
    label: "Neutral",
    color: "#a3a3a3",
    words: ["Indifferent", "Neutral", "Numb"],
  },
  {
    valence: 4,
    label: "Pleasant",
    color: "#34d399",
    words: ["Content", "Happy", "Joyful"],
  },
  {
    valence: 5,
    label: "Very Pleasant",
    color: "#3b82f6",
    words: ["Pleased", "Elated", "Ecstatic"],
  },
];

const INTENSITY_LABELS = ["Slightly", "Moderately", "Strongly"] as const;

const MAX_TAGS = 3;

const ACTIVITIES = [
  { id: "stationary", label: "Stationary", icon: "stationary" },
  { id: "eating", label: "Eating", icon: "eating" },
  { id: "walking", label: "Walking", icon: "walking" },
  { id: "running", label: "Running", icon: "running" },
  { id: "biking", label: "Biking", icon: "biking" },
  { id: "automotive", label: "Automotive", icon: "automotive" },
  { id: "flying", label: "Flying", icon: "flying" },
  { id: "none", label: "None", icon: "none" },
];

// ─── Card Themes ──────────────────────────────────────────────────────────────

const CARD_THEMES = [
  {
    id: "midnight",
    label: "Midnight",
    emoji: "moon",
    bg: "#0d0d1a",
    accent: "#7c5fc4",
    accentLight: "#c084fc",
    verseColor: "#b8aaee",
    titleColor: "#f0f0f0",
    textColor: "#aaa",
    borderColor: "#1e1e35",
    decorColor: "#1a1a2e",
  },
  {
    id: "dawn",
    label: "Dawn",
    emoji: "sun",
    bg: "#1a0e06",
    accent: "#c2752a",
    accentLight: "#f59e0b",
    verseColor: "#fcd9a0",
    titleColor: "#fff5e6",
    textColor: "#c8a87a",
    borderColor: "#2e1e0a",
    decorColor: "#231509",
  },
  {
    id: "forest",
    label: "Forest",
    emoji: "seedling",
    bg: "#071410",
    accent: "#2d7a5a",
    accentLight: "#4ade80",
    verseColor: "#a7f3d0",
    titleColor: "#ecfdf5",
    textColor: "#86efac",
    borderColor: "#0f2d20",
    decorColor: "#0a1f16",
  },
  {
    id: "ocean",
    label: "Ocean",
    emoji: "water",
    bg: "#060e1a",
    accent: "#1d5fa8",
    accentLight: "#60a5fa",
    verseColor: "#bfdbfe",
    titleColor: "#eff6ff",
    textColor: "#93c5fd",
    borderColor: "#0c2040",
    decorColor: "#08162e",
  },
];

const NOTE_THEMES = [
  {
    id: "dark",
    label: "Dark",
    emoji: "circle-half-stroke",
    bg: "#0a0a0a",
    accent: "",
    titleColor: "#f0f0f0",
    textColor: "#888",
    borderColor: "#2a2a2a",
    tagBg: "#1a1a1a",
    footerColor: "#333",
    previewAccent: "#c084fc",
  },
  {
    id: "slate",
    label: "Slate",
    emoji: "cloud",
    bg: "#0c0f1a",
    accent: "",
    titleColor: "#dde3f5",
    textColor: "#7a85a8",
    borderColor: "#1e2440",
    tagBg: "#131828",
    footerColor: "#1e2440",
    previewAccent: "#7b9cdd",
  },
  {
    id: "warm",
    label: "Warm",
    emoji: "fire-flame-curved",
    bg: "#130d06",
    accent: "",
    titleColor: "#f7e8cc",
    textColor: "#c49a60",
    borderColor: "#3a2208",
    tagBg: "#1f1208",
    footerColor: "#3a2208",
    previewAccent: "#e8833a",
  },
  {
    id: "cool",
    label: "Cool",
    emoji: "snowflake",
    bg: "#060d18",
    accent: "",
    titleColor: "#d8eeff",
    textColor: "#5a8aaa",
    borderColor: "#0d2035",
    tagBg: "#081525",
    footerColor: "#0d2035",
    previewAccent: "#60b4f8",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeId() {
  return Math.random().toString(36).slice(2, 10);
}

function defaultSegment(overrides?: Partial<Segment>): Segment {
  return {
    id: makeId(),
    text: "",
    fontSize: 16,
    color: "#f0f0f0",
    align: "left",
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    ...overrides,
  };
}

function segmentsToPlain(segs: Segment[]) {
  return segs.map((s) => s.text).join("\n");
}

function asString(val: string | string[] | undefined, fallback = ""): string {
  if (!val) return fallback;
  return Array.isArray(val) ? val[0] : val;
}

// ─── Segment style helper ─────────────────────────────────────────────────────

function getSegmentTextStyle(seg: Segment): object {
  const baseSize = seg.heading
    ? HEADING_SIZE[seg.heading]
    : (seg.fontSize ?? 16);
  const baseWeight = seg.heading
    ? HEADING_WEIGHT[seg.heading]
    : seg.bold
      ? "700"
      : "400";
  return {
    fontSize: baseSize,
    fontWeight: baseWeight,
    fontStyle: seg.italic ? "italic" : "normal",
    textDecorationLine:
      seg.underline && seg.strikethrough
        ? "underline line-through"
        : seg.underline
          ? "underline"
          : seg.strikethrough
            ? "line-through"
            : "none",
    color: seg.color ?? "#f0f0f0",
    textAlign: seg.align ?? "left",
    lineHeight: baseSize * 1.6,
  };
}

// ─── Card Previews ────────────────────────────────────────────────────────────

function DevotionCardPreview({
  title,
  verseRef,
  verseText,
  segments,
  date,
  theme,
}: {
  title: string;
  verseRef: string;
  verseText: string;
  segments: Segment[];
  date: string;
  theme: (typeof CARD_THEMES)[0];
}) {
  const plainText = segmentsToPlain(segments).trim();
  const dateStr = new Date(date || Date.now()).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return (
    <View
      style={[
        dc.card,
        { backgroundColor: theme.bg, borderColor: theme.borderColor },
      ]}
    >
      <View style={[dc.topBar, { backgroundColor: theme.accent }]} />
      <Text style={[dc.dateText, { color: theme.accent }]}>
        {dateStr.toUpperCase()}
      </Text>
      {title ? (
        <Text style={[dc.titleText, { color: theme.titleColor }]}>{title}</Text>
      ) : null}
      {verseText ? (
        <View
          style={[
            dc.verseBlock,
            {
              backgroundColor: theme.decorColor,
              borderLeftColor: theme.accent,
            },
          ]}
        >
          <Text style={[dc.verseText, { color: theme.verseColor }]}>
            "{verseText.replace(/^"|"$/g, "").trim()}"
          </Text>
          {verseRef ? (
            <Text style={[dc.verseRef, { color: theme.accentLight }]}>
              — {verseRef}
            </Text>
          ) : null}
        </View>
      ) : null}
      {plainText ? (
        <Text style={[dc.bodyText, { color: theme.textColor }]}>
          {plainText}
        </Text>
      ) : null}
      <View
        style={[dc.footerDivider, { backgroundColor: theme.borderColor }]}
      />
      <View style={dc.footer}>
        <Text style={[dc.footerBrand, { color: theme.accent }]}>✦ Astrea</Text>
        <Text style={[dc.footerSub, { color: theme.accent + "88" }]}>
          Daily Devotion
        </Text>
      </View>
    </View>
  );
}

function NoteCardPreview({
  title,
  segments,
  date,
  emotion,
  tags,
  journalName,
  accentColor,
  theme,
}: {
  title: string;
  segments: Segment[];
  date: string;
  emotion?: EmotionEntry;
  tags?: string[];
  journalName?: string;
  accentColor: string;
  theme: (typeof NOTE_THEMES)[0];
}) {
  const plainText = segmentsToPlain(segments).trim();
  const dateStr = new Date(date || Date.now()).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const themeAccent = (theme as any).previewAccent ?? accentColor;
  return (
    <View
      style={[
        nc.card,
        { backgroundColor: theme.bg, borderColor: theme.borderColor },
      ]}
    >
      <View style={[nc.topBar, { backgroundColor: themeAccent }]} />
      <View style={nc.header}>
        <Text style={[nc.dateText, { color: themeAccent }]}>
          {dateStr.toUpperCase()}
        </Text>
        {title ? (
          <Text style={[nc.titleText, { color: theme.titleColor }]}>
            {title}
          </Text>
        ) : null}
      </View>
      <View style={[nc.divider, { backgroundColor: theme.borderColor }]} />
      {plainText ? (
        <Text style={[nc.bodyText, { color: theme.textColor }]}>
          {plainText}
        </Text>
      ) : null}
      {tags && tags.length > 0 ? (
        <View style={nc.tagsRow}>
          {tags.slice(0, 3).map((tag) => (
            <View
              key={tag}
              style={[nc.tagPill, { backgroundColor: themeAccent + "22" }]}
            >
              <Text style={[nc.tagText, { color: themeAccent }]}>#{tag}</Text>
            </View>
          ))}
        </View>
      ) : null}
      {emotion ? (
        <View style={[nc.moodPill, { backgroundColor: emotion.color + "22" }]}>
          <Text style={[nc.moodText, { color: emotion.color }]}>
            {emotion.label} ·{" "}
            {["Slightly", "Moderately", "Strongly"][emotion.intensity - 1]}
          </Text>
        </View>
      ) : null}
      <View
        style={[nc.footerDivider, { backgroundColor: theme.borderColor }]}
      />
      <View style={nc.footer}>
        <Text style={[nc.footerBrand, { color: themeAccent }]}>✦ Astrea</Text>
        <Text style={[nc.footerSub, { color: themeAccent + "88" }]}>
          {journalName || "My Journal"}
        </Text>
      </View>
    </View>
  );
}

const dc = StyleSheet.create({
  card: {
    width: 320,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 20,
  },
  topBar: { height: 5, width: "100%" },
  dateText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 10,
    paddingHorizontal: 24,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 14,
    lineHeight: 24,
  },
  verseBlock: {
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  verseText: {
    fontSize: 12,
    fontStyle: "italic",
    lineHeight: 18,
    marginBottom: 6,
  },
  verseRef: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
  bodyText: {
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  footerDivider: { height: 1, marginHorizontal: 24, marginBottom: 12 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
  },
  footerBrand: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
  footerSub: { fontSize: 10, letterSpacing: 0.2 },
});

const nc = StyleSheet.create({
  card: {
    width: 320,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 16,
  },
  topBar: { height: 5, width: "100%" },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  dateText: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  titleText: { fontSize: 18, fontWeight: "700", lineHeight: 24 },
  divider: { height: 1, marginHorizontal: 20, marginBottom: 12 },
  bodyText: {
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  tagText: { fontSize: 10, fontWeight: "700" },
  moodPill: {
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  moodText: { fontSize: 10, fontWeight: "700" },
  footerDivider: { height: 1, marginHorizontal: 20, marginBottom: 10 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  footerBrand: { fontSize: 10, fontWeight: "700", letterSpacing: 0.4 },
  footerSub: { fontSize: 10, letterSpacing: 0.2 },
});

// ─── Share Modals ─────────────────────────────────────────────────────────────

function ShareDevotionModal({
  visible,
  onClose,
  title,
  verseRef,
  verseText,
  segments,
  date,
  journalColor,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  verseRef: string;
  verseText: string;
  segments: Segment[];
  date: string;
  journalColor: string;
}) {
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("");
  const theme = CARD_THEMES[selectedTheme];
  const cardRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    setIsCapturing(true);
    setStatus("Drawing card...");
    try {
      const uri = await captureRef(cardRef, { format: "jpg", quality: 0.96 });
      setStatus("Opening share options...");
      if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = uri;
        a.download = `devotion-${Date.now()}.jpg`;
        a.click();
        setStatus("Downloaded! 🎉 Save and share on Messenger.");
        setTimeout(() => setStatus(""), 4000);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) throw new Error("Sharing not available on this device");
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share Devotion Card",
        });
        setStatus("");
      }
    } catch (err) {
      setStatus("Something went wrong. Try again.");
      setTimeout(() => setStatus(""), 3000);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={sm.overlay}>
        <View style={sm.sheet}>
          <View style={sm.handle} />
          <View style={sm.header}>
            <View>
              <Text style={sm.headerTitle}>Share Devotion</Text>
              <Text style={sm.headerSub}>Choose a card theme to share</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={sm.closeBtn}>
              <IconX color="#555" />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View style={sm.cardPreviewWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                }}
              >
                <ViewShot
                  ref={cardRef}
                  options={{ format: "jpg", quality: 0.96 }}
                >
                  <DevotionCardPreview
                    title={title}
                    verseRef={verseRef}
                    verseText={verseText}
                    segments={segments}
                    date={date}
                    theme={theme}
                  />
                </ViewShot>
              </ScrollView>
              <View style={sm.previewNoteRow}>
                <IconArrowUp color="#444" />
              </View>
            </View>
            <Text style={sm.sectionLabel}>THEME</Text>
            <View style={sm.themeRow}>
              {CARD_THEMES.map((t, idx) => {
                const isActive = selectedTheme === idx;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTheme(idx)}
                    style={[
                      sm.themeBtn,
                      {
                        backgroundColor: t.bg,
                        borderColor: isActive ? t.accent : t.borderColor,
                      },
                      isActive && { borderWidth: 2 },
                    ]}
                  >
                    <FontAwesome6
                      name={t.emoji}
                      size={14}
                      color={t.accentLight}
                      style={{ opacity: isActive ? 1 : 0.7, marginTop: 2 }}
                    />
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 6,
                        paddingTop: 4,
                        paddingBottom: 4,
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          height: 2,
                          borderRadius: 1,
                          backgroundColor: t.accent,
                          marginBottom: 2,
                          opacity: isActive ? 1 : 0.6,
                        }}
                      />
                      <View
                        style={{
                          height: 4,
                          borderRadius: 3,
                          backgroundColor: t.titleColor,
                          width: "70%",
                          opacity: 0.85,
                        }}
                      />
                      <View
                        style={{
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: t.verseColor,
                          width: "100%",
                          opacity: 0.6,
                        }}
                      />
                      <View
                        style={{
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: t.accentLight,
                          width: "70%",
                          opacity: 0.3,
                        }}
                      />
                    </View>
                    <Text
                      style={[
                        sm.themeLabel,
                        { color: t.accentLight, opacity: isActive ? 1 : 0.75 },
                      ]}
                    >
                      {t.label}
                    </Text>
                    {isActive && (
                      <View
                        style={[sm.themeCheck, { backgroundColor: t.accent }]}
                      >
                        <IconCheck color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {status ? (
              <View style={sm.statusBox}>
                <Text style={[sm.statusText, { color: journalColor }]}>
                  {status}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={handleShare}
              disabled={isCapturing}
              style={[
                sm.shareBtn,
                { backgroundColor: journalColor },
                isCapturing && { opacity: 0.6 },
              ]}
            >
              <View style={sm.shareBtnInner}>
                {!isCapturing &&
                  (Platform.OS === "web" ? (
                    <IconDownload color="#fff" />
                  ) : (
                    <IconShare color="#fff" />
                  ))}
                <Text style={sm.shareBtnText}>
                  {isCapturing
                    ? status || "Working..."
                    : Platform.OS === "web"
                      ? "  Download as Image"
                      : "  Share as Image"}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ShareNoteModal({
  visible,
  onClose,
  title,
  segments,
  date,
  emotion,
  tags,
  journalName,
  journalColor,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  segments: Segment[];
  date: string;
  emotion?: EmotionEntry;
  tags?: string[];
  journalName?: string;
  journalColor: string;
}) {
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState("");
  const theme = { ...NOTE_THEMES[selectedTheme], accent: journalColor };
  const cardRef = useRef<ViewShot>(null);

  const handleShare = async () => {
    setIsCapturing(true);
    setStatus("Drawing card...");
    try {
      const uri = await captureRef(cardRef, { format: "jpg", quality: 0.96 });
      setStatus("Opening share options...");
      if (Platform.OS === "web") {
        const a = document.createElement("a");
        a.href = uri;
        a.download = `note-${Date.now()}.jpg`;
        a.click();
        setStatus("Downloaded! 🎉");
        setTimeout(() => setStatus(""), 4000);
      } else {
        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) throw new Error("Sharing not available on this device");
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: "Share Note Card",
        });
        setStatus("");
      }
    } catch (err) {
      setStatus("Something went wrong. Try again.");
      setTimeout(() => setStatus(""), 3000);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={sm.overlay}>
        <View style={sm.sheet}>
          <View style={sm.handle} />
          <View style={sm.header}>
            <View>
              <Text style={sm.headerTitle}>Share Note</Text>
              <Text style={sm.headerSub}>
                {Platform.OS === "web"
                  ? "Image will be downloaded"
                  : "Saves as image, share anywhere"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={sm.closeBtn}>
              <IconX color="#555" />
            </TouchableOpacity>
          </View>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            <View style={sm.cardPreviewWrap}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: 24,
                  paddingVertical: 16,
                }}
              >
                <ViewShot
                  ref={cardRef}
                  options={{ format: "jpg", quality: 0.96 }}
                >
                  <NoteCardPreview
                    title={title}
                    segments={segments}
                    date={date}
                    emotion={emotion}
                    tags={tags}
                    journalName={journalName}
                    accentColor={journalColor}
                    theme={theme}
                  />
                </ViewShot>
              </ScrollView>
            </View>
            <Text style={sm.sectionLabel}>BACKGROUND</Text>
            <View style={sm.themeRow}>
              {NOTE_THEMES.map((t, idx) => {
                const isActive = selectedTheme === idx;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setSelectedTheme(idx)}
                    style={[
                      sm.themeBtn,
                      {
                        backgroundColor: t.bg,
                        borderColor: isActive ? journalColor : t.borderColor,
                      },
                      isActive && { borderWidth: 2 },
                    ]}
                  >
                    <FontAwesome6
                      name={t.emoji}
                      size={14}
                      color={isActive ? journalColor : (t as any).previewAccent}
                      style={{ opacity: isActive ? 1 : 0.7, marginTop: 2 }}
                    />
                    <View
                      style={{
                        width: "100%",
                        paddingHorizontal: 6,
                        paddingTop: 4,
                        paddingBottom: 4,
                        gap: 4,
                      }}
                    >
                      <View
                        style={{
                          height: 2,
                          borderRadius: 1,
                          backgroundColor: (t as any).previewAccent,
                          marginBottom: 2,
                          opacity: isActive ? 1 : 0.6,
                        }}
                      />
                      <View
                        style={{
                          height: 4,
                          borderRadius: 3,
                          backgroundColor: t.titleColor,
                          width: "70%",
                          opacity: 0.85,
                        }}
                      />
                      <View
                        style={{
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: (t as any).previewAccent,
                          width: "100%",
                          opacity: 0.45,
                        }}
                      />
                      <View
                        style={{
                          height: 3,
                          borderRadius: 2,
                          backgroundColor: (t as any).previewAccent,
                          width: "70%",
                          opacity: 0.3,
                        }}
                      />
                    </View>
                    <Text
                      style={[
                        sm.themeLabel,
                        {
                          color: isActive
                            ? journalColor
                            : (t as any).previewAccent,
                          opacity: isActive ? 1 : 0.8,
                        },
                      ]}
                    >
                      {t.label}
                    </Text>
                    {isActive && (
                      <View
                        style={[
                          sm.themeCheck,
                          { backgroundColor: journalColor },
                        ]}
                      >
                        <IconCheck color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
            {status ? (
              <View style={sm.statusBox}>
                <Text style={[sm.statusText, { color: journalColor }]}>
                  {status}
                </Text>
              </View>
            ) : null}
            <TouchableOpacity
              onPress={handleShare}
              disabled={isCapturing}
              style={[
                sm.shareBtn,
                { backgroundColor: journalColor },
                isCapturing && { opacity: 0.6 },
              ]}
            >
              <View style={sm.shareBtnInner}>
                {!isCapturing &&
                  (Platform.OS === "web" ? (
                    <IconDownload color="#fff" />
                  ) : (
                    <IconShare color="#fff" />
                  ))}
                <Text style={sm.shareBtnText}>
                  {isCapturing
                    ? status || "Working..."
                    : Platform.OS === "web"
                      ? "  Download as Image"
                      : "  Share as Image"}
                </Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const sm = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "92%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  headerTitle: { color: "#f0f0f0", fontSize: 16, fontWeight: "700" },
  headerSub: { color: "#555", fontSize: 12, marginTop: 2 },
  closeBtn: { padding: 4 },
  cardPreviewWrap: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#0a0a0a",
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  previewNote: { color: "#444", fontSize: 11, textAlign: "center" },
  previewNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  sectionLabel: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  themeRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  themeBtn: {
    flex: 1,
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 4,
    gap: 3,
    position: "relative",
    overflow: "hidden",
  },
  themeLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 0.3 },
  themeCheck: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  statusBox: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  statusText: { fontSize: 13, fontWeight: "600" },
  tipBox: {
    marginHorizontal: 20,
    marginTop: 18,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#252525",
  },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 6 },
  tipText: { color: "#666", fontSize: 12, lineHeight: 18, flex: 1 },
  shareBtn: {
    marginHorizontal: 20,
    marginTop: 16,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },
  shareBtnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  shareBtnText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});

// ─── NEW: Single TextInput Editor ─────────────────────────────────────────────

function getRichText(segments: Segment[]): string {
  return segments.map((s) => s.text).join("\n");
}

function syncTextToSegments(
  newText: string,
  oldSegments: Segment[],
  fmt: Partial<Segment>,
): Segment[] {
  const lines = newText.split("\n");
  return lines.map((line, i) => {
    if (oldSegments[i]) {
      return { ...oldSegments[i], text: line };
    }
    return defaultSegment({
      text: line,
      bold: fmt.bold,
      italic: fmt.italic,
      underline: fmt.underline,
      strikethrough: fmt.strikethrough,
      fontSize: fmt.fontSize ?? 16,
      color: fmt.color ?? "#f0f0f0",
      highlight: fmt.highlight ?? "",
      heading: fmt.heading,
      align: fmt.align ?? "left",
    });
  });
}

function getActiveParagraphIndex(text: string, cursorPos: number): number {
  const before = text.slice(0, cursorPos);
  return before.split("\n").length - 1;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NoteForm() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const noteId = asString(params.id);
  const journalId = asString(params.journalId);
  const journalColor = asString(params.journalColor, "#c084fc");
  const journalName = asString(params.journalName, "My Journal");
  const initialTitle = asString(params.initialTitle, "");
  const paramVerseRef = asString(params.verseRef, "");
  const paramVerseText = asString(params.verseText, "");
  const newKey = asString(params.newKey, "");

  const storageKey = STORAGE_KEYS.notes(journalId);
  const isNewNote = !!newKey || !noteId;

  const [title, setTitle] = useState(isNewNote ? "" : initialTitle);
  const [verseRef, setVerseRef] = useState(isNewNote ? "" : paramVerseRef);
  const [verseText, setVerseText] = useState(isNewNote ? "" : paramVerseText);
  const verseRefRef = useRef(isNewNote ? "" : paramVerseRef);
  const verseTextRef = useRef(isNewNote ? "" : paramVerseText);

  const [editorText, setEditorText] = useState("");
  const editorTextRef = useRef("");

  const [segments, setSegments] = useState<Segment[]>([defaultSegment()]);
  const segsRef = useRef<Segment[]>([defaultSegment()]);

  const [cursorPos, setCursorPos] = useState(0);
  const cursorPosRef = useRef(0);

  const [history, setHistory] = useState<{ text: string; segs: Segment[] }[]>(
    [],
  );
  const [future, setFuture] = useState<{ text: string; segs: Segment[] }[]>([]);
  const [kbHeight, setKbHeight] = useState(0);

  const [fmt, setFmt] = useState<Partial<Segment>>({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    fontSize: 16,
    color: "#f0f0f0",
    highlight: "",
    heading: undefined,
    align: "left",
  });

  const [picker, setPicker] = useState<
    "fontSize" | "color" | "highlight" | "heading" | "mood" | "tags" | null
  >(null);

  const [isSavingUI, setIsSavingUI] = useState(false);
  const [emotion, setEmotion] = useState<EmotionEntry | undefined>(undefined);
  const [activities, setActivities] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [tagToast, setTagToast] = useState<{ msg: string; ok: boolean } | null>(
    null,
  );
  const tagToastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [globalTags, setGlobalTags] = useState<string[]>([]);
  const [selectedValence, setSelectedValence] = useState<number | null>(null);

  // ── FIX: track keyboard height inside Tags modal ──────────────────────────
  const [tagsModalKbHeight, setTagsModalKbHeight] = useState(0);

  const [showDevotionShareModal, setShowDevotionShareModal] = useState(false);
  const [showNoteShareModal, setShowNoteShareModal] = useState(false);
  const [noteDate, setNoteDate] = useState(new Date().toISOString());

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noteIdRef = useRef<string | null>(isNewNote ? null : noteId || null);
  const hasChanges = useRef(false);
  const isSaving = useRef(false);
  const latestRef = useRef({
    title: isNewNote ? "" : initialTitle,
    segments: [defaultSegment()],
  });
  const emotionRef = useRef<EmotionEntry | undefined>(undefined);
  const activitiesRef = useRef<string[]>([]);
  const tagsRef = useRef<string[]>([]);

  const editorInputRef = useRef<TextInput>(null);

  const hasContent = editorText.trim().length > 0;
  const isDevotionNote = !!(verseRef || verseText);

  const activeParagraphIdx = getActiveParagraphIndex(editorText, cursorPos);

  useEffect(() => {
    const seg = segsRef.current[activeParagraphIdx];
    if (!seg) return;
    setFmt({
      bold: seg.bold ?? false,
      italic: seg.italic ?? false,
      underline: seg.underline ?? false,
      strikethrough: seg.strikethrough ?? false,
      fontSize: seg.fontSize ?? 16,
      color: seg.color ?? "#f0f0f0",
      highlight: seg.highlight ?? "",
      heading: seg.heading,
      align: seg.align ?? "left",
    });
  }, [activeParagraphIdx]);

  useEffect(() => {
    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const s1 = Keyboard.addListener(showEvt, (e: KeyboardEvent) => {
      const screenHeight = Dimensions.get("window").height;
      setKbHeight(screenHeight - e.endCoordinates.screenY);
    });
    const s2 = Keyboard.addListener(hideEvt, () => setKbHeight(0));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, []);

  // ── Tags modal: keyboard listener + force-reload tags from Storage on open ─
  useEffect(() => {
    if (picker !== "tags") {
      setTagsModalKbHeight(0);
      return;
    }

    // Read directly from Storage — bypasses any stale state/closure issue
    (async () => {
      try {
        const stored = await Storage.getItem(STORAGE_KEYS.tags);
        let parsed: any[] = [];
        try {
          parsed = stored ? JSON.parse(stored) : [];
        } catch {
          parsed = [];
        }
        const clean: string[] = parsed.filter(
          (t: any) => t != null && typeof t === "string" && t.trim().length > 0,
        );
        setGlobalTags(clean);
        await Storage.setItem(STORAGE_KEYS.tags, JSON.stringify(clean));
      } catch {}
    })();

    // Clean the note's own selected tags too
    const cleanSelected = tagsRef.current.filter(
      (t) => t != null && typeof t === "string" && t.trim().length > 0,
    );
    tagsRef.current = cleanSelected;
    setTags(cleanSelected);

    const showEvt =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvt =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";
    const s1 = Keyboard.addListener(showEvt, (e: KeyboardEvent) => {
      setTagsModalKbHeight(e.endCoordinates.height);
    });
    const s2 = Keyboard.addListener(hideEvt, () => setTagsModalKbHeight(0));
    return () => {
      s1.remove();
      s2.remove();
    };
  }, [picker]);

  useFocusEffect(
    useCallback(() => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const currentNoteId = asString(params.id as any);
      const currentNewKey = asString(params.newKey as any);
      const freshIsNew = !!currentNewKey || !currentNoteId;

      if (freshIsNew) {
        const blankSeg = defaultSegment();
        segsRef.current = [blankSeg];
        latestRef.current = { title: "", segments: [blankSeg] };
        noteIdRef.current = null;
        emotionRef.current = undefined;
        activitiesRef.current = [];
        tagsRef.current = [];
        hasChanges.current = false;
        isSaving.current = false;

        setTitle("");
        setEditorText("");
        editorTextRef.current = "";
        setCursorPos(0);
        cursorPosRef.current = 0;
        setHistory([]);
        setFuture([]);
        setVerseRef(asString(params.verseRef as any, ""));
        setVerseText(asString(params.verseText as any, ""));
        setSegments([blankSeg]);
        setEmotion(undefined);
        setActivities([]);
        setTags([]);
        setTagInput("");
        setSelectedValence(null);
        setNoteDate(new Date().toISOString());
        loadGlobalTags();
        setFmt({
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          fontSize: 16,
          color: "#f0f0f0",
          highlight: "",
          heading: undefined,
          align: "left",
        });
      } else if (currentNoteId) {
        // Reset tags synchronously BEFORE async loadNote to avoid stale ref
        tagsRef.current = [];
        setTags([]);
        activitiesRef.current = [];
        setActivities([]);
        emotionRef.current = undefined;
        setEmotion(undefined);
        noteIdRef.current = currentNoteId;
        loadNote(currentNoteId);
      }
      loadGlobalTags();

      return () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      };
    }, [params.id, params.newKey]),
  );

  const loadGlobalTags = async () => {
    try {
      const stored = await Storage.getItem(STORAGE_KEYS.tags);
      const parsed: string[] = stored ? JSON.parse(stored) : [];
      const clean = parsed.filter(
        (t) => typeof t === "string" && t.trim().length > 0,
      );
      setGlobalTags(clean);
      if (clean.length !== parsed.length) {
        await Storage.setItem(STORAGE_KEYS.tags, JSON.stringify(clean));
      }
    } catch (err) {}
  };

  const saveGlobalTags = async (next: string[]) => {
    try {
      const clean = next.filter(
        (t) => typeof t === "string" && t.trim().length > 0,
      );
      await Storage.setItem(STORAGE_KEYS.tags, JSON.stringify(clean));
    } catch (err) {}
  };

  const loadNote = async (idToLoad: string) => {
    try {
      const stored = await Storage.getItem(storageKey);
      const parsed: Note[] = stored ? JSON.parse(stored) : [];
      const existing = parsed.find((n) => n.id === idToLoad);
      if (!existing) return;
      setTitle(existing.title);
      if (existing.date) setNoteDate(existing.date);
      const segs = existing.segments?.length
        ? existing.segments
        : [defaultSegment({ text: existing.text })];
      segsRef.current = segs;
      setSegments([...segs]);
      const text = getRichText(segs);
      setEditorText(text);
      editorTextRef.current = text;
      latestRef.current = { title: existing.title, segments: segs };
      if (existing.emotion) {
        setEmotion(existing.emotion);
        emotionRef.current = existing.emotion;
        setSelectedValence(existing.emotion.valence);
      }
      // Always reset activities too
      const cleanActivities = existing.activities ?? [];
      setActivities(cleanActivities);
      activitiesRef.current = cleanActivities;
      // Always reset tags — even if note has no tags, clear previous note's tags
      const cleanTags = (existing.tags ?? []).filter(
        (t: string) => t && t.trim().length > 0,
      );
      setTags(cleanTags);
      tagsRef.current = cleanTags;
      if (existing.verseRef) {
        setVerseRef(existing.verseRef);
        verseRefRef.current = existing.verseRef;
      }
      if (existing.verseText) {
        setVerseText(existing.verseText);
        verseTextRef.current = existing.verseText;
      }
    } catch (err) {}
  };

  const saveNow = async () => {
    if (isSaving.current) {
      await new Promise<void>((resolve) => {
        const interval = setInterval(() => {
          if (!isSaving.current) {
            clearInterval(interval);
            resolve();
          }
        }, 50);
      });
    }
    isSaving.current = true;
    const { title, segments } = latestRef.current;
    const cleanTitle = title.trim();
    const plainText = segmentsToPlain(segments).trim();
    if (!cleanTitle && !plainText) {
      isSaving.current = false;
      return;
    }
    try {
      const stored = await Storage.getItem(storageKey);
      const parsed: Note[] = stored ? JSON.parse(stored) : [];
      let updated: Note[];
      if (noteIdRef.current) {
        updated = parsed.map((n) =>
          n.id === noteIdRef.current
            ? {
                ...n,
                title: cleanTitle,
                text: plainText,
                segments,
                emotion: emotionRef.current,
                activities: activitiesRef.current,
                tags: tagsRef.current,
                verseRef: verseRefRef.current || n.verseRef,
                verseText: verseTextRef.current || n.verseText,
              }
            : n,
        );
      } else {
        const newId = Date.now().toString();
        noteIdRef.current = newId;
        const nowISO = new Date().toISOString();
        setNoteDate(nowISO);
        updated = [
          {
            id: newId,
            title: cleanTitle,
            text: plainText,
            segments,
            date: nowISO,
            emotion: emotionRef.current,
            activities: activitiesRef.current,
            tags: tagsRef.current,
            verseRef: verseRefRef.current || undefined,
            verseText: verseTextRef.current || undefined,
          },
          ...parsed,
        ];
      }
      await Storage.setItem(storageKey, JSON.stringify(updated));
    } catch (err) {}
    hasChanges.current = false;
    isSaving.current = false;
  };

  const triggerSave = () => {
    hasChanges.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(saveNow, 1000);
  };

  const handleBack = async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const hasAny =
      latestRef.current.title.trim() ||
      segmentsToPlain(latestRef.current.segments).trim();
    if (hasChanges.current || hasAny) {
      setIsSavingUI(true);
      isSaving.current = false;
      await saveNow();
      setIsSavingUI(false);
    }
    router.replace({
      pathname: "/note-list",
      params: { journalId, journalColor, journalName },
    });
  };

  const handleEditorChange = (newText: string) => {
    setHistory((h) => [
      ...h.slice(-30),
      { text: editorTextRef.current, segs: segsRef.current },
    ]);
    setFuture([]);

    const newSegs = syncTextToSegments(newText, segsRef.current, fmt);
    segsRef.current = newSegs;
    setSegments([...newSegs]);
    editorTextRef.current = newText;
    setEditorText(newText);
    latestRef.current.segments = newSegs;
    triggerSave();
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setFuture((f) => [
      { text: editorTextRef.current, segs: segsRef.current },
      ...f.slice(0, 30),
    ]);
    setHistory((h) => h.slice(0, -1));
    segsRef.current = prev.segs;
    editorTextRef.current = prev.text;
    setSegments([...prev.segs]);
    setEditorText(prev.text);
    latestRef.current.segments = prev.segs;
    triggerSave();
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setHistory((h) => [
      ...h.slice(-30),
      { text: editorTextRef.current, segs: segsRef.current },
    ]);
    setFuture((f) => f.slice(1));
    segsRef.current = next.segs;
    editorTextRef.current = next.text;
    setSegments([...next.segs]);
    setEditorText(next.text);
    latestRef.current.segments = next.segs;
    triggerSave();
  };

  const applyFmt = (patch: Partial<Segment>) => {
    const newFmt = { ...fmt, ...patch };
    setFmt(newFmt);
    const idx = activeParagraphIdx;
    const newSegs = segsRef.current.map((s, i) =>
      i === idx ? { ...s, ...patch } : s,
    );
    segsRef.current = newSegs;
    setSegments([...newSegs]);
    latestRef.current.segments = newSegs;
    triggerSave();
  };

  const toggleFmt = (
    key: "bold" | "italic" | "underline" | "strikethrough",
  ) => {
    applyFmt({ [key]: !fmt[key] });
  };

  const setEmotionEntry = (entry: EmotionEntry | undefined) => {
    emotionRef.current = entry;
    setEmotion(entry);
    triggerSave();
  };

  const confirmEmotion = (valence: number, intensity: 1 | 2 | 3) => {
    const def = EMOTIONS.find((e) => e.valence === valence)!;
    setEmotionEntry({
      valence,
      intensity,
      label: def.words[intensity - 1],
      color: def.color,
    });
  };

  const toggleActivity = (id: string) => {
    const next = activitiesRef.current.includes(id)
      ? activitiesRef.current.filter((a) => a !== id)
      : [...activitiesRef.current, id];
    activitiesRef.current = next;
    setActivities(next);
    triggerSave();
  };

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "").toLowerCase();
    if (!tag || tagsRef.current.includes(tag)) return;
    if (tagsRef.current.length >= MAX_TAGS) return;
    const next = [...tagsRef.current, tag];
    tagsRef.current = next;
    setTags(next);
    setTagInput("");
    triggerSave();
    if (!globalTags.includes(tag)) {
      const nextGlobal = [...globalTags, tag].sort();
      setGlobalTags(nextGlobal);
      saveGlobalTags(nextGlobal);
    }
  };

  // Saves to library only — does NOT auto-select into the note
  const showTagToast = (msg: string, ok: boolean) => {
    if (tagToastTimer.current) clearTimeout(tagToastTimer.current);
    setTagToast({ msg, ok });
    tagToastTimer.current = setTimeout(() => setTagToast(null), 2000);
  };

  const addTagToLibrary = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "").toLowerCase();
    if (!tag) return;
    setTagInput("");
    if (globalTags.includes(tag)) {
      showTagToast(`#${tag} already exists`, false);
      return;
    }
    const nextGlobal = [...globalTags, tag].sort();
    setGlobalTags(nextGlobal);
    saveGlobalTags(nextGlobal);
    showTagToast(`#${tag} added to library!`, true);
  };

  const deleteGlobalTag = (tag: string) => {
    const nextGlobal = globalTags.filter((t) => t !== tag);
    setGlobalTags(nextGlobal);
    saveGlobalTags(nextGlobal);
    removeTag(tag);
    showTagToast(`#${tag} removed from library`, false);
  };

  const toggleTag = (tag: string) => {
    // Always use ref for current truth — filter empties before counting
    const currentTags = tagsRef.current.filter(
      (t) => t && typeof t === "string" && t.trim().length > 0,
    );
    if (currentTags.includes(tag)) {
      removeTag(tag);
    } else {
      if (currentTags.length >= MAX_TAGS) return;
      const next = [...currentTags, tag];
      tagsRef.current = next;
      setTags(next);
      triggerSave();
    }
  };

  const removeTag = (tag: string) => {
    const next = tagsRef.current.filter((t) => t !== tag);
    tagsRef.current = next;
    setTags(next);
    triggerSave();
  };

  const handleShare = () =>
    isDevotionNote
      ? setShowDevotionShareModal(true)
      : setShowNoteShareModal(true);

  const TOOLBAR_H = 48;
  const UNDO_H = 36;
  const bottomBarH = TOOLBAR_H + UNDO_H;
  const toolbarBottom = kbHeight > 0 ? kbHeight : insets.bottom;

  const wordCount = editorText.trim().split(/\s+/).filter(Boolean).length;

  const activeSeg = segsRef.current[activeParagraphIdx];

  // ── Synchronous clean — derived every render, no async timing issues ───────
  const cleanSelectedTags = tags.filter(
    (t) => t != null && typeof t === "string" && t.trim().length > 0,
  );
  const cleanGlobalTags = globalTags.filter(
    (t) => t != null && typeof t === "string" && t.trim().length > 0,
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#161616" }}>
      {/* Top bar */}
      <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity
          onPress={handleBack}
          style={s.backBtn}
          disabled={isSavingUI}
        >
          {isSavingUI ? (
            <Text style={[s.backText, { color: "#555" }]}>Saving...</Text>
          ) : (
            <View style={s.backInner}>
              <IconChevronLeft color={journalColor} />
              <Text style={[s.backText, { color: journalColor }]}>Back</Text>
            </View>
          )}
        </TouchableOpacity>
        {hasContent || title.trim() || verseText ? (
          <TouchableOpacity
            onPress={handleShare}
            style={[s.shareBtn, { borderColor: journalColor + "55" }]}
          >
            <IconShare color={journalColor} />
            <Text style={[s.shareBtnText, { color: journalColor }]}>Share</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Title input */}
      <TextInput
        style={s.titleInput}
        placeholder="Title your note..."
        placeholderTextColor="#333"
        value={title}
        onChangeText={(t) => {
          setTitle(t);
          latestRef.current.title = t;
          triggerSave();
        }}
        selectionColor={journalColor}
        returnKeyType="next"
        onSubmitEditing={() => {
          setTimeout(() => editorInputRef.current?.focus(), 50);
        }}
      />

      {/* Bible Verse Card */}
      {verseText ? (
        <View style={s.verseCard}>
          <View style={s.verseCardRefRow}>
            <IconBible />
            <Text style={s.verseCardRef}> {verseRef}</Text>
          </View>
          <Text style={s.verseCardText}>
            {verseText.replace(/^"|"$/g, "").trim()}
          </Text>
        </View>
      ) : null}

      {/* Single TextInput Editor */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          s.editorContent,
          { paddingBottom: toolbarBottom + bottomBarH + 8 },
        ]}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        <TextInput
          ref={editorInputRef}
          style={[
            s.editorInput,
            activeSeg ? getSegmentTextStyle(activeSeg) : {},
          ]}
          value={editorText}
          onChangeText={handleEditorChange}
          onSelectionChange={(e) => {
            const pos = e.nativeEvent.selection.start;
            cursorPosRef.current = pos;
            setCursorPos(pos);
          }}
          multiline={true}
          scrollEnabled={false}
          blurOnSubmit={false}
          selectionColor={journalColor}
          placeholder="Write here..."
          placeholderTextColor={journalColor + "30"}
          autoCorrect={true}
          autoCapitalize="sentences"
          textAlignVertical="top"
        />
        <TouchableOpacity
          style={s.editorTapArea}
          activeOpacity={1}
          onPress={() => editorInputRef.current?.focus()}
        />
      </ScrollView>

      {/* Undo/Redo + word count / tags bar */}
      <View
        style={[s.undoBar, { bottom: toolbarBottom + TOOLBAR_H }]}
        onStartShouldSetResponder={() => false}
        onStartShouldSetResponderCapture={() => false}
      >
        <TouchableOpacity
          onPress={handleUndo}
          disabled={history.length === 0}
          style={s.undoBtn}
        >
          <FontAwesome6
            name="rotate-left"
            size={13}
            color={history.length === 0 ? "#2a2a2a" : "#555"}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleRedo}
          disabled={future.length === 0}
          style={s.undoBtn}
        >
          <FontAwesome6
            name="rotate-right"
            size={13}
            color={future.length === 0 ? "#2a2a2a" : "#555"}
          />
        </TouchableOpacity>
        {tags.filter((t) => t && t.trim().length > 0).length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ flex: 1 }}
            contentContainerStyle={{
              gap: 6,
              alignItems: "center",
              paddingHorizontal: 4,
            }}
          >
            {tags
              .filter((t) => t && t.trim().length > 0)
              .map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => removeTag(tag)}
                  style={s.tagPill}
                >
                  <Text style={s.tagPillText}>#{tag} </Text>
                  <IconX color="#888" />
                </TouchableOpacity>
              ))}
          </ScrollView>
        )}
        {wordCount > 0 && tags.length === 0 && (
          <Text style={s.wordCount}>{wordCount} words</Text>
        )}
      </View>

      {/* Formatting toolbar */}
      <View
        style={[s.toolbarWrap, { bottom: toolbarBottom }]}
        onStartShouldSetResponder={() => false}
        onStartShouldSetResponderCapture={() => false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.toolbarContent}
          keyboardShouldPersistTaps="always"
        >
          <ToolBtn
            icon="bold"
            active={!!fmt.bold}
            onPress={() => toggleFmt("bold")}
            activeColor={journalColor}
          />
          <ToolBtn
            icon="italic"
            active={!!fmt.italic}
            onPress={() => toggleFmt("italic")}
            activeColor={journalColor}
          />
          <ToolBtn
            icon="underline"
            active={!!fmt.underline}
            onPress={() => toggleFmt("underline")}
            activeColor={journalColor}
          />
          <ToolBtn
            icon="strike"
            active={!!fmt.strikethrough}
            onPress={() => toggleFmt("strikethrough")}
            activeColor={journalColor}
          />
          <Divider />
          <ToolBtn
            icon="heading"
            active={!!fmt.heading}
            onPress={() => setPicker("heading")}
            activeColor={journalColor}
          />
          <ToolBtn icon="fontSize" onPress={() => setPicker("fontSize")} />
          <Divider />
          <ToolBtn
            icon="color"
            onPress={() => setPicker("color")}
            activeColor={fmt.color ?? journalColor}
          />
          <ToolBtn
            icon="highlight"
            active={!!fmt.highlight}
            onPress={() => setPicker("highlight")}
            activeColor={journalColor}
          />
          <Divider />
          <ToolBtn
            icon="alignLeft"
            active={fmt.align === "left"}
            onPress={() => applyFmt({ align: "left" })}
            activeColor={journalColor}
          />
          <ToolBtn
            icon="alignCenter"
            active={fmt.align === "center"}
            onPress={() => applyFmt({ align: "center" })}
            activeColor={journalColor}
          />
          <ToolBtn
            icon="alignRight"
            active={fmt.align === "right"}
            onPress={() => applyFmt({ align: "right" })}
            activeColor={journalColor}
          />
          <Divider />
          <ToolBtn
            icon="mood"
            onPress={() => {
              loadGlobalTags();
              setPicker("mood");
            }}
            hasEmotion={!!emotion}
            emotionColor={emotion?.color}
          />
          <ToolBtn
            icon="tags"
            active={tags.length > 0}
            onPress={() => {
              loadGlobalTags();
              setPicker("tags");
            }}
            activeColor={journalColor}
          />
        </ScrollView>
      </View>

      {/* Bottom sheets — Heading */}
      <BottomSheet
        visible={picker === "heading"}
        title="Heading Style"
        onClose={() => setPicker(null)}
      >
        {HEADINGS.map((h) => (
          <ModalRow
            key={h.label}
            label={h.label}
            active={fmt.heading === h.value}
            onPress={() => {
              applyFmt({ heading: h.value, fontSize: h.size });
              setPicker(null);
            }}
            accentColor={journalColor}
            extra={
              <Text
                style={{
                  color: "#555",
                  fontSize: Math.max(10, h.size * 0.7),
                  fontWeight: h.weight,
                }}
              >
                {h.label}
              </Text>
            }
          />
        ))}
      </BottomSheet>

      {/* Font Size */}
      <BottomSheet
        visible={picker === "fontSize"}
        title="Font Size"
        onClose={() => setPicker(null)}
      >
        {FONT_SIZES.map((sz) => (
          <ModalRow
            key={sz}
            label={`${sz}px`}
            active={fmt.fontSize === sz}
            onPress={() => {
              applyFmt({ fontSize: sz });
              setPicker(null);
            }}
            accentColor={journalColor}
            extra={
              <Text
                style={{ color: "#555", fontSize: Math.max(10, sz * 0.65) }}
              >
                Preview
              </Text>
            }
          />
        ))}
      </BottomSheet>

      {/* Color */}
      <BottomSheet
        visible={picker === "color"}
        title="Font Color"
        onClose={() => setPicker(null)}
      >
        <View style={s.swatchGrid}>
          {FONT_COLORS.map((c) => (
            <TouchableOpacity
              key={c.value}
              onPress={() => {
                applyFmt({ color: c.value });
                setPicker(null);
              }}
              style={[
                s.swatch,
                { backgroundColor: c.value },
                fmt.color === c.value && s.swatchActive,
                c.value === "#f0f0f0" && { borderColor: "#555" },
              ]}
            />
          ))}
        </View>
      </BottomSheet>

      {/* Highlight */}
      <BottomSheet
        visible={picker === "highlight"}
        title="Highlight"
        onClose={() => setPicker(null)}
      >
        {HIGHLIGHT_COLORS.map((h) => (
          <ModalRow
            key={h.label}
            label={h.label}
            active={fmt.highlight === h.value}
            onPress={() => {
              applyFmt({ highlight: h.value });
              setPicker(null);
            }}
            accentColor={journalColor}
            extra={
              h.value ? (
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 4,
                    backgroundColor: h.value,
                  }}
                />
              ) : null
            }
          />
        ))}
      </BottomSheet>

      {/* Mood Modal */}
      <Modal
        transparent
        visible={picker === "mood"}
        animationType="slide"
        onRequestClose={() => setPicker(null)}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => setPicker(null)}
        >
          <TouchableOpacity activeOpacity={1} style={s.moodSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>How are you feeling?</Text>
              <TouchableOpacity onPress={() => setPicker(null)}>
                <IconX color="#555" />
              </TouchableOpacity>
            </View>
            <ScrollView
              style={{ maxHeight: 520 }}
              contentContainerStyle={{ paddingBottom: 24 }}
            >
              <Text style={s.moodSectionLabel}>MOOD</Text>
              <View style={s.emotionRow}>
                {EMOTIONS.map((e) => (
                  <TouchableOpacity
                    key={e.valence}
                    onPress={() =>
                      setSelectedValence(
                        selectedValence === e.valence ? null : e.valence,
                      )
                    }
                    style={[
                      s.emotionBtn,
                      { borderColor: e.color },
                      selectedValence === e.valence && {
                        backgroundColor: e.color + "33",
                      },
                    ]}
                  >
                    <View
                      style={[s.emotionDot, { backgroundColor: e.color }]}
                    />
                    <Text
                      style={[
                        s.emotionBtnLabel,
                        {
                          color:
                            selectedValence === e.valence ? e.color : "#666",
                        },
                      ]}
                      numberOfLines={2}
                    >
                      {e.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {selectedValence !== null && (
                <View style={s.intensitySection}>
                  <Text style={s.moodSectionLabel}>INTENSITY</Text>
                  {([1, 2, 3] as const).map((i) => {
                    const def = EMOTIONS.find(
                      (e) => e.valence === selectedValence,
                    )!;
                    const isActive =
                      emotion?.valence === selectedValence &&
                      emotion?.intensity === i;
                    return (
                      <TouchableOpacity
                        key={i}
                        onPress={() => confirmEmotion(selectedValence, i)}
                        style={[
                          s.intensityRow,
                          isActive && { backgroundColor: def.color + "22" },
                        ]}
                      >
                        <View
                          style={[
                            s.intensityDot,
                            {
                              backgroundColor: def.color,
                              opacity: 0.3 + i * 0.23,
                            },
                          ]}
                        />
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              s.intensityLabel,
                              isActive && { color: def.color },
                            ]}
                          >
                            {INTENSITY_LABELS[i - 1]} — {def.words[i - 1]}
                          </Text>
                        </View>
                        {isActive && <IconCheck color={def.color} />}
                      </TouchableOpacity>
                    );
                  })}
                  {emotion?.valence === selectedValence && (
                    <TouchableOpacity
                      onPress={() => {
                        setEmotionEntry(undefined);
                        setSelectedValence(null);
                      }}
                      style={s.clearEmotion}
                    >
                      <Text style={s.clearEmotionText}>Clear mood</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              <Text style={[s.moodSectionLabel, { marginTop: 20 }]}>
                ACTIVITY
              </Text>
              <View style={s.activityGrid}>
                {ACTIVITIES.map((act) => {
                  const active = activities.includes(act.id);
                  return (
                    <TouchableOpacity
                      key={act.id}
                      onPress={() => toggleActivity(act.id)}
                      style={[
                        s.activityBtn,
                        active && {
                          backgroundColor: journalColor + "33",
                          borderColor: journalColor,
                        },
                      ]}
                    >
                      <ActivityIcon
                        id={act.id}
                        color={active ? journalColor : "#555"}
                        size={18}
                      />
                      <Text
                        style={[
                          s.activityLabel,
                          active && { color: journalColor },
                        ]}
                      >
                        {act.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <View style={[s.tagSectionHeader, { marginTop: 20 }]}>
                <Text style={s.moodSectionLabel}>TAGS</Text>
                <Text style={s.tagCounter}>
                  {tags.length}/{MAX_TAGS}
                </Text>
              </View>
              {globalTags.length > 0 ? (
                <View style={s.moodTagsGrid}>
                  {globalTags
                    .filter((t) => t && t.trim().length > 0)
                    .map((tag) => {
                      const isActive = tags.includes(tag);
                      const isDisabled = !isActive && tags.length >= MAX_TAGS;
                      return (
                        <TouchableOpacity
                          key={tag}
                          onPress={() => toggleTag(tag)}
                          disabled={isDisabled}
                          style={[
                            s.moodTagPill,
                            isActive
                              ? {
                                  backgroundColor: journalColor + "33",
                                  borderColor: journalColor,
                                }
                              : isDisabled
                                ? {
                                    backgroundColor: "#141414",
                                    borderColor: "#1e1e1e",
                                  }
                                : {
                                    backgroundColor: "#1a1a1a",
                                    borderColor: "#2a2a2a",
                                  },
                          ]}
                        >
                          <Text
                            style={[
                              s.moodTagText,
                              {
                                color: isActive
                                  ? journalColor
                                  : isDisabled
                                    ? "#333"
                                    : "#666",
                              },
                            ]}
                          >
                            #{tag}
                          </Text>
                          {isActive && <IconCheck color={journalColor} />}
                        </TouchableOpacity>
                      );
                    })}
                </View>
              ) : (
                <Text style={s.tagEmptyHint}>
                  No tags yet. Create one using the # button in the toolbar.
                </Text>
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* ── Tags Picker Modal ── */}
      <Modal
        transparent
        visible={picker === "tags"}
        animationType="slide"
        onRequestClose={() => {
          Keyboard.dismiss();
          setPicker(null);
        }}
      >
        <TouchableOpacity
          style={s.overlay}
          activeOpacity={1}
          onPress={() => {
            Keyboard.dismiss();
            setPicker(null);
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[s.sheet, { marginBottom: tagsModalKbHeight }]}
          >
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Tags</Text>
              <TouchableOpacity
                onPress={() => {
                  Keyboard.dismiss();
                  setPicker(null);
                }}
              >
                <IconX color="#555" />
              </TouchableOpacity>
            </View>

            {/* One-time fix button — only shows if there are corrupted (empty) entries */}
            {(globalTags.some((t) => !t || !t.trim()) ||
              tags.some((t) => !t || !t.trim())) && (
              <TouchableOpacity
                onPress={async () => {
                  const cleanG = globalTags.filter(
                    (t) => t && t.trim().length > 0,
                  );
                  const cleanT = tags.filter((t) => t && t.trim().length > 0);
                  setGlobalTags(cleanG);
                  tagsRef.current = cleanT;
                  setTags(cleanT);
                  await Storage.setItem(
                    STORAGE_KEYS.tags,
                    JSON.stringify(cleanG),
                  );
                }}
                style={{
                  marginHorizontal: 18,
                  marginTop: 10,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  backgroundColor: "#ef444422",
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: "#ef444455",
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{ color: "#ef4444", fontSize: 12, fontWeight: "600" }}
                >
                  🧹 Clear corrupted tags
                </Text>
              </TouchableOpacity>
            )}

            {/* Selected counter — always visible */}
            <View
              style={[
                s.tagSectionHeader,
                { marginHorizontal: 18, marginTop: 14, marginBottom: 6 },
              ]}
            >
              <Text style={s.tagCounterLabel}>Selected</Text>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <TouchableOpacity
                  onPress={() => {
                    // Nuclear clear — wipe ALL tags from storage and state
                    tagsRef.current = [];
                    setTags([]);
                    setGlobalTags([]);
                    saveGlobalTags([]);
                    triggerSave();
                  }}
                >
                  <Text style={{ color: "#333", fontSize: 11 }}>Clear all</Text>
                </TouchableOpacity>
                <Text
                  style={[
                    s.tagCounter,
                    {
                      color:
                        tags.filter((t) => t && t.trim()).length >= MAX_TAGS
                          ? "#ef4444"
                          : "#555",
                    },
                  ]}
                >
                  {tags.filter((t) => t && t.trim()).length}/{MAX_TAGS}
                </Text>
              </View>
            </View>
            {tags.filter((t) => t && t.trim()).length >= MAX_TAGS && (
              <Text
                style={[
                  s.tagEmptyHint,
                  { color: "#ef444488", marginBottom: 4 },
                ]}
              >
                Maximum reached. Remove a tag to select another.
              </Text>
            )}

            {/* All global tags — tap to select/deselect, X to delete from library */}
            <ScrollView
              style={{ maxHeight: tagsModalKbHeight > 0 ? 160 : 300 }}
              contentContainerStyle={{ paddingBottom: 8 }}
              keyboardShouldPersistTaps="handled"
            >
              {(() => {
                const validTags = globalTags.filter(
                  (t) => t != null && typeof t === "string" && /\S/.test(t),
                );
                const cleanTags = tags.filter((t) => t && /\S/.test(t));
                if (validTags.length === 0) {
                  return (
                    <Text style={[s.tagEmptyHint, { marginTop: 16 }]}>
                      No tags yet. Create a new one below.
                    </Text>
                  );
                }
                return (
                  <View>
                    {validTags.map((tag) => {
                      const isActive = cleanTags.includes(tag);
                      const isDisabled =
                        !isActive && cleanTags.length >= MAX_TAGS;
                      return (
                        <View
                          key={tag}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingHorizontal: 18,
                            paddingVertical: 3,
                          }}
                        >
                          <TouchableOpacity
                            onPress={() => toggleTag(tag)}
                            disabled={isDisabled}
                            style={{
                              flex: 1,
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              paddingHorizontal: 14,
                              paddingVertical: 12,
                              borderRadius: 12,
                              borderWidth: 1,
                              backgroundColor: isActive
                                ? journalColor + "22"
                                : isDisabled
                                  ? "#141414"
                                  : "#1a1a1a",
                              borderColor: isActive
                                ? journalColor
                                : isDisabled
                                  ? "#1e1e1e"
                                  : "#2a2a2a",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "600",
                                color: isActive
                                  ? journalColor
                                  : isDisabled
                                    ? "#333"
                                    : "#aaa",
                                flexShrink: 1,
                              }}
                              numberOfLines={1}
                            >
                              #{tag}
                            </Text>
                            {isActive && <IconCheck color={journalColor} />}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteGlobalTag(tag)}
                            hitSlop={8}
                            style={{ padding: 10, marginLeft: 2 }}
                          >
                            <IconX color="#333" />
                          </TouchableOpacity>
                        </View>
                      );
                    })}
                  </View>
                );
              })()}
            </ScrollView>

            {/* Divider + input pinned at bottom — adding saves to library ONLY, does NOT auto-select */}
            <View
              style={{
                height: 1,
                backgroundColor: "#1e1e1e",
                marginHorizontal: 18,
                marginVertical: 12,
              }}
            />
            <Text style={s.moodSectionLabel}>ADD TO LIBRARY</Text>

            {/* Toast feedback */}
            {tagToast && (
              <View
                style={{
                  marginHorizontal: 18,
                  marginBottom: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 10,
                  backgroundColor: tagToast.ok
                    ? journalColor + "22"
                    : "#ef444422",
                  borderWidth: 1,
                  borderColor: tagToast.ok ? journalColor + "55" : "#ef444455",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Text style={{ fontSize: 12 }}>{tagToast.ok ? "✓" : "!"}</Text>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: tagToast.ok ? journalColor : "#ef4444",
                  }}
                >
                  {tagToast.msg}
                </Text>
              </View>
            )}

            <View
              style={[
                s.tagInputRow,
                { marginBottom: Platform.OS === "ios" ? 16 : 12 },
              ]}
            >
              <TextInput
                style={s.tagTextInput}
                placeholder="Tag name..."
                placeholderTextColor="#444"
                value={tagInput}
                onChangeText={setTagInput}
                onSubmitEditing={() => addTagToLibrary(tagInput)}
                returnKeyType="done"
                selectionColor={journalColor}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => addTagToLibrary(tagInput)}
                style={[s.tagAddBtn, { backgroundColor: journalColor }]}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>Add</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      <ShareDevotionModal
        visible={showDevotionShareModal}
        onClose={() => setShowDevotionShareModal(false)}
        title={title}
        verseRef={verseRef}
        verseText={verseText}
        segments={segments}
        date={noteDate}
        journalColor={journalColor}
      />
      <ShareNoteModal
        visible={showNoteShareModal}
        onClose={() => setShowNoteShareModal(false)}
        title={title}
        segments={segments}
        date={noteDate}
        emotion={emotion}
        tags={tags}
        journalName={journalName}
        journalColor={journalColor}
      />
    </View>
  );
}

// ─── Reusable components ──────────────────────────────────────────────────────

function Divider() {
  return <View style={s.divider} />;
}

function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <View style={s.sheet}>
          <View style={s.sheetHandle} />
          <View style={s.sheetHeader}>
            <Text style={s.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <IconX color="#555" />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ maxHeight: 340 }}>{children}</ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function ModalRow({
  label,
  active,
  onPress,
  extra,
  accentColor,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
  extra?: React.ReactNode;
  accentColor?: string;
}) {
  const accent = accentColor ?? "#c084fc";
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[s.sheetRow, active && { backgroundColor: accent + "22" }]}
    >
      <Text style={[s.sheetRowTxt, active && { color: accent }]}>{label}</Text>
      {extra}
      {active && <IconCheck color={accent} />}
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  topBar: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    backgroundColor: "#161616",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: { alignSelf: "flex-start" },
  backInner: { flexDirection: "row", alignItems: "center", gap: 2 },
  backText: { fontSize: 16, fontWeight: "500" },
  shareBtn: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  shareBtnText: { fontSize: 13, fontWeight: "600" },
  titleInput: {
    backgroundColor: "#161616",
    color: "#f0f0f0",
    fontSize: 20,
    fontWeight: "700",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  verseCard: {
    marginHorizontal: 18,
    marginTop: 14,
    marginBottom: 4,
    backgroundColor: "#0e0e1a",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1e1e35",
  },
  verseCardRefRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  verseCardRef: {
    color: "#7c5fc4",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  verseCardText: {
    color: "#b8aaee",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
  },
  editorContent: { paddingTop: 10 },
  editorInput: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    color: "#f0f0f0",
    fontSize: 16,
    lineHeight: 26,
    minHeight: 200,
    textAlignVertical: "top",
    backgroundColor: "transparent",
  } as any,
  editorTapArea: { minHeight: 120 },
  wordCount: { color: "#2e2e2e", fontSize: 11, paddingHorizontal: 4 },
  undoBar: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    height: 36,
    gap: 2,
    backgroundColor: "#161616",
    borderTopWidth: 1,
    borderTopColor: "#1e1e1e",
  },
  undoBtn: { padding: 6, borderRadius: 6 },
  toolbarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#222",
    zIndex: 100,
    elevation: 10,
    height: 48,
    justifyContent: "center",
  },
  toolbarContent: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    alignItems: "center",
    gap: 4,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: "#282828",
    marginHorizontal: 3,
  },
  swatchGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    padding: 8,
    paddingBottom: 16,
  },
  swatch: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
    borderColor: "transparent",
  },
  swatchActive: { borderColor: "#c084fc", transform: [{ scale: 1.15 }] },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#333",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1f1f1f",
  },
  sheetTitle: { color: "#e0e0e0", fontSize: 15, fontWeight: "600" },
  sheetRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 13,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  sheetRowTxt: { color: "#bbb", fontSize: 15, flex: 1 },
  moodSheet: {
    backgroundColor: "#141414",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "85%",
  },
  moodSectionLabel: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 10,
  },
  emotionRow: { flexDirection: "row", paddingHorizontal: 14, gap: 8 },
  emotionBtn: {
    flex: 1,
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#2a2a2a",
    paddingVertical: 10,
    paddingHorizontal: 4,
    gap: 6,
  },
  emotionDot: { width: 12, height: 12, borderRadius: 6 },
  emotionBtnLabel: { fontSize: 10, fontWeight: "600", textAlign: "center" },
  intensitySection: { marginTop: 12 },
  intensityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  intensityDot: { width: 10, height: 10, borderRadius: 5 },
  intensityLabel: { color: "#bbb", fontSize: 15 },
  clearEmotion: { paddingHorizontal: 18, paddingTop: 10 },
  clearEmotionText: { color: "#555", fontSize: 13 },
  activityGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 14,
    gap: 8,
  },
  activityBtn: {
    width: "22%",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#2a2a2a",
    paddingVertical: 10,
    gap: 4,
  },
  activityLabel: { fontSize: 10, color: "#555", fontWeight: "600" },
  tagInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 18,
    gap: 8,
  },
  tagTextInput: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#f0f0f0",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 14,
  },
  tagAddBtn: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10 },
  tagPillsWrap: { marginHorizontal: 18, marginTop: 6, gap: 6 },
  moodTagsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  moodTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  moodTagPillRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  moodTagText: { fontSize: 13, fontWeight: "600" },
  tagPickerGrid: { marginHorizontal: 18, marginTop: 10 },
  tagPickerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  tagPickerPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  tagPickerText: { fontSize: 13, fontWeight: "600" },
  tagDeleteBtn: { padding: 4 },
  tagEmptyHint: {
    color: "#333",
    fontSize: 12,
    marginHorizontal: 18,
    marginTop: 8,
    lineHeight: 18,
  },
  tagPill: {
    backgroundColor: "#1e1e1e",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: "row",
    alignItems: "center",
  },
  tagPillText: { color: "#888", fontSize: 12 },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  tagSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 18,
    marginBottom: 4,
  },
  tagCounter: {
    fontSize: 11,
    fontWeight: "700",
    color: "#555",
    letterSpacing: 0.5,
  },
  tagCounterLabel: {
    fontSize: 11,
    color: "#444",
    fontWeight: "700",
    letterSpacing: 1,
  },
  // ── NEW: selected tag pills row inside Tags modal ──────────────────────────
  selectedTagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 18,
    paddingBottom: 10,
  },
  selectedTagPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  selectedTagPillText: { fontSize: 13, fontWeight: "700" },
});
