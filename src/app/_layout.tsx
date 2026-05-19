import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Tabs } from "expo-router";

export default function RootLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#111",
          borderTopColor: "#1e1e1e",
        },
        tabBarActiveTintColor: "#c084fc",
        tabBarInactiveTintColor: "#444",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Journals",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="book-open" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="calendar-days" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: "Insights",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome6 name="chart-simple" size={size} color={color} />
          ),
        }}
      />

      {/* Hidden sa footer */}
      <Tabs.Screen name="explore" options={{ href: null }} />
      <Tabs.Screen name="note-form" options={{ href: null }} />
      <Tabs.Screen name="note-list" options={{ href: null }} />
      <Tabs.Screen name="prayer-list" options={{ href: null }} />
      <Tabs.Screen name="bible-reader" options={{ href: null }} />
    </Tabs>
  );
}
