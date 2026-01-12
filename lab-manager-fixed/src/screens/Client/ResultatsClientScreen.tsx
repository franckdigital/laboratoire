import { demandeAnalyseAPI } from '@/src/services/api';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

export function ResultatsClientScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [analyses, setAnalyses] = useState<any[]>([]);

  const load = async () => {
    try {
      const data = await demandeAnalyseAPI.list();
      setAnalyses(data?.results || data || []);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error('Resultats load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
  };

  const finished = analyses.filter((a) => a.statut === 'TERMINEE' || a.statut === 'RESULTATS_ENVOYES');

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          Résultats
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {loading ? 'Chargement...' : `${finished.length} résultat(s) disponibles`}
        </Text>
      </View>

      <View style={styles.list}>
        {finished.length === 0 && !loading ? (
          <Text style={styles.empty}>Aucun résultat disponible</Text>
        ) : (
          finished.map((a) => (
            <Card key={String(a.id)} style={styles.item}>
              <Card.Title title={a.numero || 'Analyse'} subtitle={a.statut || ''} />
              <Card.Content>
                <Text variant="bodySmall">Montant TTC: {a.montant_ttc ?? '-'} </Text>
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { padding: 20, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  title: { fontWeight: 'bold', color: '#1F2937' },
  subtitle: { color: '#6B7280', marginTop: 4 },
  list: { padding: 12, gap: 12 },
  item: { elevation: 1 },
  empty: { padding: 12, color: '#6B7280' },
});
