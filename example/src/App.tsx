import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import {
  activateKeepAwake,
  deactivateKeepAwake,
  getActiveKeepAwakeTags,
  isKeepAwakeActive,
  useKeepAwake,
} from 'react-native-stay-awake';

function VideoPlayerScreen() {
  // Keeps the screen awake only while this component is mounted.
  useKeepAwake();
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🎬 “Video player” mounted</Text>
      <Text style={styles.cardBody}>
        This component holds its own keep-awake tag via useKeepAwake().
      </Text>
    </View>
  );
}

export default function App() {
  const [manualOn, setManualOn] = useState(false);
  const [playerMounted, setPlayerMounted] = useState(false);
  const [, forceRender] = useState(0);

  useEffect(() => {
    if (manualOn) {
      activateKeepAwake('manual-toggle');
    } else {
      deactivateKeepAwake('manual-toggle');
    }
    forceRender((n) => n + 1);
  }, [manualOn]);

  useEffect(() => {
    forceRender((n) => n + 1);
  }, [playerMounted]);

  const tags = getActiveKeepAwakeTags();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>react-native-stay-awake</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Manual keep-awake</Text>
        <Switch value={manualOn} onValueChange={setManualOn} />
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Mount “video player”</Text>
        <Switch value={playerMounted} onValueChange={setPlayerMounted} />
      </View>

      {playerMounted ? <VideoPlayerScreen /> : null}

      <View style={styles.status}>
        <Text style={styles.statusText}>
          Screen kept awake: {isKeepAwakeActive() ? 'YES' : 'no'}
        </Text>
        <Text style={styles.statusText}>
          Active tags: {tags.length > 0 ? tags.join(', ') : '(none)'}
        </Text>
        <Text style={styles.hint}>
          Turn both on, then turn one off — the screen stays awake until the
          last holder releases it (reference counting).
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginVertical: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#eef2ff',
    gap: 4,
  },
  cardTitle: {
    fontWeight: '600',
  },
  cardBody: {
    fontSize: 13,
    color: '#444',
  },
  status: {
    marginTop: 'auto',
    gap: 4,
    paddingBottom: 16,
  },
  statusText: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#666',
  },
});
