import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Storage, STORAGE_KEYS } from "../storage";

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
  date: string;
  emotion?: EmotionEntry;
  tags?: string[];
};

function asString(val: string | string[] | undefined, fallback = ""): string {
  if (!val) return fallback;
  return Array.isArray(val) ? val[0] : val;
}

// ─── Relative date helper ─────────────────────────────────────────────────────
function relativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("default", { month: "short", day: "numeric" });
}

function fullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("default", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

// ─── Filter types ─────────────────────────────────────────────────────────────
type FilterType = "all" | "mood" | "tag";

export default function NoteList() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const journalId = asString(params.journalId);
  const journalName = asString(params.journalName, "Journal");
  const rawColor = asString(params.journalColor, "#c084fc");
  const journalColor = rawColor.startsWith("#") ? rawColor : "#c084fc";

  const storageKey = STORAGE_KEYS.notes(journalId);

  const [notes, setNotes] = useState<Note[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  // ── Search & filter state ──────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [filterValue, setFilterValue] = useState<string>("");
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (!journalId) return;
      const timer = setTimeout(() => loadNotes(), 100);
      return () => clearTimeout(timer);
    }, [journalId]),
  );

  const loadNotes = async () => {
    try {
      const stored = await Storage.getItem(storageKey);
      setNotes(stored ? JSON.parse(stored) : []);
    } catch (err) {
      console.log("Load error:", err);
    }
  };

  const handleDelete = async (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    await Storage.setItem(storageKey, JSON.stringify(updated));
  };

  const goToNoteForm = (noteId?: string) => {
    router.push({
      pathname: "/note-form",
      params: {
        journalId,
        journalColor,
        journalName,
        ...(noteId ? { id: noteId } : { newKey: Date.now().toString() }),
      },
    } as any);
  };

  // ── Collect all unique tags from notes ────────────────────────────────────
  const allTags = Array.from(
    new Set(notes.flatMap((n) => n.tags ?? [])),
  ).sort();

  // ── Filter + search logic ─────────────────────────────────────────────────
  const filteredNotes = notes.filter((note) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = note.title?.toLowerCase().includes(q);
      const inText = note.text?.toLowerCase().includes(q);
      const inTags = note.tags?.some((t) => t.toLowerCase().includes(q));
      if (!inTitle && !inText && !inTags) return false;
    }
    // Filter
    if (filterType === "mood" && filterValue) {
      if (note.emotion?.label !== filterValue) return false;
    }
    if (filterType === "tag" && filterValue) {
      if (!note.tags?.includes(filterValue)) return false;
    }
    return true;
  });

  const isFiltered = filterType !== "all" && !!filterValue;
  const activeFilterLabel =
    filterType === "mood"
      ? filterValue
      : filterType === "tag"
        ? `#${filterValue}`
        : "";

  // ── Group by month ────────────────────────────────────────────────────────
  const groupByMonth = (data: Note[]) =>
    data.reduce((acc: Record<string, Note[]>, item) => {
      const month = new Date(item.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(item);
      return acc;
    }, {});

  const groupedNotes = groupByMonth(filteredNotes);
  const monthKeys = Object.keys(groupedNotes);

  // ── All unique moods from notes ───────────────────────────────────────────
  const allMoods = Array.from(
    new Set(notes.filter((n) => n.emotion).map((n) => n.emotion!.label)),
  );

  const moodColorMap: Record<string, string> = {};
  notes.forEach((n) => {
    if (n.emotion) moodColorMap[n.emotion.label] = n.emotion.color;
  });

  return (
    <View style={[s.container, { paddingTop: insets.top + 12 }]}>
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <View style={s.header}>
        <Pressable onPress={() => router.back()} style={s.headerIconBtn}>
          <FontAwesome6 name="chevron-left" size={16} color={journalColor} />
        </Pressable>
        <View style={s.headerCenter}>
          <Text style={s.headerTitle} numberOfLines={1}>
            {journalName}
          </Text>
          {notes.length > 0 && (
            <Text style={s.headerCount}>
              {notes.length} {notes.length === 1 ? "entry" : "entries"}
            </Text>
          )}
        </View>
        <Pressable
          onPress={() => goToNoteForm()}
          style={s.headerIconBtn}
          hitSlop={12}
        >
          <View style={[s.addBtnCircle, { backgroundColor: journalColor }]}>
            <FontAwesome6 name="plus" size={13} color="#fff" />
          </View>
        </Pressable>
      </View>

      {/* ── Search bar ──────────────────────────────────────────────────────── */}
      <View
        style={[
          s.searchRow,
          searchFocused && { borderColor: journalColor + "55" },
        ]}
      >
        <FontAwesome6
          name="magnifying-glass"
          size={13}
          color={searchFocused ? journalColor : "#444"}
        />
        <TextInput
          style={s.searchInput}
          placeholder="Search notes, tags..."
          placeholderTextColor="#333"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          selectionColor={journalColor}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
        {/* Filter button */}
        <Pressable
          onPress={() => setShowFilterSheet(true)}
          style={[
            s.filterBtn,
            isFiltered && { backgroundColor: journalColor + "22" },
          ]}
          hitSlop={8}
        >
          <FontAwesome6
            name="sliders"
            size={13}
            color={isFiltered ? journalColor : "#444"}
          />
          {isFiltered && (
            <View style={[s.filterDot, { backgroundColor: journalColor }]} />
          )}
        </Pressable>
      </View>

      {/* ── Active filter chip ───────────────────────────────────────────────── */}
      {isFiltered && (
        <View style={s.activeFilterRow}>
          <View
            style={[
              s.activeFilterChip,
              {
                borderColor: journalColor + "44",
                backgroundColor: journalColor + "11",
              },
            ]}
          >
            <FontAwesome6
              name={filterType === "mood" ? "face-smile" : "hashtag"}
              size={10}
              color={journalColor}
            />
            <Text style={[s.activeFilterText, { color: journalColor }]}>
              {activeFilterLabel}
            </Text>
            <Pressable
              onPress={() => {
                setFilterType("all");
                setFilterValue("");
              }}
              hitSlop={6}
            >
              <FontAwesome6 name="xmark" size={10} color={journalColor} />
            </Pressable>
          </View>
          <Text style={s.filterResultCount}>
            {filteredNotes.length}{" "}
            {filteredNotes.length === 1 ? "result" : "results"}
          </Text>
        </View>
      )}

      {/* ── Empty state ──────────────────────────────────────────────────────── */}
      {notes.length === 0 && (
        <View style={s.emptyState}>
          <View style={[s.emptyIconWrap, { borderColor: journalColor + "33" }]}>
            <FontAwesome6
              name="pen-nib"
              size={28}
              color={journalColor + "66"}
            />
          </View>
          <Text style={s.emptyTitle}>No entries yet</Text>
          <Text style={s.emptySub}>Tap + to write your first entry</Text>
          <Pressable
            onPress={() => goToNoteForm()}
            style={[s.emptyBtn, { backgroundColor: journalColor }]}
          >
            <Text style={s.emptyBtnText}>Write now</Text>
          </Pressable>
        </View>
      )}

      {/* ── Search empty state ───────────────────────────────────────────────── */}
      {notes.length > 0 && filteredNotes.length === 0 && (
        <View style={s.emptyState}>
          <FontAwesome6 name="magnifying-glass" size={28} color="#2a2a2a" />
          <Text style={s.emptyTitle}>No results found</Text>
          <Text style={s.emptySub}>Try a different search or filter</Text>
        </View>
      )}

      {/* ── Notes list ───────────────────────────────────────────────────────── */}
      <FlatList
        data={monthKeys}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: month }) => (
          <View>
            {/* Month header */}
            <View style={s.monthRow}>
              <Text style={s.monthLabel}>{month.toUpperCase()}</Text>
              <View style={s.monthLine} />
            </View>

            {groupedNotes[month].map((noteItem) => (
              <NoteCard
                key={noteItem.id}
                note={noteItem}
                journalColor={journalColor}
                onPress={() => goToNoteForm(noteItem.id)}
                onMore={() => {
                  setSelectedNote(noteItem);
                  setMenuVisible(true);
                }}
              />
            ))}
          </View>
        )}
      />

      {/* ── Filter bottom sheet ───────────────────────────────────────────────── */}
      <Modal
        transparent
        visible={showFilterSheet}
        animationType="slide"
        onRequestClose={() => setShowFilterSheet(false)}
      >
        <Pressable
          style={s.sheetOverlay}
          onPress={() => setShowFilterSheet(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()} style={s.filterSheet}>
            <View style={s.sheetHandle} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>Filter</Text>
              <Pressable onPress={() => setShowFilterSheet(false)}>
                <FontAwesome6 name="xmark" size={16} color="#555" />
              </Pressable>
            </View>

            {/* All */}
            <Pressable
              onPress={() => {
                setFilterType("all");
                setFilterValue("");
                setShowFilterSheet(false);
              }}
              style={[
                s.filterRow,
                filterType === "all" && {
                  backgroundColor: journalColor + "11",
                },
              ]}
            >
              <View style={[s.filterRowIcon, { backgroundColor: "#1e1e1e" }]}>
                <FontAwesome6 name="border-all" size={12} color="#666" />
              </View>
              <Text
                style={[
                  s.filterRowLabel,
                  filterType === "all" && { color: journalColor },
                ]}
              >
                All entries
              </Text>
              {filterType === "all" && (
                <FontAwesome6 name="check" size={12} color={journalColor} />
              )}
            </Pressable>

            {/* By mood */}
            {allMoods.length > 0 && (
              <>
                <Text style={s.filterSectionLabel}>BY MOOD</Text>
                {allMoods.map((mood) => {
                  const color = moodColorMap[mood] ?? "#888";
                  const isActive =
                    filterType === "mood" && filterValue === mood;
                  return (
                    <Pressable
                      key={mood}
                      onPress={() => {
                        setFilterType("mood");
                        setFilterValue(mood);
                        setShowFilterSheet(false);
                      }}
                      style={[
                        s.filterRow,
                        isActive && { backgroundColor: color + "11" },
                      ]}
                    >
                      <View
                        style={[
                          s.filterRowIcon,
                          { backgroundColor: color + "22" },
                        ]}
                      >
                        <View
                          style={[s.filterDotLarge, { backgroundColor: color }]}
                        />
                      </View>
                      <Text style={[s.filterRowLabel, isActive && { color }]}>
                        {mood}
                      </Text>
                      {isActive && (
                        <FontAwesome6 name="check" size={12} color={color} />
                      )}
                    </Pressable>
                  );
                })}
              </>
            )}

            {/* By tag */}
            {allTags.length > 0 && (
              <>
                <Text style={s.filterSectionLabel}>BY TAG</Text>
                {allTags.map((tag) => {
                  const isActive = filterType === "tag" && filterValue === tag;
                  return (
                    <Pressable
                      key={tag}
                      onPress={() => {
                        setFilterType("tag");
                        setFilterValue(tag);
                        setShowFilterSheet(false);
                      }}
                      style={[
                        s.filterRow,
                        isActive && { backgroundColor: journalColor + "11" },
                      ]}
                    >
                      <View
                        style={[
                          s.filterRowIcon,
                          { backgroundColor: journalColor + "22" },
                        ]}
                      >
                        <FontAwesome6
                          name="hashtag"
                          size={11}
                          color={journalColor}
                        />
                      </View>
                      <Text
                        style={[
                          s.filterRowLabel,
                          isActive && { color: journalColor },
                        ]}
                      >
                        #{tag}
                      </Text>
                      {isActive && (
                        <FontAwesome6
                          name="check"
                          size={12}
                          color={journalColor}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </>
            )}

            {allMoods.length === 0 && allTags.length === 0 && (
              <Text style={s.filterEmptyHint}>
                Walang mood o tags pa sa mga notes mo.
              </Text>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ── Options modal ─────────────────────────────────────────────────────── */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={s.modalOverlay} onPress={() => setMenuVisible(false)}>
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={s.menuBox}>
              <View style={s.menuHeader}>
                <Text style={s.menuTitle} numberOfLines={1}>
                  {selectedNote?.title || "Untitled"}
                </Text>
                <Pressable
                  onPress={() => setMenuVisible(false)}
                  style={s.menuClose}
                >
                  <FontAwesome6 name="xmark" size={16} color="#555" />
                </Pressable>
              </View>
              <Pressable
                onPress={() => {
                  if (selectedNote) goToNoteForm(selectedNote.id);
                  setMenuVisible(false);
                }}
                style={({ pressed }) => [
                  s.menuRow,
                  pressed && { backgroundColor: "#1a1a1a" },
                ]}
              >
                <FontAwesome6 name="pen-to-square" size={16} color="#e0e0e0" />
                <Text style={s.menuRowText}>Edit</Text>
              </Pressable>
              <View style={s.menuDivider} />
              <Pressable
                onPress={() => {
                  if (selectedNote) handleDelete(selectedNote.id);
                  setMenuVisible(false);
                }}
                style={({ pressed }) => [
                  s.menuRow,
                  pressed && { backgroundColor: "#1a1a1a" },
                ]}
              >
                <FontAwesome6 name="trash-can" size={16} color="#f87171" />
                <Text style={[s.menuRowText, { color: "#f87171" }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

// ─── Note Card Component ──────────────────────────────────────────────────────
function NoteCard({
  note,
  journalColor,
  onPress,
  onMore,
}: {
  note: Note;
  journalColor: string;
  onPress: () => void;
  onMore: () => void;
}) {
  const hasEmotion = !!note.emotion;
  const hasTags = note.tags && note.tags.length > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [s.card, pressed && s.cardPressed]}
    >
      {/* Top accent line using journal color */}
      <View style={[s.cardAccentBar, { backgroundColor: journalColor + "33" }]}>
        <View
          style={[
            s.cardAccentFill,
            { backgroundColor: journalColor, width: "30%" },
          ]}
        />
      </View>

      <View style={s.cardInner}>
        {/* ── Title row ────────────────────────────────────────────────────── */}
        <View style={s.cardTitleRow}>
          <Text style={s.cardTitle} numberOfLines={1}>
            {note.title || "Untitled"}
          </Text>
          <View style={s.cardTitleRight}>
            {hasEmotion && (
              <View
                style={[
                  s.emotionDotSmall,
                  { backgroundColor: note.emotion!.color },
                ]}
              />
            )}
            <Pressable onPress={onMore} style={s.moreBtn} hitSlop={10}>
              <FontAwesome6 name="ellipsis" size={14} color="#3a3a3a" />
            </Pressable>
          </View>
        </View>

        {/* ── Preview text ─────────────────────────────────────────────────── */}
        {note.text ? (
          <Text style={s.cardPreview} numberOfLines={2}>
            {note.text}
          </Text>
        ) : null}

        {/* ── Footer row: date + tags + emotion ────────────────────────────── */}
        <View style={s.cardFooter}>
          {/* Date */}
          <View style={s.cardDateRow}>
            <FontAwesome6 name="clock" size={9} color="#333" />
            <Text style={s.cardDate}>{relativeDate(note.date)}</Text>
            <Text style={s.cardDateFull}>· {fullDate(note.date)}</Text>
          </View>

          {/* Tags */}
          {hasTags && (
            <View style={s.cardTagsRow}>
              {note.tags!.slice(0, 3).map((tag) => (
                <View
                  key={tag}
                  style={[s.cardTag, { backgroundColor: journalColor + "18" }]}
                >
                  <Text style={[s.cardTagText, { color: journalColor + "cc" }]}>
                    #{tag}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Emotion pill */}
          {hasEmotion && (
            <View
              style={[
                s.emotionPill,
                { backgroundColor: note.emotion!.color + "18" },
              ]}
            >
              <View
                style={[
                  s.emotionPillDot,
                  { backgroundColor: note.emotion!.color },
                ]}
              />
              <Text style={[s.emotionPillText, { color: note.emotion!.color }]}>
                {note.emotion!.label}
              </Text>
            </View>
          )}
        </View>
      </View>
    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 8,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    color: "#f0f0f0",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  headerCount: { color: "#333", fontSize: 11, marginTop: 1 },
  addBtnCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  // Search
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#141414",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: "#1e1e1e",
  },
  searchInput: {
    flex: 1,
    color: "#e0e0e0",
    fontSize: 14,
    padding: 0,
  },
  filterBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  filterDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: "#0a0a0a",
  },

  // Active filter chip
  activeFilterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginHorizontal: 16,
    marginBottom: 10,
  },
  activeFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  activeFilterText: { fontSize: 12, fontWeight: "600" },
  filterResultCount: { color: "#333", fontSize: 11 },

  // Empty states
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
    gap: 10,
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginBottom: 8,
  },
  emptyTitle: { color: "#e0e0e0", fontSize: 16, fontWeight: "600" },
  emptySub: {
    color: "#333",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  emptyBtn: {
    marginTop: 12,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 24,
  },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Month group
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  monthLabel: {
    color: "#3a3a3a",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.5,
  },
  monthLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#161616",
  },

  // Card
  card: {
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: "#111",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    overflow: "hidden",
  },
  cardPressed: { opacity: 0.6 },
  cardAccentBar: {
    height: 3,
    width: "100%",
  },
  cardAccentFill: {
    height: "100%",
    borderRadius: 2,
  },
  cardInner: {
    padding: 14,
  },
  cardTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  cardTitle: {
    color: "#f0f0f0",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
    letterSpacing: 0.1,
  },
  cardTitleRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: 8,
  },
  emotionDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  moreBtn: {
    padding: 2,
  },
  cardPreview: {
    color: "#444",
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 10,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  cardDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardDate: {
    color: "#383838",
    fontSize: 11,
    fontWeight: "600",
  },
  cardDateFull: {
    color: "#2a2a2a",
    fontSize: 11,
  },
  cardTagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardTag: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: "700",
  },
  emotionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  emotionPillDot: { width: 5, height: 5, borderRadius: 3 },
  emotionPillText: { fontSize: 10, fontWeight: "700" },

  // Filter sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  filterSheet: {
    backgroundColor: "#111",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: "70%",
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#2a2a2a",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  sheetTitle: { color: "#e0e0e0", fontSize: 15, fontWeight: "700" },
  filterSectionLabel: {
    color: "#333",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginHorizontal: 18,
    marginTop: 16,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 8,
  },
  filterRowIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  filterRowLabel: { flex: 1, color: "#888", fontSize: 14, fontWeight: "500" },
  filterDotLarge: { width: 10, height: 10, borderRadius: 5 },
  filterEmptyHint: {
    color: "#333",
    fontSize: 12,
    marginHorizontal: 18,
    marginTop: 16,
    lineHeight: 18,
  },

  // Options modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuBox: {
    backgroundColor: "#161616",
    borderRadius: 16,
    width: 260,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#242424",
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  menuTitle: { color: "#888", fontSize: 13, flex: 1, marginRight: 8 },
  menuClose: { padding: 2 },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 14,
  },
  menuRowText: { color: "#e0e0e0", fontSize: 15, fontWeight: "500" },
  menuDivider: { height: 1, backgroundColor: "#1e1e1e", marginHorizontal: 14 },
});
