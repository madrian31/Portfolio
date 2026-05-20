import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
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

  const groupedNotes = groupByMonth(notes);
  const monthKeys = Object.keys(groupedNotes);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 16 }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <FontAwesome6 name="chevron-left" size={18} color={journalColor} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {journalName}
        </Text>
        <Pressable
          onPress={() => goToNoteForm()}
          style={styles.addBtn}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <FontAwesome6 name="plus" size={18} color={journalColor} />
        </Pressable>
      </View>

      {/* Empty state */}
      {notes.length === 0 && (
        <View style={styles.emptyState}>
          <FontAwesome6 name="pen" size={36} color="#333" />
          <Text style={styles.emptyText}>No entries yet</Text>
          <Text style={styles.emptySubtext}>
            Tap + to write your first entry
          </Text>
        </View>
      )}

      {/* Notes list grouped by month */}
      <FlatList
        data={monthKeys}
        keyExtractor={(item) => item}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item: month }) => (
          <View>
            <Text style={styles.monthLabel}>{month}</Text>
            {groupedNotes[month].map((noteItem) => (
              <Pressable
                key={noteItem.id}
                style={({ pressed }) => [
                  styles.noteCard,
                  pressed && styles.noteCardPressed,
                ]}
                onPress={() => goToNoteForm(noteItem.id)}
              >
                {/* Left accent bar */}
                <View
                  style={[styles.noteAccent, { backgroundColor: journalColor }]}
                />

                {/* Main content */}
                <View style={styles.noteBody}>
                  {/* Title row + emotion dot */}
                  <View style={styles.titleRow}>
                    <Text style={styles.noteTitle} numberOfLines={1}>
                      {noteItem.title || "Untitled"}
                    </Text>
                    {noteItem.emotion && (
                      <View
                        style={[
                          styles.emotionDot,
                          { backgroundColor: noteItem.emotion.color },
                        ]}
                      />
                    )}
                  </View>

                  {/* Preview text */}
                  <Text style={styles.notePreview} numberOfLines={1}>
                    {noteItem.text}
                  </Text>

                  {/* Tags + date row */}
                  <View style={styles.metaRow}>
                    <Text style={styles.noteDate}>
                      {new Date(noteItem.date).toLocaleDateString("default", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    {noteItem.tags && noteItem.tags.length > 0 && (
                      <View style={styles.tagsRow}>
                        {noteItem.tags.slice(0, 3).map((tag) => (
                          <View
                            key={tag}
                            style={[
                              styles.tagPill,
                              { backgroundColor: journalColor + "22" },
                            ]}
                          >
                            <Text
                              style={[styles.tagText, { color: journalColor }]}
                            >
                              #{tag}
                            </Text>
                          </View>
                        ))}
                        {noteItem.tags.length > 3 && (
                          <Text style={styles.tagOverflow}>
                            +{noteItem.tags.length - 3}
                          </Text>
                        )}
                      </View>
                    )}
                  </View>

                  {/* Emotion label */}
                  {noteItem.emotion && (
                    <View style={styles.emotionRow}>
                      <View
                        style={[
                          styles.emotionPill,
                          { backgroundColor: noteItem.emotion.color + "22" },
                        ]}
                      >
                        <View
                          style={[
                            styles.emotionPillDot,
                            { backgroundColor: noteItem.emotion.color },
                          ]}
                        />
                        <Text
                          style={[
                            styles.emotionLabel,
                            { color: noteItem.emotion.color },
                          ]}
                        >
                          {noteItem.emotion.label}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                {/* More button */}
                <Pressable
                  onPress={() => {
                    setSelectedNote(noteItem);
                    setMenuVisible(true);
                  }}
                  style={styles.moreBtn}
                  hitSlop={8}
                >
                  <FontAwesome6
                    name="ellipsis-vertical"
                    size={16}
                    color="#444"
                  />
                </Pressable>
              </Pressable>
            ))}
          </View>
        )}
      />

      {/* Options modal */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuBox}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle} numberOfLines={1}>
                  {selectedNote?.title || "Options"}
                </Text>
                <Pressable
                  onPress={() => setMenuVisible(false)}
                  style={styles.menuClose}
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
                  styles.menuRow,
                  pressed && { backgroundColor: "#1a1a1a" },
                ]}
              >
                <FontAwesome6 name="pen-to-square" size={16} color="#e0e0e0" />
                <Text style={styles.menuRowText}>Edit</Text>
              </Pressable>

              <View style={styles.menuDivider} />

              <Pressable
                onPress={() => {
                  if (selectedNote) handleDelete(selectedNote.id);
                  setMenuVisible(false);
                }}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { backgroundColor: "#1a1a1a" },
                ]}
              >
                <FontAwesome6 name="trash-can" size={16} color="#f87171" />
                <Text style={[styles.menuRowText, { color: "#f87171" }]}>
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

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  backBtn: { padding: 4, width: 36 },
  headerTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
  addBtn: { width: 36, alignItems: "flex-end", padding: 4 },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 120,
    gap: 8,
  },
  emptyText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },
  emptySubtext: { color: "#444", fontSize: 13 },
  monthLabel: {
    color: "#555",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    textTransform: "uppercase",
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  noteCard: {
    backgroundColor: "#111",
    borderRadius: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "stretch",
    borderWidth: 1,
    borderColor: "#1e1e1e",
    overflow: "hidden",
  },
  noteCardPressed: { opacity: 0.7 },
  noteAccent: { width: 4 },
  noteBody: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },
  noteTitle: {
    color: "#f0f0f0",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  emotionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  notePreview: { color: "#555", fontSize: 13, marginBottom: 6 },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  noteDate: { color: "#3a3a3a", fontSize: 11, fontWeight: "500" },
  tagsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  tagPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  tagText: { fontSize: 10, fontWeight: "600" },
  tagOverflow: { color: "#444", fontSize: 10 },
  emotionRow: { marginTop: 6 },
  emotionPill: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  emotionPillDot: { width: 6, height: 6, borderRadius: 3 },
  emotionLabel: { fontSize: 11, fontWeight: "600" },
  moreBtn: { paddingRight: 14, paddingVertical: 16, justifyContent: "center" },
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
