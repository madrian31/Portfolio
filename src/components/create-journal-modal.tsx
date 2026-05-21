import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const ICON_SIZE = Math.min((SCREEN_WIDTH - 40 - 6 * 8) / 7, 48);

// ─── Color Palette ────────────────────────────────────────────────────────────

const COLS = 8;
const ROWS = 3;
const H_PAD = 20;
const SWATCH_GAP = 6;
const SWATCH_SIZE = Math.floor(
  (SCREEN_WIDTH - H_PAD * 2 - SWATCH_GAP * (COLS - 1)) / COLS,
);
const PAGE_WIDTH = SCREEN_WIDTH - H_PAD * 2;

// ─── Icon Map ─────────────────────────────────────────────────────────────────
type FAIconDef = { name: string; style?: "regular" | "solid" };

const ICON_MAP: Record<string, FAIconDef> = {
  // ── Devotion ──────────────────────────────────────────────────────────────
  cross: { name: "cross", style: "solid" },
  pray: { name: "hands-praying", style: "solid" },
  biblia: { name: "book-bible", style: "solid" },
  church: { name: "church", style: "solid" },
  heart: { name: "heart", style: "solid" },
  star: { name: "star", style: "solid" },
  dove: { name: "dove", style: "solid" },
  crown: { name: "crown", style: "solid" },
  scroll: { name: "scroll", style: "solid" },
  candle: { name: "fire", style: "solid" },
  shield: { name: "shield-halved", style: "solid" },
  handsheart: { name: "hand-holding-heart", style: "solid" },
  ankh: { name: "ankh", style: "solid" },
  menorah: { name: "menorah", style: "solid" },
  // ── General ───────────────────────────────────────────────────────────────
  smiley: { name: "face-smile", style: "regular" },
  journals: { name: "book", style: "solid" },
  home: { name: "house", style: "solid" },
  bed: { name: "bed", style: "solid" },
  stove: { name: "fire-burner", style: "solid" },
  books: { name: "book-open", style: "solid" },
  phone: { name: "phone", style: "solid" },
  key: { name: "key", style: "solid" },
  puzzle: { name: "puzzle-piece", style: "solid" },
  balloon: { name: "gift", style: "solid" },
  bulb: { name: "lightbulb", style: "regular" },
  flower: { name: "seedling", style: "solid" },
  notepad: { name: "pen-to-square", style: "solid" },
  clock: { name: "clock", style: "regular" },
  bell: { name: "bell", style: "solid" },
  flag: { name: "flag", style: "solid" },
  // ── Health & Fitness ──────────────────────────────────────────────────────
  dumbbell: { name: "dumbbell", style: "solid" },
  heartpulse: { name: "heart-pulse", style: "solid" },
  running: { name: "person-running", style: "solid" },
  bicycle2: { name: "bicycle", style: "solid" },
  swimming: { name: "person-swimming", style: "solid" },
  apple2: { name: "apple-whole", style: "solid" },
  salad: { name: "leaf", style: "solid" },
  pill: { name: "pills", style: "solid" },
  stethoscope: { name: "stethoscope", style: "solid" },
  bed2: { name: "bed-pulse", style: "solid" },
  brain: { name: "brain", style: "solid" },
  spa: { name: "spa", style: "solid" },
  // ── Work & Study ──────────────────────────────────────────────────────────
  briefcase: { name: "briefcase", style: "solid" },
  laptop: { name: "laptop", style: "solid" },
  chart: { name: "chart-line", style: "solid" },
  graduation: { name: "graduation-cap", style: "solid" },
  pencil: { name: "pencil", style: "solid" },
  calculator: { name: "calculator", style: "solid" },
  microscope: { name: "microscope", style: "solid" },
  chalkboard: { name: "chalkboard-user", style: "solid" },
  clipboard: { name: "clipboard", style: "regular" },
  code: { name: "code", style: "solid" },
  // ── Travel ────────────────────────────────────────────────────────────────
  pin: { name: "location-dot", style: "solid" },
  globe: { name: "globe", style: "solid" },
  plane: { name: "plane", style: "solid" },
  car: { name: "car", style: "solid" },
  bike: { name: "bicycle", style: "solid" },
  ship: { name: "ship", style: "solid" },
  luggage: { name: "suitcase-rolling", style: "solid" },
  tent: { name: "tent", style: "solid" },
  signpost: { name: "signs-post", style: "solid" },
  camera: { name: "camera", style: "solid" },
  bus: { name: "bus", style: "solid" },
  train: { name: "train", style: "solid" },
  moto: { name: "motorcycle", style: "solid" },
  map: { name: "map", style: "regular" },
  compass: { name: "compass", style: "regular" },
  // ── Food & Drink ──────────────────────────────────────────────────────────
  fork: { name: "utensils", style: "solid" },
  spoon: { name: "spoon", style: "solid" },
  coffee: { name: "mug-hot", style: "solid" },
  drink: { name: "glass-water", style: "solid" },
  wine: { name: "wine-glass", style: "solid" },
  wok: { name: "bowl-food", style: "solid" },
  carrot: { name: "carrot", style: "solid" },
  cake: { name: "cake-candles", style: "solid" },
  popcorn: { name: "cookie", style: "solid" },
  basket: { name: "basket-shopping", style: "solid" },
  pizza: { name: "pizza-slice", style: "solid" },
  burger: { name: "burger", style: "solid" },
  icecream: { name: "ice-cream", style: "solid" },
  martini: { name: "martini-glass", style: "solid" },
  // ── Nature & Weather ──────────────────────────────────────────────────────
  mountain: { name: "mountain", style: "solid" },
  sun: { name: "sun", style: "solid" },
  snow: { name: "snowflake", style: "regular" },
  bolt: { name: "bolt", style: "solid" },
  moon: { name: "moon", style: "regular" },
  cloud: { name: "cloud-rain", style: "solid" },
  fire: { name: "fire", style: "solid" },
  rainbow: { name: "rainbow", style: "solid" },
  leaf: { name: "leaf", style: "solid" },
  tree: { name: "tree", style: "solid" },
  volcano: { name: "volcano", style: "solid" },
  wind: { name: "wind", style: "solid" },
  water: { name: "water", style: "solid" },
  seedling: { name: "seedling", style: "solid" },
  // ── Animals ───────────────────────────────────────────────────────────────
  dog: { name: "dog", style: "solid" },
  cat: { name: "cat", style: "solid" },
  bird: { name: "dove", style: "solid" },
  fish: { name: "fish", style: "solid" },
  horse: { name: "horse", style: "solid" },
  frog: { name: "frog", style: "solid" },
  spider: { name: "spider", style: "solid" },
  worm: { name: "worm", style: "solid" },
  // ── Hobbies & Arts ────────────────────────────────────────────────────────
  palette: { name: "palette", style: "solid" },
  music: { name: "music", style: "solid" },
  guitar: { name: "guitar", style: "solid" },
  film: { name: "film", style: "solid" },
  gamepad: { name: "gamepad", style: "solid" },
  chess: { name: "chess", style: "solid" },
  dice: { name: "dice", style: "solid" },
  book2: { name: "book-bookmark", style: "solid" },
  theater: { name: "masks-theater", style: "solid" },
  microphone: { name: "microphone", style: "solid" },
  headphones: { name: "headphones", style: "solid" },
  trophy: { name: "trophy", style: "solid" },
  // ── Finance ───────────────────────────────────────────────────────────────
  money: { name: "money-bill-wave", style: "solid" },
  coins: { name: "coins", style: "solid" },
  piggy: { name: "piggy-bank", style: "solid" },
  wallet: { name: "wallet", style: "solid" },
  creditcard: { name: "credit-card", style: "regular" },
  chartbar: { name: "chart-bar", style: "solid" },
  building: { name: "building-columns", style: "solid" },
  handmoney: { name: "hand-holding-dollar", style: "solid" },
  // ── Family & People ───────────────────────────────────────────────────────
  person: { name: "user", style: "solid" },
  couple: { name: "user-group", style: "solid" },
  handshake: { name: "handshake", style: "regular" },
  pregnant: { name: "person-pregnant", style: "solid" },
  family: { name: "people-group", style: "solid" },
  elder: { name: "person-cane", style: "solid" },
  wheelchair: { name: "wheelchair-move", style: "solid" },
  baby: { name: "baby", style: "solid" },
  clap: { name: "hands-clapping", style: "solid" },
  thumbup: { name: "thumbs-up", style: "regular" },
};

