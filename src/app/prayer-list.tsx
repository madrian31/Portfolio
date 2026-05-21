import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Keyboard,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  makeId,
  Prayer,
  PRAYER_STORAGE_KEY,
  PrayerCard,
  PrayerStatus,
  StatsBar,
  STATUS_CONFIG,
} from "../components/prayer-card";
import { Storage } from "../storage";

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = PRAYER_STORAGE_KEY;

const PRAYER_ICONS = [
  "hands-praying",
  "cross",
  "heart",
  "star",
  "dove",
  "fire",
  "sun",
  "moon",
  "droplet",
  "seedling",
  "leaf",
  "hand-holding-heart",
  "shield-halved",
  "church",
  "book-bible",
  "bolt",
  "rainbow",
  "infinity",
  "peace",
  "circle-nodes",
];

const AVAILABLE_TAGS = [
  "family",
  "health",
  "career",
  "relationships",
  "finances",
  "peace",
  "guidance",
  "protection",
  "gratitude",
  "healing",
  "faith",
  "future",
];

// ─── Filter Tabs ──────────────────────────────────────────────────────────────

const FILTERS: { key: PrayerStatus | "all"; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "border-all" },
  { key: "pending", label: "Praying", icon: "hands-praying" },
  { key: "answered", label: "Answered", icon: "circle-check" },
  { key: "archived", label: "Archived", icon: "box-archive" },
];

function FilterTabs({
  active,
  prayers,
  onChange,
}: {
  active: PrayerStatus | "all";
  prayers: Prayer[];
  onChange: (f: PrayerStatus | "all") => void;
}) {
  const counts: Record<string, number> = {
    all: prayers.length,
    pending: prayers.filter((p) => p.status === "pending").length,
    answered: prayers.filter((p) => p.status === "answered").length,
    archived: prayers.filter((p) => p.status === "archived").length,
  };

  const activeColor =
    active === "all" ? "#c084fc" : STATUS_CONFIG[active as PrayerStatus].color;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={filterStyles.row}
      style={{ marginBottom: 16 }}
    >
      {FILTERS.map((f) => {
        const isActive = active === f.key;
        const color =
          f.key === "all"
            ? "#c084fc"
            : STATUS_CONFIG[f.key as PrayerStatus].color;
        return (
          <Pressable
            key={f.key}
            onPress={() => onChange(f.key)}
            style={[
              filterStyles.tab,
              isActive && {
                backgroundColor: color + "15",
                borderColor: color + "50",
              },
            ]}
          >
            <FontAwesome6
              name={f.icon}
              size={11}
              color={isActive ? color : "#444"}
            />
            <Text style={[filterStyles.tabText, isActive && { color }]}>
              {f.label}
            </Text>
            <View
              style={[
                filterStyles.badge,
                isActive && { backgroundColor: color + "25" },
                counts[f.key] === 0 && { opacity: 0 },
              ]}
            >
              <Text style={[filterStyles.badgeText, isActive && { color }]}>
                {counts[f.key] || "0"}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const filterStyles = StyleSheet.create({
  row: { gap: 8, paddingRight: 4 },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    height: 38,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    backgroundColor: "#0f0f0f",
  },
  tabText: { color: "#444", fontSize: 13, fontWeight: "600" },
  badge: {
    backgroundColor: "#1c1c1c",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 18,
    alignItems: "center",
  },
  badgeText: { color: "#555", fontSize: 10, fontWeight: "700" },
});

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function PrayerListScreen() {
  const insets = useSafeAreaInsets();

  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [filterStatus, setFilterStatus] = useState<PrayerStatus | "all">("all");

  const [formVisible, setFormVisible] = useState(false);
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formEmoji, setFormEmoji] = useState("hands-praying");
  const [formTags, setFormTags] = useState<string[]>([]);
  const [formPrivate, setFormPrivate] = useState(false);

  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<Prayer | null>(null);
  const [updateText, setUpdateText] = useState("");

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPrayer, setMenuPrayer] = useState<Prayer | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadPrayers();
    }, []),
  );

  const loadPrayers = async () => {
    try {
      const raw = await Storage.getItem(STORAGE_KEY);
      if (!raw) {
        setPrayers([]);
        return;
      }
      // Migrate: reset isPrivate to false for all existing prayers
      const parsed: Prayer[] = JSON.parse(raw);
      const migrated = parsed.map((p) =>
        p.isPrivate ? { ...p, isPrivate: false } : p,
      );
      // Save migrated data back only if anything changed
      if (migrated.some((p, i) => p.isPrivate !== parsed[i].isPrivate)) {
        await Storage.setItem(STORAGE_KEY, JSON.stringify(migrated));
      }
      setPrayers(migrated);
    } catch (err) {
      console.log("[PrayerList] load error:", err);
    }
  };

  const savePrayers = async (updated: Prayer[]) => {
    setPrayers(updated);
    await Storage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const openAddForm = () => {
    setEditingPrayer(null);
    setFormTitle("");
    setFormDesc("");
    setFormEmoji("hands-praying");
    setFormTags([]);
    setFormPrivate(true);
    setFormVisible(true);
  };

  const openEditForm = (prayer: Prayer) => {
    setEditingPrayer(prayer);
    setFormTitle(prayer.title);
    setFormDesc(prayer.description);
    setFormEmoji(prayer.emoji);
    setFormTags([...prayer.tags]);
    setFormPrivate(prayer.isPrivate);
    setFormVisible(true);
  };

  const saveForm = async () => {
    const trimTitle = formTitle.trim();
    if (!trimTitle) return;
    if (editingPrayer) {
      await savePrayers(
        prayers.map((p) =>
          p.id === editingPrayer.id
            ? {
                ...p,
                title: trimTitle,
                description: formDesc.trim(),
                emoji: formEmoji,
                tags: formTags,
                isPrivate: formPrivate,
              }
            : p,
        ),
      );
    } else {
      await savePrayers([
        {
          id: makeId(),
          title: trimTitle,
          description: formDesc.trim(),
          status: "pending",
          tags: formTags,
          emoji: formEmoji,
          isPrivate: formPrivate,
          createdAt: new Date().toISOString(),
          updates: [],
        },
        ...prayers,
      ]);
    }
    setFormVisible(false);
    Keyboard.dismiss();
  };

  const markAnswered = async (prayer: Prayer) => {
    const updated = prayers.map((p) =>
      p.id === prayer.id
        ? {
            ...p,
            status: "answered" as PrayerStatus,
            answeredAt: new Date().toISOString(),
          }
        : p,
    );
    await savePrayers(updated);
    if (selectedPrayer?.id === prayer.id)
      setSelectedPrayer({
        ...prayer,
        status: "answered",
        answeredAt: new Date().toISOString(),
      });
    setMenuVisible(false);
  };

  const archivePrayer = async (prayer: Prayer) => {
    await savePrayers(
      prayers.map((p) =>
        p.id === prayer.id ? { ...p, status: "archived" as PrayerStatus } : p,
      ),
    );
    setMenuVisible(false);
  };

  const deletePrayer = async (prayer: Prayer) => {
    await savePrayers(prayers.filter((p) => p.id !== prayer.id));
    setMenuVisible(false);
    if (detailVisible && selectedPrayer?.id === prayer.id)
      setDetailVisible(false);
  };

  const addUpdate = async () => {
    const text = updateText.trim();
    if (!text || !selectedPrayer) return;
    const updatedPrayer = {
      ...selectedPrayer,
      updates: [
        { id: makeId(), text, date: new Date().toISOString() },
        ...selectedPrayer.updates,
      ],
    };
    await savePrayers(
      prayers.map((p) => (p.id === selectedPrayer.id ? updatedPrayer : p)),
    );
    setSelectedPrayer(updatedPrayer);
    setUpdateText("");
    Keyboard.dismiss();
  };

  const filtered =
    filterStatus === "all"
      ? prayers
      : prayers.filter((p) => p.status === filterStatus);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top + 16 }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerEyebrow}>MY PRAYERS</Text>
          <Text style={styles.headerTitle}>Prayer List</Text>
        </View>
        <Pressable
          onPress={openAddForm}
          style={({ pressed }) => [
            styles.addBtn,
            pressed && { opacity: 0.8, transform: [{ scale: 0.95 }] },
          ]}
        >
          <FontAwesome6 name="plus" size={16} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </Pressable>
      </View>

      {/* ── Stats ── */}
      {prayers.length > 0 && <StatsBar prayers={prayers} />}

      {/* ── Filter Tabs ── */}
      <FilterTabs
        active={filterStatus}
        prayers={prayers}
        onChange={setFilterStatus}
      />

      {/* ── Empty State ── */}
      {filtered.length === 0 && (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconWrap}>
            <FontAwesome6
              name={
                filterStatus === "all"
                  ? "hands-praying"
                  : STATUS_CONFIG[filterStatus as PrayerStatus].faIcon
              }
              size={32}
              color="#c084fc"
            />
          </View>
          <Text style={styles.emptyTitle}>
            {filterStatus === "all"
              ? "Start your prayer journey"
              : `No ${filterStatus} prayers`}
          </Text>
          <Text style={styles.emptySub}>
            {filterStatus === "all"
              ? "Write down what's on your heart.\nGod hears every prayer."
              : "Try a different filter"}
          </Text>
          {filterStatus === "all" && (
            <Pressable
              onPress={openAddForm}
              style={({ pressed }) => [
                styles.emptyBtn,
                pressed && { opacity: 0.8 },
              ]}
            >
              <FontAwesome6 name="plus" size={13} color="#fff" />
              <Text style={styles.emptyBtnText}>Add First Prayer</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* ── Prayer List ── */}
      {filtered.map((item) => (
        <PrayerCard
          key={item.id}
          item={item}
          onPress={() => {
            setSelectedPrayer(item);
            setDetailVisible(true);
          }}
          onLongPress={() => {
            setMenuPrayer(item);
            setMenuVisible(true);
          }}
        />
      ))}

      {/* ══════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════ */}

      {/* ── Add / Edit Form ── */}
      <Modal
        visible={formVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}>
            <Pressable
              onPress={() => setFormVisible(false)}
              style={styles.modalHeaderBtn}
            >
              <Text style={styles.modalCancel}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingPrayer ? "Edit Prayer" : "New Prayer"}
            </Text>
            <Pressable onPress={saveForm} style={styles.modalHeaderBtn}>
              <Text style={[styles.modalSave, { color: "#c084fc" }]}>Save</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 20 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Icon picker */}
            <View>
              <Text style={styles.fieldLabel}>ICON</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 10 }}
              >
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {PRAYER_ICONS.map((icon) => (
                    <Pressable
                      key={icon}
                      onPress={() => setFormEmoji(icon)}
                      style={[
                        styles.emojiBtn,
                        formEmoji === icon && {
                          borderColor: "#c084fc",
                          backgroundColor: "#c084fc18",
                        },
                      ]}
                    >
                      <FontAwesome6
                        name={icon}
                        size={20}
                        color={formEmoji === icon ? "#c084fc" : "#555"}
                      />
                    </Pressable>
                  ))}
                </View>
              </ScrollView>
            </View>

            {/* Title */}
            <View>
              <Text style={styles.fieldLabel}>PRAYER</Text>
              <TextInput
                style={styles.textInput}
                value={formTitle}
                onChangeText={setFormTitle}
                placeholder="What are you lifting up to God?"
                placeholderTextColor="#333"
                selectionColor="#c084fc"
                autoFocus={!editingPrayer}
                maxLength={80}
              />
            </View>

            {/* Description */}
            <View>
              <Text style={styles.fieldLabel}>DETAILS (optional)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formDesc}
                onChangeText={setFormDesc}
                placeholder="Share more of your heart..."
                placeholderTextColor="#333"
                selectionColor="#c084fc"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            </View>

            {/* Tags */}
            <View>
              <Text style={styles.fieldLabel}>TAGS</Text>
              <View style={styles.tagGrid}>
                {AVAILABLE_TAGS.map((tag) => {
                  const active = formTags.includes(tag);
                  return (
                    <Pressable
                      key={tag}
                      onPress={() =>
                        setFormTags(
                          active
                            ? formTags.filter((t) => t !== tag)
                            : [...formTags, tag],
                        )
                      }
                      style={[styles.tagPill, active && styles.tagPillActive]}
                    >
                      <Text
                        style={[
                          styles.tagPillText,
                          active && styles.tagPillTextActive,
                        ]}
                      >
                        {tag}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setDetailVisible(false)}
      >
        {selectedPrayer &&
          (() => {
            const cfg = STATUS_CONFIG[selectedPrayer.status];
            return (
              <View style={styles.modalContainer}>
                <View
                  style={[styles.modalHeader, { paddingTop: insets.top + 8 }]}
                >
                  <Pressable
                    onPress={() => setDetailVisible(false)}
                    style={styles.modalHeaderBtn}
                  >
                    <Text style={styles.modalCancel}>Close</Text>
                  </Pressable>
                  <Text style={styles.modalTitle}>Prayer</Text>
                  <Pressable
                    onPress={() => {
                      openEditForm(selectedPrayer);
                      setDetailVisible(false);
                    }}
                    style={styles.modalHeaderBtn}
                  >
                    <Text style={[styles.modalSave, { color: "#c084fc" }]}>
                      Edit
                    </Text>
                  </Pressable>
                </View>

                <ScrollView
                  contentContainerStyle={{ padding: 20 }}
                  keyboardShouldPersistTaps="handled"
                >
                  {/* Head */}
                  <View
                    style={[
                      styles.detailHead,
                      selectedPrayer.status === "answered" &&
                        styles.detailHeadAnswered,
                    ]}
                  >
                    <View
                      style={[
                        styles.detailIconWrap,
                        { backgroundColor: cfg.bg },
                      ]}
                    >
                      <FontAwesome6
                        name={selectedPrayer.emoji || "hands-praying"}
                        size={34}
                        color={cfg.color}
                      />
                    </View>
                    <Text style={styles.detailTitle}>
                      {selectedPrayer.title}
                    </Text>

                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: cfg.bg,
                          borderColor: cfg.color + "40",
                        },
                      ]}
                    >
                      <FontAwesome6
                        name={cfg.faIcon}
                        size={12}
                        color={cfg.color}
                      />
                      <Text
                        style={[styles.statusBadgeText, { color: cfg.color }]}
                      >
                        {cfg.label}
                      </Text>
                    </View>

                    {selectedPrayer.description ? (
                      <Text style={styles.detailDesc}>
                        {selectedPrayer.description}
                      </Text>
                    ) : null}

                    {selectedPrayer.tags.length > 0 && (
                      <View style={styles.detailTags}>
                        {selectedPrayer.tags.map((t) => (
                          <View key={t} style={styles.tagChip}>
                            <Text style={styles.tagChipText}>{t}</Text>
                          </View>
                        ))}
                      </View>
                    )}

                    <Text style={styles.detailDate}>
                      Started{" "}
                      {new Date(selectedPrayer.createdAt).toLocaleDateString(
                        "default",
                        { month: "long", day: "numeric", year: "numeric" },
                      )}
                    </Text>
                    {selectedPrayer.answeredAt && (
                      <View style={styles.answeredDateRow}>
                        <FontAwesome6
                          name="circle-check"
                          size={12}
                          color="#4ade80"
                        />
                        <Text style={styles.answeredDateText}>
                          Answered{" "}
                          {new Date(
                            selectedPrayer.answeredAt,
                          ).toLocaleDateString("default", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Mark answered */}
                  {selectedPrayer.status === "pending" && (
                    <Pressable
                      onPress={() => markAnswered(selectedPrayer)}
                      style={({ pressed }) => [
                        styles.answeredBtn,
                        pressed && { opacity: 0.8 },
                      ]}
                    >
                      <FontAwesome6
                        name="circle-check"
                        size={16}
                        color="#4ade80"
                      />
                      <Text style={styles.answeredBtnText}>
                        Mark as Answered
                      </Text>
                    </Pressable>
                  )}

                  {/* Updates */}
                  <View style={styles.updateSection}>
                    <Text style={styles.fieldLabel}>PRAYER JOURNAL</Text>
                    <View style={styles.updateInputRow}>
                      <TextInput
                        style={styles.updateInput}
                        value={updateText}
                        onChangeText={setUpdateText}
                        placeholder="Record what God is doing..."
                        placeholderTextColor="#333"
                        selectionColor="#c084fc"
                        multiline
                      />
                      <Pressable
                        onPress={addUpdate}
                        style={({ pressed }) => [
                          styles.updateSendBtn,
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <FontAwesome6
                          name="paper-plane"
                          size={14}
                          color="#fff"
                        />
                      </Pressable>
                    </View>

                    {selectedPrayer.updates.length === 0 ? (
                      <Text style={styles.noUpdates}>
                        Write notes as God moves. Document your faith journey.
                      </Text>
                    ) : (
                      selectedPrayer.updates.map((u) => (
                        <View key={u.id} style={styles.updateCard}>
                          <View style={styles.updateDot} />
                          <View style={{ flex: 1 }}>
                            <Text style={styles.updateText}>{u.text}</Text>
                            <Text style={styles.updateDate}>
                              {new Date(u.date).toLocaleDateString("default", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </ScrollView>
              </View>
            );
          })()}
      </Modal>

      {/* ── Options Menu ── */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={styles.menuBox}>
              <View style={styles.menuHeader}>
                <View
                  style={[
                    styles.menuIconWrap,
                    {
                      backgroundColor: menuPrayer
                        ? STATUS_CONFIG[menuPrayer.status].bg
                        : "#1a1a1a",
                    },
                  ]}
                >
                  <FontAwesome6
                    name={menuPrayer?.emoji || "hands-praying"}
                    size={14}
                    color={
                      menuPrayer
                        ? STATUS_CONFIG[menuPrayer.status].color
                        : "#c084fc"
                    }
                  />
                </View>
                <Text style={styles.menuTitle} numberOfLines={1}>
                  {menuPrayer?.title || "Options"}
                </Text>
                <Pressable onPress={() => setMenuVisible(false)}>
                  <FontAwesome6 name="xmark" size={14} color="#555" />
                </Pressable>
              </View>

              {menuPrayer?.status === "pending" && (
                <>
                  <Pressable
                    onPress={() => menuPrayer && markAnswered(menuPrayer)}
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && { backgroundColor: "#0a110a" },
                    ]}
                  >
                    <FontAwesome6
                      name="circle-check"
                      size={16}
                      color="#4ade80"
                    />
                    <Text style={styles.menuRowText}>Mark as Answered</Text>
                  </Pressable>
                  <View style={styles.menuDivider} />
                </>
              )}

              <Pressable
                onPress={() => {
                  if (menuPrayer) {
                    openEditForm(menuPrayer);
                    setMenuVisible(false);
                  }
                }}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { backgroundColor: "#1a1a1a" },
                ]}
              >
                <FontAwesome6 name="pen-to-square" size={15} color="#aaa" />
                <Text style={styles.menuRowText}>Edit Prayer</Text>
              </Pressable>
              <View style={styles.menuDivider} />

              {menuPrayer?.status !== "archived" && (
                <>
                  <Pressable
                    onPress={() => menuPrayer && archivePrayer(menuPrayer)}
                    style={({ pressed }) => [
                      styles.menuRow,
                      pressed && { backgroundColor: "#1a1a1a" },
                    ]}
                  >
                    <FontAwesome6 name="box-archive" size={15} color="#aaa" />
                    <Text style={styles.menuRowText}>Archive</Text>
                  </Pressable>
                  <View style={styles.menuDivider} />
                </>
              )}

              <Pressable
                onPress={() => menuPrayer && deletePrayer(menuPrayer)}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { backgroundColor: "#1a1a1a" },
                ]}
              >
                <FontAwesome6 name="trash-can" size={15} color="#f87171" />
                <Text style={[styles.menuRowText, { color: "#f87171" }]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", paddingHorizontal: 20 },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerEyebrow: {
    color: "#333",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 2,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#c084fc",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  addBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Empty state
  emptyState: {
    alignItems: "center",
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  emptyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: "#c084fc12",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#c084fc20",
  },
  emptyTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    color: "#444",
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#c084fc",
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

  // Tags
  tagChip: {
    backgroundColor: "#1a1a1a",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagChipText: { color: "#555", fontSize: 11 },
  tagGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  tagPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#1c1c1c",
    backgroundColor: "#0f0f0f",
  },
  tagPillActive: { borderColor: "#c084fc", backgroundColor: "#c084fc15" },
  tagPillText: { color: "#555", fontSize: 13 },
  tagPillTextActive: { color: "#c084fc", fontWeight: "600" },

  // Modal shared
  modalContainer: { flex: 1, backgroundColor: "#111" },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  modalHeaderBtn: { width: 70, paddingVertical: 4 },
  modalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  modalCancel: { color: "#555", fontSize: 15 },
  modalSave: { fontSize: 15, fontWeight: "600", textAlign: "right" },
  fieldLabel: {
    color: "#444",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    color: "#f0f0f0",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#222",
  },
  textArea: { height: 110, paddingTop: 14 },
  emojiBtn: {
    width: 50,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#1a1a1a",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },

  // Detail modal
  detailHead: {
    alignItems: "center",
    paddingVertical: 24,
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: "#0f0f0f",
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  detailHeadAnswered: { borderColor: "#4ade8025", backgroundColor: "#0a110a" },
  detailIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  detailTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 14,
  },
  statusBadgeText: { fontSize: 13, fontWeight: "600" },
  detailDesc: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 14,
    paddingHorizontal: 20,
  },
  detailTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    justifyContent: "center",
    marginBottom: 14,
  },
  detailDate: { color: "#333", fontSize: 12 },
  answeredDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
  },
  answeredDateText: { color: "#4ade80", fontSize: 12 },

  answeredBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#4ade8015",
    borderWidth: 1,
    borderColor: "#4ade8030",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  answeredBtnText: { color: "#4ade80", fontSize: 15, fontWeight: "600" },

  updateSection: { marginBottom: 20 },
  updateInputRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
    marginBottom: 16,
  },
  updateInput: {
    flex: 1,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    color: "#f0f0f0",
    fontSize: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#222",
    maxHeight: 80,
  },
  updateSendBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "#c084fc",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
  },
  noUpdates: {
    color: "#2a2a2a",
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 20,
    lineHeight: 20,
  },
  updateCard: { flexDirection: "row", gap: 12, marginBottom: 16 },
  updateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#c084fc",
    marginTop: 6,
  },
  updateText: { color: "#bbb", fontSize: 14, lineHeight: 21 },
  updateDate: { color: "#333", fontSize: 11, marginTop: 4 },

  // Menu
  menuOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuBox: {
    backgroundColor: "#161616",
    borderRadius: 18,
    width: 280,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#242424",
  },
  menuHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1e1e1e",
  },
  menuIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  menuTitle: { color: "#888", fontSize: 13, fontWeight: "600", flex: 1 },
  menuRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 15 },
  menuRowText: { color: "#e0e0e0", fontSize: 15, fontWeight: "500" },
  menuDivider: { height: 1, backgroundColor: "#1a1a1a", marginHorizontal: 14 },
});