// 8 cols × 3 rows = 24 per page — 5 pages = 120 colors
const PAGES_CONFIG: { label: string; icon: FAIconDef; colors: string[] }[] = [
  {
    label: "Reds & Pinks",
    icon: { name: "heart", style: "solid" },
    colors: [
      "#ff1744",
      "#e03535",
      "#f06060",
      "#e8556a",
      "#c62828",
      "#b71c1c",
      "#ff5252",
      "#ff8a80",
      "#e03580",
      "#c42c6e",
      "#f07090",
      "#f44b6e",
      "#ad1457",
      "#880e4f",
      "#f48fb1",
      "#f8bbd0",
      "#e91e63",
      "#f06292",
      "#ec407a",
      "#ff4081",
      "#ff80ab",
      "#ff79b0",
      "#fce4ec",
      "#ff1a75",
    ],
  },
  {
    label: "Oranges & Yellows",
    icon: { name: "sun", style: "solid" },
    colors: [
      "#ff6d00",
      "#f0904a",
      "#e87830",
      "#ff7043",
      "#e64a19",
      "#bf360c",
      "#ff9e80",
      "#ffccbc",
      "#ff8f00",
      "#f5b042",
      "#ffb300",
      "#ffa000",
      "#e65100",
      "#ff6f00",
      "#ffe082",
      "#ffecb3",
      "#ffd740",
      "#ffc400",
      "#ffab00",
      "#e8c030",
      "#d4a820",
      "#f0c870",
      "#fff9c4",
      "#ffee58",
    ],
  },
  {
    label: "Greens & Teals",
    icon: { name: "seedling", style: "solid" },
    colors: [
      "#00c853",
      "#2ecc71",
      "#00c896",
      "#43a047",
      "#2e7d32",
      "#1b5e20",
      "#69f0ae",
      "#b9f6ca",
      "#00bfa5",
      "#00897b",
      "#00695c",
      "#004d40",
      "#1de9b6",
      "#64ffda",
      "#a7ffeb",
      "#e0f2f1",
      "#48d18a",
      "#3ab87a",
      "#00e676",
      "#66bb6a",
      "#81c784",
      "#a5d6a7",
      "#c8e6c9",
      "#f1f8e9",
    ],
  },
  {
    label: "Blues & Cyans",
    icon: { name: "water", style: "solid" },
    colors: [
      "#2979ff",
      "#3b5fe0",
      "#1565c0",
      "#0d47a1",
      "#1a237e",
      "#4a90d4",
      "#5b7ff0",
      "#82b1ff",
      "#00bcd4",
      "#38b8e8",
      "#0097a7",
      "#006064",
      "#00e5ff",
      "#40c4ff",
      "#80d8ff",
      "#e1f5fe",
      "#26c6da",
      "#4dd0e1",
      "#80deea",
      "#b2ebf2",
      "#90caf9",
      "#42a5f5",
      "#1e88e5",
      "#0288d1",
    ],
  },
  {
    label: "Purples & Neutrals",
    icon: { name: "palette", style: "solid" },
    colors: [
      "#7c3aed",
      "#9060d0",
      "#a855f7",
      "#c084fc",
      "#b070e8",
      "#6a1b9a",
      "#4a148c",
      "#ea80fc",
      "#e040fb",
      "#9c27b0",
      "#ce93d8",
      "#d4a0f8",
      "#f3e5f5",
      "#ab47bc",
      "#8e24aa",
      "#ba68c8",
      "#607890",
      "#546e7a",
      "#78909c",
      "#90a4ae",
      "#7a8fa0",
      "#80b0e8",
      "#c49060",
      "#8d6e63",
    ],
  },
];

const ALL_COLORS = PAGES_CONFIG.flatMap((p) => p.colors);
const PAGES = PAGES_CONFIG;

const ICON_SECTIONS: { label: string; icon: FAIconDef; ids: string[] }[] = [
  {
    label: "Devotion",
    icon: { name: "cross", style: "solid" },
    ids: [
      "cross",
      "pray",
      "biblia",
      "church",
      "heart",
      "star",
      "dove",
      "crown",
      "scroll",
      "candle",
      "shield",
      "handsheart",
      "ankh",
      "menorah",
    ],
  },
  {
    label: "General",
    icon: { name: "book", style: "solid" },
    ids: [
      "smiley",
      "journals",
      "home",
      "bed",
      "stove",
      "books",
      "phone",
      "key",
      "puzzle",
      "balloon",
      "bulb",
      "flower",
      "notepad",
      "clock",
      "bell",
      "flag",
    ],
  },
  {
    label: "Health & Fitness",
    icon: { name: "dumbbell", style: "solid" },
    ids: [
      "dumbbell",
      "heartpulse",
      "running",
      "bicycle2",
      "swimming",
      "apple2",
      "salad",
      "pill",
      "stethoscope",
      "bed2",
      "brain",
      "spa",
    ],
  },
  {
    label: "Work & Study",
    icon: { name: "briefcase", style: "solid" },
    ids: [
      "briefcase",
      "laptop",
      "chart",
      "graduation",
      "pencil",
      "calculator",
      "microscope",
      "chalkboard",
      "clipboard",
      "code",
    ],
  },
  {
    label: "Travel",
    icon: { name: "plane", style: "solid" },
    ids: [
      "pin",
      "globe",
      "plane",
      "car",
      "bike",
      "ship",
      "luggage",
      "tent",
      "signpost",
      "camera",
      "bus",
      "train",
      "moto",
      "map",
      "compass",
    ],
  },
  {
    label: "Food & Drink",
    icon: { name: "pizza-slice", style: "solid" },
    ids: [
      "fork",
      "spoon",
      "coffee",
      "drink",
      "wine",
      "wok",
      "carrot",
      "cake",
      "popcorn",
      "basket",
      "pizza",
      "burger",
      "icecream",
      "martini",
    ],
  },
  {
    label: "Nature & Weather",
    icon: { name: "sun", style: "solid" },
    ids: [
      "mountain",
      "sun",
      "snow",
      "bolt",
      "moon",
      "cloud",
      "fire",
      "rainbow",
      "leaf",
      "tree",
      "volcano",
      "wind",
      "water",
      "seedling",
    ],
  },
  {
    label: "Animals",
    icon: { name: "paw", style: "solid" },
    ids: ["dog", "cat", "bird", "fish", "horse", "frog", "spider", "worm"],
  },
  {
    label: "Hobbies & Arts",
    icon: { name: "palette", style: "solid" },
    ids: [
      "palette",
      "music",
      "guitar",
      "film",
      "gamepad",
      "chess",
      "dice",
      "book2",
      "theater",
      "microphone",
      "headphones",
      "trophy",
    ],
  },
  {
    label: "Finance",
    icon: { name: "coins", style: "solid" },
    ids: [
      "money",
      "coins",
      "piggy",
      "wallet",
      "creditcard",
      "chartbar",
      "building",
      "handmoney",
    ],
  },
  {
    label: "Family & People",
    icon: { name: "people-group", style: "solid" },
    ids: [
      "person",
      "couple",
      "handshake",
      "pregnant",
      "family",
      "elder",
      "wheelchair",
      "baby",
      "clap",
      "thumbup",
    ],
  },
];

// ─── Section Label Component ──────────────────────────────────────────────────
function SectionLabel({
  icon,
  label,
  style: textStyle,
}: {
  icon: FAIconDef;
  label: string;
  style?: object;
}) {
  return (
    <View style={sectionLabelStyles.row}>
      <FontAwesome6
        name={icon.name}
        size={11}
        color="#555"
        iconStyle={icon.style ?? "solid"}
      />
      <Text style={[sectionLabelStyles.text, textStyle]}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

const sectionLabelStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 10,
  },
  text: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
});

// ─── Exports ──────────────────────────────────────────────────────────────────
export function JournalIcon({
  iconId,
  color = "#888",
  size = 22,
}: {
  iconId: string;
  color?: string;
  size?: number;
}) {
  const def = ICON_MAP[iconId];
  if (!def) return null;
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <FontAwesome6
        name={def.name}
        size={size * 0.8}
        color={color}
        iconStyle={def.style ?? "solid"}
      />
    </View>
  );
}

// ─── Journal Cover Preview ────────────────────────────────────────────────────
function JournalCoverPreview({
  color,
  iconId,
}: {
  color: string;
  iconId: string;
}) {
  const def = ICON_MAP[iconId];
  return (
    <View style={[previewStyles.wrapper, { backgroundColor: color + "22" }]}>
      {def ? (
        <FontAwesome6
          name={def.name}
          size={36}
          color={color}
          iconStyle={def.style ?? "solid"}
        />
      ) : (
        <FontAwesome6 name="book" size={36} color={color} />
      )}
    </View>
  );
}

const previewStyles = StyleSheet.create({
  wrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Color Picker — Paged Grid ────────────────────────────────────────────────
function ColorPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (c: string) => void;
}) {
  const [pageIndex, setPageIndex] = useState(() => {
    const p = PAGES.findIndex((pg) => pg.colors.includes(selected));
    return p >= 0 ? p : 0;
  });
  const scrollRef = useRef<ScrollView>(null);

  const goToPage = (i: number) => {
    scrollRef.current?.scrollTo({ x: i * PAGE_WIDTH, animated: true });
    setPageIndex(i);
  };

  return (
    <View style={cpStyles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        contentOffset={{ x: pageIndex * PAGE_WIDTH, y: 0 }}
        onScroll={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
          if (idx !== pageIndex) setPageIndex(idx);
        }}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / PAGE_WIDTH);
          setPageIndex(idx);
        }}
      >
        {PAGES.map((page, pi) => {
          const rows: string[][] = [];
          for (let i = 0; i < page.colors.length; i += COLS) {
            rows.push(page.colors.slice(i, i + COLS));
          }
          return (
            <View key={pi} style={{ width: PAGE_WIDTH }}>
              <SectionLabel icon={page.icon} label={page.label} />
              {rows.map((row, ri) => (
                <View key={ri} style={cpStyles.row}>
                  {row.map((c) => {
                    const isSelected = selected === c;
                    return (
                      <Pressable key={c} onPress={() => onSelect(c)}>
                        <View
                          style={[
                            cpStyles.swatch,
                            {
                              backgroundColor: c,
                              width: SWATCH_SIZE,
                              height: SWATCH_SIZE,
                              borderRadius: SWATCH_SIZE / 2,
                            },
                            isSelected && cpStyles.swatchSelected,
                          ]}
                        >
                          {isSelected && (
                            <FontAwesome6 name="check" size={11} color="#fff" />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>

      {/* Page dots */}
      <View style={cpStyles.dots}>
        {PAGES.map((_, i) => (
          <Pressable key={i} onPress={() => goToPage(i)} hitSlop={8}>
            <View
              style={[cpStyles.dot, i === pageIndex && cpStyles.dotActive]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const cpStyles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  row: { flexDirection: "row", gap: SWATCH_GAP, marginBottom: SWATCH_GAP },
  swatch: { alignItems: "center", justifyContent: "center" },
  swatchSelected: {
    borderWidth: 2.5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginTop: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#2a2a2a" },
  dotActive: { backgroundColor: "#c084fc", width: 18 },
});

// ─── Main Component ───────────────────────────────────────────────────────────
type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: { name: string; color: string; iconId: string }) => void;
  initialName?: string;
  initialColor?: string;
  initialIconId?: string;
};

export default function CreateJournalModal({
  visible,
  onClose,
  onSave,
  initialName = "",
  initialColor = "#4a90d4",
  initialIconId = "journals",
}: Props) {
  const [name, setName] = useState(initialName);
  const [selectedColor, setSelectedColor] = useState(initialColor);
  const [selectedIconId, setSelectedIconId] = useState(initialIconId);

  useEffect(() => {
    if (visible) {
      setName(initialName);
      setSelectedColor(initialColor);
      setSelectedIconId(initialIconId);
    }
  }, [visible]);

  const handleSave = () =>
    onSave({ name, color: selectedColor, iconId: selectedIconId });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={onClose} style={styles.topBtn} hitSlop={16}>
            <FontAwesome6 name="xmark" size={14} color="#888" />
          </Pressable>
          <Pressable
            onPress={handleSave}
            style={styles.topBtnRight}
            hitSlop={16}
          >
            <FontAwesome6 name="check" size={14} color="#c084fc" />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Cover preview */}
          <View style={styles.previewRow}>
            <JournalCoverPreview
              color={selectedColor}
              iconId={selectedIconId}
            />
          </View>

          {/* Name input */}
          <TextInput
            style={styles.nameInput}
            placeholder="Journal Name"
            placeholderTextColor="#444"
            value={name}
            onChangeText={setName}
          />

          {/* Color picker */}
          <ColorPicker selected={selectedColor} onSelect={setSelectedColor} />

          {/* Icon sections */}
          {ICON_SECTIONS.map((section) => (
            <View key={section.label} style={styles.iconSection}>
              <SectionLabel icon={section.icon} label={section.label} />
              <View style={styles.iconGrid}>
                {section.ids.map((id) => {
                  const def = ICON_MAP[id];
                  if (!def) return null;
                  const isSelected = selectedIconId === id;
                  return (
                    <Pressable
                      key={id}
                      onPress={() => setSelectedIconId(id)}
                      style={[
                        styles.iconBtn,
                        {
                          width: ICON_SIZE,
                          height: ICON_SIZE,
                          borderRadius: ICON_SIZE / 2,
                          backgroundColor: isSelected
                            ? selectedColor + "20"
                            : "#1e1e1e",
                          borderWidth: isSelected ? 2 : 0,
                          borderColor: isSelected
                            ? selectedColor
                            : "transparent",
                        },
                      ]}
                    >
                      <FontAwesome6
                        name={def.name}
                        size={20}
                        color={isSelected ? selectedColor : "#555"}
                        iconStyle={def.style ?? "solid"}
                      />
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f0f0f" },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#1e1e1e",
    borderWidth: 1,
    borderColor: "#2a2a2a",
    alignItems: "center",
    justifyContent: "center",
  },
  topBtnRight: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#c084fc22",
    borderWidth: 1,
    borderColor: "#c084fc55",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 60 },
  previewRow: { alignItems: "center", marginTop: 8, marginBottom: 24 },
  nameInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 14,
    height: 50,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#f0f0f0",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#2a2a2a",
  },
  iconSection: { marginBottom: 20 },
  iconGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  iconBtn: { alignItems: "center", justifyContent: "center" },
});
